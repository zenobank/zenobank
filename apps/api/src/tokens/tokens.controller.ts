import { Controller, Get } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { OnChainTokenResponseDto } from './dto/on-chain-token-response';
import { BinancePayTokenResponseDto } from './dto/binance-pay-token-response';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokenService: TokensService) {}

  @Get('/on-chain')
  async getOnChainTokens(): Promise<OnChainTokenResponseDto[]> {
    return this.tokenService.getOnChainTokens();
  }

  @Get('/binance-pay')
  async getBinancePayTokens(): Promise<BinancePayTokenResponseDto[]> {
    return this.tokenService.getBinancePayTokens();
  }
}
