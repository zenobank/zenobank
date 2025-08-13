import { BlockchainAdapterFactory } from './blockchain-adapter.factory';
import { Network } from 'src/lib/contants/network';

describe('BlockchainAdapterFactory', () => {
  let factory: BlockchainAdapterFactory;

  beforeEach(() => {
    factory = new BlockchainAdapterFactory();
  });

  it('should handle all defined networks in getAdapter()', () => {
    const allNetworks = Object.values(Network);
    const unhandled: Network[] = [];

    for (const network of allNetworks) {
      try {
        factory.getAdapter(network as Network);
      } catch (e) {
        unhandled.push(network as Network);
      }
    }

    expect(unhandled).toEqual([]);
  });
});
