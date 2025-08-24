import { Injectable, Logger } from '@nestjs/common';
import {
  SweepWalletFundsJobData,
  TransactionRecordInput,
  TxIdentifier,
} from './lib/types';
import { TokenService } from 'src/assets/token/token.service';
import { TokenGasService } from 'src/assets/token/tokens-gas.service';
import { isNativeToken, nativeTokenAddress } from 'src/assets/lib/utils';
import { privateKeyToAccount } from 'viem/accounts';
import { client, walletClient } from 'src/lib/utils/client';
import { erc20Abi } from 'viem';
import { Env, getEnv } from 'src/lib/utils/env';
import { TX_CONFIRMATION_QUEUE_NAME } from './lib/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { plainToInstance } from 'class-transformer';
import ms from 'src/lib/utils/ms';
import { buildTxSchedulerId } from './lib/utils';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private tokensService: TokenService,
    private tokenGasService: TokenGasService,
    private readonly db: PrismaService,
    @InjectQueue(TX_CONFIRMATION_QUEUE_NAME)
    private readonly txConfirmationQueue: Queue<TxIdentifier>,
  ) {}

  async recordTransaction({
    txData,
    networkId,
  }: TransactionRecordInput): Promise<TransactionResponseDto> {
    const tx = await this.db.transaction.create({
      data: {
        hash: txData.hash,
        networkId: networkId,
        fromAddress: txData.fromAddress,
        toAddress: txData.toAddress,
        title: txData.title,
      },
    });
    return plainToInstance(TransactionResponseDto, tx);
  }

  /**
   * Requires the transaction to already exist in DB.
   */
  async enqueueTransactionForConfirmation({ hash, networkId }: TxIdentifier) {
    const tx = await this.db.transaction.findUniqueOrThrow({
      where: {
        networkId_hash: {
          networkId: networkId,
          hash,
        },
      },
    });
    await this.txConfirmationQueue.upsertJobScheduler(
      buildTxSchedulerId({ networkId, hash }),
      {
        every: ms('5s'),
        // max limit = 1h (720 tries)
        limit: ms('1h') / ms('5s'),
      },
      {
        data: {
          hash,
          networkId,
        },
      },
    );
  }

  async enqueueSweepWalletFundsJob({
    sourceWalletAddress,
    networkId: network,
  }: SweepWalletFundsJobData) {
    this.logger.log(
      `Starting sweep wallet funds job for ${sourceWalletAddress} on ${network}`,
    );

    // gas tanker in .env. address: 0x4b7673AB39733493a44695b37b2C7DF814A28d1B

    const sourceWalletAccount = privateKeyToAccount(
      '0x055af4739ccdef2a04da69d03ea5c681361ddd734c45979ab90339a8c54fd1ae',
    ); // tb lo tengo en el controller 0xC5E65E7F0D344125E11f7AE1597B39f97d7a7Fee
    const sourceWalletWalletClient = walletClient(network, sourceWalletAccount);

    const masterAccount = privateKeyToAccount(
      '0xe5d88c1da977dde9b88ce9c7046ca006819b5819b491086de2824fde84c02a9a',
    ); // address 0x1C6Fe155B8Ea16d634D207f0824DDb5d988d55E8

    const gasTankerAccount = privateKeyToAccount(
      getEnv(Env.GAS_TANKER_TESTING_PRIVATE_KEY) as `0x${string}`,
    );
    const gasStationWalletClient = walletClient(network, gasTankerAccount);

    const tokens = await this.tokensService.getNetworkTokens(network);
    this.logger.log(`Found ${tokens.length} tokens to check on ${network}`);

    const balances = await this.tokensService.getTokenBalances(
      network,
      sourceWalletAddress,
      tokens.map((token) => token.address),
    );

    const sourceWalletNativeBalance =
      balances[nativeTokenAddress(network).toLowerCase()] ?? 0n;

    this.logger.log(
      `Source wallet native balance: ${sourceWalletNativeBalance} wei`,
    );

    // Log non-zero token balances
    const nonZeroTokens = Object.entries(balances).filter(
      ([_, amount]) => amount > 0n && !isNativeToken(_, network),
    );
    if (nonZeroTokens.length > 0) {
      this.logger.log(
        `Found ${nonZeroTokens.length} tokens with non-zero balance:`,
      );
      nonZeroTokens.forEach(([tokenAddress, amount]) => {
        this.logger.log(`  - ${tokenAddress}: ${amount}`);
      });
    } else {
      this.logger.log('No non-zero token balances found');
    }

    const gasEstimation =
      await this.tokenGasService.estimateTokenTransferGasCost(
        {
          sender: sourceWalletAddress,
          destination: masterAccount.address,
        },
        balances,
        network,
      );

    this.logger.log(`Estimated gas required: ${gasEstimation} wei`);

    if (gasEstimation > sourceWalletNativeBalance) {
      this.logger.log(
        `Gas insufficient: has ${sourceWalletNativeBalance} wei, requires ${gasEstimation} wei`,
      );

      const gasTankerNativeBalance =
        await this.tokensService.getNativeTokenBalance(
          network,
          gasTankerAccount.address,
        );

      const gasRequiredToTransfer = gasEstimation - sourceWalletNativeBalance;
      this.logger.log(
        `Gas tanker balance: ${gasTankerNativeBalance} wei, required: ${gasRequiredToTransfer} wei`,
      );

      if (gasRequiredToTransfer > gasTankerNativeBalance) {
        this.logger.error(
          `Not enough balance to cover gas. Gas tanker has ${gasTankerNativeBalance} wei, needs ${gasRequiredToTransfer} wei`,
        );
        throw new Error('Not enough balance to cover gas');
      }

      this.logger.log(
        `Sending ${gasEstimation} wei from gas tanker to source wallet account...`,
      );
      const gasStationTx = await gasStationWalletClient.sendTransaction({
        to: sourceWalletAccount.address,
        value: gasEstimation,
        account: gasTankerAccount,
        chain: client(network).chain,
        kzg: undefined,
      });

      this.logger.log(`Gas tanker transaction sent: ${gasStationTx}`);

      const gasStationReceipt = await client(network).waitForTransactionReceipt(
        {
          hash: gasStationTx,
          confirmations: 3,
        },
      );

      if (
        gasStationReceipt.status !== 'success' ||
        gasStationReceipt.blockNumber == null
      ) {
        this.logger.error(`Gas tanker transaction failed: ${gasStationTx}`);
        throw new Error('Transaction reverted');
      }

      this.logger.log(
        `Gas tanker transaction confirmed in block ${gasStationReceipt.blockNumber}`,
      );
    } else {
      this.logger.log(
        `Sufficient gas available: ${sourceWalletNativeBalance} wei >= ${gasEstimation} wei`,
      );
    }

    for (const [tokenAddress, amount] of Object.entries(balances)) {
      if (amount === 0n) continue;

      if (isNativeToken(tokenAddress, network)) continue;

      this.logger.log(
        `Transferring ${amount} ${tokens.find((token) => token.address === tokenAddress)?.symbol} tokens from ${sourceWalletAddress} to master account ${masterAccount.address}...`,
      );

      const tokenTransferTx = await sourceWalletWalletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        account: sourceWalletAccount,
        args: [masterAccount.address, amount],
        chain: client(network).chain,
      });

      this.logger.log(`Token transfer transaction sent: ${tokenTransferTx}`);

      const tokenTransferReceipt = await client(
        network,
      ).waitForTransactionReceipt({
        hash: tokenTransferTx,
        confirmations: 3,
      });

      if (
        tokenTransferReceipt.status !== 'success' ||
        tokenTransferReceipt.blockNumber == null
      ) {
        this.logger.error(
          `Token transfer transaction failed: ${tokenTransferTx}`,
        );
        throw new Error('Transaction reverted');
      }

      this.logger.log(
        `Token transfer confirmed in block ${tokenTransferReceipt.blockNumber}: ${amount} tokens transferred`,
      );
    }

    // solo si se transfiere este tb
    const remainingNativeBalance = await client(network).getBalance({
      address: sourceWalletAccount.address,
    });

    this.logger.log(`Remaining native balance: ${remainingNativeBalance} wei`);

    // Ensure it's worth sending the remaining balance
    if (remainingNativeBalance > gasEstimation * 100n) {
      this.logger.log(
        `Sending remaining native balance: ${remainingNativeBalance - gasEstimation} wei to master account...`,
      );

      const nativeTransferTx = await sourceWalletWalletClient.sendTransaction({
        to: masterAccount.address,
        value: remainingNativeBalance - gasEstimation,
        account: sourceWalletAccount,
        chain: client(network).chain,
        kzg: undefined,
      });

      this.logger.log(`Native transfer transaction sent: ${nativeTransferTx}`);

      const nativeTransferReceipt = await client(
        network,
      ).waitForTransactionReceipt({
        hash: nativeTransferTx,
        confirmations: 3,
      });

      if (
        nativeTransferReceipt.status === 'success' &&
        nativeTransferReceipt.blockNumber != null
      ) {
        this.logger.log(
          `Native transfer confirmed in block ${nativeTransferReceipt.blockNumber}`,
        );
      } else {
        this.logger.error(
          `Native transfer transaction failed: ${nativeTransferTx}`,
        );
      }
    } else {
      this.logger.log(
        `Remaining balance (${remainingNativeBalance} wei) too low to transfer (threshold: ${gasEstimation * 100n} wei)`,
      );
    }

    this.logger.log(
      `Sweep wallet funds job completed for ${sourceWalletAddress}`,
    );
  }
}
