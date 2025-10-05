import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { publicClients } from 'src/lib/contants/client';
import { ms } from 'src/lib/utils/ms';
import { requestWithRepeatDelay } from 'src/lib/utils/request-with-repeat-delay';
import { erc20Abi } from 'viem';
import { isNativeToken, nativeTokenAddress } from './lib/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { TokenResponseDto } from './dto/on-chain-token-response';
import { toDto } from 'src/lib/utils/to-dto';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  constructor(private db: PrismaService) {}

  async getOnChainTokens(): Promise<TokenResponseDto[]> {
    const tokens = await this.db.onchainToken.findMany({});
    const tokensDto = tokens.map((token) => toDto(TokenResponseDto, token));
    return tokensDto;
  }
}
