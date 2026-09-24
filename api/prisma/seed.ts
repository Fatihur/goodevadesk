import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@goodevadesk.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Demo Admin';
  const organizationName = process.env.SEED_ORG_NAME ?? 'GoodevaDesk Demo';
  const organizationApiKey = process.env.SEED_ORG_API_KEY ?? 'dev-goodevadesk-org-a';
  const production = process.env.SEED_PRODUCTION === 'true';
  const passwordHash = await hash(adminPassword, 12);
  const organization = await prisma.organization.upsert({
    where: { apiKey: organizationApiKey },
    update: {},
    create: { name: organizationName, apiKey: organizationApiKey },
  });

  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: adminEmail } },
    update: { passwordHash },
    create: { organizationId: organization.id, email: adminEmail, name: adminName, passwordHash, role: UserRole.admin },
  });

  if (!production) {
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
}

main().finally(() => prisma.$disconnect());
