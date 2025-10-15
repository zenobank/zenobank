import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { ConversionsModule } from 'src/conversions/conversions.module';
import { CheckoutsModule } from '../checkouts.module';
import { AttemptsController } from './attempts.controller';

@Module({
  imports: [PrismaModule, TokensModule, ConversionsModule, CheckoutsModule],
  providers: [AttemptsService],
  controllers: [AttemptsController],
  exports: [AttemptsService],
})
export class AttemptsModule {}
