import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { OnChainTokenResponseDto } from './dto/onchain-token-response';
import { BinancePayTokenResponseDto } from './dto/binance-pay-token-response';
import { CanonicalTokensResponseDto } from './dto/canonical-tokens-response';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokenService: TokensService) {}

  @Get('canonical')
  @ApiOperation({
    summary: 'Get all canonical tokens',
    description:
      'Returns all available tokens grouped by payment method (on-chain and Binance Pay)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved canonical tokens',
    type: CanonicalTokensResponseDto,
  })
  async getCanonicalTokens(): Promise<CanonicalTokensResponseDto> {
    return this.tokenService.getCanonicalTokens();
  }
}
