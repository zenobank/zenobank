import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor() {}
}
