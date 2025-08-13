import { Network, NETWORK_INFO } from 'src/lib/contants/network';

export function isNativeToken(tokenAddress: string, network: Network) {
  return (
    tokenAddress.toLowerCase() ===
    NETWORK_INFO[network].nativeCurrency.address.toLowerCase()
  );
}
export function nativeTokenAddress(network: Network): string {
  return NETWORK_INFO[network].nativeCurrency.address;
}
