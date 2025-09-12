import { BlockchainAdapterFactory } from './blockchain-adapter.factory';
import { NetworkId } from 'src/networks/network.interface';

describe('BlockchainAdapterFactory', () => {
  let factory: BlockchainAdapterFactory;

  beforeEach(() => {
    factory = new BlockchainAdapterFactory();
  });

  it('should handle all defined networks in getAdapter()', () => {
    const allNetworks = Object.values(NetworkId);
    const unhandled: NetworkId[] = [];

    for (const network of allNetworks) {
      try {
        factory.getAdapter(network);
      } catch (e) {
        unhandled.push(network);
      }
    }

    expect(unhandled).toEqual([]);
  });
});
