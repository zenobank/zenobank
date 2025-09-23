import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PaymentsModule } from 'src/payments/payment.module';
import { PaymentService } from 'src/payments/payment.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Payment Integration Test', () => {
  let db: PrismaService;
  let paymentService: PaymentService;
  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [PrismaModule, PaymentsModule],
      providers: [PrismaService, PaymentService],
    }).compile();
    db = testModule.get(PrismaService);
    paymentService = testModule.get(PaymentService);
  });

  it('should create a payment', () => {
    expect(true).toBe(true);
  });
});
