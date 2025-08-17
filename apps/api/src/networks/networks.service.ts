import { Injectable, NotFoundException } from '@nestjs/common';
import { Network, NetworkId } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NetworksService {
  constructor(private readonly db: PrismaService) {}

  async getNetwork(id: NetworkId): Promise<Network | null> {
    const network = await this.db.network.findUnique({
      where: { id },
    });
    return network;
  }

  async getNetworkOrThrow(id: NetworkId): Promise<Network> {
    const network = await this.getNetwork(id);
    if (!network) throw new NotFoundException('Network not found');
    return network;
  }
}
