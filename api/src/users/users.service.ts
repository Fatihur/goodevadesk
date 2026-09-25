import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from './users.dto';

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

  async update(organizationId: string, id: string, currentUserId: string, dto: UpdateUserDto) {
    const current = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!current) throw new NotFoundException('User not found');
    if (id === currentUserId && dto.role === 'agent') throw new ConflictException('You cannot remove admin access from your own account');
    if (current.role === 'admin' && dto.role === 'agent') {
      const adminCount = await this.prisma.user.count({ where: { organizationId, role: 'admin' } });
      if (adminCount <= 1) throw new ConflictException('The organization must keep at least one admin');
    }
    const email = dto.email?.toLowerCase();
    if (email && email !== current.email) {
      const exists = await this.prisma.user.findUnique({ where: { organizationId_email: { organizationId, email } } });
      if (exists) throw new ConflictException('A user with this email already exists');
    }
    const passwordHash = dto.password ? await hash(dto.password, 12) : undefined;
    return this.prisma.user.update({
      where: { id },
      data: { email, name: dto.name?.trim(), role: dto.role, passwordHash },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async remove(organizationId: string, id: string, currentUserId: string) {
    if (id === currentUserId) throw new ConflictException('You cannot delete your own account');
    const current = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!current) throw new NotFoundException('User not found');
    if (current.role === 'admin') {
      const adminCount = await this.prisma.user.count({ where: { organizationId, role: 'admin' } });
      if (adminCount <= 1) throw new ConflictException('The organization must keep at least one admin');
    }
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}
