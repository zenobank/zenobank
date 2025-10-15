import { SupportedNetworksId } from '@repo/networks/types';

export interface TxIdentifier {
  hash: string;
  networkId: SupportedNetworksId;
}

export interface TransactionConfirmationJob {
  paymentId: string;
}

export interface TransactionRecordInput {
  networkId: SupportedNetworksId;
  txData: {
    hash: string;
    title: string;
    fromAddress: string;
    toAddress: string;
  };
}

export interface SweepWalletFundsJobData {
  sourceWalletAddress: string;
  networkId: SupportedNetworksId;
}
