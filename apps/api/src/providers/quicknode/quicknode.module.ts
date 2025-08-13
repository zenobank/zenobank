import { Module } from '@nestjs/common';
import { QuickNodeService } from './quicknode.service';
import { QuicknodeController } from './quicknode.controller';

@Module({
  providers: [QuickNodeService],
  exports: [QuickNodeService],
  controllers: [QuicknodeController],
})
export class QuicknodeModule {}
