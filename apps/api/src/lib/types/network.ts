import { AddressType } from 'src/lib/contants/address-type.enum';

export interface NetworkInfo {
  addressType: AddressType;
  id: number;
  nativeCurrency: ChainNativeCurrency;
}

type ChainNativeCurrency = {
  name: string;
  /** 2-6 characters long */
  symbol: string;
  decimals: number;
  address: string;
};
