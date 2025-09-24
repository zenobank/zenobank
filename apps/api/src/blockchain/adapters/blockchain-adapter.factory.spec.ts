import { BlockchainFactory } from './blockchain-adapter.factory';
import { SupportedNetworksId } from 'src/networks/network.interface';

describe('BlockchainAdapterFactory', () => {
  let factory: BlockchainFactory;

  beforeEach(() => {
    factory = new BlockchainFactory();
  });

  it('should handle all defined networks in getAdapter()', () => {
    const allNetworks = Object.values(SupportedNetworksId);
    const unhandled: SupportedNetworksId[] = [];

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
