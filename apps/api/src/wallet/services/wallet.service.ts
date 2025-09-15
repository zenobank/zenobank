import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { NetworkType, Wallet } from '@repo/db';
import { WalletFactory } from 'src/wallet/wallet.factory';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NetworkId } from 'src/networks/network.interface';
import { AlchemyService } from 'src/alchemy/alchemy.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly db: PrismaService,
    @Inject(forwardRef(() => AlchemyService))
    private readonly alchemyService: AlchemyService,
  ) {}

  /**
   * Registers an EVM wallet address across all EVM networks in the database
   * and subscribes to webhook notifications for transaction updates.
   *
   * @param address - The EVM wallet address to register
   * @returns Promise<Wallet[]> - Array of created wallet records for each EVM network
   */
  async registerEvmWallet(address: string): Promise<Wallet[]> {
    const networks = await this.db.network.findMany({
      where: {
        networkType: NetworkType.EVM,
      },
    });
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
        this.alchemyService.suscribeAddressToWebhook({
          address: wallet.address,
          network: wallet.networkId as NetworkId,
        }),
      ),
    );
    return wallets;
  }
}
