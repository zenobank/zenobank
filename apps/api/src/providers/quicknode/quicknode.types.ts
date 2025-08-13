export type QuickNodeNetwork =
  | 'abstract-mainnet'
  | 'abstract-testnet'
  | 'arbitrum-mainnet'
  | 'arbitrum-sepolia'
  | 'avalanche-fuji'
  | 'avalanche-mainnet'
  | 'b3-mainnet'
  | 'b3-sepolia'
  | 'base-mainnet'
  | 'base-sepolia'
  | 'bera-mainnet'
  | 'bera-bepolia'
  | 'bitcoin-mainnet'
  | 'blast-mainnet'
  | 'blast-sepolia'
  | 'bnbchain-mainnet'
  | 'bnbchain-testnet'
  | 'celo-mainnet'
  | 'cyber-mainnet'
  | 'cyber-sepolia'
  | 'ethereum-holesky'
  | 'ethereum-hoodi'
  | 'ethereum-mainnet'
  | 'ethereum-sepolia'
  | 'fantom-mainnet'
  | 'flow-mainnet'
  | 'flow-testnet'
  | 'gnosis-mainnet'
  | 'gravity-alpham'
  | 'hedera-mainnet'
  | 'hedera-testnet'
  | 'hemi-mainnet'
  | 'hemi-testnet'
  | 'imx-mainnet'
  | 'imx-testnet'
  | 'injective-mainnet'
  | 'injective-testnet'
  | 'ink-mainnet'
  | 'ink-sepolia'
  | 'joc-mainnet'
  | 'kaia-mainnet'
  | 'kaia-testnet'
  | 'lens-mainnet'
  | 'lens-testnet'
  | 'linea-mainnet'
  | 'mantle-mainnet'
  | 'mantle-sepolia'
  | 'monad-testnet'
  | 'morph-holesky'
  | 'morph-mainnet'
  | 'nova-mainnet'
  | 'omni-mainnet'
  | 'omni-omega'
  | 'optimism-mainnet'
  | 'optimism-sepolia'
  | 'peaq-mainnet'
  | 'plasma-testnet'
  | 'polygon-amoy'
  | 'polygon-mainnet'
  | 'race-mainnet'
  | 'race-testnet'
  | 'sahara-testnet'
  | 'scroll-mainnet'
  | 'scroll-testnet'
  | 'sei-mainnet'
  | 'sei-testnet'
  | 'solana-devnet'
  | 'solana-mainnet'
  | 'solana-testnet'
  | 'sonic-mainnet'
  | 'soneium-mainnet'
  | 'sophon-mainnet'
  | 'sophon-testnet'
  | 'story-aeneid'
  | 'story-mainnet'
  | 'tron-mainnet'
  | 'unichain-mainnet'
  | 'unichain-sepolia'
  | 'vana-mainnet'
  | 'vana-moksha'
  | 'worldchain-mainnet'
  | 'worldchain-sepolia'
  | 'xai-mainnet'
  | 'xai-sepolia'
  | 'xrp-mainnet'
  | 'xrp-testnet'
  | 'zerog-galileo'
  | 'zkevm-cardona'
  | 'zkevm-mainnet'
  | 'zksync-mainnet'
  | 'zksync-sepolia'
  | 'zora-mainnet';

export type QuickNodeTemplateId = 'evmWalletFilter';

export interface BaseWebhookPayload {
  name?: string;
  network: QuickNodeNetwork;
  notification_email?: string;
  destination_attributes: {
    url: string;
    compression: 'none' | 'gzip';
    security_token?: string;
  };
  status?: WebhookStatus;
}

// EVM Wallet Filter
export interface EvmWalletFilterTemplate extends BaseWebhookPayload {
  templateArgs: {
    wallets: string[];
  };
}

// EVM Contract Events

// EVM ABI Filter

// Union de todos los templates válidos
export type QuickNodeTemplateWebhookPayload = EvmWalletFilterTemplate;

export type WebhookStatus = 'active' | 'paused' | 'terminated';

export type CompressionType = 'none' | 'gzip';

export interface QuickNodeDestinationAttributes {
  url: string;
  security_token: string;
  compression?: CompressionType;
}

export interface QuickNodeWebhookCreatePayload {
  name?: string;
  network: QuickNodeNetwork;
  filter_function: string;
  notification_email?: string;
  destination_attributes: QuickNodeDestinationAttributes;
  status?: WebhookStatus;
}

export interface QuickNodeWebhookResponse {
  id: string;
  name: string;
  network: QuickNodeNetwork;
  filter_function: string;
  notification_email?: string;
  destination_attributes: QuickNodeDestinationAttributes;
  status: WebhookStatus;
  created_at: string;
  updated_at: string;
  sequence: number;
}
