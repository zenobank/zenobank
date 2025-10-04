import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { AlchemyModule } from 'src/providers/alchemy/alchemy.module';

@Module({
  controllers: [WebhooksController],
  imports: [AlchemyModule],
})
export class WebhooksModule {}
