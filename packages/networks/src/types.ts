// src/types.ts
export const SupportedNetworksId = {
  // mainnets
  ETHEREUM_MAINNET: 'ETHEREUM_MAINNET',
  BASE_MAINNET: 'BASE_MAINNET',
  ARBITRUM_ONE_MAINNET: 'ARBITRUM_ONE_MAINNET',
  BNB_MAINNET: 'BNB_MAINNET',
  POLYGON_POS_MAINNET: 'POLYGON_POS_MAINNET',

  // testnets
  ETHEREUM_HOLESKY: 'ETHEREUM_HOLESKY',
  ETHEREUM_SEPOLIA: 'ETHEREUM_SEPOLIA',
} as const;

export type SupportedNetworksId =
  (typeof SupportedNetworksId)[keyof typeof SupportedNetworksId];
