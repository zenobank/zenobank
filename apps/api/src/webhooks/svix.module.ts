// svix.module.ts
import { Module } from '@nestjs/common';
import { Svix } from 'svix';
// import { SVIX_CLIENT } from './webhooks.constants';
import { env } from 'src/lib/utils/env';

@Module({
  providers: [
    // {
    //   provide: SVIX_CLIENT,
    //   useFactory: () => new Svix(env.SVIX_API_KEY),
    // },
  ],
  // exports: [SVIX_CLIENT], // 👈 muy importante: exportar el provider
})
export class SvixModule {}
