import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { SupportedNetworksId } from '@repo/networks';
import { type SupportedNetworksId as SupportedNetworksIdTypes } from '@repo/networks';
export const NETWORK_TO_ALCHEMY_SDK: Record<
  SupportedNetworksId,
  AlchemyNetwork
> = {
  ETHEREUM_MAINNET: AlchemyNetwork.ETH_MAINNET,
  BASE_MAINNET: AlchemyNetwork.BASE_MAINNET,
  ARBITRUM_ONE_MAINNET: AlchemyNetwork.ARB_MAINNET,
  BNB_MAINNET: AlchemyNetwork.BNB_MAINNET,
  POLYGON_POS_MAINNET: AlchemyNetwork.POLYNOMIAL_MAINNET,
  ETHEREUM_HOLESKY: AlchemyNetwork.ETH_HOLESKY,
  ETHEREUM_SEPOLIA: AlchemyNetwork.ETH_SEPOLIA,
};

export const ALCHEMY_SDK_TO_NETWORK_MAP: Record<
  AlchemyNetwork,
  SupportedNetworksId
> = Object.fromEntries(
  Object.entries(NETWORK_TO_ALCHEMY_SDK).map(([k, v]) => [
    v,
    k as SupportedNetworksIdTypes,
  ]),
) as Record<AlchemyNetwork, SupportedNetworksId>;

export const NETWORK_TO_ALCHEMY_ONLY_WEBHOOK_RECEIVED_EVENTS: Record<
  SupportedNetworksId,
  keyof typeof AlchemyNetwork
> = {
  ETHEREUM_MAINNET: 'ETH_MAINNET',
  BASE_MAINNET: 'BASE_MAINNET',
  ARBITRUM_ONE_MAINNET: 'ARB_MAINNET',
  ETHEREUM_HOLESKY: 'ETH_HOLESKY',
  ETHEREUM_SEPOLIA: 'ETH_SEPOLIA',
  BNB_MAINNET: 'BNB_MAINNET',
  POLYGON_POS_MAINNET: 'MATIC_MAINNET',
};
export const ALCHEMY_WEBHOOK_TO_NETWORK_MAP: Record<
  keyof typeof AlchemyNetwork,
  SupportedNetworksId
> = Object.fromEntries(
  Object.entries(NETWORK_TO_ALCHEMY_ONLY_WEBHOOK_RECEIVED_EVENTS).map(
    ([k, v]) => [v, k as SupportedNetworksIdTypes],
  ),
) as Record<keyof typeof AlchemyNetwork, SupportedNetworksId>;
