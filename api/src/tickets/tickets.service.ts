import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { CreateTicketDto, TicketListQueryDto, UpdateTicketStatusDto } from './tickets.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService, private readonly llm: LlmService) {}

  async create(organizationId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: { organizationId, customerEmail: dto.customer_email, subject: dto.subject, message: dto.message },
    });

    const analysis = await this.llm.analyze(dto.subject, dto.message);
    if (!analysis) return ticket;

    await this.prisma.ticket.updateMany({
      where: { id: ticket.id, organizationId },
      data: { category: analysis.category, suggestedReply: analysis.suggestedReply },
    });
    return this.findOne(organizationId, ticket.id);
  }

  async list(organizationId: string, query: TicketListQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const where = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? { OR: [{ subject: { contains: query.search, mode: 'insensitive' as const } }, { customerEmail: { contains: query.search, mode: 'insensitive' as const } }, { message: { contains: query.search, mode: 'insensitive' as const } }] }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.ticket.count({ where }),
    ]);
    return { data, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }

  findOne(organizationId: string, id: string) {
    return this.prisma.ticket.findFirst({ where: { id, organizationId } });
  }

  updateStatus(organizationId: string, id: string, dto: UpdateTicketStatusDto) {
    return this.prisma.ticket.updateMany({ where: { id, organizationId }, data: { status: dto.status } }).then(async result => {
      if (!result.count) return null;
      return this.findOne(organizationId, id);
    });
  }
}
