import { Inject, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dtos/create-store.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Svix } from 'svix';
import { SVIX_CLIENT } from 'src/webhooks/webhooks.constants';
import { WalletService } from 'src/wallet/services/wallet.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    @Inject(SVIX_CLIENT) private readonly svix: Svix,
    private readonly walletService: WalletService,
  ) {}

  async createStore(createStoreDto: CreateStoreDto) {
    const [store, wallets] = await Promise.all([
      this.db.store.create({ data: createStoreDto }),
      this.walletService.registerEvmWallet(createStoreDto.walletAddress),
    ]);

    await this.db.store.update({
      where: { id: store.id },
      data: {
        wallets: {
          connect: wallets.map((wallet) => ({
            id: wallet.id,
          })),
        },
      },
    });

    return store;
  }
}
