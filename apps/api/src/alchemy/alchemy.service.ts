import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ActivityWebhook,
  PaymentStatus,
  WebhookProvider,
} from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { Alchemy, WebhookType as AlchemyWebhookType } from 'alchemy-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ALCHEMY_MAX_ACTIVITY_WEBHOOK_SIZE,
  ALCHEMY_SDK,
} from './lib/alchemy.constants';
import { Env, getEnv } from 'src/lib/utils/env';
import { AddressActivityWebhookResponse } from './lib/alchemy.interface';
import { isNumber } from 'class-validator';
import { PaymentService } from 'src/payments/payment.service';
import {
  ALCHEMY_WEBHOOK_TO_NETWORK_MAP,
  NETWORK_TO_ALCHEMY_SDK,
} from './lib/alchemy.network-map';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { WEBHOOKS_PATHS } from 'src/webhooks/webhooks.constants';

@Injectable()
export class AlchemyService {
  private readonly logger = new Logger(AlchemyService.name);
  constructor(
    private readonly db: PrismaService,
    @Inject(ALCHEMY_SDK) private readonly alchemy: Alchemy,
    private readonly paymentService: PaymentService,
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

    const filteredActivities = body.event.activity
      .filter((a) => a.erc721TokenId == null && a.erc1155Metadata == null)
      .filter((a) => a.category === 'token')

      .filter((a) => a.log?.removed === false);
    this.logger.log(`Filtered activities length ${filteredActivities.length}`);
    for (const activity of filteredActivities) {
      const tokenAmount = activity.value;

      if (!activity.toAddress || !tokenAmount) {
        this.logger.error('Invalid activity', { activity });
        continue;
      }
      if (isNumber(tokenAmount) && tokenAmount <= 0) {
        this.logger.error('Invalid token amount', { activity });
        continue;
      }

      const payment = await this.db.payment.findFirst({
        where: {
          payAmount: tokenAmount.toString(),
          status: PaymentStatus.PENDING,
        },
      });
      if (payment?.expiredAt && payment.expiredAt < new Date()) {
        this.logger.warn(`Payment received but expired ${payment.id}`);
        await this.db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.EXPIRED },
        });
        continue;
      }
      if (payment) {
        await this.paymentService.markPaymentAsCompleted(payment.id);
        // await this.paymentService.initiatePaymentProcessing(payment.id);
      } else {
        this.logger.warn(
          `Payment not found ${JSON.stringify({
            payAmount: tokenAmount,
            depositWallet: activity.toAddress,
            networkId: network,
            tokenAddress: activity.rawContract?.address,
          })}`,
        );
      }
    }

    return { received: true };
  }
  async getWebhook(network: SupportedNetworksId): Promise<ActivityWebhook> {
    let webhook = await this.findWebhookWithSpace(network);
    if (!webhook) {
      this.logger.log(
        `Webhook not found, creating webhook for network ${network}`,
      );
      // alchemy webhook creation requires an address
      webhook = await this.createWebhook(
        network,
        privateKeyToAccount(generatePrivateKey()).address,
      );
    }
    return webhook;
  }

  async findWebhookWithSpace(
    network: SupportedNetworksId,
  ): Promise<ActivityWebhook | null> {
    const webhooks = await this.alchemy.notify.getAllWebhooks();

    const webhook = webhooks.webhooks.find(
      (webhook) => webhook.network === NETWORK_TO_ALCHEMY_SDK[network],
    );
    if (!webhook) {
      return null;
    }
    return {
      id: webhook.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      networkId: network,
      webhookId: webhook.id,
      providerId: WebhookProvider.ALCHEMY,
      currentSize: 10,
      maxSize: 100_000,
    };
  }

  async addAddressToWebhook({
    webhookId,
    address,
  }: {
    webhookId: string;
    address: string;
  }) {
    await Promise.all([
      this.alchemy.notify.updateWebhook(webhookId, {
        addAddresses: [address],
      }),
    ]);

    this.logger.log(`Added address ${address} to webhook ${webhookId}.`);
  }
  async removeAddressFromWebhook({
    webhookId,
    addresses,
  }: {
    webhookId: string;
    addresses: string[];
  }) {
    await this.alchemy.notify.updateWebhook(webhookId, {
      removeAddresses: addresses,
    });
  }

  // required to create the webhook for with at least one address
  async createWebhook(
    network: SupportedNetworksId,
    address: string,
  ): Promise<ActivityWebhook> {
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

    return {
      id: alchemyWebhook.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      networkId: network,
      webhookId: alchemyWebhook.id,
      providerId: WebhookProvider.ALCHEMY,
      currentSize: 1,
      maxSize: ALCHEMY_MAX_ACTIVITY_WEBHOOK_SIZE,
    };
  }
}
