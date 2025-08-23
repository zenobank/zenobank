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
import { AlchemyService } from 'src/alchemy/alchemy.service';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletFactory: WalletFactory,
    private readonly alchemyService: AlchemyService,
  ) {}

  @Get('validator-schema')
  async getValidatorSchema(): Promise<any> {
    const schemas = validationMetadatasToSchemas();
    console.log(schemas);
    return schemas;
  }

  @Post('test-suscribe-to-webhook')
  async suscribeToWebhook() {
    return this.alchemyService.suscribeAddressToWebhook({
      address: '0x0766991DC00D109386D6e0685AE46BD307320e4b',
      network: NetworkId.BASE_MAINNET,
    });
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
}
