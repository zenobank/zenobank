import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnChainTokenResponseDto } from './dto/onchain-token-response';
import { toDto } from 'src/lib/utils/to-dto';
import { BinancePayTokenResponseDto } from './dto/binance-pay-token-response';
import { MethodType } from '@prisma/client';
import { CanonicalTokensResponseDto } from './dto/canonical-tokens-response';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  constructor(private db: PrismaService) {}

  async getCanonicalTokens(): Promise<CanonicalTokensResponseDto> {
    const [onchainTokens, binancePayTokens] = await Promise.all([
      this.getOnChainTokens(),
      this.getBinancePayTokens(),
    ]);

    return toDto(CanonicalTokensResponseDto, {
      ONCHAIN: onchainTokens,
      BINANCE_PAY: binancePayTokens,
    });
  }

  async getOnChainTokens(): Promise<OnChainTokenResponseDto[]> {
    const tokens = await this.db.onchainToken.findMany({});
    const tokensDto = tokens.map((token) =>
      toDto(OnChainTokenResponseDto, token),
    );
    return tokensDto;
  }
  async getOnChainToken(
    tokenId: string,
  ): Promise<OnChainTokenResponseDto | null> {
    const token = await this.db.onchainToken.findUnique({
      where: { id: tokenId },
    });
    if (!token) {
      return null;
    }
    return toDto(OnChainTokenResponseDto, token);
  }

  async getBinancePayTokens(): Promise<BinancePayTokenResponseDto[]> {
    const tokens = await this.db.binancePayToken.findMany({});
    const tokensDto = tokens.map((token) =>
      toDto(BinancePayTokenResponseDto, token),
    );
    return tokensDto;
  }

  async getBinancePayToken(
    tokenId: string,
  ): Promise<BinancePayTokenResponseDto | null> {
    const token = await this.db.binancePayToken.findUnique({
      where: { id: tokenId },
    });
    if (!token) {
      return null;
    }
    return toDto(BinancePayTokenResponseDto, token);
  }
}
