import type { NetworkId, TokenResponseDto } from '@/src/lib/requests/api-client/model';
import { CanonicalTokenOption } from '../types/cannonical-token-option';

export function getCanonicalTokenOptions(tokens: TokenResponseDto[] | undefined): CanonicalTokenOption[] {
  if (!tokens) return [];

  const map = new Map<string, { id: string; symbol: string; imageUrl: string; networks: Set<NetworkId> }>();

  for (const t of tokens) {
    const key = t.canonicalTokenId;
    const exist = map.get(key);

    if (!exist) {
      map.set(key, {
        id: t.id, // tomamos el primero que aparezca
        symbol: t.symbol,
        imageUrl: `/images/tokens/${key.toLowerCase()}.png`,
        networks: new Set<NetworkId>([t.networkId]),
      });
    } else {
      exist.networks.add(t.networkId);
    }
  }

  return Array.from(map.values()).map((o) => ({
    id: o.id,
    symbol: o.symbol,
    imageUrl: o.imageUrl,
    networks: Array.from(o.networks), // si quieres orden, aplica sort aquí
  }));
}
