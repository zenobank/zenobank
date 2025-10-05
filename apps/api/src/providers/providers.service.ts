import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { toDto } from 'src/lib/utils/to-dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly db: PrismaService) {}

  async getProviders(): Promise<ProviderResponseDto[]> {
    const providers = await this.db.provider.findMany();
    return providers.map((provider) => toDto(ProviderResponseDto, provider));
  }
}
