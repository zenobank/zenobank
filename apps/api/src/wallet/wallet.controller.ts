import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { NetworkId } from '@prisma/client';
import { WalletFactory } from './wallet.factory';
import { client } from 'src/lib/utils/client';
import {
  createClient,
  createPublicClient,
  http,
  parseAbiItem,
  webSocket,
} from 'viem';
import { arbitrum } from 'viem/chains';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletFactory: WalletFactory,
  ) {}

  @Get('validator-schema')
  async getValidatorSchema(): Promise<any> {
    const schemas = validationMetadatasToSchemas();
    console.log(schemas);
    return schemas;
  }

  @Get()
  async getWallets() {
    return this.walletService.createWallet({
      networkId: NetworkId.ARBITRUM_MAINNET,
      label: 'test',
    });
  }

  @Get('test')
  async test() {
    const viemClient = createPublicClient({
      chain: arbitrum,
      transport: http('https://arb1.arbitrum.io/rpc'), // ej. wss://...
    });

    const abc = viemClient.watchEvent({
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      poll: true,
      event: parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ),
      pollingInterval: 1000,
      onLogs: (logs) => {
        console.log(logs);
      },
    });
    console.log(abc);
    return abc;
  }

  @Post('create-webhook/')
  async createWebhook() {
    const total = 100;
    const batchSize = 10;

    // Crear batch de wallets
    const walletsBatch: { address: string; privateKey: string }[] = [];
    for (let j = 0; j < batchSize && j < total; j++) {
      const wallet = this.walletFactory.generate(NetworkId.ARBITRUM_MAINNET);
      walletsBatch.push(wallet);
      console.log(walletsBatch);
    }

    // Registrar batch en paralelo
    await Promise.all(
      walletsBatch.map((wallet) =>
        this.walletService.registerWalletInWebhooks({
          addresses: Array.from(walletsBatch.map((w) => w.address)),
          networkId: NetworkId.ARBITRUM_MAINNET,
        }),
      ),
    );

    return { message: `${total} wallets creadas y registradas` };
  }
}
