import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupportedNetworksId } from '@repo/networks';
import { AlchemyService } from 'src/integrations/alchemy/alchemy.service';
import { Wallet, NetworkType } from '@prisma/client';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { AddressActivityWebhookDto } from './dto/address-activity-webhook.dto';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly alchemyService: AlchemyService,
  ) {}

  async registerExternalEvmWallet({
    _address,
    apiKey,
  }: {
    _address: string;
    apiKey: string;
  }): Promise<void> {
    const address = _address.toLowerCase();

    const store = await this.db.store.findUnique({
      where: { apiKey },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if wallet already exists in any EVM network
    const [walletsWithThatAddress, otherStoreWallets, networks] =
      await Promise.all([
        this.db.wallet.findMany({
          where: {
            address,
            network: {
              networkType: NetworkType.EVM,
            },
          },
        }),
        this.db.wallet.findMany({
          where: {
            storeId: store.id,
          },
        }),
        this.db.network.findMany({
          where: {
            networkType: NetworkType.EVM,
          },
        }),
      ]);
    if (otherStoreWallets.length > 0) {
      throw new ConflictException(`A wallet already exists for this store`);
    }

    if (walletsWithThatAddress.length > 0) {
      throw new ConflictException(`Wallet ${address} already exists`);
    }
    await Promise.all(
      networks.map(async (network) => {
        this.logger.log(
          `Subscribing to address activity for ${address} on network ${network.id}`,
        );

        await this.subscribeToAddressActivity({
          address,
          network: toEnumValue(SupportedNetworksId, network.id),
        });
      }),
    );
    // await Promise.all(
    //   networks.map((network) =>
    //     this.subscribeToAddressActivity({
    //       address,
    //       network: toEnumValue(SupportedNetworksId, network.id),
    //     }),
    //   ),
    // );

    const wallets = await this.db.$transaction(async (tx) => {
      return await Promise.all(
        networks.map((network) =>
          tx.wallet.create({
            data: {
              storeId: store.id,
              address,
              networkId: network.id,
            },
          }),
        ),
      );
    });
  }
  async subscribeToAddressActivity({
    address,
    network,
  }: {
    address: string;
    network: SupportedNetworksId;
  }): Promise<AddressActivityWebhookDto> {
    const webhook = await this.alchemyService.getOrCreateWebhook(network);
    if (!webhook) {
      this.logger.error(
        `!!Webhook not found for network ${network}. Address: ${address}`,
      );
      throw new Error(
        `Webhook not found for network ${network}. Address: ${address}`,
      );
    }
    this.logger.log(
      `Adding address ${address} to webhook ${JSON.stringify(webhook)}`,
    );
    await this.alchemyService.addAddressToWebhook({
      webhookId: webhook.id,
      address: address,
    });

    return webhook;
  }
}
