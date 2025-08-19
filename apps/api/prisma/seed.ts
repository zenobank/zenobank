import {
  PrismaClient,
  NetworkId,
  NetworkType,
  TokenStandard,
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedNetworks() {
  await prisma.network.createMany({
    data: [
      {
        id: NetworkId.ETHEREUM_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Ethereum Mainnet',
        displayName: 'Ethereum',
      },
      {
        id: NetworkId.BASE_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Base Mainnet',
        displayName: 'Base',
      },
      {
        id: NetworkId.ARBITRUM_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Arbitrum Mainnet',
        displayName: 'Arbitrum',
      },
      {
        id: NetworkId.ETHEREUM_HOLESKY,
        networkType: NetworkType.EVM,
        name: 'Ethereum Holesky',
        isTestnet: true,
        displayName: 'Ethereum Holesky',
      },
    ],
    skipDuplicates: true,
  });
}

async function seedTokensOnNetworks() {
  await prisma.token.createMany({
    data: [
      {
        id: 'USDC_ETHEREUM_MAINNET',
        networkId: NetworkId.ETHEREUM_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        standard: TokenStandard.ERC20,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDC
        decimals: 6,
        isDeprecated: false,
      },
      {
        id: 'USDC_BASE_MAINNET',
        networkId: NetworkId.BASE_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        standard: TokenStandard.ERC20,
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC nativo
        decimals: 6,
        isDeprecated: false,
      },
      {
        id: 'USDC_ARBITRUM_MAINNET',
        networkId: NetworkId.ARBITRUM_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        standard: TokenStandard.ERC20,
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC nativo
        decimals: 6,
        isDeprecated: false,
      },
      {
        id: 'USDT_ETHEREUM_MAINNET',
        networkId: NetworkId.ETHEREUM_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        standard: TokenStandard.ERC20,
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
        decimals: 6,
        isDeprecated: false,
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
