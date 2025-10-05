import { Body, Controller, Headers, Post } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateBinancePayCredentialDto } from 'src/stores/dtos/create-binance-pay-credential.dto';
import { ApiOperation } from '@nestjs/swagger';
import { API_KEY_HEADER } from 'src/auth/auth.constants';
import { ApiKeyAuth } from 'src/auth/api-key-auth.decorator';
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiKeyAuth()
  @Post('providers/binance-pay')
  @ApiOperation({ summary: 'Create a new store credential' })
  async createBinancePayCredential(
    @Body() createStoreCredentialDto: CreateBinancePayCredentialDto,
    @Headers(API_KEY_HEADER) apiKey: string,
  ) {
    return this.storesService.createBinancePayCredential(
      apiKey,
      createStoreCredentialDto,
    );
  }

  // @UseGuards(AuthGuard)
  // @Post()
  // @ApiOperation({ summary: 'Create a new store' })
  // async createStore(@Body() createStoreDto: CreateStoreDto) {
  //   return this.storesService.createStore(createStoreDto);
  // }
}
