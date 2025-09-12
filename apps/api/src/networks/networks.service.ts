import { Injectable, NotFoundException } from '@nestjs/common';
import { NetworkId } from 'src/networks/network.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { NetworkResponseDto } from './dto/network-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NetworksService {
  constructor(private readonly db: PrismaService) {}

  async getNetworks(): Promise<NetworkResponseDto[]> {
    const networks = await this.db.network.findMany();
    return plainToInstance(NetworkResponseDto, networks);
  }

  async getNetwork(id: NetworkId): Promise<NetworkResponseDto | null> {
    const network = await this.db.network.findUnique({
      where: { id },
    });
    return plainToInstance(NetworkResponseDto, network);
  }
}
