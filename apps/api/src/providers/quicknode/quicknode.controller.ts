import {
  All,
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { QuickNodeService } from './quicknode.service';

@Controller('providers/quicknode')
export class QuicknodeController {
  private readonly logger = new Logger(QuicknodeController.name);
  constructor(private readonly quickNodeService: QuickNodeService) {}
  @Post('webhook/')
  async handleWebhook(
    @Headers('x-qn-signature') signature: string,
    @Headers('x-qn-nonce') nonce: string,
    @Headers('x-qn-timestamp') timestamp: string,
    @Req() _request: Request, // raw body (middleware in main.ts)
  ) {
    const isValid = this.quickNodeService.isValidWebhookSignature({
      signature,
      nonce,
      timestamp,
      rawBody: _request.body?.toString?.('utf8') || '',
    });
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }
    const parsedBody = JSON.parse(_request.body?.toString?.('utf8') || '{}');
    console.log(parsedBody);
    return { received: true };
    // await this.walletService.processWebhookEvent(payload);
    // return { received: true };
  }
}
