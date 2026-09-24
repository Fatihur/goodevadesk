import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketAccessGuard } from '../common/guards/ticket-access.guard';
import { CurrentOrganization } from '../common/decorators/current-organization.decorator';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, TicketListQueryDto, UpdateTicketStatusDto } from './tickets.dto';

@ApiTags('tickets')
@ApiHeader({ name: 'x-api-key', required: true })
@Controller('tickets')
@UseGuards(TicketAccessGuard)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a ticket and enrich it with LLM analysis' })
  create(@CurrentOrganization() organizationId: string, @Body() dto: CreateTicketDto) {
    return this.tickets.create(organizationId, dto);
  }

  @Get()
  list(@CurrentOrganization() organizationId: string, @Query() query: TicketListQueryDto) {
    return this.tickets.list(organizationId, query);
  }

  @Get(':id')
  findOne(@CurrentOrganization() organizationId: string, @Param('id') id: string) {
    return this.tickets.findOne(organizationId, id).then(ticket => {
      if (!ticket) throw new NotFoundException('Ticket not found');
      return ticket;
    });
  }

  @Patch(':id/status')
  updateStatus(@CurrentOrganization() organizationId: string, @Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.tickets.updateStatus(organizationId, id, dto).then(ticket => {
      if (!ticket) throw new NotFoundException('Ticket not found');
      return ticket;
    });
  }
}
