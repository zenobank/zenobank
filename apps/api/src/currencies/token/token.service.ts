import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { publicClients } from 'src/lib/contants/client';
import { ms } from 'src/lib/utils/ms';
import { requestWithRepeatDelay } from 'src/lib/utils/request-with-repeat-delay';
import { erc20Abi } from 'viem';
import { isNativeToken, nativeTokenAddress } from '../lib/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token } from '@prisma/client';
import { SupportedNetworksId } from 'src/networks/network.interface';
import { TokenResponseDto } from '../dto/token-response.dto';
import { toDto } from 'src/lib/utils/to-dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  constructor(private db: PrismaService) {}

  async getSupportedTokens(): Promise<TokenResponseDto[]> {
    const tokens = await this.db.token.findMany({});
    const tokensDto = tokens.map((token) => toDto(TokenResponseDto, token));
    return tokensDto;
  }

  async getToken(id: string): Promise<Token | null> {
    const token = await this.db.token.findUnique({
      where: { id },
    });
    return token;
  }

  async getNetworkTokens(networkId: SupportedNetworksId): Promise<Token[]> {
    const tokens = await this.db.token.findMany({
      where: {
        networkId,
      },
    });
    return tokens;
  }

  async getTokenBalance(
    networkId: SupportedNetworksId,
    { owner, token }: { owner: string; token: string },
  ): Promise<bigint> {
    const balances = await this.getTokenBalances(networkId, owner, [token]);
    return balances[token.toLowerCase()] ?? 0n;
  }
  async getNativeTokenBalance(
    networkId: SupportedNetworksId,
    owner: string,
  ): Promise<bigint> {
    return await this.getTokenBalance(networkId, {
      owner,
      token: nativeTokenAddress(networkId),
    });
  }

  async getTokenBalances(
    networkId: SupportedNetworksId,
    owner: string,
    tokens: string[],
  ): Promise<{ [key: string]: bigint }> {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = ms('1.5s');
    const client = publicClients[networkId];
    try {
      const tokenNativeIndex = tokens.findIndex((address) =>
        isNativeToken(address, networkId),
      );

      let res = (await requestWithRepeatDelay(
        () =>
          client.multicall({
            contracts: tokens
              .filter((address) => !isNativeToken(address, networkId))

              .map((token) => ({
                abi: erc20Abi,
                address: token as `0x${string}`,
                functionName: 'balanceOf',
                args: [owner as `0x${string}`],
              })),
          }),
        MAX_RETRIES,
        RETRY_DELAY,
      )) as { result: bigint }[];

      if (tokenNativeIndex >= 0) {
        const eth = await requestWithRepeatDelay(
          () => client.getBalance({ address: owner as `0x${string}` }),
          MAX_RETRIES,
          RETRY_DELAY,
        );
        res = [
          ...res.slice(0, tokenNativeIndex),
          { result: eth },
          ...res.slice(tokenNativeIndex),
        ];
      }

      return res.reduce(
        (all, { result: balance }, i) => {
          if (i < tokens.length) {
            return {
              ...all,
              [tokens?.[i]?.toLowerCase() ?? '']: balance ?? 0n,
            };
          }
          return all;
        },
        {} as { [key: string]: bigint },
      );
    } catch (error: any) {
      this.logger.error('Error fetching user token balances:', error);
      throw error;
    }
  }
}
