export type PlaygroundMethod = 'GET' | 'POST' | 'PATCH';

export interface PlaygroundEndpoint {
  id: string;
  method: PlaygroundMethod;
  path: string;
  description: string;
  body: string;
}

export const fallbackPlaygroundEndpoints: PlaygroundEndpoint[] = [
  { id: 'list-tickets', method: 'GET', path: '/tickets', description: 'List tenant-scoped tickets with filters and pagination.', body: '' },
  { id: 'ticket-detail', method: 'GET', path: '/tickets/:id', description: 'Read one ticket inside the active organization.', body: '' },
  { id: 'create-ticket', method: 'POST', path: '/tickets', description: 'Create a ticket and request LLM enrichment.', body: '{\n  "customer_email": "customer@example.com",\n  "subject": "Payment failed",\n  "message": "My payment was charged but my subscription is inactive."\n}' },
  { id: 'update-status', method: 'PATCH', path: '/tickets/:id/status', description: 'Move a ticket through its workflow.', body: '{\n  "status": "in_progress"\n}' },
];

const allowedPaths = new Set(['/tickets', '/tickets/{id}', '/tickets/{id}/status']);

export function isAllowedPlaygroundPath(path: string) {
  return allowedPaths.has(path);
}

export function parseJsonBody(body: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false, error: 'JSON body is invalid.' };
  }
}

export function buildTicketQuery(input: { page?: number; limit?: number; status?: string; category?: string; search?: string }) {
  const params = new URLSearchParams({ page: String(input.page ?? 1), limit: String(input.limit ?? 10) });
  for (const key of ['status', 'category', 'search'] as const) {
    const value = input[key];
    if (value) params.set(key, value);
  }
  return params;
}

export function endpointFromOpenApi(path: string, method: string): PlaygroundEndpoint | null {
  if (!isAllowedPlaygroundPath(path) || !['get', 'post', 'patch'].includes(method.toLowerCase())) return null;
  const fallback = fallbackPlaygroundEndpoints.find(item => item.method === method.toUpperCase() && item.path.replace(':id', '{id}') === path);
  return fallback ?? null;
}
