import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findByApiKey(apiKey: string) {
    return this.prisma.organization.findUnique({ where: { apiKey }, select: { id: true, name: true } });
  }
}
