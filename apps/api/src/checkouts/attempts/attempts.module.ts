import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
