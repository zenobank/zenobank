import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dtos/create-store.dto';
import { StoreResponseDto } from './dtos/store-response.dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { toDto } from 'src/lib/utils/to-dto';
import { WalletService } from 'src/wallets/wallet.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly db: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async createStore(
    createStoreDto: CreateStoreDto,
    userId: string,
  ): Promise<StoreResponseDto> {
    const store = await this.db.store.create({
      data: {
        name: createStoreDto.name,
        userId: userId,
      },
      include: {
        wallets: {
          select: {
            id: true,
            address: true,
            label: true,
            createdAt: true,
            updatedAt: true,
            network: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return toDto(StoreResponseDto, {
      ...store,
      wallets: store.wallets.map((wallet) => ({
        id: wallet.id,
        network: toEnumValue(SupportedNetworksId, wallet.network.id),
        address: wallet.address,
        label: wallet.label,
      })),
    });
  }
}
