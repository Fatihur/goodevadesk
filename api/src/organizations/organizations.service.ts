import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findByApiKey(apiKey: string) {
    return this.prisma.organization.findUnique({ where: { apiKey }, select: { id: true, name: true } });
  }

  async getSettings(id: string) {
    const organization = await this.prisma.organization.findUnique({ where: { id }, select: { id: true, name: true, apiKey: true, createdAt: true } });
    if (!organization) return null;
    return { ...organization, apiKey: this.maskApiKey(organization.apiKey) };
  }

  async updateSettings(id: string, input: { name: string }) {
    return this.prisma.organization.update({ where: { id }, data: { name: input.name.trim() }, select: { id: true, name: true, createdAt: true } });
  }

  async rotateApiKey(id: string) {
    const apiKey = `gd_${randomBytes(24).toString('hex')}`;
    const organization = await this.prisma.organization.update({ where: { id }, data: { apiKey }, select: { id: true, name: true } });
    return { ...organization, apiKey, warning: 'Store this key securely. It will only be shown in full once.' };
  }

  private maskApiKey(apiKey: string) {
    return apiKey.length <= 8 ? '••••••••' : `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}`;
  }
}
