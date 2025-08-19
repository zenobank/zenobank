import { Controller, Get } from '@nestjs/common';
import { TokenService } from './token/token.service';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('assets')
export class AssetController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('tokens')
  async getSupportedTokens(): Promise<TokenResponseDto[]> {
    return this.tokenService.getSupportedTokens();
  }
}
