export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketCategory = 'billing' | 'technical' | 'general';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  organizationId: string;
}

export interface Ticket {
  id: string;
  customerEmail: string;
  subject: string;
  message: string;
  category: TicketCategory | null;
  suggestedReply: string | null;
  status: TicketStatus;
  createdAt: string;
}

export interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  createdAt: string;
}

export interface OrganizationSettings {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<User>('/auth/me'),
  login: (email: string, password: string) => request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  summary: () => request<{ total: number; open: number; in_progress: number; closed: number; categories: { category: TicketCategory | null; _count: { _all: number } }[]; recent: Ticket[] }>('/dashboard/summary'),
  tickets: (params: URLSearchParams) => request<{ data: Ticket[]; meta: { page: number; limit: number; total: number; total_pages: number } }>(`/tickets?${params}`),
  ticket: (id: string) => request<Ticket>(`/tickets/${id}`),
  updateStatus: (id: string, status: TicketStatus) => request<Ticket>(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  users: () => request<TeamUser[]>('/users'),
  createUser: (input: { name: string; email: string; password: string; role: 'agent' | 'admin' }) => request<TeamUser>('/users', { method: 'POST', body: JSON.stringify(input) }),
  updateUser: (id: string, input: Partial<{ name: string; email: string; password: string; role: 'agent' | 'admin' }>) => request<TeamUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteUser: (id: string) => request<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  organization: () => request<OrganizationSettings>('/organizations/me'),
  updateOrganization: (name: string) => request<OrganizationSettings>('/organizations/me', { method: 'PATCH', body: JSON.stringify({ name }) }),
  rotateApiKey: () => request<{ id: string; name: string; apiKey: string; warning: string }>('/organizations/me/api-key/rotate', { method: 'POST' }),
};
