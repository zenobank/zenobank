import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { NetworkId } from '@prisma/client';

export const ALCHEMY_NETWORK_MAP: Record<NetworkId, AlchemyNetwork> = {
  ETHEREUM_MAINNET: AlchemyNetwork.ETH_MAINNET,
  BASE_MAINNET: AlchemyNetwork.BASE_MAINNET,
  ARBITRUM_MAINNET: AlchemyNetwork.ARB_MAINNET,
  ETHEREUM_HOLESKY: AlchemyNetwork.ETH_HOLESKY,
};
