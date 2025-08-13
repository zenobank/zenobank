import { Account, createPublicClient, PublicClient } from 'viem';
import { Network, NETWORK_INFO } from './network';
import { arbitrum, base, holesky, mainnet } from 'viem/chains';
import { http } from 'viem';

export const publicClients: Record<Network, PublicClient> = {
  // @ts-expect-error TS2590. Viem lib error
  [Network.ETHEREUM_MAINNET]: createPublicClient({
    chain: mainnet,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [Network.BASE_MAINNET]: createPublicClient({
    chain: base,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [Network.ARBITRUM_MAINNET]: createPublicClient({
    chain: arbitrum,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [Network.ETHEREUM_HOLESKY]: createPublicClient({
    chain: holesky,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
};
