import { Injectable } from '@nestjs/common';
import { AddressType } from 'src/lib/contants/address-type.enum';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

@Injectable()
export class WalletFactory {
  generate(type: AddressType): string {
    switch (type) {
      case AddressType.EVM:
        return this.generateEvmAddress();

      default:
        throw new Error(`Unsupported address type: ${type}`);
    }
  }

  private generateEvmAddress(): string {
    const privateKey = generatePrivateKey();
    const publicKey = privateKeyToAddress(privateKey);
    return publicKey;
  }

  private generateBitcoinAddress(): string {
    return 'bc1q...';
  }

  private generateSolanaAddress(): string {
    return 'So1...'; // mock
  }
}
