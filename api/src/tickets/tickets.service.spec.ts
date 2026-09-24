import { TicketsService } from './tickets.service';

describe('TicketsService tenant boundary', () => {
  it('includes organizationId in ticket creation and list queries', async () => {
    const prisma = {
      ticket: {
        create: jest.fn().mockResolvedValue({ id: 'ticket-1', organizationId: 'org-a' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const llm = { analyze: jest.fn().mockResolvedValue(null) };
    const service = new TicketsService(prisma as any, llm as any);

    await service.create('org-a', { customer_email: 'customer@example.com', subject: 'Subject', message: 'Message' });
    await service.list('org-a', { page: 1, limit: 20 });

    expect(prisma.ticket.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId: 'org-a' }) }));
    expect(prisma.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ organizationId: 'org-a' }) }));
    expect(prisma.ticket.findMany).not.toHaveBeenCalledWith(expect.objectContaining({ where: { id: expect.anything() } }));
  });
});
