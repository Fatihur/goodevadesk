import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('ChangeMe123!', 12);
  const organization = await prisma.organization.upsert({
    where: { apiKey: 'dev-goodevadesk-org-a' },
    update: {},
    create: { name: 'GoodevaDesk Demo', apiKey: 'dev-goodevadesk-org-a' },
  });

  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'admin@goodevadesk.local' } },
    update: { passwordHash },
    create: { organizationId: organization.id, email: 'admin@goodevadesk.local', name: 'Demo Admin', passwordHash, role: UserRole.admin },
  });

  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: 'agent@goodevadesk.local' } },
    update: { passwordHash },
    create: { organizationId: organization.id, email: 'agent@goodevadesk.local', name: 'Demo Agent', passwordHash, role: UserRole.agent },
  });

  await prisma.organization.upsert({
    where: { apiKey: 'dev-goodevadesk-org-b' },
    update: {},
    create: { name: 'GoodevaDesk Second Tenant', apiKey: 'dev-goodevadesk-org-b' },
  });
}

main().finally(() => prisma.$disconnect());
