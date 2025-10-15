import { PrismaClient, NetworkType } from '@prisma/client';
import { ms } from 'src/lib/utils/ms';
import { SupportedNetworksId } from '@repo/networks/types';

const prisma = new PrismaClient();

async function seedNetworks() {
  await prisma.network.createMany({
    data: [
      {
        id: SupportedNetworksId.ETHEREUM_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Ethereum Mainnet',
        chainId: 1,
        displayName: 'Ethereum',
        isTestnet: false,
        minBlockConfirmations: 8,
        maxConfirmationAttempts: ms('1h') / ms('3s'),
        confirmationRetryDelay: ms('3s'),
      },
      {
        id: SupportedNetworksId.BASE_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Base Mainnet',
        displayName: 'Base',
        chainId: 8453,
        isTestnet: false,
        minBlockConfirmations: 3,
        maxConfirmationAttempts: ms('1h') / ms('3s'),
        confirmationRetryDelay: ms('3s'),
      },
      {
        id: SupportedNetworksId.ARBITRUM_ONE_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Arbitrum One Mainnet',
        chainId: 42161,
        displayName: 'Arbitrum',
        isTestnet: false,
        minBlockConfirmations: 3,
        maxConfirmationAttempts: ms('1h') / ms('3s'),
        confirmationRetryDelay: ms('3s'),
      },
      {
        id: SupportedNetworksId.POLYGON_POS_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Polygon POS Mainnet',
        displayName: 'Polygon',
        chainId: 137,
        isTestnet: false,
        minBlockConfirmations: 3,
        maxConfirmationAttempts: ms('1h') / ms('3s'),
        confirmationRetryDelay: ms('3s'),
      },
      {
        id: SupportedNetworksId.BNB_MAINNET,
        networkType: NetworkType.EVM,
        name: 'BNB Mainnet',
        displayName: 'BNB',
        chainId: 56,
        isTestnet: false,
        minBlockConfirmations: 3,
        maxConfirmationAttempts: ms('1h') / ms('3s'),
        confirmationRetryDelay: ms('3s'),
      },

      // {
      //   id: NetworkId.ETHEREUM_HOLESKY,
      //   networkType: NetworkType.EVM,
      //   name: 'Ethereum Holesky',
      //   isTestnet: true,
      //   displayName: 'Ethereum Holesky',
      //   depositConfirmations: 12,
      //   avgBlockTime: 12,
      // },
      // {
      //   id: NetworkId.ETHEREUM_SEPOLIA,
      //   networkType: NetworkType.EVM,
      //   name: 'Ethereum Sepolia',
      //   isTestnet: true,
      //   displayName: 'Ethereum Sepolia',
      //   depositConfirmations: 12,
      //   avgBlockTime: 12,
      // },
    ],
    skipDuplicates: true,
  });
}

async function seedTokensOnNetworks() {
  await prisma.onchainToken.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'USDT_ETHEREUM_MAINNET',
        networkId: SupportedNetworksId.ETHEREUM_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdt.png',
      },
      {
        id: 'USDT_BASE_MAINNET',
        networkId: SupportedNetworksId.BASE_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdt.png',
      },
      {
        id: 'USDT_BNB_MAINNET',
        networkId: SupportedNetworksId.BNB_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        address: '0x55d398326f99059ff775485246999027b3197955',
        decimals: 18,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdt.png',
      },
      {
        id: 'USDT_ARBITRUM_ONE_MAINNET',
        networkId: SupportedNetworksId.ARBITRUM_ONE_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdt.png',
      },
      {
        id: 'USDT_POLYGON_POS_MAINNET',
        networkId: SupportedNetworksId.POLYGON_POS_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdt.png',
      },
      {
        id: 'USDC_BASE_MAINNET',
        networkId: SupportedNetworksId.BASE_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdc.png',
      },
      {
        id: 'USDC_ARBITRUM_ONE_MAINNET',
        networkId: SupportedNetworksId.ARBITRUM_ONE_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdc.png',
      },
      {
        id: 'USDC_POLYGON_POS_MAINNET',
        networkId: SupportedNetworksId.POLYGON_POS_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdc.png',
      },
      {
        id: 'USDC_BNB_MAINNET',
        networkId: SupportedNetworksId.BNB_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        decimals: 18,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdc.png',
      },
      {
        id: 'USDC_ETHEREUM_MAINNET',
        networkId: SupportedNetworksId.ETHEREUM_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdc.png',
      },

      // USDE (Ethena)
      {
        id: 'USDE_ETHEREUM_MAINNET',
        networkId: SupportedNetworksId.ETHEREUM_MAINNET,
        symbol: 'USDe',
        canonicalTokenId: 'USDE',
        address: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
        decimals: 18,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usde.png',
      },
      {
        id: 'USDE_BASE_MAINNET',
        networkId: SupportedNetworksId.BASE_MAINNET,
        symbol: 'USDe',
        canonicalTokenId: 'USDE',
        address: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
        decimals: 18,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usde.png',
      },
      {
        id: 'USDE_ARBITRUM_ONE_MAINNET',
        networkId: SupportedNetworksId.ARBITRUM_ONE_MAINNET,
        symbol: 'USDe',
        canonicalTokenId: 'USDE',
        address: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
        decimals: 18,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usde.png',
      },
      {
        id: 'USDE_BNB_MAINNET',
        networkId: SupportedNetworksId.BNB_MAINNET,
        symbol: 'USDe',
        canonicalTokenId: 'USDE',
        address: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34',
        decimals: 18,
        logoUrl: 'https://pay.zenobank.io/images/tokens/usde.png',
      },
    ],
  });

  await prisma.binancePayToken.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'USDT_BINANCE_PAY',
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdt.png',
        name: 'USDT',
        canonicalTokenId: 'USDT',
        binanceTokenId: 'USDT',
        symbol: 'USDT',
      },
      {
        id: 'USDC_BINANCE_PAY',
        logoUrl: 'https://pay.zenobank.io/images/tokens/usdc.png',
        name: 'USDC',
        canonicalTokenId: 'USDC',
        binanceTokenId: 'USDC',
        symbol: 'USDC',
      },
    ],
  });
}

async function main() {
  await seedNetworks();
  await seedTokensOnNetworks();
}

main()
  .then(() => console.log('Seed executed'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
