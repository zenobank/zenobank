import { BlockchainAdapter } from './blockchain-adapter.interface';
import { client } from 'src/lib/utils/client';
import { NetworkId } from '@prisma/client';

export class EvmAdapter implements BlockchainAdapter {
  constructor(private readonly networkId: NetworkId) {}

  async getTransactionStatus(txHash: string): Promise<{
    confirmations: number;
    status: 'success' | 'reverted';
  }> {
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
