import { Module } from '@nestjs/common';
import { AlchemyService } from './alchemy.service';
import { ALCHEMY_SDK } from './lib/alchemy.constants';
import { Alchemy } from 'alchemy-sdk';
import { Env, getEnv } from 'src/lib/utils/env';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SvixModule } from 'src/webhooks/svix.module';
import { PaymentsModule } from 'src/payments/payment.module';
@Module({
  providers: [
    AlchemyService,
    {
      provide: ALCHEMY_SDK,
      useFactory: () =>
        new Alchemy({
          authToken: getEnv(Env.ALCHEMY_AUTH_TOKEN),
        }),
    },
  ],
  controllers: [],
  exports: [AlchemyService],
  imports: [PrismaModule, SvixModule, PaymentsModule],
})
export class AlchemyModule {}
