import { Inject, Injectable } from '@nestjs/common';
import { ActivityWebhook, NetworkId, WebhookProvider } from '@prisma/client';
import { Alchemy, Network, WebhookType } from 'alchemy-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ALCHEMY_MAX_ACTIVITY_WEBHOOK_SIZE,
  ALCHEMY_SDK,
  ALCHEMY_WEBHOOK_RECEIVER_PATH,
} from './lib/constants';
import { Env, getEnv } from 'src/lib/utils/env';
import { WebhookActivityDto } from './dto/webhook-activity.dto';
import { NETWORK_TO_ALCHEMY_MAP } from './lib/network-map';
import { TX_CONFIRMATION_QUEUE_NAME } from 'src/transactions/lib/constants';

@Injectable()
export class AlchemyService {
  constructor(
    private readonly db: PrismaService,
    @Inject(ALCHEMY_SDK) private readonly alchemy: Alchemy,
  ) {}

  async handleReceivedWebhook(body: WebhookActivityDto) {
    console.log(body);
    // primer ver porque no se valida
    // ahora, una vez que me llega, tengo la tx, tengo que añadirla a la cola y a la db para las confirmaciones
    // ver dashboard de alchemy si llega o no
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
      WebhookType.ADDRESS_ACTIVITY,
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
