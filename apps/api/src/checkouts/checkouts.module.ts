import { Module } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { CheckoutsController } from './checkouts.controller';

@Module({
  providers: [CheckoutsService],
  controllers: [CheckoutsController]
})
export class CheckoutsModule {}
