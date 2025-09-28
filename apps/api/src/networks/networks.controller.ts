import { Controller, Get } from '@nestjs/common';
import { NetworkResponseDto } from './dto/network-response.dto';
import { NetworksService } from './networks.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @ApiOperation({
    summary: 'Get all networks',
    description: 'Get all networks',
  })
  @Get('')
  async getNetworks(): Promise<NetworkResponseDto[]> {
    return this.networksService.getNetworks();
  }
}
