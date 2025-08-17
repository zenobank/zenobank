import { NetworkId } from '@prisma/client';

export function isNativeToken(tokenAddress: string, network: NetworkId) {
  throw new Error('Not implemented');
  return (
    tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  );
}
export function nativeTokenAddress(networkId: NetworkId): string {
  return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
}
