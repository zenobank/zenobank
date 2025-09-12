import { NetworkId } from 'src/networks/network.interface';

export interface TxIdentifier {
  hash: string;
  networkId: NetworkId;
}

export interface TransactionRecordInput {
  networkId: NetworkId;
  txData: {
    hash: string;
    title: string;
    fromAddress: string;
    toAddress: string;
  };
}

export interface SweepWalletFundsJobData {
  sourceWalletAddress: string;
  networkId: NetworkId;
}
