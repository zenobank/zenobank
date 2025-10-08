import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import CryptoConvert from 'crypto-convert';
import { Converter as Iso4217Converter } from 'easy-currencies';

@Injectable()
export class ConversionsService implements OnModuleInit {
  private readonly logger = new Logger(ConversionsService.name);
  private cryptoConverter: CryptoConvert;
  private iso4217Converter: Iso4217Converter;
  async onModuleInit() {
    this.cryptoConverter = new CryptoConvert({
      binance: true,
      calculateAverage: false,
      kraken: false,
    });
    this.iso4217Converter = new Iso4217Converter();
    await this.cryptoConverter.ready();
  }
  async convert({
    from,
    to,
    amount,
  }: {
    from: string;
    to: string;
    amount: string;
  }): Promise<{
    amount: string;
    from: string;
    to: string;
  }> {
    from = from.toUpperCase();
    to = to.toUpperCase();
    let proxyFrom = from;
    let proxyAmount = amount;
    if (!this.cryptoConverter[from]) {
      const intermediateUSDAmount = await this.iso4217Converter.convert(
        +amount,
        from,
        'USD',
      );
      proxyFrom = 'USD';
      proxyAmount = intermediateUSDAmount.toString();
    }
    const result = await this.cryptoConverter[proxyFrom][to](proxyAmount);
    if (result == null || +result < 0 || result === '') {
      throw new InternalServerErrorException(
        `Error converting currencies.From: ${from} To: ${to} Amount: ${amount}`,
      );
    }
    return {
      amount: result.toString(),
      from,
      to,
    };
  }
}
