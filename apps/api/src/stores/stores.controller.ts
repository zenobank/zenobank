import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from 'src/stores/dtos/create-store.dto';
import { CreateStoreCredentialDto } from 'src/stores/dtos/create-store-credential.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiHeader, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { API_KEY_HEADER } from 'src/auth/auth.constants';
import { StoreApiKeyAuth } from 'src/auth/api-key-auth.decorator';
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @StoreApiKeyAuth()
  @Post('credentials')
  @ApiOperation({ summary: 'Create a new store credential' })
  async createStoreCredential(
    @Body() createStoreCredentialDto: CreateStoreCredentialDto,
    @Headers(API_KEY_HEADER) apiKey: string,
  ) {
    return this.storesService.createStoreCredential(
      apiKey,
      createStoreCredentialDto,
    );
  }

  @StoreApiKeyAuth()
  @Get('credentials')
  @ApiOperation({ summary: 'Get all store credentials' })
  async getStoreCredentials(@Headers(API_KEY_HEADER) apiKey: string) {
    return this.storesService.getStoreCredentials(apiKey);
  }
  // @UseGuards(AuthGuard)
  // @Post()
  // @ApiOperation({ summary: 'Create a new store' })
  // async createStore(@Body() createStoreDto: CreateStoreDto) {
  //   return this.storesService.createStore(createStoreDto);
  // }
}
