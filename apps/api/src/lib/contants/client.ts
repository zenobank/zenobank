import { Account, createPublicClient, PublicClient } from 'viem';
import {
  arbitrum,
  base,
  holesky,
  mainnet,
  sepolia,
  bsc,
  polygon,
} from 'viem/chains';
import { http } from 'viem';
import { SupportedNetworksId } from '@repo/networks/types';

export const publicClients: Record<SupportedNetworksId, PublicClient> = {
  [SupportedNetworksId.ETHEREUM_MAINNET]: createPublicClient({
    chain: mainnet,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [SupportedNetworksId.BASE_MAINNET]: createPublicClient({
    chain: base,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [SupportedNetworksId.ARBITRUM_ONE_MAINNET]: createPublicClient({
    chain: arbitrum,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [SupportedNetworksId.ETHEREUM_HOLESKY]: createPublicClient({
    chain: holesky,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [SupportedNetworksId.ETHEREUM_SEPOLIA]: createPublicClient({
    chain: sepolia,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [SupportedNetworksId.BNB_MAINNET]: createPublicClient({
    chain: bsc,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [SupportedNetworksId.POLYGON_POS_MAINNET]: createPublicClient({
    chain: polygon,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
};
