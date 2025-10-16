import { Injectable, Logger } from '@nestjs/common';
import { toDto } from 'src/lib/utils/to-dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from '@repo/networks';
import { PrismaService } from 'src/prisma/prisma.service';

import { UserResponseDto } from './dtos/user-response.dto';
import { generateApiKey } from 'src/lib/utils/generate-api-key';
import { BootstrapResponseDto } from './dtos/bootstrap-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly db: PrismaService) {}

  async bootstrap(userId: string): Promise<void> {
    this.logger.log('Bootstrapping user with id: ' + userId);
    if (!userId) throw new Error('User id is required for bootstrap');
    try {
      const user = await this.db.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          stores: {
            connectOrCreate: {
              where: { userId_name: { userId, name: 'Default Store' } },
              create: {
                name: 'Default Store',
                apiKey: generateApiKey(),
              },
            },
          },
        },
        update: {
          stores: {
            connectOrCreate: {
              where: { userId_name: { userId, name: 'Default Store' } },
              create: {
                name: 'Default Store',
                apiKey: generateApiKey(),
              },
            },
          },
        },
        include: {
          stores: { include: { binancePayCredential: true, wallets: true } },
        },
      });
      return;
    } catch (error) {
      this.logger.error('Error bootstrapping user: ' + error);
      throw error;
    }
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
