import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
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
import { NetworkId } from 'src/networks/network.interface';
import { Svix } from 'svix';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletFactory: WalletFactory,
    private readonly alchemyService: AlchemyService,
  ) {}

  @Post('test-suscribe-to-webhook')
  async suscribeToWebhook() {
    return this.alchemyService.suscribeAddressToWebhook({
      address: '0x4b7673AB39733493a44695b37b2C7DF814A28d1B',
      network: NetworkId.ETHEREUM_SEPOLIA,
    });
  }
}
