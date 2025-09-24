import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { NetworkResponseDto } from './dto/network-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { Network } from '@prisma/client';

@Injectable()
export class NetworksService {
  constructor(private readonly db: PrismaService) {}

  async getNetworks(): Promise<Network[]> {
    const networks = await this.db.network.findMany();
    return networks;
  }

  async getNetwork(id: SupportedNetworksId): Promise<Network | null> {
    const network = await this.db.network.findUnique({
      where: { id },
    });
    if (!network) {
      return null;
    }
    return network;
  }
}
