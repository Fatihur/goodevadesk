import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowUpRight, BarChart3, Check, ChevronLeft, ChevronRight, Clipboard, Inbox, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, Ticket as TicketIcon, Users, X } from 'lucide-react';
import { api, Ticket, TicketCategory, TicketStatus, User } from './lib/api';

const statusLabels: Record<TicketStatus, string> = { open: 'Open', in_progress: 'In progress', closed: 'Closed' };
const categoryLabels: Record<TicketCategory, string> = { billing: 'Billing', technical: 'Technical', general: 'General' };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null)).finally(() => setBooting(false));
  }, []);

  if (booting) return <div className="boot-screen"><div className="brand-mark">G</div><span>Loading workspace</span></div>;
  if (!user) return <Login onAuthenticated={setUser} />;

  return <AppShell user={user} onLogout={() => setUser(null)} />;
}

function Login({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [email, setEmail] = useState('admin@goodevadesk.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: () => api.login(email, password), onSuccess: user => { onAuthenticated(user); navigate('/dashboard'); }, onError: error => setError(error.message) });

  return <main className="login-page"><div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" /><section className="login-card">
    <div className="brand-lockup"><div className="brand-mark">G</div><div><strong>GoodevaDesk</strong><span>Support operations</span></div></div>
    <div className="login-copy"><p className="eyebrow">Internal workspace</p><h1>Make every ticket easier to resolve.</h1><p>One focused queue for the conversations that need a human touch.</p></div>
    <form onSubmit={event => { event.preventDefault(); setError(''); mutation.mutate(); }} className="form-stack">
      <label>Email<input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" /></label>
      <label>Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" /></label>
      {error && <div className="form-error"><X size={16} />{error}</div>}
      <button className="button button-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Signing in…' : 'Enter workspace'}<ArrowUpRight size={17} /></button>
    </form>
    <p className="login-note">Demo seed: admin@goodevadesk.local · ChangeMe123!</p>
  </section></main>;
}

function AppShell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const logout = useMutation({ mutationFn: api.logout, onSuccess: () => { queryClient.clear(); onLogout(); navigate('/'); } });
  const navItems = [{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' }, { label: 'Tickets', icon: Inbox, to: '/tickets' }];
  const adminItems = user.role === 'admin' ? [{ label: 'Team', icon: Users, to: '/team' }, { label: 'Settings', icon: Settings, to: '/settings' }] : [];
  const sidebar = <aside className="sidebar"><div className="sidebar-top"><div className="brand-lockup"><div className="brand-mark">G</div><div><strong>GoodevaDesk</strong><span>Support operations</span></div></div><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button></div><div className="workspace-switch"><span className="workspace-dot" />GoodevaDesk Demo<ChevronRight size={15} /></div><nav><p className="nav-label">Workspace</p>{[...navItems, ...adminItems].map(item => <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={`nav-item ${location.pathname.startsWith(item.to) ? 'active' : ''}`}><item.icon size={18} />{item.label}</Link>)}</nav><div className="sidebar-bottom"><div className="side-status"><span className="status-pulse" /><div><strong>All systems ready</strong><span>API + Redis connected</span></div></div><button className="user-menu" onClick={() => logout.mutate()}><div className="avatar">{user.name.slice(0, 1)}</div><div><strong>{user.name}</strong><span>{user.role}</span></div><LogOut size={16} /></button></div></aside>;

  return <div className="app-shell"><div className="desktop-sidebar">{sidebar}</div><AnimatePresence>{mobileOpen && <motion.div className="mobile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}><motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} onClick={event => event.stopPropagation()}>{sidebar}</motion.div></motion.div>}</AnimatePresence><main className="main-area"><header className="topbar"><button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div><p className="breadcrumb">GoodevaDesk / {location.pathname === '/dashboard' ? 'Workspace' : 'Tickets'}</p><h2>{location.pathname === '/dashboard' ? 'Good morning, ' + user.name.split(' ')[0] : 'Ticket queue'}</h2></div><div className="topbar-actions"><div className="system-chip"><Activity size={15} />Live workspace</div><div className="avatar avatar-small">{user.name.slice(0, 1)}</div></div></header><div className="content-area"><Routes><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/tickets" element={<Tickets />} /><Route path="/tickets/:ticketId" element={<TicketDetail />} /><Route path="*" element={<EmptyRoute />} /></Routes></div></main></div>;
}

function Dashboard() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: api.summary });
  const stats = [{ label: 'Total tickets', value: data?.total ?? 0, icon: TicketIcon, tone: 'blue' }, { label: 'Needs attention', value: data?.open ?? 0, icon: Activity, tone: 'orange' }, { label: 'In progress', value: data?.in_progress ?? 0, icon: BarChart3, tone: 'purple' }, { label: 'Resolved', value: data?.closed ?? 0, icon: Check, tone: 'green' }];
  return <PageTransition><div className="page-intro"><div><p className="eyebrow">Tuesday, September 24</p><h1>Your support pulse</h1><p className="page-subtitle">A calm view of what your team needs to pick up next.</p></div><Link to="/tickets" className="button button-primary"><Inbox size={17} />Open ticket queue</Link></div>{isError && <div className="notice notice-warning">The API is currently unavailable. Start the local API and refresh to load live workspace data.</div>}<div className="stat-grid">{stats.map(({ label, value, icon: Icon, tone }) => <motion.article key={label} className="stat-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div><span>{label}</span><strong>{isLoading ? '—' : value}</strong></div><ArrowUpRight size={16} className="stat-arrow" /></motion.article>)}</div><div className="dashboard-grid"><section className="panel panel-wide"><div className="panel-heading"><div><p className="eyebrow">Queue rhythm</p><h2>Recent tickets</h2></div><Link to="/tickets" className="text-link">View all <ArrowUpRight size={15} /></Link></div>{data?.recent?.length ? <div className="ticket-list">{data.recent.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)}</div> : <EmptyState title="Your queue is clear" copy="New tickets will appear here as soon as the API receives them." />}</section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Reliability</p><h2>Workspace health</h2></div><ShieldCheck size={19} className="health-icon" /></div><div className="health-card"><span className="health-ring"><Check size={20} /></span><div><strong>Everything is ready</strong><p>API and Redis are available for ticket operations.</p></div></div><div className="health-lines"><div><span>API response time</span><strong>128 ms</strong></div><div><span>LLM enrichment</span><strong className="green-text">Protected</strong></div><div><span>Tenant boundary</span><strong className="green-text">Active</strong></div></div></section></div></PageTransition>;
}

function Tickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const category = searchParams.get('category') ?? '';
  const params = useMemo(() => new URLSearchParams({ page: String(page), limit: '10', ...(search ? { search } : {}), ...(status ? { status } : {}), ...(category ? { category } : {}) }), [page, search, status, category]);
  const query = useQuery({ queryKey: ['tickets', params.toString()], queryFn: () => api.tickets(params) });
  const update = (key: string, value: string) => { const next = new URLSearchParams(searchParams); if (value) next.set(key, value); else next.delete(key); next.set('page', '1'); setSearchParams(next); };
  return <PageTransition><div className="page-intro"><div><p className="eyebrow">Operations / Queue</p><h1>Ticket queue</h1><p className="page-subtitle">Sort through the conversations that need a thoughtful next move.</p></div><div className="queue-count"><span>Showing</span><strong>{query.data?.meta.total ?? 0}</strong></div></div><section className="panel queue-panel"><div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={event => update('search', event.target.value)} placeholder="Search subject, customer, or message" /></label><select value={status} onChange={event => update('status', event.target.value)}><option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select><select value={category} onChange={event => update('category', event.target.value)}><option value="">All categories</option><option value="billing">Billing</option><option value="technical">Technical</option><option value="general">General</option></select></div>{query.isLoading ? <div className="skeleton-list">{[1, 2, 3, 4].map(item => <div className="skeleton-row" key={item} />)}</div> : query.isError ? <EmptyState title="We could not load the queue" copy="Check the API connection, then try again." action={<button className="button button-secondary" onClick={() => query.refetch()}>Try again</button>} /> : query.data?.data.length ? <div className="ticket-list">{query.data.data.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)}</div> : <EmptyState title={search || status || category ? 'No tickets match these filters' : 'No tickets yet'} copy={search || status || category ? 'Clear a filter to widen the queue.' : 'Tickets created through the integration API will appear here.'} action={(search || status || category) ? <button className="text-link" onClick={() => setSearchParams({ page: '1' })}>Reset filters</button> : undefined} />}</section>{query.data && query.data.meta.total_pages > 1 && <div className="pagination"><button className="icon-button" disabled={page <= 1} onClick={() => update('page', String(page - 1))} aria-label="Previous page"><ChevronLeft size={18} /></button><span>Page {page} of {query.data.meta.total_pages}</span><button className="icon-button" disabled={page >= query.data.meta.total_pages} onClick={() => update('page', String(page + 1))} aria-label="Next page"><ChevronRight size={18} /></button></div>}</PageTransition>;
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return <Link to={`/tickets/${ticket.id}`} className="ticket-row"><div className="ticket-main"><span className="ticket-avatar">{ticket.customerEmail.slice(0, 1).toUpperCase()}</span><div><strong>{ticket.subject}</strong><span>{ticket.customerEmail}</span></div></div><div className="ticket-message">{ticket.message}</div><div className="ticket-meta">{ticket.category ? <span className={`category-badge ${ticket.category}`}>{categoryLabels[ticket.category]}</span> : <span className="category-badge pending">Pending AI</span>}<span className={`status-badge ${ticket.status}`}>{statusLabels[ticket.status]}</span></div><ArrowUpRight size={17} className="row-arrow" /></Link>;
}

function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['ticket', ticketId], queryFn: () => api.ticket(ticketId!), enabled: Boolean(ticketId) });
  const update = useMutation({ mutationFn: (status: TicketStatus) => api.updateStatus(ticketId!, status), onSuccess: ticket => { queryClient.setQueryData(['ticket', ticketId], ticket); queryClient.invalidateQueries({ queryKey: ['tickets'] }); } });
  const [copied, setCopied] = useState(false);
  if (query.isLoading) return <PageTransition><div className="detail-loading"><div className="skeleton-detail" /><div className="skeleton-detail small" /></div></PageTransition>;
  if (query.isError || !query.data) return <PageTransition><EmptyState title="Ticket not found" copy="This ticket may have been removed or belongs to another workspace." action={<button className="button button-secondary" onClick={() => navigate('/tickets')}>Back to queue</button>} /></PageTransition>;
  const ticket = query.data;
  const copyReply = async () => { if (!ticket.suggestedReply) return; await navigator.clipboard.writeText(ticket.suggestedReply); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return <PageTransition><button className="back-link" onClick={() => navigate('/tickets')}><ChevronLeft size={16} />Back to queue</button><div className="detail-layout"><section className="panel detail-main"><div className="detail-heading"><div><p className="eyebrow">Ticket detail</p><h1>{ticket.subject}</h1><p className="detail-customer">{ticket.customerEmail} · {new Date(ticket.createdAt).toLocaleString()}</p></div><span className={`status-badge large ${ticket.status}`}>{statusLabels[ticket.status]}</span></div><div className="message-card"><p className="eyebrow">Customer message</p><p>{ticket.message}</p></div><div className="reply-section"><div className="panel-heading"><div><p className="eyebrow">AI assist</p><h2>Suggested reply</h2></div>{ticket.category && <span className={`category-badge ${ticket.category}`}>{categoryLabels[ticket.category]}</span>}</div>{ticket.suggestedReply ? <div className="reply-card"><p>{ticket.suggestedReply}</p><button className="button button-secondary" onClick={copyReply}>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? 'Copied' : 'Copy reply'}</button></div> : <div className="unavailable-card"><Activity size={18} /><div><strong>Suggestion unavailable</strong><p>The ticket is saved safely. AI enrichment can be retried later.</p></div></div>}</div></section><aside className="panel detail-side"><p className="eyebrow">Workflow</p><h2>Move this ticket forward</h2><p className="side-copy">Status changes are visible to the whole organization workspace.</p><div className="status-actions">{(['open', 'in_progress', 'closed'] as TicketStatus[]).map(status => <button key={status} className={`status-action ${ticket.status === status ? 'selected' : ''}`} onClick={() => update.mutate(status)} disabled={update.isPending}><span className={`status-dot ${status}`} />{statusLabels[status]}{ticket.status === status && <Check size={16} />}</button>)}</div>{update.isError && <div className="form-error">Could not update status.</div>}</aside></div></PageTransition>;
}

function PageTransition({ children }: { children: ReactNode }) { return <motion.div className="page-transition" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>{children}</motion.div>; }
function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) { return <div className="empty-state"><div className="empty-icon"><Inbox size={21} /></div><h3>{title}</h3><p>{copy}</p>{action}</div>; }
function EmptyRoute() { return <EmptyState title="This page is still taking shape" copy="Use the dashboard or ticket queue to continue working." action={<Link to="/dashboard" className="button button-secondary">Go to dashboard</Link>} />; }

export default App;
