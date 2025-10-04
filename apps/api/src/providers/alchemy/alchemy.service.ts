import { Inject, Injectable, Logger } from '@nestjs/common';
import { AttemptStatus, PaymentRail, PaymentStatus } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { Alchemy, WebhookType as AlchemyWebhookType } from 'alchemy-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { ALCHEMY_SDK } from './lib/alchemy.constants';
import { Env, getEnv } from 'src/lib/utils/env';
import { AddressActivityWebhookResponse } from './lib/alchemy.interface';
import { isNumber } from 'class-validator';
import {
  ALCHEMY_WEBHOOK_TO_NETWORK_MAP,
  NETWORK_TO_ALCHEMY_SDK,
} from './lib/alchemy.network-map';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { WEBHOOKS_PATHS } from 'src/webhooks/webhooks.constants';
import { AddressActivityWebhookDto } from 'src/wallets/dto/address-activity-webhook.dto';
import { toDto } from 'src/lib/utils/to-dto';

@Injectable()
export class AlchemyService {
  private readonly logger = new Logger(AlchemyService.name);
  constructor(
    private readonly db: PrismaService,
    @Inject(ALCHEMY_SDK) private readonly alchemy: Alchemy,
  ) {}

  async processAddressActivityWebhook(body: AddressActivityWebhookResponse) {
    this.logger.log('Processing address activity webhook', { body });
    if (body.type !== AlchemyWebhookType.ADDRESS_ACTIVITY) {
      this.logger.warn(
        `Webhook type is not address activity body.type: ${body.type}`,
      );
      return;
    }
    this.logger.log('Processing address activity webhook');
    const network = ALCHEMY_WEBHOOK_TO_NETWORK_MAP[body.event.network];
    if (!network) {
      this.logger.error(`Invalid network ${body.event.network}`);
      return;
    }
    const supportedTokens = await this.db.token.findMany({
      where: {
        networkId: network,
      },
    });
    const supportedTokensAddresses = supportedTokens.map((t) =>
      t.address.toLowerCase(),
    );

    const filteredActivities = body.event.activity
      .filter((a) => a.erc721TokenId == null && a.erc1155Metadata == null)
      .filter((a) => a.category === 'token')
      .filter((a) =>
        supportedTokensAddresses.includes(
          a.rawContract?.address?.toLowerCase() ?? '',
        ),
      )
      .filter((a) => a.log?.removed === false);
    this.logger.log(`Filtered activities length ${filteredActivities.length}`);

    for (const activity of filteredActivities) {
      const tokenAmount = activity.value;
      const tokenId = supportedTokens.find(
        (t) =>
          t.address.toLowerCase() ===
          activity.rawContract?.address?.toLowerCase(),
      )?.id;
      if (!tokenId || !activity.toAddress || !tokenAmount) {
        this.logger.error('Invalid activity', { activity });
        continue;
      }
      if (isNumber(tokenAmount) && tokenAmount <= 0) {
        this.logger.error('Invalid token amount', { activity });
        continue;
      }

      const paymentAttempt = await this.db.paymentAttempt.findFirst({
        where: {
          rail: PaymentRail.ONCHAIN,
          status: AttemptStatus.PENDING,
          onchain: {
            is: {
              networkId: network,
              wallet: {
                is: {
                  address: {
                    equals: activity.toAddress,
                  },
                  network: {
                    id: network,
                  },
                },
              },
            },
          },
        },
        include: {
          onchain: { include: { wallet: true, network: true } },
          checkout: true,
        },
      });
      if (!paymentAttempt) {
        this.logger.warn(
          `Payment attempt not found ${JSON.stringify({
            activity,
          })}`,
        );
        continue;
      }
      const { checkout } = paymentAttempt;
      if (checkout?.expiresAt && checkout.expiresAt < new Date()) {
        this.logger.error(
          `Activity received but checkout expired ${checkout.id}`,
        );
        await this.db.paymentAttempt.update({
          where: { id: paymentAttempt.id },
          data: { status: AttemptStatus.EXPIRED },
        });
        continue;
      }
      if (!checkout) {
        this.logger.error(`Checkout not found ${paymentAttempt.id}`);
        continue;
      }
      if (checkout.expiresAt && checkout.expiresAt < new Date()) {
        this.logger.error(`Payment received but expired ${checkout.id}`);
        await this.db.paymentAttempt.update({
          where: { id: paymentAttempt.id },
          data: { status: AttemptStatus.EXPIRED },
        });
        continue;
      }
    }

    return { received: true };
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
      getEnv(Env.API_BASE_URL) + WEBHOOKS_PATHS.ALCHEMY,
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
