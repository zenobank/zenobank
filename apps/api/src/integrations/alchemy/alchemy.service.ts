import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AttemptStatus,
  Checkout,
  OnChainPaymentAttempt,
  PaymentStatus,
} from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { Alchemy, WebhookType as AlchemyWebhookType } from 'alchemy-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { ALCHEMY_SDK } from './lib/alchemy.constants';
import { env } from 'src/lib/utils/env';
import {
  AddressActivity,
  AddressActivityWebhookResponse,
} from './lib/alchemy.interface';
import { isNumber } from 'class-validator';
import {
  ALCHEMY_WEBHOOK_TO_NETWORK_MAP,
  NETWORK_TO_ALCHEMY_SDK,
} from './lib/alchemy.network-map';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { WEBHOOKS_PATHS } from 'src/webhooks/webhooks.constants';
import { AddressActivityWebhookDto } from 'src/wallets/dto/address-activity-webhook.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { TokensService } from 'src/tokens/tokens.service';
import { OnChainTokenResponseDto } from 'src/tokens/dto/onchain-token-response';

@Injectable()
export class AlchemyService {
  private readonly logger = new Logger(AlchemyService.name);
  constructor(
    private readonly db: PrismaService,
    @Inject(ALCHEMY_SDK) private readonly alchemy: Alchemy,
    private readonly tokenService: TokensService,
  ) {}

  async processAddressActivityWebhook(body: AddressActivityWebhookResponse) {
    this.logger.log('Processing address activity webhook', { body });
    if (!this.isValidWebhookType(body)) {
      return;
    }

    const network = this.extractNetworkFromWebhook(body);
    if (!network) {
      return;
    }

    const supportedTokens = await this.tokenService.getOnChainTokens();
    const supportedTokensAddresses = supportedTokens.map(
      (token) => token.address,
    );

    const filteredActivities = this.filterSupportedTokenActivities(
      body.event.activity,
      supportedTokensAddresses,
    );
    this.logger.log(`Filtered activities length ${filteredActivities.length}`);

    for (const activity of filteredActivities) {
      await this.processActivity(activity, supportedTokens, network);
    }

    return { received: true };
  }

  private async processActivity(
    activity: AddressActivity,
    supportedTokens: OnChainTokenResponseDto[],
    network: SupportedNetworksId,
  ) {
    const tokenAmount = activity.value;
    const tokenId = this.findTokenIdFromActivity(activity, supportedTokens);

    if (!this.isValidActivity(activity, tokenId, tokenAmount)) {
      return;
    }

    const paymentAttempt = await this.findPaymentAttempt(activity, network);
    if (!paymentAttempt) {
      return;
    }

    await this.validateAndUpdateCheckout(paymentAttempt);
  }

  private findTokenIdFromActivity(
    activity: AddressActivity,
    supportedTokens: OnChainTokenResponseDto[],
  ) {
    return supportedTokens.find(
      (t) =>
        t.address?.toLowerCase() ===
        activity.rawContract?.address?.toLowerCase(),
    )?.id;
  }

  private isValidActivity(
    activity: AddressActivity,
    tokenId: string | undefined,
    tokenAmount: number | null | undefined,
  ): boolean {
    if (!tokenId || !activity.toAddress || !tokenAmount) {
      this.logger.error('Invalid activity', { activity });
      return false;
    }
    if (isNumber(tokenAmount) && tokenAmount <= 0) {
      this.logger.error('Invalid token amount', { activity });
      return false;
    }
    return true;
  }

  private async findPaymentAttempt(
    activity: AddressActivity,
    network: SupportedNetworksId,
  ) {
    if (!activity.toAddress) {
      this.logger.error('Invalid activity', { activity });
      return null;
    }
    const paymentAttempt = await this.db.onChainPaymentAttempt.findFirst({
      where: {
        status: AttemptStatus.PENDING,
        networkId: network,
        depositWallet: {
          address: activity.toAddress,
          networkId: network,
        },
      },
    });

    if (!paymentAttempt) {
      this.logger.warn(
        `Payment attempt not found ${JSON.stringify({
          activity,
        })}`,
      );
      return null;
    }

    return paymentAttempt;
  }

