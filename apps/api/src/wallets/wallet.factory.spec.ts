import { describe, it, expect, beforeEach } from 'vitest';
import { WalletFactory } from './wallets.factory';
import { SupportedNetworksId } from '@repo/networks';

describe('WalletFactory', () => {
  let walletFactory: WalletFactory;

  beforeEach(() => {
    walletFactory = new WalletFactory();
  });

  describe('network coverage - DYNAMIC CHECK', () => {
    it('should handle ALL networks from Prisma enum - no network forgotten!', () => {
      const allNetworksFromPrisma = Object.values(SupportedNetworksId);

      allNetworksFromPrisma.forEach((networkId) => {
        expect(() => walletFactory.generate(networkId)).not.toThrow();
      });
    });
  });
});
