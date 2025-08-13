import { Network } from 'src/lib/contants/network';

export interface TransactionConfirmationJobData {
  txHash: string;
  network: Network;
  walletAddress: string;
}

export interface SweepWalletFundsJobData {
  sourceWalletAddress: string;
  network: Network;
}
