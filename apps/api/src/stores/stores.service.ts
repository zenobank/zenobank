import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dtos/create-store.dto';
import { CreateBinancePayCredentialDto } from './dtos/create-binance-pay-credential.dto';
import { StoreResponseDto } from './dtos/store-response.dto';
import { toEnumValue } from 'src/lib/utils/to-enum';
import { SupportedNetworksId } from 'src/networks/networks.interface';
import { toDto } from 'src/lib/utils/to-dto';
import { WalletsService } from 'src/wallets/wallets.service';
import { Store } from '@prisma/client';
import { BinancePayCredentialResponseDto } from './dtos/binance-pay-credential-response.dto';
import { generateApiKey } from 'src/lib/utils/generate-api-key';

@Injectable()
export class StoresService {
  constructor(private readonly db: PrismaService) {}

  async createStore(
    createStoreDto: CreateStoreDto,
    userId: string,
  ): Promise<StoreResponseDto> {
    const store = await this.db.store.create({
      data: {
        name: createStoreDto.name,
        userId: userId,
        apiKey: generateApiKey(),
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
        binancePayCredential: {
          select: {
            id: true,
            accountId: true,
            apiKey: true,
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

  async getStore(apiKey: string): Promise<Store | null> {
    const store = await this.db.store.findUnique({
      where: { apiKey },
    });
    if (!store) {
      return null;
    }
    return store;
  }

  async createBinancePayCredential(
    apiKey: string,
    data: CreateBinancePayCredentialDto,
  ): Promise<BinancePayCredentialResponseDto> {
    const store = await this.getStore(apiKey);

    if (!store) {
      throw new NotFoundException('Store not found');
    }
    const credential = await this.db.binancePayCredential.create({
      data: {
        storeId: store.id,
        apiKey: data.apiKey,
        accountId: data.accountId,
        apiSecret: data.apiSecret,
      },
    });

    return toDto(BinancePayCredentialResponseDto, credential);
  }
}
