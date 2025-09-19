import { NetworkId } from '@/src/lib/requests/api-client/model';

export interface CheckoutSelection {
  selectedTokenId: string | null;

  // same id, but orval generate a type for the response and we are using also the prisma type
  selectedNetworkId: NetworkId | null;
}
