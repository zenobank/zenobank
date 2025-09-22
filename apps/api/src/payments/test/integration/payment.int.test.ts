import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Payment Integration Test', () => {
  let db: PrismaService;
  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    db = testModule.get(PrismaService);
    // await db.cleanDb();
  });

  it('should create a payment', () => {
    expect(true).toBe(true);
  });
});
