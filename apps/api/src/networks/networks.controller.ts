import { Controller, Get } from '@nestjs/common';
import { NetworkResponseDto } from './dto/network-response.dto';
import { NetworksService } from './networks.service';

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Get('')
  async getNetworks(): Promise<NetworkResponseDto[]> {
    return this.networksService.getNetworks();
  }
}
