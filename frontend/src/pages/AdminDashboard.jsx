import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ══════════════════════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════════════════════ */
const C = {
  blue:      '#4FC3F7',
  blueDark:  '#0288D1',
  blueLight: '#B3E5FC',
  blueBg:    '#F0F9FF',
  brown:     '#8D6E63',
  brownDk:   '#6D4C41',
  brownLt:   '#BCAAA4',
  white:     '#FFFFFF',
  bg:        '#F8FAFB',
};

/* ══════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════════════════════════ */
const DropletLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M12 2L6 10C4 13 4 18 8 20.5C10 21.7 14 21.7 16 20.5C20 18 20 13 18 10L12 2Z"
      strokeLinejoin="round" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { bg: '#FFFDE7', color: '#F57F17', border: '#FFF176', label: 'Pending' },
    delivered: { bg: '#E8F5E9', color: '#2E7D32', border: '#C8E6C9', label: 'Delivered' },
    cancelled: { bg: '#FFEBEE', color: '#C62828', border: '#FFCDD2', label: 'Cancelled' },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

const SectionTitle = ({ children, sub }) => (
  <div className="mb-5">
    <h2 className="text-lg font-extrabold" style={{ color: C.brown }}>{children}</h2>
    {sub && <p className="text-sm mt-0.5" style={{ color: C.brownLt }}>{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',        icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { id: 'todays-orders', label: "Today's Orders", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )},
  { id: 'all-orders',   label: 'All Orders',      icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )},
  { id: 'customers',    label: 'Customers',       icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { id: 'recurring',    label: 'Recurring Orders', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )},
  { id: 'disruptions',  label: 'Disruptions',     icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )},
  { id: 'notifications', label: 'Notifications',  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )},
];

