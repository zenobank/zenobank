import { Module } from '@nestjs/common';
import { ConversionsService } from './conversions.service';
import { ConversionsController } from './conversions.controller';

@Module({
  providers: [ConversionsService],
  controllers: [ConversionsController],
  exports: [ConversionsService],
})
export class ConversionsModule {}
