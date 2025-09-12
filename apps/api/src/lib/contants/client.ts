import { Account, createPublicClient, PublicClient } from 'viem';
import { arbitrum, base, holesky, mainnet, sepolia } from 'viem/chains';
import { http } from 'viem';
import { NetworkId } from 'src/networks/network.interface';

export const publicClients: Record<NetworkId, PublicClient> = {
  [NetworkId.ETHEREUM_MAINNET]: createPublicClient({
    chain: mainnet,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [NetworkId.BASE_MAINNET]: createPublicClient({
    chain: base,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [NetworkId.ARBITRUM_MAINNET]: createPublicClient({
    chain: arbitrum,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [NetworkId.ETHEREUM_HOLESKY]: createPublicClient({
    chain: holesky,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
  [NetworkId.ETHEREUM_SEPOLIA]: createPublicClient({
    chain: sepolia,
    transport: http(),
    batch: {
      multicall: true,
    },
  }) as PublicClient,
};
