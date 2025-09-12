import { Injectable } from '@nestjs/common';
import { BlockchainAdapter } from './blockchain-adapter.interface';
import { EvmAdapter } from './evm.adapter';
import { NetworkId } from 'src/networks/network.interface';

@Injectable()
export class BlockchainAdapterFactory {
  constructor() {}

  getAdapter(networkId: NetworkId): BlockchainAdapter {
    switch (networkId) {
      case NetworkId.ETHEREUM_MAINNET:
      case NetworkId.BASE_MAINNET:
      case NetworkId.ARBITRUM_MAINNET:
      case NetworkId.ETHEREUM_HOLESKY:
      case NetworkId.ETHEREUM_SEPOLIA:
        return new EvmAdapter(networkId);
      default:
        const _exhaustiveCheck: never = networkId;
        throw new Error(`No adapter found for network: ${networkId}`);
    }
  }
}
