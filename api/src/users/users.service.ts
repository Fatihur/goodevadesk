import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcryptjs';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async create(organizationId: string, dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { organizationId_email: { organizationId, email } } });
    if (exists) throw new ConflictException('A user with this email already exists');
    const passwordHash = await hash(dto.password, 12);
    return this.prisma.user.create({
      data: { organizationId, email, name: dto.name.trim(), passwordHash, role: dto.role ?? 'agent' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }
}
