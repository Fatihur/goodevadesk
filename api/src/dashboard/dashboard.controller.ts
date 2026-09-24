import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionGuard } from '../common/guards/session.guard';
import { AuthenticatedUser } from '../common/http.types';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(SessionGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async summary(@CurrentUser() user: AuthenticatedUser) {
    const where = { organizationId: user.organizationId };
    const [total, open, inProgress, closed, categoryCounts, recent] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, status: 'open' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'in_progress' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'closed' } }),
      this.prisma.ticket.groupBy({ by: ['category'], where, _count: { _all: true } }),
      this.prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);
    return { total, open, in_progress: inProgress, closed, categories: categoryCounts, recent };
  }
}
