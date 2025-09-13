import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivityWebhook,
  PaymentStatus,
  WebhookProvider,
} from '@prisma/client';
import { NetworkId } from 'src/networks/network.interface';
import {
  AddressActivityResponse,
  AddressActivityWebhook,
  Alchemy,
  Network as AlchemyNetwork,
  WebhookType as AlchemyWebhookType,
} from 'alchemy-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ALCHEMY_MAX_ACTIVITY_WEBHOOK_SIZE,
  ALCHEMY_SDK,
  ALCHEMY_WEBHOOK_RECEIVER_PATH,
} from './lib/alchemy.constants';
import { Env, getEnv } from 'src/lib/utils/env';
import { WebhookActivityDto } from './dto/webhook-activity.dto';
import {
  ALCHEMY_TO_NETWORK_MAP,
  NETWORK_TO_ALCHEMY_MAP,
} from './lib/alchemy.network-map';
import { TX_CONFIRMATION_QUEUE_NAME } from 'src/transactions/lib/constants';
import * as crypto from 'crypto';
import { formatUnits, hexToBigInt } from 'viem';
import { AddressActivityWebhookResponse } from './lib/alchemy.interface';
import { isNumber } from 'class-validator';

@Injectable()
export class AlchemyService {
  private readonly logger = new Logger(AlchemyService.name);
  constructor(
    private readonly db: PrismaService,
    @Inject(ALCHEMY_SDK) private readonly alchemy: Alchemy,
  ) {}

  async processAddressActivityWebhook(body: AddressActivityWebhookResponse) {
    if (body.type !== AlchemyWebhookType.ADDRESS_ACTIVITY) {
      this.logger.warn('Webhook type is not address activity', { body });
      return;
    }
    const network = ALCHEMY_TO_NETWORK_MAP[body.event.network];
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
      const payment = await this.db.payment.findFirst({
        where: {
          tokenAmount: tokenAmount.toString(),
          tokenId: tokenId,
          networkId: network,
          depositWallet: {
            address: activity.toAddress,
            networkId: network,
          },
          status: PaymentStatus.PENDING,
        },
      });
      if (payment) {
        this.logger.log(`Updating payment ${payment.id} status to completed`);
        await this.db.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.COMPLETED },
        });
      }
    }

    return { received: true };
  }

  private async findWebhookWithSpace(
    network: NetworkId,
  ): Promise<ActivityWebhook | null> {
    const webhooks = await this.db.activityWebhook.findMany({
      where: {
        networkId: network,
      },
      orderBy: {
        currentSize: 'asc',
      },
    });
    return (
      webhooks.find((webhook) => webhook.currentSize < webhook.maxSize) || null
    );
  }

  // required to create the webhook for with at least one address
  private async createWebhook(
    network: NetworkId,
    address: string,
  ): Promise<ActivityWebhook> {
    const alchemyWebhook = await this.alchemy.notify.createWebhook(
      getEnv(Env.API_BASE_URL) + ALCHEMY_WEBHOOK_RECEIVER_PATH,
      AlchemyWebhookType.ADDRESS_ACTIVITY,
      {
        network: NETWORK_TO_ALCHEMY_MAP[network],
        addresses: [address],
      },
    );
    const newWebhook = await this.db.activityWebhook.create({
      data: {
        networkId: network,
        maxSize: ALCHEMY_MAX_ACTIVITY_WEBHOOK_SIZE,
        currentSize: 1,
        webhookId: alchemyWebhook.id,
        providerId: WebhookProvider.ALCHEMY,
        wallets: {
          connect: {
            networkId_address: {
              networkId: network,
              address,
            },
          },
        },
      },
    });
    return newWebhook;
  }

  async suscribeAddressToWebhook({
    address,
    network,
  }: {
    address: string;
    network: NetworkId;
  }) {
    let webhook = await this.findWebhookWithSpace(network);
    if (!webhook) {
      webhook = await this.createWebhook(network, address);
    } else {
      await this.alchemy.notify.updateWebhook(webhook.webhookId, {
        addAddresses: [address],
      });
    }

    await this.db.activityWebhook.update({
      where: { id: webhook.id },
      data: {
        currentSize: { increment: 1 },
        wallets: {
          connect: {
            networkId_address: {
              networkId: network,
              address,
            },
          },
        },
      },
    });
    return webhook;
  }
}
