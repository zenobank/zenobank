import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [NetworksService],
  imports: [PrismaModule],
  exports: [NetworksService],
})
export class NetworksModule {}
