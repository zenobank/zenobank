import {
  Account,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from 'viem';
import { publicClients } from 'src/lib/contants/client';
import { Network } from 'src/lib/contants/network';

export function client(network: Network): PublicClient {
  return publicClients[network];
}
export function walletClient(network: Network, account: Account): WalletClient {
  const publicClient = client(network);

  return createWalletClient({
    account,
    chain: publicClient.chain,
    transport: http(),
  });
}
