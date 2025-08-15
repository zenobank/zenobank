import {
  Account,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from 'viem';
import { publicClients } from 'src/lib/contants/client';
import { NetworkId } from '@prisma/client';

export function client(networkId: NetworkId): PublicClient {
  return publicClients[networkId];
}
export function walletClient(
  networkId: NetworkId,
  account: Account,
): WalletClient {
  const publicClient = client(networkId);

  return createWalletClient({
    account,
    chain: publicClient.chain,
    transport: http(),
  });
}
