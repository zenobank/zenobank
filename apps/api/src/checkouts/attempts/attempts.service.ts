import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutAttemptResponseDto } from './dtos/checkout-attempt-response.dto';
import { toDto } from 'src/lib/utils/to-dto';
import { CreateCheckoutAttemptDto } from './dtos/create-checkout-attempt.dto';

@Injectable()
export class AttemptsService {
  constructor(private readonly db: PrismaService) {}

  async getCheckoutAttempts(id: string): Promise<CheckoutAttemptResponseDto[]> {
    const attempts = await this.db.paymentAttempt.findMany({
      where: { checkoutId: id },
    });
    return attempts.map((attempt) =>
      toDto(CheckoutAttemptResponseDto, attempt),
    );
  }

  async createCheckoutAttempt(
    id: string,
    createCheckoutAttemptDto: CreateCheckoutAttemptDto,
  ): Promise<CheckoutAttemptResponseDto> {
    const attempt = await this.db.paymentAttempt.create({
      data: { checkoutId: id, ...createCheckoutAttemptDto },
    });
    return toDto(CheckoutAttemptResponseDto, attempt);
  }
}
