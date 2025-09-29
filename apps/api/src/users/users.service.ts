import { Injectable } from '@nestjs/common';
import { toDto } from 'src/lib/utils/to-dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletService } from 'src/wallet/wallet.service';

import { CreateStoreDto } from '../stores/dtos/create-store.dto';
import { StoreResponseDto } from '../stores/dtos/store-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async bootstrap(): Promise<UserResponseDto> {
    // ver el usuario
    const user = await this.db.user.create({
      data: {
        clerkUserId: '123',
        stores: {
          create: {
            name: 'Default Store',
          },
        },
      },
      include: {
        stores: true,
      },
    });
    return toDto(UserResponseDto, {
      ...user,
      stores: user.stores.map((store) => ({
        ...store,
        apiKey: store.apiKey,
        wallets: [],
      })),
    });
  }

  async getUser(): Promise<UserResponseDto | null> {
    const user = await this.db.user.findUnique({
      where: {
        // id: '98188bdb-4ecb-4366-967b-9340a2fb2666',
        id: '708f3ab1-a81d-4db8-8a46-0f759d021ac0',
      },
      include: {
        stores: {
          select: {
            apiKey: true,
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
            id: true,
            name: true,
          },
        },
      },
    });
    if (!user) {
      return null;
    }
    return toDto(UserResponseDto, {
      ...user,
      stores: user.stores.map((store) => ({
        ...store,
        apiKey: store.apiKey,
        wallets: store.wallets.map((wallet) => ({
          ...wallet,
          network: toEnumValue(SupportedNetworksId, wallet.network.id),
        })),
      })),
    });
  }
}
