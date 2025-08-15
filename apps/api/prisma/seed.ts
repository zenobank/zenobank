import { PrismaClient, NetworkId, NetworkType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

main()
  .then(() => console.log('Seed executed'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
