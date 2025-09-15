import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, NetworkId } from '@prisma/client';

const prisma = new PrismaClient();

describe('NetworkId enum consistency', () => {
  beforeAll(async () => {
    // Opcional: podrías poblar con seed antes del test
    // await prisma.network.createMany(...);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('cada valor de NetworkId debe existir como registro en Network', async () => {
    const networks = await prisma.network.findMany({
      select: { id: true },
    });
    const existingIds = networks.map((n) => n.id);

    const missing = Object.values(NetworkId).filter(
      (id) => !existingIds.includes(id),
    );

    expect(missing).toEqual([]);
  });
});
