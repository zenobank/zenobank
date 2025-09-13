import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { NetworkId } from 'src/networks/network.interface';

export const NETWORK_TO_ALCHEMY_MAP: Record<NetworkId, AlchemyNetwork> = {
  ETHEREUM_MAINNET: AlchemyNetwork.ETH_MAINNET,
  BASE_MAINNET: AlchemyNetwork.BASE_MAINNET,
  ARBITRUM_MAINNET: AlchemyNetwork.ARB_MAINNET,
  ETHEREUM_HOLESKY: AlchemyNetwork.ETH_HOLESKY,
  ETHEREUM_SEPOLIA: AlchemyNetwork.ETH_SEPOLIA,
};

export const ALCHEMY_TO_NETWORK_MAP: Record<AlchemyNetwork, NetworkId> =
  Object.fromEntries(
    Object.entries(NETWORK_TO_ALCHEMY_MAP).map(([k, v]) => [v, k as NetworkId]),
  ) as Record<AlchemyNetwork, NetworkId>;
