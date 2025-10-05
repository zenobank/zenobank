import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { AlchemyModule } from 'src/integrations/alchemy/alchemy.module';

@Module({
  controllers: [WebhooksController],
  imports: [AlchemyModule],
})
export class WebhooksModule {}
