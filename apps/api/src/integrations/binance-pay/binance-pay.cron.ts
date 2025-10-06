import { BinancePayService } from './binance-pay.service';
import { CronExpression, Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import {
  AttemptStatus,
  BinancePayPaymentAttempt,
  PrismaPromise,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pay as BinancePay } from '@binance/pay';
import { ms } from 'src/lib/utils/ms';

type PendingAttempt = {
  id: string;
  amount: string; // guarda montos como string en BD (recomendado)
  currency: string; // por ejemplo "USDT" / "BUSD" / "BTC"
  checkout: {
    store: {
      binancePayCredential: {
        apiKey: string;
        apiSecret: string;
        accountId: string;
      } | null;
    };
  };
};

@Injectable()
export class BinanceCron {
  constructor(
    private readonly binanceService: BinancePayService,
    private readonly db: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // 1) Traer attempts PENDING con monto y moneda
    const attempts = (await this.db.binancePayPaymentAttempt.findMany({
      where: { status: AttemptStatus.PENDING },
      select: {
        id: true,
        checkout: {
          select: {
            store: {
              include: {
                binancePayCredential: {
                  select: { apiKey: true, apiSecret: true, accountId: true },
                },
              },
            },
          },
        },
      },
    })) as unknown as PendingAttempt[];

    // 2) Agrupar por credenciales
    const grouped: Record<string, PendingAttempt[]> = attempts.reduce(
      (acc, attempt) => {
        const cred = attempt.checkout.store.binancePayCredential;
        if (!cred) return acc;
        const key = `${cred.apiKey}:${cred.apiSecret}`;
        (acc[key] ||= []).push(attempt);
        return acc;
      },
      {} as Record<string, PendingAttempt[]>,
    );

    // 3) Procesar cada grupo (una llamada a Binance por credencial)
    for (const [credKey, attemptsGroup] of Object.entries(grouped)) {
      const [apiKey, apiSecret] = credKey.split(':');
      if (!apiKey || !apiSecret) continue;

      // 3a) Cliente Binance Pay
      const binancePayClient = new BinancePay({
        configurationRestAPI: { apiKey, apiSecret },
      });

      // 3b) Traer trade history reciente
      const tradeHistory = await binancePayClient.restAPI.getPayTradeHistory({
        recvWindow: ms('1m'),
        startTime: Date.now() - ms('10m'),
        limit: 100,
      });

      const { data: trades } = await tradeHistory.data(); // asume que devuelve { data: Trade[] }

      // 3c) Construir índice de attempts: key = `${currency}:${normalizedAmount}`
      const attemptsIndex = new Map<string, PendingAttempt[]>();
      for (const at of attemptsGroup) {
        const key = `${at.currency.toUpperCase()}:${at.amount}`;
        const arr = attemptsIndex.get(key) || [];
        arr.push(at);
        attemptsIndex.set(key, arr);
      }

      // 3d) Recorrer trades y buscar match por (currency, amount)
      // Ajusta estos nombres según lo que devuelve realmente Binance Pay:
      // Ejemplo de campos típicos: trade.currency, trade.totalAmount, trade.status, trade.transactionId, trade.merchantTradeNo
      const updates: Array<PrismaPromise<BinancePayPaymentAttempt>> = [];

      for (const trade of trades ?? []) {
        if (!trade.currency || !trade.amount) continue;

        const key = `${trade.currency.toUpperCase()}:${trade.amount}`;
        const candidates = attemptsIndex.get(key);
        if (!candidates?.length) continue;

        // Si puede haber múltiples attempts con mismo monto/moneda, decide la heurística:
        //  - priorizar el más antiguo
        //  - o por algún campo adicional (merchantTradeNo, checkoutId, etc.)
        const attemptToConfirm = candidates.shift()!; // toma uno
        if (!candidates.length) attemptsIndex.delete(key); // limpiar si ya no quedan

        // 3e) Actualizar attempt en DB
        updates.push(
          this.db.binancePayPaymentAttempt.update({
            where: { id: attemptToConfirm.id },
            data: {
              status: AttemptStatus.SUCCEEDED,
              transactionId: trade.transactionId,
              paidAt: new Date(trade.transactionTime ?? new Date().getTime()),
            },
          }),
        );
      }

      if (updates.length) {
        await this.db.$transaction(updates);
      }
    }
  }
}
