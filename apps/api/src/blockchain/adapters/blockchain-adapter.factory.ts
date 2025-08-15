import { Injectable } from '@nestjs/common';
import { BlockchainAdapter } from './blockchain-adapter.interface';
import { EvmAdapter } from './evm.adapter';
import { NetworkId } from '@prisma/client';

@Injectable()
export class BlockchainAdapterFactory {
  constructor() {}

  getAdapter(network: NetworkId): BlockchainAdapter {
    switch (network) {
      case NetworkId.ETHEREUM_MAINNET:
      case NetworkId.BASE_MAINNET:
      case NetworkId.ARBITRUM_MAINNET:
      case NetworkId.ETHEREUM_HOLESKY:
        return new EvmAdapter(network);
      default:
        throw new Error(`No adapter found for network: ${network}`);
    }
  }
}
