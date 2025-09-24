import { Account, createPublicClient, PublicClient } from 'viem';
import { arbitrum, base, holesky, mainnet, sepolia } from 'viem/chains';
import { http } from 'viem';
import { SupportedNetworksId } from 'src/networks/network.interface';

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
  [SupportedNetworksId.ARBITRUM_MAINNET]: createPublicClient({
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
};
