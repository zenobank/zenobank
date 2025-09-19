import { NetworkId } from '@/src/lib/requests/api-client/model'

export interface CanonicalTokenOption {
  id: string
  symbol: string
  imageUrl: string
  networks: NetworkId[]
}
