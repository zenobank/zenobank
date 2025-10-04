import { Controller, Get } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokenService: TokensService) {}

  @Get('')
  async getTokens(): Promise<TokenResponseDto[]> {
    return this.tokenService.getTokens();
  }
}
