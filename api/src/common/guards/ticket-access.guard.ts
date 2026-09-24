import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestWithContext } from '../http.types';
import { OrganizationsService } from '../../organizations/organizations.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class TicketAccessGuard implements CanActivate {
  constructor(private readonly organizations: OrganizationsService, private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const apiKey = request.header('x-api-key');
    if (apiKey) {
      const organization = await this.organizations.findByApiKey(apiKey);
      if (!organization) throw new UnauthorizedException('Invalid API key');
      request.organizationId = organization.id;
      return true;
    }

    const sessionToken = request.cookies?.gd_session as string | undefined;
    if (sessionToken) {
      const user = await this.auth.getUserFromSession(sessionToken);
      if (user) {
        request.user = user;
        request.organizationId = user.organizationId;
        return true;
      }
    }
    throw new UnauthorizedException('API key or authenticated session is required');
  }
}
