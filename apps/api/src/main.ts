import './instrument'; // sentry always at the top
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ClassSerializerInterceptor,
  VersioningType,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const allowedOrigins = [
    'https://zenobank.io',
    'https://www.zenobank.io',
    'https://api-staging.zenobank.io',
    'https://api.zenobank.io',
    'https://dashboard.zenobank.io',
    'https://dashboard-staging.zenobank.io',
    'https://pay.zenobank.io',
    'https://pay-staging.zenobank.io',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error('CORS not allowed for this origin: ' + origin),
          false,
        );
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-api-key',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
      enableImplicitConversion: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('API description')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('docs', app, document);
  // alchemy webhook validation
  // app.use(WEBHOOKS_PATHS.ALCHEMY, express.raw({ type: '*/*' }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    next();
  });
  app.use(cookieParser());

  await app.listen(3001);
}
bootstrap();
