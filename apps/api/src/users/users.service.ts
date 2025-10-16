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

  async bootstrap(userId: string): Promise<BootstrapResponseDto> {
    this.logger.log('Bootstrapping user with id: ' + userId);
    if (!userId) throw new Error('User id is required for bootstrap');

    const result = await this.db.$transaction(async (tx) => {
      // intentar crear primero; si ya existe, leerlo
      let user;
      let createdUser = false;

      try {
        user = await tx.user.create({
          data: { id: userId },
          include: { stores: { include: { binancePayCredential: true } } },
        });
        createdUser = true;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          user = await tx.user.findUnique({
            where: { id: userId },
            include: { stores: { include: { binancePayCredential: true } } },
          });
        } else {
          throw e;
        }
      }

      let createdStore = false;
      if (user!.stores.length === 0) {
        const store = await tx.store.create({
          data: {
            name: 'Default Store',
            userId: user!.id,
            apiKey: generateApiKey(),
          },
          include: { binancePayCredential: true },
        });
        user = { ...user!, stores: [store] };
        createdStore = true;
      }

      return { user, createdUser, createdStore };
    });

    const alreadyExists = !(result.createdUser || result.createdStore);
    return toDto(BootstrapResponseDto, { alreadyExists });
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
