import { Body, Controller, Post } from '@nestjs/common';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { WebhookActivityDto as AlchemyWebhookActivityDto } from 'src/alchemy/dto/webhook-activity.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly alchemyService: AlchemyService) {}
  @Post('alchemy')
  async handleAlchemyWebhook(@Body() body: AlchemyWebhookActivityDto) {
    return this.alchemyService.handleReceivedWebhook(body);
  }
}