const Sidebar = ({ active, setActive, sidebarOpen, setSidebarOpen, unreadCount }) => {
  const navigate = useNavigate();

  const profile = useMemo(() => {
    try {
      const cached = localStorage.getItem('userProfile');
      if (cached) return JSON.parse(cached);
    } catch {}
    return { name: 'Supplier', phone: '' };
  }, []);

  const initials = (profile.name || 'S').slice(0, 1).toUpperCase();

  const handleLogout = () => {
    sessionStorage.removeItem('jalSeva_adminAuth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('accessToken');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(141,110,99,0.3)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, background: C.brown, fontFamily: 'Inter, sans-serif' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: C.blue }}>
            <DropletLogo size={20} />
          </div>
          <div>
            <div className="text-white font-extrabold text-base leading-tight">
              Jal <span style={{ color: C.blueLight }}>Seva</span>
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Admin Panel</div>
          </div>
          {/* Close on mobile */}
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative"
                style={{
                  background: isActive ? C.blue : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.72)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                  {item.icon}
                </span>
                {item.label}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span
                    className="ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ background: '#EF5350', color: 'white' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin info + Logout */}
        <div className="px-4 py-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: C.blue }}>{initials}</div>
            <div>
              <div className="text-white text-sm font-semibold">{profile.name}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{profile.phone}</div>
            </div>
          </div>
          <button
            id="admin-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.07)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,83,80,0.25)'; e.currentTarget.style.color = '#EF9A9A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════════ */
const Topbar = ({ activeLabel, setSidebarOpen, unreadCount, setActive }) => {
  const profile = useMemo(() => {
    try {
      const cached = localStorage.getItem('userProfile');
      if (cached) return JSON.parse(cached);
    } catch {}
    return { name: 'Supplier' };
  }, []);

  const initials = (profile.name || 'S').slice(0, 1).toUpperCase();

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-4 px-4 sm:px-6 py-3.5 border-b"
      style={{ background: C.white, borderColor: '#F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Hamburger */}
      <button
        className="lg:hidden p-1.5 rounded-lg"
        style={{ color: C.brown }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
          <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round"/>
          <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round"/>
        </svg>
      </button>

      <div>
        <h1 className="font-extrabold text-base sm:text-lg leading-tight" style={{ color: C.brown }}>{activeLabel}</h1>
        <p className="text-xs" style={{ color: C.brownLt }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification bell */}
        <button
          id="topbar-notifications"
          onClick={() => setActive('notifications')}
          className="relative p-2 rounded-xl transition-colors"
          style={{ background: unreadCount > 0 ? C.blueBg : 'transparent', color: C.brown }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center text-white" style={{ background: '#EF5350' }}>
              {unreadCount}
            </span>
          )}
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: C.blue }}>{initials}</div>
      </div>
    </header>
  );
};

/* ══════════════════════════════════════════════════════════════
   STAT CARDS
══════════════════════════════════════════════════════════════ */
const StatCards = ({ stats }) => {
  const cards = [
    {
      label: "Today's Orders",
      value: stats.todaysOrders,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
      accent: C.blue,
      bg: C.blueBg,
    },
    {
      label: 'Pending Deliveries',
      value: stats.pendingDeliveries,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      accent: '#F57F17',
      bg: '#FFFDE7',
    },
    {
      label: 'Delivered Today',
      value: stats.deliveredToday,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
      accent: '#388E3C',
      bg: '#E8F5E9',
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      accent: C.brown,
      bg: '#FBE9E7',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          style={{ background: C.white, border: `1px solid ${c.bg}` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: c.accent }}>
            {c.icon}
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-tight" style={{ color: C.brown }}>{c.value}</div>
            <div className="text-xs font-medium leading-snug mt-0.5" style={{ color: C.brownLt }}>{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   TODAY'S ORDERS VIEW — grouped by area + filter tabs
══════════════════════════════════════════════════════════════ */
const TodaysOrdersView = ({ orders: allOrders, onMarkDelivered }) => {
  const [filter, setFilter]       = useState('all');
  const [collapsed, setCollapsed] = useState({});

  const filtered = useMemo(() =>
    filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter),
    [allOrders, filter]
  );

  // group by area
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(o => {
      if (!g[o.area]) g[o.area] = [];
      g[o.area].push(o);
    });
    return g;
  }, [filtered]);

  const toggle = (area) => setCollapsed(prev => ({ ...prev, [area]: !prev[area] }));

  const tabs = [
    { id: 'all', label: 'All', count: allOrders.length },
    { id: 'pending', label: 'Pending', count: allOrders.filter(o => o.status === 'pending').length },
    { id: 'delivered', label: 'Delivered', count: allOrders.filter(o => o.status === 'delivered').length },
  ];

  return (
    <div>
      <SectionTitle sub="Grouped by delivery area">Today's Orders</SectionTitle>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            id={`filter-${t.id}`}
            onClick={() => setFilter(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150"
            style={{
              background: filter === t.id ? C.blue : '#F5F5F5',
              color:      filter === t.id ? '#fff'  : C.brownLt,
              boxShadow:  filter === t.id ? `0 2px 10px ${C.blueLight}` : 'none',
            }}
          >
            {t.label}
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: filter === t.id ? 'rgba(255,255,255,0.25)' : C.blueLight,
                color:      filter === t.id ? '#fff' : C.blueDark,
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Area groups */}
      <div className="space-y-3">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12" style={{ color: C.brownLt }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.brownLt} strokeWidth="1.5" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10"/><path d="M9 9h.01M15 9h.01M9 16s1 1 3 1 3-1 3-1"/>
            </svg>
            No orders match this filter.
          </div>
        )}
        {Object.entries(grouped).map(([area, areaOrders]) => (
          <div key={area} className="rounded-2xl overflow-hidden border" style={{ background: C.white, borderColor: '#F0F0F0' }}>
            {/* Area header */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
              style={{ background: collapsed[area] ? C.white : C.blueBg }}
              onClick={() => toggle(area)}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.blue }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm" style={{ color: C.brown }}>{area}</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: C.blueLight, color: C.blueDark }}>
                  {areaOrders.length} order{areaOrders.length !== 1 ? 's' : ''}
                </span>
                <span className="ml-1 text-xs font-medium" style={{ color: C.brownLt }}>
                  · {areaOrders.filter(o => o.status === 'pending').length} pending
                </span>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.brownLt} strokeWidth="2"
                style={{ transform: collapsed[area] ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Orders in area */}
            {!collapsed[area] && (
              <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
                {areaOrders.map(order => (
                  <div key={order.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    {/* Customer info */}
                    <div className="flex-1 min-w-48">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: C.brown }}>
                          {order.customer[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: C.brown }}>{order.customer}</div>
                          <div className="text-xs" style={{ color: C.brownLt }}>{order.address}</div>
                        </div>
                      </div>
                    </div>
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold" style={{ background: C.blueBg, color: C.blueDark }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2L6 10C4 13 4 18 8 20.5C10 21.7 14 21.7 16 20.5C20 18 20 13 18 10L12 2Z"/>
                        </svg>
                        {order.cans} can{order.cans !== 1 ? 's' : ''} {order.can_size ? `(${order.can_size})` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1" style={{ color: C.brownLt }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {order.timeSlot}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    {/* Action */}
                    {order.status === 'pending' && (
                      <button
                        id={`mark-delivered-${order.id}`}
                        onClick={() => onMarkDelivered(order.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: C.blue }}
                        onMouseEnter={(e) => e.currentTarget.style.background = C.blueDark}
                        onMouseLeave={(e) => e.currentTarget.style.background = C.blue}
                      >
                        ✓ Mark Delivered
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ALL ORDERS TABLE
══════════════════════════════════════════════════════════════ */
const AllOrdersView = ({ orders, onMarkDelivered }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  return (
    <div>
      <SectionTitle sub="All orders history">All Orders</SectionTitle>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.brownLt} strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="all-orders-search"
            type="text"
            placeholder="Search by name or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{ border: `1.5px solid #E0E0E0`, color: C.brown, background: C.white, fontFamily: 'Inter, sans-serif' }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = '#E0E0E0'}
          />
        </div>
        <select
          id="all-orders-status-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: `1.5px solid #E0E0E0`, color: C.brown, background: C.white, fontFamily: 'Inter, sans-serif' }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = '#E0E0E0'}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#F0F0F0', background: C.white }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            <thead>
              <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EEEEEE' }}>
                {['Order ID', 'Customer', 'Area', 'Cans', 'Date', 'Time Slot', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: C.brownLt }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm" style={{ color: C.brownLt }}>
                    No orders found.
                  </td>
                </tr>
              )}
              {filtered.map((o, i) => (
                <tr
                  key={o.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid #F5F5F5' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.blueBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: C.blue }}>{o.id}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: C.brown }}>{o.customer}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: C.brownLt }}>{o.area}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: C.brown }}>{o.cans} {o.can_size ? `(${o.can_size})` : ''}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: C.brownLt }}>{o.date}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: C.brownLt }}>{o.timeSlot}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    {o.status === 'pending' && (
                      <button
                        id={`table-mark-delivered-${o.id}`}
                        onClick={() => onMarkDelivered(o.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: C.blue }}
                        onMouseEnter={e => e.currentTarget.style.background = C.blueDark}
                        onMouseLeave={e => e.currentTarget.style.background = C.blue}
                      >
                        ✓ Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t text-xs" style={{ borderColor: '#F0F0F0', color: C.brownLt }}>
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   CUSTOMERS VIEW
══════════════════════════════════════════════════════════════ */
const CustomersView = ({ customers }) => {
  const [search, setSearch] = useState('');
  const filtered = customers.filter(c =>
    !search ||
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.area || '').toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <SectionTitle sub={`${customers.length} registered customers`}>Customers</SectionTitle>
      <div className="relative mb-5 max-w-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.brownLt} strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
          style={{ border: `1.5px solid #E0E0E0`, color: C.brown, background: C.white, fontFamily: 'Inter, sans-serif' }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = '#E0E0E0'}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: C.brownLt }}>No customers found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl p-4 border hover:shadow-md transition-shadow"
              style={{ background: C.white, borderColor: '#F0F0F0' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold text-white" style={{ background: C.brown }}>
                  {(c.name || 'U')[0]}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: C.brown }}>{c.name}</div>
                  <div className="text-xs" style={{ color: C.brownLt }}>{c.area}</div>
                </div>
                {c.has_recurring && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: C.blueBg, color: C.blueDark }}>Recurring</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span style={{ color: C.brownLt }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {c.phone}
                </span>
                <span className="font-semibold ml-auto" style={{ color: C.blue }}>{c.total_orders ?? 0} orders</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   RECURRING ORDERS VIEW
══════════════════════════════════════════════════════════════ */
const RecurringView = ({ recurringOrders }) => (
  <div>
    <SectionTitle sub="Auto-scheduled daily deliveries">Recurring Orders</SectionTitle>
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#F0F0F0', background: C.white }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EEEEEE' }}>
              {['ID', 'Customer', 'Area', 'Cans', 'Frequency', 'Next Delivery', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: C.brownLt }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recurringOrders.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: C.brownLt }}>No recurring orders found.</td></tr>
            )}
            {recurringOrders.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #F5F5F5' }}
                onMouseEnter={e => e.currentTarget.style.background = C.blueBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: C.blue }}>#{r.id}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: C.brown }}>{r.customer_name || r.customer || '—'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: C.brownLt }}>{r.area}</td>
                <td className="px-4 py-3 font-bold" style={{ color: C.brown }}>{r.quantity}</td>
                <td className="px-4 py-3 text-xs" style={{ color: C.brownLt }}>Every {r.frequency_days} days</td>
                <td className="px-4 py-3 text-xs" style={{ color: C.brownLt }}>{r.next_delivery_date || '—'}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: r.is_active ? '#E8F5E9' : '#FFF3E0', color: r.is_active ? '#2E7D32' : '#E65100' }}>
                    {r.is_active ? 'Active' : 'Paused'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   DISRUPTIONS VIEW
══════════════════════════════════════════════════════════════ */
const DisruptionsView = ({ disruptions, onAnnounce }) => {
  const [showForm,      setShowForm]      = useState(false);
  const [msg,           setMsg]           = useState('');
  const [selectedDate,  setSelectedDate]  = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  const announce = async () => {
    if (!msg.trim()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      await onAnnounce({ message: msg.trim(), disruption_date: selectedDate });
      setMsg('');
      setShowForm(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionTitle sub="Manage supply disruptions and alerts">Disruptions</SectionTitle>
      <button
        id="announce-disruption"
        onClick={() => setShowForm(!showForm)}
        className="mb-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
        style={{ background: '#F57F17' }}
        onMouseEnter={e => e.currentTarget.style.background = '#E65100'}
        onMouseLeave={e => e.currentTarget.style.background = '#F57F17'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        {showForm ? 'Cancel' : 'Announce Disruption'}
      </button>

      {showForm && (
        <div className="mb-5 rounded-2xl p-5 border" style={{ background: '#FFFDE7', borderColor: '#FFF176' }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: '#F57F17' }}>New Disruption Alert</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.brown }}>Disruption Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ border: `1.5px solid #E0E0E0`, color: C.brown, background: C.white, fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Describe the disruption (e.g., low supply, road blocked)…"
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ border: `1.5px solid #E0E0E0`, color: C.brown, background: C.white, fontFamily: 'Inter, sans-serif' }}
            />
            {submitError && (
              <div className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg">{submitError}</div>
            )}
            <button onClick={announce} disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-bold"
              style={{ background: submitting ? '#FFA726' : '#F57F17', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Sending…' : 'Send Alert'}
            </button>
          </div>
        </div>
      )}

      {disruptions.length === 0 ? (
        <div className="text-center py-12" style={{ color: C.brownLt }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.brownLt} strokeWidth="1.5" className="mx-auto mb-3">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          No disruptions announced.
        </div>
      ) : (
        <div className="space-y-3">
          {disruptions.map(s => (
            <div key={s.id} className="rounded-2xl p-4 border flex items-start gap-3"
              style={{ background: '#FFFDE7', borderColor: '#FFF176' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F57F17' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: '#E65100' }}>{s.disruption_date || s.date}</div>
                <div className="text-sm mt-0.5" style={{ color: C.brown }}>{s.message || s.msg}</div>
                {s.created_at && (
                  <div className="text-xs mt-1" style={{ color: C.brownLt }}>
                    Announced {new Date(s.created_at).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   NOTIFICATIONS VIEW
══════════════════════════════════════════════════════════════ */
const NotificationsView = ({ notifications, onMarkRead }) => (
  <div>
    <SectionTitle sub="System alerts and order updates">Notifications</SectionTitle>
    <div className="space-y-2">
      {notifications.map(n => (
        <div key={n.id}
          className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all"
          style={{ background: n.read ? C.white : C.blueBg, borderColor: n.read ? '#F0F0F0' : C.blueLight }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: n.type === 'disruption' ? '#FFFDE7' : n.type === 'system' ? '#F3E5F5' : C.blueBg }}>
            {n.type === 'order' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
            {n.type === 'disruption' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F57F17" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            {n.type === 'system' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: C.brown }}>{n.message}</div>
            <div className="text-xs mt-0.5" style={{ color: C.brownLt }}>{n.time}</div>
          </div>
          {!n.read && (
            <button onClick={() => onMarkRead(n.id)}
              className="text-xs font-semibold px-3 py-1 rounded-full shrink-0 transition-all"
              style={{ background: C.blue, color: '#fff' }}>
              Mark read
            </button>
          )}
          {n.read && <span className="text-xs shrink-0" style={{ color: C.brownLt }}>Read</span>}
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD OVERVIEW
══════════════════════════════════════════════════════════════ */
const DashboardOverview = ({ orders, stats, onMarkDelivered, setActive }) => {
  const [exportMsg, setExportMsg] = useState('');

  const handleExport = () => {
    const rows = [
      ['Order ID', 'Customer', 'Area', 'Cans', 'Time Slot', 'Status'],
      ...orders.map(o => [o.id, o.customer, o.area, o.cans, o.timeSlot, o.status]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'jalseva_orders_today.csv'; a.click();
    URL.revokeObjectURL(url);
    setExportMsg('Exported!');
    setTimeout(() => setExportMsg(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatCards stats={stats} />

      {/* Two columns: today's orders + quick actions */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Today's orders (recent 6) */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold" style={{ color: C.brown }}>Today's Orders — Recent</h2>
            <button onClick={() => setActive('todays-orders')}
              className="text-xs font-semibold transition-colors" style={{ color: C.blue }}
              onMouseEnter={e => e.target.style.color = C.blueDark}
              onMouseLeave={e => e.target.style.color = C.blue}>
              View all →
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border" style={{ background: C.white, borderColor: '#F0F0F0' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <thead>
                  <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EEEEEE' }}>
                    {['Customer', 'Area', 'Cans', 'Slot', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: C.brownLt }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F5F5F5' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.blueBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: C.brown }}>{o.customer}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: C.brownLt }}>{o.area}</td>
                      <td className="px-4 py-2.5 font-bold" style={{ color: C.brown }}>{o.cans} {o.can_size ? `(${o.can_size})` : ''}</td>
                      <td className="px-4 py-2.5 text-xs whitespace-nowrap" style={{ color: C.brownLt }}>{o.timeSlot}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-2.5">
                        {o.status === 'pending' && (
                          <button onClick={() => onMarkDelivered(o.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                            style={{ background: C.blue }}
                            onMouseEnter={e => e.currentTarget.style.background = C.blueDark}
                            onMouseLeave={e => e.currentTarget.style.background = C.blue}>
                            ✓ Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-extrabold mb-4" style={{ color: C.brown }}>Quick Actions</h2>
          <div className="rounded-2xl border p-5 space-y-3" style={{ background: C.white, borderColor: '#F0F0F0' }}>
            {/* Announce disruption */}
            <button id="qa-disruption" onClick={() => setActive('disruptions')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-all"
              style={{ background: '#FFFDE7', color: '#E65100', border: '1px solid #FFF176' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF9C4'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFDE7'}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F57F17' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              Announce Disruption
            </button>

            {/* View customers */}
            <button id="qa-customers" onClick={() => setActive('customers')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-all"
              style={{ background: C.blueBg, color: C.blueDark, border: `1px solid ${C.blueLight}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.blueLight}
              onMouseLeave={e => e.currentTarget.style.background = C.blueBg}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.blue }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              View All Customers
            </button>

            {/* Export */}
            <button id="qa-export" onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-all"
              style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}
              onMouseEnter={e => e.currentTarget.style.background = '#C8E6C9'}
              onMouseLeave={e => e.currentTarget.style.background = '#E8F5E9'}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#388E3C' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              {exportMsg || "Export Today's Orders"}
            </button>

            {/* Recurring orders */}
            <button id="qa-recurring" onClick={() => setActive('recurring')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-all"
              style={{ background: '#F3E5F5', color: '#6A1B9A', border: '1px solid #E1BEE7' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E1BEE7'}
              onMouseLeave={e => e.currentTarget.style.background = '#F3E5F5'}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#7B1FA2' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="17 1 21 5 17 9"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </div>
              Recurring Orders
            </button>
          </div>

          {/* Mini summary */}
          <div className="mt-4 rounded-2xl p-4 border" style={{ background: C.white, borderColor: '#F0F0F0' }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C.brownLt }}>Today's Progress</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: C.brown }}>
                  <span>Delivered</span>
                  <span className="font-bold">{stats.deliveredToday}/{stats.todaysOrders}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((stats.deliveredToday / stats.todaysOrders) * 100)}%`, background: C.blue }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // Auth guard — must have both accessToken and supplier role
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'supplier') {
      sessionStorage.removeItem('jalSeva_adminAuth');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProfile');
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const [active, setActive]           = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // API-driven state
  const [ordersToday,     setOrdersToday]     = useState([]);
  const [allOrders,       setAllOrders]       = useState([]);
  const [customers,       setCustomers]       = useState([]);
  const [recurringOrders, setRecurringOrders] = useState([]);
  const [notifications,   setNotifications]   = useState([]);
  const [disruptions,     setDisruptions]     = useState([]);

  // UI state
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  const handle401 = useCallback(() => {
    sessionStorage.removeItem('jalSeva_adminAuth');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  /* ── Initial fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [todayRes, allRes, custRes, recRes, notifRes] = await Promise.all([
        fetch(`${API_URL}/orders/today`,           { headers: getHeaders() }),
        fetch(`${API_URL}/orders`,                 { headers: getHeaders() }),
        fetch(`${API_URL}/users/customers`,        { headers: getHeaders() }),
        fetch(`${API_URL}/recurring-orders`,       { headers: getHeaders() }),
        fetch(`${API_URL}/notifications`,          { headers: getHeaders() }),
      ]);

      if ([todayRes, allRes, custRes, recRes, notifRes].some(r => r.status === 401)) {
        handle401(); return;
      }

      if (todayRes.ok)  { const d = await todayRes.json();  setOrdersToday(d.data || d || []); }
      if (allRes.ok)    { const d = await allRes.json();    setAllOrders(d.data || d || []); }
      if (custRes.ok)   { const d = await custRes.json();   setCustomers(d.data || d || []); }
      if (recRes.ok)    { const d = await recRes.json();    setRecurringOrders(d.data || d || []); }
      if (notifRes.ok)  { const d = await notifRes.json();  setNotifications(d.data || d || []); }
    } catch (err) {
      setFetchError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle401]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Mark order as delivered ── */
  const markDelivered = async (id) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'delivered' }),
      });
      if (res.status === 401) { handle401(); return; }
      if (!res.ok) throw new Error('Failed to update order status.');

      // Refresh both order lists
      const [todayRes, allRes] = await Promise.all([
        fetch(`${API_URL}/orders/today`, { headers: getHeaders() }),
        fetch(`${API_URL}/orders`,       { headers: getHeaders() }),
      ]);
      if (todayRes.ok) { const d = await todayRes.json(); setOrdersToday(d.data || d || []); }
      if (allRes.ok)   { const d = await allRes.json();   setAllOrders(d.data || d || []); }
    } catch (err) {
      // Optimistic local update on network failure
      const update = arr => arr.map(o => o.id === id ? { ...o, status: 'delivered' } : o);
      setOrdersToday(update);
      setAllOrders(update);
    }
  };

  /* ── Announce disruption ── */
  const handleAnnounce = async ({ message, disruption_date }) => {
    const res = await fetch(`${API_URL}/disruptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, disruption_date }),
    });
    if (res.status === 401) { handle401(); return; }
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || 'Failed to announce disruption.');
    }
    // Refresh disruptions — try dedicated endpoint, fall back to appending locally
    try {
      const listRes = await fetch(`${API_URL}/disruptions`, { headers: getHeaders() });
      if (listRes.ok) { const d = await listRes.json(); setDisruptions(d.data || d || []); }
    } catch {
      setDisruptions(prev => [{ id: Date.now(), message, disruption_date, created_at: new Date().toISOString() }, ...prev]);
    }
  };

  /* ── Mark notification read ── */
  const markNotifRead = (id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  /* ── Computed ── */
  const unreadCount = notifications.filter(n => !n.read).length;

  const stats = useMemo(() => ({
    todaysOrders:      ordersToday.length,
    pendingDeliveries: ordersToday.filter(o => (o.status || '').toLowerCase() === 'pending').length,
    deliveredToday:    ordersToday.filter(o => (o.status || '').toLowerCase() === 'delivered').length,
    totalCustomers:    customers.length,
  }), [ordersToday, customers]);

  /* ── Normalise order shape for sub-components ── */
  const normaliseOrder = o => ({
    ...o,
    customer: o.customer_name || o.customer || o.users?.name || '—',
    area:     o.area     || '—',
    cans:     o.quantity ?? o.cans ?? 0,
    date:     o.delivery_date || o.date || '—',
    timeSlot: o.time_slot    || o.timeSlot || '—',
    address:  o.address || o.area || '—',
    status:   (o.status || 'pending').toLowerCase(),
  });

  const normOrdersToday = useMemo(() => ordersToday.map(normaliseOrder), [ordersToday]);
  const normAllOrders   = useMemo(() => allOrders.map(normaliseOrder),   [allOrders]);

  const activeLabel = NAV_ITEMS.find(n => n.id === active)?.label || 'Dashboard';

  /* ── Inline loading / error ── */
  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: `${C.blueLight} ${C.blueLight} ${C.blueLight} ${C.blue}` }} />
        <p className="text-sm" style={{ color: C.brownLt }}>Loading dashboard data…</p>
      </div>
    );
    if (fetchError) return (
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <div className="font-bold text-sm mb-1">Error</div>
          <div className="text-sm">{fetchError}</div>
          <button onClick={fetchAll} className="mt-2 text-xs font-bold underline">Retry</button>
        </div>
      </div>
    );

    switch (active) {
      case 'dashboard':
        return <DashboardOverview orders={normOrdersToday} stats={stats} onMarkDelivered={markDelivered} setActive={setActive} />;
      case 'todays-orders':
        return <TodaysOrdersView orders={normOrdersToday} onMarkDelivered={markDelivered} />;
      case 'all-orders':
        return <AllOrdersView orders={normAllOrders} onMarkDelivered={markDelivered} />;
      case 'customers':
        return <CustomersView customers={customers} />;
      case 'recurring':
        return <RecurringView recurringOrders={recurringOrders} />;
      case 'disruptions':
        return <DisruptionsView disruptions={disruptions} onAnnounce={handleAnnounce} />;
      case 'notifications':
        return <NotificationsView notifications={notifications} onMarkRead={markNotifRead} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: 'Inter, sans-serif' }}>
      <Sidebar
        active={active}
        setActive={setActive}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadCount={unreadCount}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar activeLabel={activeLabel} setSidebarOpen={setSidebarOpen} unreadCount={unreadCount} setActive={setActive} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
