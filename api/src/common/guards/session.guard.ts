import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestWithContext } from '../http.types';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const token = request.cookies?.gd_session as string | undefined;
    if (!token) throw new UnauthorizedException('Authentication required');

    const user = await this.auth.getUserFromSession(token);
    if (!user) throw new UnauthorizedException('Session expired');
    request.user = user;
    return true;
  }
}
