import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { WebhookActivityDto as AlchemyWebhookActivityDto } from 'src/alchemy/dto/webhook-activity.dto';
import { AlchemySignatureGuard } from './guards/alchemy-signature.guard';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private readonly alchemyService: AlchemyService) {}
  @Post('alchemy')
  // @UseGuards(AlchemySignatureGuard)
  @HttpCode(200)
  async receiveAlchemyWebhook(@Body() body: any) {
    try {
      this.logger.log('Received Alchemy webhook');
      return this.alchemyService.processAddressActivityWebhook(body);
    } catch (error) {
      console.error('Error processing Alchemy webhook:', error);
      throw error;
    }
  }
}
