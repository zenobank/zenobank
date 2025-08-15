import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NetworkId, NetworkType, Wallet } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { WalletFactory } from 'src/wallet/wallet.factory';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet.dto';
import { QuickNodeService } from 'src/providers/quicknode/quicknode.service';
import { WalletWebhookResponseDto } from '../dto/response-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly walletFactory: WalletFactory,
    private readonly quickNodeService: QuickNodeService,
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Wallet created successfully: ${wallet.id}`);
      return wallet;
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error}`);
      throw error;
    }
  }

  async registerWalletInWebhooks({
    addresses,
    networkId,
  }: {
    addresses: string[];
    networkId: NetworkId;
  }): Promise<WalletWebhookResponseDto[]> {
    const response = await this.quickNodeService.addEvmWalletToWebhook({
      webhookId: `b693a672-3a58-436e-949b-837617613e32`,
      wallets: addresses,
    });
    return [
      {
        webhookId: response.id,
        network: response.network,
      },
    ];
  }

  async processWebhookEvent(eventData: any): Promise<void> {
    this.logger.log(
      'Processing webhook event:',
      JSON.stringify(eventData, null, 2),
    );

    // Extract relevant information from the webhook event
    const { address, network, transactions } = eventData;

    if (!address || !network || !transactions) {
      this.logger.warn('Invalid webhook event format');
      return;
    }

    // Process each transaction
    // for (const tx of transactions) {
    //   await this.processTransaction(address, network, tx);
    // }
  }
}
