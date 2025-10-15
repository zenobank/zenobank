'use client';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, Chain, bsc, sepolia, holesky } from 'viem/chains';
import {
  metaMaskWallet,
  coinbaseWallet,
  ledgerWallet,
  trustWallet,
  rabbyWallet,
  braveWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { SupportedNetworksId } from '@repo/networks/types';

const chainsById: Record<SupportedNetworksId, Chain> = {
  [SupportedNetworksId.ETHEREUM_MAINNET]: mainnet,
  [SupportedNetworksId.POLYGON_POS_MAINNET]: polygon,
  [SupportedNetworksId.ARBITRUM_ONE_MAINNET]: arbitrum,
  [SupportedNetworksId.BASE_MAINNET]: base,
  [SupportedNetworksId.BNB_MAINNET]: bsc,
  [SupportedNetworksId.ETHEREUM_HOLESKY]: holesky,
  [SupportedNetworksId.ETHEREUM_SEPOLIA]: sepolia,
}

const enabledChains = Object.values(chainsById) as [Chain, ...Chain[]];

export const wagmiConfig: ReturnType<typeof getDefaultConfig> = getDefaultConfig({
  appName: 'Zeno Bank Pay',
  projectId: 'YOUR_PROJECT_ID',
  chains: enabledChains,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, ledgerWallet, trustWallet, braveWallet],
    },
  ],
  ssr: true,
});
