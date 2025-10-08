import { Injectable, Logger } from '@nestjs/common';
import { toDto } from 'src/lib/utils/to-dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletService } from 'src/wallets/wallet.service';

import { CreateStoreDto } from '../stores/dtos/create-store.dto';
import { StoreResponseDto } from '../stores/dtos/store-response.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { generateApiKey } from 'src/lib/utils/generate-api-key';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly db: PrismaService) {}

  async bootstrap(userId: string): Promise<UserResponseDto> {
    this.logger.log('Bootstrapping user');

    // First, try to find the user
    let user = await this.db.user.findUnique({
      where: { id: userId },
      include: { stores: { include: { binancePayCredential: true } } },
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await this.db.user.create({
        data: {
          id: userId,
          stores: {
            create: {
              apiKey: generateApiKey(),
              name: 'Default Store',
            },
          },
        },
        include: { stores: { include: { binancePayCredential: true } } },
      });
    } else if (user.stores.length === 0) {
      // If user exists but has no stores, create a default store
      const store = await this.db.store.create({
        data: {
          name: 'Default Store',
          userId: user.id,
          apiKey: generateApiKey(),
        },
        include: {
          binancePayCredential: true,
        },
      });
      user.stores.push(store);
    }

    return toDto(UserResponseDto, {
      ...user,
      stores: user.stores.map((store) => ({
        ...store,
        apiKey: store.apiKey,
        binancePayCredential: store.binancePayCredential,
        wallets: [],
      })),
    });
  }

  async getUser(userId: string): Promise<UserResponseDto | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        stores: {
          select: {
            apiKey: true,
            binancePayCredential: {
              select: {
                id: true,
                accountId: true,
                apiKey: true,
              },
            },
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
