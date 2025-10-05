import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { SupportedNetworksId } from 'src/networks/network.interface';

export const NETWORK_TO_ALCHEMY_SDK: Record<
  SupportedNetworksId,
  AlchemyNetwork
> = {
  ETHEREUM_MAINNET: AlchemyNetwork.ETH_MAINNET,
  BASE_MAINNET: AlchemyNetwork.BASE_MAINNET,
  ARBITRUM_MAINNET: AlchemyNetwork.ARB_MAINNET,
  ETHEREUM_HOLESKY: AlchemyNetwork.ETH_HOLESKY,
  ETHEREUM_SEPOLIA: AlchemyNetwork.ETH_SEPOLIA,
};

export const ALCHEMY_SDK_TO_NETWORK_MAP: Record<
  AlchemyNetwork,
  SupportedNetworksId
> = Object.fromEntries(
  Object.entries(NETWORK_TO_ALCHEMY_SDK).map(([k, v]) => [
    v,
    k as SupportedNetworksId,
  ]),
) as Record<AlchemyNetwork, SupportedNetworksId>;

export const NETWORK_TO_ALCHEMY_ONLY_WEBHOOK_RECEIVED_EVENTS: Record<
  SupportedNetworksId,
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
  SupportedNetworksId
> = Object.fromEntries(
  Object.entries(NETWORK_TO_ALCHEMY_ONLY_WEBHOOK_RECEIVED_EVENTS).map(
    ([k, v]) => [v, k as SupportedNetworksId],
  ),
) as Record<keyof typeof AlchemyNetwork, SupportedNetworksId>;
