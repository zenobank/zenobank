import { NetworkId } from '@/src/lib/requests/api-client/model';

export interface CanonicalTokenOption {
  canonicalTokenId: string;
  symbol: string;
  imageUrl: string;
  networks: NetworkId[];
}
