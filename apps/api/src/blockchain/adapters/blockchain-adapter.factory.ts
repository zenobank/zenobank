import { Injectable } from '@nestjs/common';
import { BlockchainAdapter } from './blockchain-adapter.interface';
import { EvmAdapter } from './evm.adapter';
import { SupportedNetworksId } from 'src/networks/network.interface';

@Injectable()
export class BlockchainFactory {
  constructor() {}

  getAdapter(networkId: SupportedNetworksId): BlockchainAdapter {
    switch (networkId) {
      case SupportedNetworksId.ETHEREUM_MAINNET:
      case SupportedNetworksId.BASE_MAINNET:
      case SupportedNetworksId.ARBITRUM_ONE_MAINNET:
      case SupportedNetworksId.BNB_MAINNET:
      case SupportedNetworksId.POLYGON_POS_MAINNET:
      case SupportedNetworksId.ETHEREUM_HOLESKY:
      case SupportedNetworksId.ETHEREUM_SEPOLIA:
        return new EvmAdapter(networkId);
      default:
        const _exhaustiveCheck: never = networkId;
        throw new Error(`No adapter found for network: ${networkId}`);
    }
  }
}
