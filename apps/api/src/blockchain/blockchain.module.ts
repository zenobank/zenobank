import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainAdapterFactory } from './adapters/blockchain-adapter.factory';

@Module({
  providers: [BlockchainAdapterFactory],
  exports: [BlockchainAdapterFactory],
})
export class BlockchainModule {}
