import { Injectable } from '@nestjs/common';
import { publicClients } from 'src/lib/contants/client';
import { parsePercent } from 'src/lib/utils/percent';
import { PublicClient, encodeFunctionData, erc20Abi } from 'viem';
import { SupportedNetworksId } from 'src/networks/networks.interface';
import { isNativeToken } from './lib/utils';

@Injectable()
export class TokenGasService {
  async estimateTokenTransferGasCost(
    transferArgs: { sender: string; destination: string },
    amountsToTransfer: { [key: string]: bigint },
    network: SupportedNetworksId,
    extraGasMarginPerc = parsePercent('50%'),
  ): Promise<bigint> {
    const client = publicClients[network];

    const [gasPrice, gasUnits] = await Promise.all([
      client.getGasPrice(),
      this.estimateTokenTransferGasUnits(
        transferArgs,
        amountsToTransfer,
        network,
        extraGasMarginPerc,
      ),
    ]);

    return gasUnits * gasPrice;
  }
  private async estimateTokenTransferGasUnits(
    transferArgs: { sender: string; destination: string },
    amountsToTransfer: { [key: string]: bigint },
    network: SupportedNetworksId,
    extraGasMarginPerc = parsePercent('50%'),
  ): Promise<bigint> {
    const client = publicClients[network];
    const { sender, destination } = transferArgs;

    const estimations = await Promise.all(
      Object.entries(amountsToTransfer).map(async ([token, amount]) => {
        if (isNativeToken(token, network)) {
          return this.estimateNativeTransferGasUnits(client, {
            sender,
            destination,
            amount,
            extraGasMarginPerc: parsePercent('0%'),
          });
        } else {
          return this.estimateErc20TransferGasUnits(client, {
            sender,
            tokenAddress: token,
            destination,
            amount,
            extraGasMarginPerc: parsePercent('0%'),
          });
        }
      }),
    );

    const totalGas = estimations.reduce((acc, val) => acc + val, 0n);

    return (
      totalGas +
      (totalGas * BigInt(Math.floor(extraGasMarginPerc * 100))) / 100n
    );
  }
  private async estimateNativeTransferGasUnits(
    client: PublicClient,
    transferArgs: {
      sender: string;
      destination: string;
      amount: bigint;
      extraGasMarginPerc?: number;
    },
  ): Promise<bigint> {
    const gasEstimation = await client.estimateGas({
      to: transferArgs.destination as `0x${string}`,
      value: transferArgs.amount,
      account: transferArgs.sender as `0x${string}`,
    });
    return (
      gasEstimation +
      (gasEstimation *
        BigInt(Math.floor(transferArgs?.extraGasMarginPerc ?? 0 * 100))) /
        100n
    );
  }
  private async estimateErc20TransferGasUnits(
    client: PublicClient,
    transferArgs: {
      sender: string;
      tokenAddress: string;
      destination: string;
      amount: bigint;
      extraGasMarginPerc?: number;
    },
  ): Promise<bigint> {
    const { sender, tokenAddress, destination, amount } = transferArgs;
    const gasEstimation = await client.estimateGas({
      to: tokenAddress as `0x${string}`,
      value: 0n,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [destination as `0x${string}`, amount],
      }),
      account: sender as `0x${string}`,
    });
    return (
      gasEstimation +
      (gasEstimation *
        BigInt(Math.floor(transferArgs?.extraGasMarginPerc ?? 0 * 100))) /
        100n
    );
  }
}
