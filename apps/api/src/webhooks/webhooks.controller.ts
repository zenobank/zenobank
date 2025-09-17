import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { WebhookActivityDto as AlchemyWebhookActivityDto } from 'src/alchemy/dto/webhook-activity.dto';
import { AlchemySignatureGuard } from './guards/alchemy-signature.guard';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly alchemyService: AlchemyService) {}
  @Post('alchemy')
  // @UseGuards(AlchemySignatureGuard)
  @HttpCode(200)
  async receiveAlchemyWebhook(@Req() req: Request & { rawBody?: Buffer }) {
    const raw = req.rawBody?.toString('utf8');
    const body = raw ? JSON.parse(raw) : req.body;
    console.log('lsjdf');
    return this.alchemyService.processAddressActivityWebhook(body);
  }
}
