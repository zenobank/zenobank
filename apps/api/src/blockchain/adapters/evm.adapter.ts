import { BlockchainAdapter } from './blockchain-adapter.interface';
import { Network } from 'src/lib/contants/network';
import { client } from 'src/lib/utils/client';

export class EvmAdapter implements BlockchainAdapter {
  constructor(private readonly network: Network) {}

  async getTransactionStatus(txHash: string): Promise<{
    confirmations: number;
    status: 'success' | 'reverted';
  }> {
    const [txReceipt, latestBlock] = await Promise.all([
      client(this.network).getTransactionReceipt({
        hash: txHash as `0x${string}`,
      }),
      client(this.network).getBlockNumber(),
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
