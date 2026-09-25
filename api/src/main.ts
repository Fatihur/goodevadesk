import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix('api');
  app.use(json({ limit: process.env.BODY_LIMIT ?? '100kb' }));
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','), credentials: true });
  const requestLogger = new Logger('HTTP');
  app.use((request: { requestId?: string; headers: Record<string, string | string[] | undefined> }, _response: unknown, next: () => void) => {
    const response = _response as { statusCode: number; setHeader: (name: string, value: string) => void; on: (event: string, listener: () => void) => void };
    const startedAt = Date.now();
    request.requestId = typeof request.headers['x-request-id'] === 'string' ? request.headers['x-request-id'] : randomUUID();
    response.setHeader('x-request-id', request.requestId);
    response.on('finish', () => requestLogger.log(JSON.stringify({
      requestId: request.requestId,
      status: response.statusCode,
      latencyMs: Date.now() - startedAt,
    })));
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder().setTitle('GoodevaDesk API').setDescription('Multi-tenant support ticketing API').setVersion('0.1.0').addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key').build();
  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, openApiDocument, { jsonDocumentUrl: 'api/openapi.json' });

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}

bootstrap();
