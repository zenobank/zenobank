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
      },
      {
        id: NetworkId.BASE_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Base Mainnet',
      },
      {
        id: NetworkId.ARBITRUM_MAINNET,
        networkType: NetworkType.EVM,
        name: 'Arbitrum Mainnet',
      },
      {
        id: NetworkId.ETHEREUM_HOLESKY,
        networkType: NetworkType.EVM,
        name: 'Ethereum Holesky',
        isTestnet: true,
      },
    ],
    skipDuplicates: true,
  });
}
async function seedTokens() {
  await prisma.tokenCanonical.createMany({
    data: [
      {
        id: 'USDC',
        name: 'USDC',
        symbol: 'USDC',
      },
      {
        id: 'USDT',
        name: 'USDT',
        symbol: 'USDT',
      },
      {
        id: 'BTC',
        name: 'Bitcoin',
        symbol: 'BTC',
      },
      {
        id: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
      },
      {
        id: 'SOL',
        name: 'Solana',
        symbol: 'SOL',
      },
      {
        id: 'XRP',
        name: 'Ripple',
        symbol: 'XRP',
      },
      {
        id: 'DOGE',
        name: 'Dogecoin',
        symbol: 'DOGE',
      },
      {
        id: 'LTC',
        name: 'Litecoin',
        symbol: 'LTC',
      },
      {
        id: 'BCH',
        name: 'Bitcoin Cash',
        symbol: 'BCH',
      },
      {
        id: 'XLM',
        name: 'Stellar',
        symbol: 'XLM',
      },
      {
        id: 'ADA',
        name: 'Cardano',
        symbol: 'ADA',
      },
      {
        id: 'DOT',
        name: 'Polkadot',
        symbol: 'DOT',
      },
      {
        id: 'LINK',
        name: 'Chainlink',
        symbol: 'LINK',
      },
      {
        id: 'UNI',
        name: 'Uniswap',
        symbol: 'UNI',
      },
    ],
  });
  await prisma.tokenOnNetwork.createMany({
    data: [
      {
        id: 'USDC_ETHEREUM_MAINNET',
        networkId: NetworkId.ETHEREUM_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        standard: TokenStandard.ERC20,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 6,
        isDeprecated: false,
      },
      {
        id: 'USDC_BASE_MAINNET',
        networkId: NetworkId.BASE_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        standard: TokenStandard.ERC20,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 6,
        isDeprecated: false,
      },
      {
        id: 'USDC_ARBITRUM_MAINNET',
        networkId: NetworkId.ARBITRUM_MAINNET,
        symbol: 'USDC',
        canonicalTokenId: 'USDC',
        standard: TokenStandard.ERC20,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 6,
        isDeprecated: false,
      },
      {
        id: 'USDT_ETHEREUM_MAINNET',
        networkId: NetworkId.ETHEREUM_MAINNET,
        symbol: 'USDT',
        canonicalTokenId: 'USDT',
        standard: TokenStandard.ERC20,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 6,
        isDeprecated: false,
      },
    ],
  });
}

async function main() {
  await seedNetworks();
  await seedTokens();
}

main()
  .then(() => console.log('Seed executed'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
