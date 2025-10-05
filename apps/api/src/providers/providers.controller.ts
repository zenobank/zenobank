import { Controller, Get } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProviderResponseDto } from './dto/provider-response.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}
  @Get()
  async getProviders(): Promise<ProviderResponseDto[]> {
    return this.providersService.getProviders();
  }
}
