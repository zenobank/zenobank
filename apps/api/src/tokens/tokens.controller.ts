import { Controller, Get } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokenResponseDto } from './dto/on-chain-token-response';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokenService: TokensService) {}

  // @Get('/canonical')
  // async getCanonicalTokens(): Promise<TokenResponseDto[]> {
  //   return this.tokenService.getCanonicalTokens();
  // }
}
