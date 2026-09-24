import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','), credentials: true });
  app.use((request: { requestId?: string; headers: Record<string, string | string[] | undefined> }, _response: unknown, next: () => void) => {
    request.requestId = typeof request.headers['x-request-id'] === 'string' ? request.headers['x-request-id'] : randomUUID();
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder().setTitle('GoodevaDesk API').setDescription('Multi-tenant support ticketing API').setVersion('0.1.0').addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key').build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}

bootstrap();
