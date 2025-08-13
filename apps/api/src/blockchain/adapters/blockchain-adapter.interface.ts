export interface BlockchainAdapter {
  getTransactionStatus(txHash: string): Promise<{ confirmations: number }>;
}
