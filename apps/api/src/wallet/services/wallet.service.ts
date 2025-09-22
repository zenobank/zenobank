import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NetworkId } from 'src/networks/network.interface';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { Wallet, NetworkType } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly alchemyService: AlchemyService,
  ) {}

  /**
   * Registers an EVM wallet address across all EVM networks in the database
   * and subscribes to webhook notifications for transaction updates.
   *
   * @param address - The EVM wallet address to register
   * @returns Promise<Wallet[]> - Array of created wallet records for each EVM network
   */

  async registerEvmWallet(_address: string): Promise<Wallet[]> {
    const address = _address.toLowerCase();

    // Check if wallet already exists in any EVM network
    const existingWallets = await this.db.wallet.findMany({
      where: {
        address,
        network: {
          networkType: NetworkType.EVM,
        },
      },
    });

    if (existingWallets.length > 0) {
      throw new ConflictException(`Wallet ${address} already exists`);
    }

    const networks = await this.db.network.findMany({
      where: {
        networkType: NetworkType.EVM,
      },
    });

    this.logger.log(
      `Registering evm wallet ${address} to ${networks.length} networks`,
    );

    const wallets = await this.db.$transaction(async (tx) => {
      return await Promise.all(
        networks.map((network) =>
          tx.wallet.create({
            data: {
              address,
              networkId: network.id,
            },
          }),
        ),
      );
    });

    await Promise.all(
      wallets.map((wallet) =>
        this.subscribeToAddressActivity({
          address: wallet.address,
          network: wallet.networkId as NetworkId,
        }),
      ),
    );

    return wallets;
  }
  async subscribeToAddressActivity({
    address,
    network,
  }: {
    address: string;
    network: NetworkId;
  }) {
    const webhook = await this.alchemyService.getWebhook(network);
    if (!webhook) {
      throw new Error(
        `Webhook not found for network ${network}. Address: ${address}`,
      );
    }
    await this.alchemyService.addAddressToWebhook({
      webhookId: webhook.id,
      address: address,
    });

    return webhook;
  }
}
