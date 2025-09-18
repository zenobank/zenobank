import { Inject, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dtos/create-store.dto';
import { StoreResponseDto } from './dtos/store-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Svix } from 'svix';
import { SVIX_CLIENT } from 'src/webhooks/webhooks.constants';
import { WalletService } from 'src/wallet/services/wallet.service';
import { plainToInstance } from 'class-transformer';
import { toDto } from 'src/lib/utils/to-dto';
import { NetworkId } from 'src/networks/network.interface';
import { toEnumValue } from 'src/lib/utils/to-enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async createStore(createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    const wallets = await this.walletService.registerEvmWallet(
      createStoreDto.walletAddress,
    );

    const store = await this.db.store.create({
      data: {
        name: createStoreDto.name,
        domain: createStoreDto.domain,
        wallets: {
          connect: wallets.map((wallet) => ({
            id: wallet.id,
          })),
        },
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
        network: toEnumValue(NetworkId, wallet.network.id),
        address: wallet.address,
        label: wallet.label,
      })),
    });
  }
}
