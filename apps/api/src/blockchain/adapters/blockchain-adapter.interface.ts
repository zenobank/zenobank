import { TransactionStatus } from '@db/client';
import { OnChainTxStatus } from '../lib/types';

export interface BlockchainAdapter {
  getTransactionStatus(txHash: string): Promise<OnChainTxStatus>;
}
