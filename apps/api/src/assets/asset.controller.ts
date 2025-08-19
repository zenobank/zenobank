import { Controller, Get } from '@nestjs/common';
import { TokenService } from './token/token.service';

@Controller('assets')
export class AssetController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('tokens')
  async getSupportedTokens() {
    return this.tokenService.getSupportedTokens();
  }
}
