import { SupportedNetworksId } from 'src/networks/network.interface';

export function isNativeToken(
  tokenAddress: string,
  network: SupportedNetworksId,
) {
  throw new Error('Not implemented');
  return (
    tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  );
}
export function nativeTokenAddress(networkId: SupportedNetworksId): string {
  return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
}
