import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthModule } from '../auth/auth.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketAccessGuard } from '../common/guards/ticket-access.guard';

@Module({ imports: [OrganizationsModule, AuthModule, LlmModule], controllers: [TicketsController], providers: [TicketsService, TicketAccessGuard] })
export class TicketsModule {}
