import { Injectable } from '@nestjs/common';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

@Injectable()
export class WalletFactory {
  generate(networkId: SupportedNetworksId): {
    address: string;
    privateKey: string;
  } {
    switch (networkId) {
      case SupportedNetworksId.ARBITRUM_ONE_MAINNET:
      case SupportedNetworksId.BASE_MAINNET:
      case SupportedNetworksId.BNB_MAINNET:
      case SupportedNetworksId.POLYGON_POS_MAINNET:
      case SupportedNetworksId.ETHEREUM_HOLESKY:
      case SupportedNetworksId.ETHEREUM_MAINNET:
      case SupportedNetworksId.ETHEREUM_SEPOLIA:
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
