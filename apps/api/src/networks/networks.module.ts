import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NetworksController } from './networks.controller';

@Module({
  providers: [NetworksService],
  imports: [PrismaModule],
  exports: [NetworksService],
  controllers: [NetworksController],
})
export class NetworksModule {}
