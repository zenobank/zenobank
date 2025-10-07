import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { ConversionsModule } from 'src/conversions/conversions.module';

@Module({
  imports: [PrismaModule, TokensModule, ConversionsModule],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
