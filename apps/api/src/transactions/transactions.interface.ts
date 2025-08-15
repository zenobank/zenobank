import { NetworkId } from '@prisma/client';

export interface TransactionConfirmationJobData {
  txHash: string;
  network: NetworkId;
  walletAddress: string;
}

export interface SweepWalletFundsJobData {
  sourceWalletAddress: string;
  network: NetworkId;
}
