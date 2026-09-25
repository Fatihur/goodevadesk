import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { SessionGuard } from '../common/guards/session.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/http.types';
import { UpdateOrganizationDto } from './organizations.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
@UseGuards(SessionGuard, RolesGuard)
@Roles(UserRole.admin)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get('me')
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.organizations.getSettings(user.organizationId);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateOrganizationDto) {
    return this.organizations.updateSettings(user.organizationId, dto);
  }

  @Post('me/api-key/rotate')
  rotateApiKey(@CurrentUser() user: AuthenticatedUser) {
    return this.organizations.rotateApiKey(user.organizationId);
  }
}
