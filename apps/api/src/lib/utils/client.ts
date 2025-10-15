import {
  Account,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from 'viem';
import { publicClients } from 'src/lib/contants/client';
import { SupportedNetworksId } from 'src/networks/networks.interface';

export function client(networkId: SupportedNetworksId): PublicClient {
  return publicClients[networkId];
}
export function walletClient(
  networkId: SupportedNetworksId,
  account: Account,
): WalletClient {
  const publicClient = client(networkId);

  return createWalletClient({
    account,
    chain: publicClient.chain,
    transport: http(),
  });
}
