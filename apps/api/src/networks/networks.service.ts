import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportedNetworksId } from '@repo/networks/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { NetworkResponseDto } from './dto/network-response.dto';
import { toDto } from 'src/lib/utils/to-dto';

@Injectable()
export class NetworksService {
  constructor(private readonly db: PrismaService) {}

  async getNetworks(): Promise<NetworkResponseDto[]> {
    const networks = await this.db.network.findMany();
    const networksDto = networks.map((network) =>
      toDto(NetworkResponseDto, network),
    );
    return networksDto;
  }

  async getNetwork(
    id: SupportedNetworksId,
  ): Promise<NetworkResponseDto | null> {
    const network = await this.db.network.findUnique({
      where: { id },
    });
    if (!network) {
      return null;
    }
    return toDto(NetworkResponseDto, network);
  }
}
