import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AlchemyService } from 'src/alchemy/alchemy.service';
import { AlchemySignatureGuard } from './guards/alchemy-signature.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly alchemyService: AlchemyService) {}
  @ApiOperation({
    summary: 'Receive Alchemy webhook',
    description: 'Receive Alchemy webhook',
  })
  @Post('alchemy')
  @UseGuards(AlchemySignatureGuard)
  @HttpCode(200)
  async receiveAlchemyWebhook(@Req() req: Request & { rawBody?: Buffer }) {
    const raw = req.rawBody?.toString('utf8');
    const body = raw ? JSON.parse(raw) : req.body;
    return this.alchemyService.processAddressActivityWebhook(body);
  }
}
