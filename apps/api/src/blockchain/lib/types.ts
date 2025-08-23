export interface OnChainTxStatus {
  status: 'success' | 'reverted';
  confirmations: number;
}
