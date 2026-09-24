import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { compare } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { AuthenticatedUser } from '../common/http.types';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private tokenHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + Number(process.env.SESSION_TTL_SECONDS ?? 604800) * 1000);
    await this.prisma.session.create({ data: { tokenHash: this.tokenHash(token), userId: user.id, expiresAt } });
    return { token, expiresAt, user: this.toUser(user) };
  }

  async getUserFromSession(token: string): Promise<AuthenticatedUser | null> {
    const session = await this.prisma.session.findUnique({ where: { tokenHash: this.tokenHash(token) }, include: { user: true } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await this.prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      return null;
    }
    return this.toUser(session.user);
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { tokenHash: this.tokenHash(token) } });
  }

  private toUser(user: { id: string; email: string; name: string; role: AuthenticatedUser['role']; organizationId: string }): AuthenticatedUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId };
  }
}
