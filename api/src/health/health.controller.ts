import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  @Get()
  async check() {
    let database = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = true;
    } catch {
      database = false;
    }
    const cache = await this.redis.ping();
    return { status: database && cache ? 'ok' : 'degraded', dependencies: { database, redis: cache } };
  }
}
