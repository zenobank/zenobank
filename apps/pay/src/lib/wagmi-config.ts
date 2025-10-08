'use client';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import {
  metaMaskWallet,
  coinbaseWallet,
  ledgerWallet,
  trustWallet,
  rabbyWallet,
  braveWallet,
} from '@rainbow-me/rainbowkit/wallets';
// filtrar todas las chains, cogerlo del enum
export const wagmiConfig: ReturnType<typeof getDefaultConfig> = getDefaultConfig({
  appName: 'Zeno Bank Pay',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  wallets: [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, ledgerWallet, trustWallet, braveWallet],
    },
  ],
  ssr: true,
});
