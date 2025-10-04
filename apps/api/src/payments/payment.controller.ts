import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdateDepositSelectionDto } from './dto/update-payment-selection.dto';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';
import { API_KEY_HEADER } from 'src/auth/auth.constants';
import { Pay, PayRestAPI } from '@binance/pay';
import { ConfigService } from '@nestjs/config';
import { ms } from 'src/lib/utils/ms';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentsService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  // @Get('tutorial')
  // async getTutorial(): Promise<any> {
  //   const configurationRestAPI = {
  //     apiKey: this.configService.get('BINANCE_PAY_API_KEY'),
  //     apiSecret: this.configService.get('BINANCE_PAY_API_SECRET'),
  //   };
  //   const client = new Pay({ configurationRestAPI });
  //   try {
  //     const res = await client.restAPI.getPayTradeHistory({
  //       recvWindow: ms('1m'),
  //       startTime: Date.now() - ms('1h'), // 1 hour ago, same as the expiration time of the payment
  //     });
  //     const data: PayRestAPI.GetPayTradeHistoryResponse = await res.data();
  //     console.log(data);
  //     return data;
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }

  //   return 'Hello World';
  // }

  // @Post('')
  // @UseGuards(ApiKeyGuard)
  // @ApiHeader({
  //   name: API_KEY_HEADER,
  //   description: 'External API Key',
  //   required: true,
  // })
  // async createPayment(
  //   @Body() createPaymentDto: CreatePaymentDto,
  //   @ApiKey() apiKey: string,
  // ): Promise<PaymentResponseDto> {
  //   return this.paymentsService.createPayment(createPaymentDto, apiKey);
  // }

  // @Get('')
  // @UseGuards(ApiKeyGuard)
  // @ApiHeader({
  //   name: API_KEY_HEADER,
  //   description: 'External API Key',
  //   required: true,
  // })
  // async getPayments(@ApiKey() apiKey: string): Promise<PaymentResponseDto[]> {
  //   return this.paymentsService.getPayments(apiKey);
  // }

  // @Get(':id')
  // async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
  //   const payment = await this.paymentsService.getPayment(id);
  //   if (!payment) {
  //     throw new NotFoundException();
  //   }
  //   return payment;
  // }

  // @Patch(':id/deposit')
  // async updatePaymentDepositSelection(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateDepositSelectionDto,
  // ): Promise<PaymentResponseDto> {
  //   return this.paymentsService.updatePaymentDepositSelection(id, dto);
  // }
}
