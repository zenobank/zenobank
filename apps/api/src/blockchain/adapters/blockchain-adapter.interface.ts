import { TransactionStatus } from '@prisma/client';
import { OnChainTxStatus } from '../lib/types';

export interface BlockchainAdapter {
  getTransactionStatus(txHash: string): Promise<OnChainTxStatus>;
}
