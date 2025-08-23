import { Injectable, Logger } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { WalletFactory } from 'src/wallet/wallet.factory';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly walletFactory: WalletFactory,
    private readonly db: PrismaService,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      const { address, privateKey } = this.walletFactory.generate(
        createWalletDto.networkId,
      );
      const wallet: Wallet = await this.db.wallet.create({
        data: {
          address,
          networkId: createWalletDto.networkId,
          privateKey,
          label: createWalletDto.label,
        },
      });

      this.logger.log(`Wallet created successfully: ${wallet.id}`);
      return wallet;
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error}`);
      throw error;
    }
  }
}
