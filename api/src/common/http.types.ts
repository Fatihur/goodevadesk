import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
}

export type RequestWithContext = Request & {
  organizationId?: string;
  user?: AuthenticatedUser;
  requestId?: string;
};
