import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LlmService } from '../src/llm/llm.service';
import { OrganizationsService } from '../src/organizations/organizations.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

describe('tickets API', () => {
  let app: INestApplication;
  const organizationId = '00000000-0000-0000-0000-000000000001';
  const ticket = { id: '00000000-0000-0000-0000-000000000010', organizationId, customerEmail: 'customer@example.com', subject: 'Payment failed', message: 'Charge declined', category: 'billing', suggestedReply: 'Please retry.', status: 'open', createdAt: new Date().toISOString() };
  const prisma = {
    ticket: {
      create: jest.fn().mockResolvedValue(ticket),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findFirst: jest.fn().mockResolvedValue(ticket),
      findMany: jest.fn().mockResolvedValue([ticket]),
      count: jest.fn().mockResolvedValue(1),
    },
  };
  const organizations = { findByApiKey: jest.fn((key: string) => key === 'test-key' ? { id: organizationId, name: 'Test org' } : null) };
  const llm = { analyze: jest.fn().mockResolvedValue({ category: 'billing', suggestedReply: 'Please retry.' }) };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(RedisService).useValue({ get: jest.fn(), set: jest.fn() })
      .overrideProvider(OrganizationsService).useValue(organizations)
      .overrideProvider(LlmService).useValue(llm)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('rejects requests without a valid tenant credential', async () => {
    await request(app.getHttpServer()).get('/api/tickets').expect(401);
    await request(app.getHttpServer()).get('/api/tickets').set('x-api-key', 'wrong').expect(401);
  });

  it('creates a ticket in the organization resolved by the API key', async () => {
    const response = await request(app.getHttpServer()).post('/api/tickets').set('x-api-key', 'test-key').send({ customer_email: 'new@example.com', subject: 'Payment failed', message: 'Please help' }).expect(201);
    expect(response.body.organizationId).toBe(organizationId);
    expect(prisma.ticket.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId, customerEmail: 'new@example.com' }) }));
  });

  it('keeps ticket reads scoped to the resolved organization', async () => {
    await request(app.getHttpServer()).get(`/api/tickets/${ticket.id}`).set('x-api-key', 'test-key').expect(200);
    expect(prisma.ticket.findFirst).toHaveBeenCalledWith({ where: { id: ticket.id, organizationId } });
  });
});
