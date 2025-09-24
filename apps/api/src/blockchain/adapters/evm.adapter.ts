import { BlockchainAdapter } from './blockchain-adapter.interface';
import { client } from 'src/lib/utils/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { OnChainTxStatus } from '../lib/types';

export class EvmAdapter implements BlockchainAdapter {
  constructor(private readonly networkId: SupportedNetworksId) {}

  async getTransactionStatus(txHash: string): Promise<OnChainTxStatus> {
    const [txReceipt, latestBlock] = await Promise.all([
      client(this.networkId).getTransactionReceipt({
        hash: txHash as `0x${string}`,
      }),
      client(this.networkId).getBlockNumber(),
    ]);
    if (!txReceipt || txReceipt.blockNumber == null) {
      return {
        confirmations: 0,
        status: txReceipt?.status,
      };
    }
    return {
      confirmations: Number(latestBlock - (txReceipt?.blockNumber || 0n)),
      status: txReceipt?.status,
    };
  }
}
