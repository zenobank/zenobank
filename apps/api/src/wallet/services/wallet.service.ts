import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { WalletFactory } from 'src/wallet/wallet.factory';
import { CreateWalletDto } from 'src/wallet/dto/create-wallet.dto';
import { QuickNodeService } from 'src/providers/quicknode/quicknode.service';
import { EVM_NETWORKS } from 'src/lib/contants/network';
import { WalletWebhookResponseDto } from '../dto/response-wallet.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private wallets: Map<string, Wallet> = new Map();

  constructor(
    private readonly walletFactory: WalletFactory,
    private readonly quickNodeService: QuickNodeService,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      const address = this.walletFactory.generate(createWalletDto.addressType);
      const wallet: Wallet = this.buildWallet(createWalletDto, address);

      await this.registerWalletInWebhooks(wallet);
      this.wallets.set(wallet.id, wallet);

      this.logger.log(`Wallet created successfully: ${wallet.id}`);
      return wallet;
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error.message}`);
      throw error;
    }
  }
  private buildWallet(dto: CreateWalletDto, address: string): Wallet {
    return {
      id: uuidv4(),
      address,
      masterId: null,
      addressType: dto.addressType,
      label: dto.label,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async registerWalletInWebhooks(
    wallet: Wallet,
  ): Promise<WalletWebhookResponseDto[]> {
    const responses = await Promise.all(
      EVM_NETWORKS.map((network) =>
        this.quickNodeService.addEvmWalletToWebhook({
          webhookId: `b693a672-3a58-436e-949b-837617613e32`,
          wallet: wallet.address,
        }),
      ),
    );

    return responses.map((res) => ({
      webhookId: res.id,
      network: res.network,
    }));
  }

  async getAllWallets(): Promise<Wallet[]> {
    return Array.from(this.wallets.values());
  }

  async getWalletById(id: string): Promise<Wallet> {
    const wallet = this.wallets.get(id);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async getWalletByAddress(address: string, network: string): Promise<Wallet> {
    const wallet = Array.from(this.wallets.values()).find(
      (w) =>
        w.address.toLowerCase() === address.toLowerCase() &&
        w.addressType === network,
    );

    if (!wallet) {
      throw new NotFoundException(
        `Wallet with address ${address} not found on ${network}`,
      );
    }
    return wallet;
  }

  async deleteWallet(id: string): Promise<void> {
    const wallet = this.wallets.get(id);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    try {
      this.wallets.delete(id);
      this.logger.log(`Wallet deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete wallet: ${error.message}`);
      throw error;
    }
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
    for (const tx of transactions) {
      await this.processTransaction(address, network, tx);
    }
  }

  private async processTransaction(
    address: string,
    network: string,
    transaction: any,
  ): Promise<void> {
    try {
      const wallet = await this.getWalletByAddress(address, network);

      this.logger.log(`Processing transaction for wallet ${wallet.id}:`, {
        txHash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        tokenName: transaction.tokenName,
        tokenSymbol: transaction.tokenSymbol,
      });

      // Here you can implement your business logic for handling transactions
      // For example: store in database, send notifications, update balances, etc.

      // Example: Send notification or store transaction
      await this.storeTransaction(wallet.id, transaction);
    } catch (error) {
      this.logger.error(`Failed to process transaction: ${error.message}`);
    }
  }

  private async storeTransaction(
    walletId: string,
    transaction: any,
  ): Promise<void> {
    // Implementation for storing transaction in database
    // This is a placeholder - you would implement your own storage logic
    this.logger.log(`Storing transaction for wallet ${walletId}:`, transaction);
  }
}
