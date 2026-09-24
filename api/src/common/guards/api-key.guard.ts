import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestWithContext } from '../http.types';
import { OrganizationsService } from '../../organizations/organizations.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly organizations: OrganizationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const apiKey = request.header('x-api-key');
    if (!apiKey) throw new UnauthorizedException('API key is required');

    const organization = await this.organizations.findByApiKey(apiKey);
    if (!organization) throw new UnauthorizedException('Invalid API key');
    request.organizationId = organization.id;
    return true;
  }
}
