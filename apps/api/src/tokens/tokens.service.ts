import { Injectable, Logger } from '@nestjs/common';
import { Network, NETWORK_INFO } from 'src/lib/contants/network';
import { publicClients } from 'src/lib/contants/client';
import ms from 'src/lib/utils/ms';
import { requestWithRepeatDelay } from 'src/lib/utils/request-with-repeat-delay';
import { erc20Abi } from 'viem';
import { isNativeToken, nativeTokenAddress } from './tokens.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { Token } from '@prisma/client';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  constructor(private db: PrismaService) {}

  async getTokens(network: Network): Promise<Token[]> {
    const tokens = await this.db.token.findMany({
      where: {
        network,
      },
    });
    return tokens;
  }

  async getTokenBalance(
    network: Network,
    { owner, token }: { owner: string; token: string },
  ): Promise<bigint> {
    const balances = await this.getTokenBalances(network, owner, [token]);
    return balances[token.toLowerCase()] ?? 0n;
  }
  async getNativeTokenBalance(
    network: Network,
    owner: string,
  ): Promise<bigint> {
    return await this.getTokenBalance(network, {
      owner,
      token: nativeTokenAddress(network),
    });
  }

  async getTokenBalances(
    network: Network,
    owner: string,
    tokens: string[],
  ): Promise<{ [key: string]: bigint }> {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = ms('1.5s');
    const client = publicClients[network];
    try {
      const tokenNativeIndex = tokens.findIndex((address) =>
        isNativeToken(address, network),
      );

      let res = (await requestWithRepeatDelay(
        () =>
          // @ts-ignore
          client.multicall({
            contracts: tokens
              .filter((address) => !isNativeToken(address, network))

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
        (all, { result: balance }, i) => ({
          ...all,
          [tokens[i].toLowerCase()]: balance || 0n,
        }),
        {} as { [key: string]: bigint },
      );
    } catch (error: any) {
      this.logger.error('Error fetching user token balances:', error);
      throw error;
    }
  }
}
