import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainFactory } from './adapters/blockchain-adapter.factory';

@Module({
  providers: [BlockchainFactory],
  exports: [BlockchainFactory],
})
export class BlockchainModule {}
