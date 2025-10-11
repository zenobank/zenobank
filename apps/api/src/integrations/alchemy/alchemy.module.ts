import { Module } from '@nestjs/common';
import { AlchemyService } from './alchemy.service';
import { ALCHEMY_SDK } from './lib/alchemy.constants';
import { Alchemy } from 'alchemy-sdk';
import { env } from 'src/lib/utils/env';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SvixModule } from 'src/webhooks/svix.module';
import { TokensModule } from 'src/tokens/tokens.module';
@Module({
  providers: [
    AlchemyService,
    {
      provide: ALCHEMY_SDK,
      useFactory: () =>
        new Alchemy({
          authToken: env.ALCHEMY_AUTH_TOKEN,
        }),
    },
  ],
  controllers: [],
  exports: [AlchemyService],
  imports: [PrismaModule, SvixModule, TokensModule],
})
export class AlchemyModule {}
