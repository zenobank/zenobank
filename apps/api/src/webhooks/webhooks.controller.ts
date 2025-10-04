import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AlchemyService } from 'src/providers/alchemy/alchemy.service';
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
  async receiveAlchemyWebhook(@Body() body: any) {
    if (!body) {
      throw new BadRequestException('Body is required');
    }
    return this.alchemyService.processAddressActivityWebhook(body);
  }
}
