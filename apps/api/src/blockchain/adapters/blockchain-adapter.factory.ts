import { Injectable } from '@nestjs/common';
import { Network } from 'src/lib/contants/network';
import { BlockchainAdapter } from './blockchain-adapter.interface';
import { EvmAdapter } from './evm.adapter';

@Injectable()
export class BlockchainAdapterFactory {
  constructor() {}

  getAdapter(network: Network): BlockchainAdapter {
    switch (network) {
      case Network.ETHEREUM_MAINNET:
      case Network.BASE_MAINNET:
      case Network.ARBITRUM_MAINNET:
        return new EvmAdapter(network);
      default:
        throw new Error(`No adapter found for network: ${network}`);
    }
  }
}
