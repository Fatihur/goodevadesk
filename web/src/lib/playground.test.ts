import { describe, expect, it } from 'vitest';
import { buildTicketQuery, isAllowedPlaygroundPath, parseJsonBody } from './playground';

describe('playground helpers', () => {
  it('builds a stable ticket query and omits empty filters', () => {
    expect(buildTicketQuery({ page: 2, status: 'open', search: '' }).toString()).toBe('page=2&limit=10&status=open');
  });

  it('accepts only documented ticket paths', () => {
    expect(isAllowedPlaygroundPath('/tickets')).toBe(true);
    expect(isAllowedPlaygroundPath('/users')).toBe(false);
  });

  it('validates JSON before a request is sent', () => {
    expect(parseJsonBody('{"status":"closed"}').ok).toBe(true);
    expect(parseJsonBody('{bad').ok).toBe(false);
  });
});
