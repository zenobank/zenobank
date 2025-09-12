import { Injectable } from '@nestjs/common';
import { NetworkId } from 'src/networks/network.interface';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

@Injectable()
export class WalletFactory {
  generate(networkId: NetworkId): {
    address: string;
    privateKey: string;
  } {
    switch (networkId) {
      case NetworkId.ARBITRUM_MAINNET:
      case NetworkId.BASE_MAINNET:
      case NetworkId.ETHEREUM_HOLESKY:
      case NetworkId.ETHEREUM_MAINNET:
      case NetworkId.ETHEREUM_SEPOLIA:
        return this.generateEvmAddress();

      default:
        const _exhaustiveCheck: never = networkId;
        throw new Error(`Unsupported address type: ${networkId}`);
    }
  }

  private generateEvmAddress(): {
    address: string;
    privateKey: string;
  } {
    const privateKey = generatePrivateKey();
    const publicKey = privateKeyToAddress(privateKey);
    return { address: publicKey, privateKey };
  }

  private generateBitcoinAddress(): string {
    return 'bc1q...';
  }

  private generateSolanaAddress(): string {
    return 'So1...'; // mock
  }
}
