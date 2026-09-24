import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { LlmModule } from './llm/llm.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, RedisModule, OrganizationsModule, LlmModule, TicketsModule, AuthModule, DashboardModule, HealthModule],
})
export class AppModule {}
