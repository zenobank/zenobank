import { Module } from '@nestjs/common';
import { ClerkClientProvider } from './clerk.provider';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [ClerkClientProvider, AuthGuard],
  exports: [ClerkClientProvider],
})
export class AuthModule {}
