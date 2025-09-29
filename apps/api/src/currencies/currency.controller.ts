import { Controller, Get } from '@nestjs/common';
import { TokenService } from './token/token.service';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('')
  async getSupportedTokens(): Promise<TokenResponseDto[]> {
    return this.tokenService.getSupportedTokens();
  }
}
