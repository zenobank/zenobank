import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import CryptoConvert from 'crypto-convert';

@Injectable()
export class ConversionsService implements OnModuleInit {
  private readonly logger = new Logger(ConversionsService.name);
  private convertApi: CryptoConvert;
  async onModuleInit() {
    this.convertApi = new CryptoConvert({
      binance: true,
      calculateAverage: false,
      kraken: false,
    });
    await this.convertApi.ready();
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
    const result = await this.convertApi[from][to](amount);
    if (result == null || result < 0 || result === '') {
      this.logger.error('Error converting currencies', result);
      throw new InternalServerErrorException(
        `Error converting currencies.From: ${from} To: ${to} Amount: ${amount}`,
      );
    }
    return {
      amount: result,
      from,
      to,
    };
  }
}
