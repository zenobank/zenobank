import { Module } from '@nestjs/common';
import { ClerkClientProvider } from './clerk.provider';
import { AuthGuard } from './auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ClerkClientProvider, AuthGuard],
  exports: [ClerkClientProvider],
  imports: [PrismaModule],
})
export class AuthModule {}
