import { NetworkId } from '@prisma/client';
import ms from 'src/lib/utils/ms';

export interface NetworkConfirmationRule {
  minBlockConfirmations: number;
  maxWaitTime: number;
  retryDelay: number;
}

export const TX_CONFIRMATION_QUEUE_NAME = 'tx-confirmation';
export const SWEEP_WALLET_FUNDS_QUEUE_NAME = 'sweep-wallet-funds';

export const NETWORK_CONFIRMATION_POLICIES: Record<
  NetworkId,
  NetworkConfirmationRule
> = {
  [NetworkId.ETHEREUM_MAINNET]: {
    minBlockConfirmations: 6,
    maxWaitTime: ms('2h'),
    retryDelay: ms('10s'),
  },
  [NetworkId.BASE_MAINNET]: {
    minBlockConfirmations: 6,
    maxWaitTime: ms('2h'),
    retryDelay: ms('10s'),
  },
  [NetworkId.ARBITRUM_MAINNET]: {
    minBlockConfirmations: 6,
    maxWaitTime: ms('2h'),
    retryDelay: ms('10s'),
  },
  [NetworkId.ETHEREUM_HOLESKY]: {
    minBlockConfirmations: 6,
    maxWaitTime: ms('2h'),
    retryDelay: ms('10s'),
  },
} as const;
