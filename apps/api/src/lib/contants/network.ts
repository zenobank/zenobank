import { arbitrum, base, holesky, mainnet } from 'viem/chains';
import { AddressType } from 'src/lib/contants/address-type.enum';
import { NetworkInfo } from 'src/lib/types/network';
import { ADDRESS_TOKEN_ETH } from './common-tokens';
import { createPublicClient, http } from 'viem';

export enum Network {
  ETHEREUM_MAINNET = 'ethereum-mainnet',
  BASE_MAINNET = 'base-mainnet',
  ARBITRUM_MAINNET = 'arbitrum-mainnet',
  ETHEREUM_HOLESKY = 'ethereum-holesky',
}

export const NETWORK_INFO = {
  [Network.ETHEREUM_MAINNET]: {
    addressType: AddressType.EVM,
    id: mainnet.id,
    nativeCurrency: { ...mainnet.nativeCurrency, address: ADDRESS_TOKEN_ETH },
  },
  [Network.BASE_MAINNET]: {
    addressType: AddressType.EVM,
    id: base.id,
    nativeCurrency: { ...base.nativeCurrency, address: ADDRESS_TOKEN_ETH },
  },
  [Network.ARBITRUM_MAINNET]: {
    addressType: AddressType.EVM,
    id: arbitrum.id,
    nativeCurrency: { ...arbitrum.nativeCurrency, address: ADDRESS_TOKEN_ETH },
  },
  [Network.ETHEREUM_HOLESKY]: {
    addressType: AddressType.EVM,
    id: holesky.id,
    nativeCurrency: { ...holesky.nativeCurrency, address: ADDRESS_TOKEN_ETH },
  },
} satisfies Record<Network, NetworkInfo>;

export const EVM_NETWORKS = Object.keys(NETWORK_INFO).filter(
  (net) => NETWORK_INFO[net as Network].addressType === AddressType.EVM,
) as Network[];