  private async validateAndUpdateCheckout(
    paymentAttempt: OnChainPaymentAttempt,
  ) {
    const checkout = await this.db.checkout.findUnique({
      where: { id: paymentAttempt.checkoutId },
    });

    if (!checkout) {
      this.logger.error(`Checkout not found ${paymentAttempt.id}`);
      return;
    }

    if (checkout.expiresAt && checkout.expiresAt < new Date()) {
      this.logger.error(
        `Activity received but checkout expired ${checkout.id}`,
      );
    }
  }

  private isValidWebhookType(body: AddressActivityWebhookResponse): boolean {
    if (body.type !== AlchemyWebhookType.ADDRESS_ACTIVITY) {
      this.logger.warn(
        `Webhook type is not address activity body.type: ${body.type}`,
      );
      return false;
    }
    return true;
  }

  private extractNetworkFromWebhook(
    body: AddressActivityWebhookResponse,
  ): SupportedNetworksId | null {
    const network = ALCHEMY_WEBHOOK_TO_NETWORK_MAP[body.event.network];
    if (!network) {
      this.logger.error(`Invalid network ${body.event.network}`);
      return null;
    }

    return network;
  }

  private filterSupportedTokenActivities(
    activities: AddressActivity[],
    supportedTokensAddresses: string[],
  ) {
    return activities
      .filter((a) => a.erc721TokenId == null && a.erc1155Metadata == null)
      .filter((a) => a.category === 'token')
      .filter((a) =>
        supportedTokensAddresses.includes(
          a.rawContract?.address?.toLowerCase() ?? '',
        ),
      )
      .filter((a) => a.log?.removed === false);
  }

  async activateWebhook(webhookId: string) {
    await this.alchemy.notify.updateWebhook(webhookId, {
      isActive: true,
    });
  }

  async getWebhook(
    network: SupportedNetworksId,
  ): Promise<AddressActivityWebhookDto> {
    const webhooksData = await this.alchemy.notify.getAllWebhooks();
    const webhook = webhooksData.webhooks.find(
      (w) => w.network === NETWORK_TO_ALCHEMY_SDK[network],
    );
    this.logger.log(`Webhook found: ${JSON.stringify(webhook)}`);
    if (!webhook || !webhook.id) {
      this.logger.error(
        `Webhook not found for network ${network}. Creating it...`,
      );
      const createdWebhook = await this.createWebhook(
        network,
        privateKeyToAccount(generatePrivateKey()).address,
      );
      return createdWebhook;
    }
    if (!webhook?.isActive) {
      this.logger.error(
        `Webhook ${webhook.id} is not active. Activating it...`,
      );
      await this.activateWebhook(webhook.id);
    }
    const obj = toDto(AddressActivityWebhookDto, {
      id: webhook.id,
      network: SupportedNetworksId.ETHEREUM_MAINNET,
    });
    return obj;
  }

  async addAddressToWebhook({
    webhookId,
    address,
  }: {
    webhookId: string;
    address: string;
  }) {
    if (!webhookId) {
      throw new Error('Webhook ID is required to add address to webhook');
    }
    await this.alchemy.notify.updateWebhook(webhookId, {
      addAddresses: [address],
    });
    this.logger.log(`Added address ${address} to webhook ${webhookId}.`);
  }
  async removeAddressFromWebhook({
    webhookId,
    addresses,
  }: {
    webhookId: string;
    addresses: string[];
  }) {
    if (!webhookId) {
      throw new Error(
        'Webhook ID is required to remove addresses from webhook',
      );
    }
    await this.alchemy.notify.updateWebhook(webhookId, {
      removeAddresses: addresses,
    });
  }

  // required to create the webhook for with at least one address
  async createWebhook(
    network: SupportedNetworksId,
    address: string,
  ): Promise<AddressActivityWebhookDto> {
    const alchemyWebhook = await this.alchemy.notify.createWebhook(
      env.API_URL + WEBHOOKS_PATHS.ALCHEMY,
      AlchemyWebhookType.ADDRESS_ACTIVITY,
      {
        network: NETWORK_TO_ALCHEMY_SDK[network],
        addresses: [address],
      },
    );
    if (!alchemyWebhook.id) {
      throw new Error('Failed to create webhook');
    }

    return toDto(AddressActivityWebhookDto, {
      id: alchemyWebhook.id,
      network: ALCHEMY_WEBHOOK_TO_NETWORK_MAP[alchemyWebhook.network],
    });
  }
}
