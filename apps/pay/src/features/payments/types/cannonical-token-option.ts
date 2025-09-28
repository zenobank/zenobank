import { NetworkId } from '@repo/api-client/model';

export interface CanonicalTokenOption {
  canonicalTokenId: string;
  symbol: string;
  imageUrl: string;
  networks: NetworkId[];
}
