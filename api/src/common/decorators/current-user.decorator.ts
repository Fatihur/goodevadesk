import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithContext } from '../http.types';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithContext>();
  return request.user;
});
