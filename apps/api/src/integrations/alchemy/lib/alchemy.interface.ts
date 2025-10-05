import {
  Network as AlchemyNetwork,
  ERC1155Metadata,
  Log,
  RawContract,
  WebhookType,
} from 'alchemy-sdk';

export interface AddressActivityWebhookResponse {
  webhookId: string;
  id: string;
  createdAt: string;
  type: WebhookType;
  event: {
    network: AlchemyNetwork;
    activity: AddressActivity[];
  };
}

export interface AddressActivity {
  blockNum: string;
  hash: string;
  fromAddress: string;
  toAddress: string | null;
  value?: number | null;
  erc721TokenId?: string | null;
  erc1155Metadata?: ERC1155Metadata[] | null;
  asset?: string | null; // e.g. "ETH", "USDC"
  category:
    | 'external'
    | 'internal'
    | 'token'
    | 'erc20'
    | 'erc721'
    | 'erc1155'
    | 'specialnft';
  rawContract: RawContract;
  typeTraceAddress?: string | null;
  log?: Log;
}
