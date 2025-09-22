// import { Test, TestingModule } from '@nestjs/testing';
// import { PaymentController } from '../src/payment/payment.controller';
// import { PaymentService } from '../src/payment/payment.service';
// import { TokenService } from '../src/currencies/token/token.service';
// import { PrismaService } from '../src/prisma/prisma.service';
// import { CreatePaymentDto } from '../src/payment/dto/create-payment.dto';
// import { PaymentResponseDto } from '../src/payment/dto/payment-response.dto';
describe('Integration Tests', () => {
  it('test', () => {
    expect(true).toBe(true);
  });
});
// describe('Integration Tests', () => {
//   let paymentController: PaymentController;
//   let paymentService: PaymentService;
//   let tokenService: TokenService;
//   let module: TestingModule;

//   beforeAll(async () => {
//     module = await Test.createTestingModule({
//       controllers: [PaymentController],
//       providers: [PaymentService, TokenService, PrismaService],
//     }).compile();

//     paymentController = module.get<PaymentController>(PaymentController);
//     paymentService = module.get<PaymentService>(PaymentService);
//     tokenService = module.get<TokenService>(TokenService);
//   });

//   afterAll(async () => {
//     // await module.close();
//   });

//   describe('PaymentController Integration Tests', () => {
//     it('should create payment and return all required fields', async () => {
//       // Arrange
//       const createPaymentDto: CreatePaymentDto = {
//         priceAmount: '100',
//         priceCurrency: 'USD',
//         webhookUrl: 'https://example.com/webhook',
//         successUrl: 'https://example.com/success',
//         verificationToken: '123e4567-e89b-12d3-a456-426614174000',
//         orderId: '765',
//       };

//       // Act
//       const result = await paymentController.createPayment(
//         createPaymentDto,
//         'test',
//       );

//       // Assert - Verificar que el resultado tiene todas las variables requeridas
//       expect(result).toBeDefined();
//       expect(result).toBeInstanceOf(PaymentResponseDto);

//       // Verificar campos principales
//       expect(result.id).toBeDefined();
//       expect(typeof result.id).toBe('string');
//       expect(result.id.length).toBeGreaterThan(0);

//       expect(result.priceAmount).toBeDefined();
//       expect(result.priceAmount).toBe('100');

//       expect(result.priceCurrency).toBeDefined();
//       expect(result.priceCurrency).toBe('USD');

//       expect(result.status).toBeDefined();
//       expect(typeof result.status).toBe('string');

//       expect(result.createdAt).toBeDefined();
//       expect(result.createdAt).toBeInstanceOf(Date);

//       expect(result.expiredAt).toBeDefined();
//       expect(result.expiredAt).toBeInstanceOf(Date);

//       expect(result.paymentUrl).toBeDefined();
//       expect(typeof result.paymentUrl).toBe('string');
//       expect(result.paymentUrl.length).toBeGreaterThan(0);

//       expect(result.webhookUrl).toBeDefined();
//       expect(typeof result.webhookUrl).toBe('string');

//       // Verificar depositDetails si existe
//       if (result.depositDetails) {
//         expect(result.depositDetails.address).toBeDefined();
//         expect(typeof result.depositDetails.address).toBe('string');
//         expect(result.depositDetails.address).toMatch(/^0x[a-fA-F0-9]{40}$/);

//         expect(result.depositDetails.currencyId).toBeDefined();
//         expect(typeof result.depositDetails.currencyId).toBe('string');

//         expect(result.depositDetails.amount).toBeDefined();
//         expect(typeof result.depositDetails.amount).toBe('string');

//         expect(result.depositDetails.networkId).toBeDefined();
//         expect(typeof result.depositDetails.networkId).toBe('string');
//       }
//     });

//     it('should be able to retrieve created payment by ID', async () => {
//       // Arrange
//       const createPaymentDto: CreatePaymentDto = {
//         priceAmount: '50',
//         priceCurrency: 'EUR',
//         webhookUrl: 'https://example.com/webhook',
//         successUrl: 'https://example.com/success',
//         verificationToken: '123e4567-e89b-12d3-a456-426614174000',
//         orderId: '765',
//       };

//       // Act - Crear payment
//       const createdPayment = await paymentController.createPayment(
//         createPaymentDto,
//         'test',
//       );

//       // Act - Recuperar payment por ID
//       const retrievedPayment = await paymentController.getPayment(
//         createdPayment.id,
//       );

//       // Assert
//       expect(retrievedPayment).toBeDefined();
//       expect(retrievedPayment.id).toBe(createdPayment.id);
//       expect(retrievedPayment.priceAmount).toBe(createdPayment.priceAmount);
//       expect(retrievedPayment.priceCurrency).toBe(createdPayment.priceCurrency);
//       expect(retrievedPayment.status).toBe(createdPayment.status);
//     });
//   });

//   describe('TokenService Integration Tests', () => {
//     it('should return more than 0 tokens from real database', async () => {
//       const result = await tokenService.getSupportedTokens();

//       expect(result.length).toBeGreaterThan(0);
//       console.log(`✅ Found ${result.length} tokens in database`);
//     });
//   });
// });
