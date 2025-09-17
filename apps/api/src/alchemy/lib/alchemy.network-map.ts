import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { NetworkId } from 'src/networks/network.interface';

export const NETWORK_TO_ALCHEMY_SDK: Record<NetworkId, AlchemyNetwork> = {
  ETHEREUM_MAINNET: AlchemyNetwork.ETH_MAINNET,
  BASE_MAINNET: AlchemyNetwork.BASE_MAINNET,
  ARBITRUM_MAINNET: AlchemyNetwork.ARB_MAINNET,
  ETHEREUM_HOLESKY: AlchemyNetwork.ETH_HOLESKY,
  ETHEREUM_SEPOLIA: AlchemyNetwork.ETH_SEPOLIA,
};

export const ALCHEMY_SDK_TO_NETWORK_MAP: Record<AlchemyNetwork, NetworkId> =
  Object.fromEntries(
    Object.entries(NETWORK_TO_ALCHEMY_SDK).map(([k, v]) => [v, k as NetworkId]),
  ) as Record<AlchemyNetwork, NetworkId>;

export const NETWORK_TO_ALCHEMY_WEBHOOK: Record<
  NetworkId,
  keyof typeof AlchemyNetwork
> = {
  ETHEREUM_MAINNET: 'ETH_MAINNET',
  BASE_MAINNET: 'BASE_MAINNET',
  ARBITRUM_MAINNET: 'ARB_MAINNET',
  ETHEREUM_HOLESKY: 'ETH_HOLESKY',
  ETHEREUM_SEPOLIA: 'ETH_SEPOLIA',
};
export const ALCHEMY_WEBHOOK_TO_NETWORK_MAP: Record<
  keyof typeof AlchemyNetwork,
  NetworkId
> = Object.fromEntries(
  Object.entries(NETWORK_TO_ALCHEMY_WEBHOOK).map(([k, v]) => [
    v,
    k as NetworkId,
  ]),
) as Record<keyof typeof AlchemyNetwork, NetworkId>;
