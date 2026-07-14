import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Customer Dashboard for Jal Seva
 * Color scheme:
 *  - #4FC3F7  water blue  → buttons, accents, active states
 *  - #FFFFFF  white       → backgrounds, cards
 *  - #3E2723  dark brown  → text, borders, labels
 */
function Dashboard() {
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const [profile] = useState({
    name: 'John Doe',
    phone: '+91 9876543210',
    area: 'Indiranagar',
    initials: 'JD',
  });

  const [orders] = useState([
    {
      id: 'ORD-8291',
      quantity: 2,
      deliveryDate: '2026-07-15',
      timeSlot: 'Morning 7am–10am',
      address: 'No 42, 5th Cross, Indiranagar',
      status: 'Pending',
    },
    {
      id: 'ORD-7193',
      quantity: 1,
      deliveryDate: '2026-07-12',
      timeSlot: 'Afternoon 12pm–3pm',
      address: 'No 42, 5th Cross, Indiranagar',
      status: 'Delivered',
    },
  ]);

  const [recurringOrders, setRecurringOrders] = useState([
    {
      id: 'REC-304',
      quantity: 1,
      frequencyDays: 3,
      nextDelivery: '2026-07-17',
      isActive: true,
    },
    {
      id: 'REC-112',
      quantity: 2,
      frequencyDays: 7,
      nextDelivery: '2026-07-21',
      isActive: false,
    },
  ]);

  const [disruption] = useState(
    'Notice: Delivery services will be suspended on 2026-07-16 due to local pipe main repair works. Please stock up accordingly.'
  );

  const [notifications] = useState([
    {
      id: 'NTF-1',
      time: '10 mins ago',
      message: 'Your order ORD-8291 has been confirmed for delivery on 2026-07-15.',
    },
    {
      id: 'NTF-2',
      time: '2 days ago',
      message: 'Your order ORD-7193 was successfully delivered.',
    },
  ]);

  const toggleRecurringActive = (id) => {
    setRecurringOrders((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, isActive: !rec.isActive } : rec))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#3E2723]/15 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4FC3F7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-9 h-9 shrink-0"
            >
              <rect x="10" y="2" width="4" height="2" rx="0.5" fill="#4FC3F7" />
              <path d="M11 4h2v2h-2z" />
              <path d="M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" />
              <path d="M7 15c2-1 3 1 5 0s3-1 5 0" />
            </svg>
            <div>
              <span className="text-lg font-bold text-[#3E2723] leading-none">Jal Seva</span>
              <p className="text-[11px] text-[#3E2723]/60 leading-none mt-0.5 hidden sm:block">
                Fresh water, delivered to your door
              </p>
            </div>
          </div>

          {/* Nav right: New Order + Account avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/place-order')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#4FC3F7] text-white font-semibold rounded-lg text-sm hover:bg-[#29B6F6] active:scale-95 transition-all"
            >
              <span className="text-lg leading-none">+</span> New Order
            </button>

            {/* Account avatar with dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-[#3E2723]/8 transition-colors group"
                aria-label="Account menu"
              >
                {/* Avatar circle */}
                <div className="w-9 h-9 rounded-full bg-[#4FC3F7] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {profile.initials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-[#3E2723] leading-tight">
                    {profile.name}
                  </div>
                  <div className="text-[11px] text-[#3E2723]/60 leading-tight">
                    {profile.area}
                  </div>
                </div>
                {/* Chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-[#3E2723]/50 transition-transform duration-200 ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#3E2723]/10 overflow-hidden z-50 animate-[fadeIn_0.15s_ease]">
                  {/* Profile info header */}
                  <div className="px-4 py-3 bg-[#4FC3F7]/8 border-b border-[#3E2723]/10">
                    <div className="font-semibold text-[#3E2723] text-sm">{profile.name}</div>
                    <div className="text-[11px] text-[#3E2723]/60 mt-0.5">{profile.phone}</div>
                    <div className="text-[11px] text-[#3E2723]/60">{profile.area}</div>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#3E2723] hover:bg-[#F5F7FA] transition-colors text-left"
                      onClick={() => { setAccountMenuOpen(false); }}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#4FC3F7]">person</span>
                      My Profile
                    </button>
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#3E2723] hover:bg-[#F5F7FA] transition-colors text-left"
                      onClick={() => { setAccountMenuOpen(false); navigate('/place-order'); }}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#4FC3F7]">add_shopping_cart</span>
                      New Order
                    </button>
                    <div className="border-t border-[#3E2723]/10 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── PAGE BODY ── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8 space-y-6">

        {/* Disruption banner */}
        {disruption && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0">warning</span>
            <div className="text-sm">
              <span className="font-bold uppercase tracking-wider text-xs block mb-0.5">
                Service Announcement
              </span>
              {disruption}
            </div>
          </div>
        )}

        {/* ── MAIN GRID: left 2/3 + right 1/3 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Your Bookings */}
            <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#3E2723]/10">
                <h2 className="text-base font-bold text-[#3E2723]">Your Bookings</h2>
                <button
                  onClick={() => navigate('/place-order')}
                  className="flex items-center gap-1 px-4 py-2 bg-[#4FC3F7] text-white font-semibold rounded-lg text-xs hover:bg-[#29B6F6] active:scale-95 transition-all"
                >
                  + New Order
                </button>
              </div>

              <div className="divide-y divide-[#3E2723]/8">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#F5F7FA] transition-colors">
                    <div className="space-y-1">
                      <div className="font-semibold text-[#3E2723] text-sm">
                        {order.id} &nbsp;·&nbsp; {order.quantity} Can{order.quantity > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-[#3E2723]/60">{order.deliveryDate} &nbsp;|&nbsp; {order.timeSlot}</div>
                      <div className="text-xs text-[#3E2723]/60">{order.address}</div>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                        order.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-[#4FC3F7]/15 text-[#0288D1] border border-[#4FC3F7]/40'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring Subscriptions */}
            <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#3E2723]/10">
                <h2 className="text-base font-bold text-[#3E2723]">Recurring Subscriptions</h2>
              </div>

              <div className="divide-y divide-[#3E2723]/8">
                {recurringOrders.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#F5F7FA] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-[#3E2723] text-sm">
                        {rec.id} &nbsp;·&nbsp; {rec.quantity} Can{rec.quantity > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-[#3E2723]/60">
                        Every {rec.frequencyDays} days &nbsp;·&nbsp; Next: {rec.nextDelivery}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] font-bold ${rec.isActive ? 'text-[#4FC3F7]' : 'text-[#3E2723]/40'}`}>
                        {rec.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                      {/* Toggle switch */}
                      <button
                        onClick={() => toggleRecurringActive(rec.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 outline-none focus:ring-2 focus:ring-[#4FC3F7]/40 ${
                          rec.isActive ? 'bg-[#4FC3F7]' : 'bg-[#3E2723]/20'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                            rec.isActive ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4FC3F7] flex items-center justify-center text-white font-bold text-base shadow">
                  {profile.initials}
                </div>
                <div>
                  <div className="font-bold text-[#3E2723] text-sm">{profile.name}</div>
                  <div className="text-[11px] text-[#3E2723]/60">{profile.phone}</div>
                  <div className="text-[11px] text-[#3E2723]/60">{profile.area}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#F5F7FA]">
                  <div className="text-lg font-bold text-[#4FC3F7]">{orders.length}</div>
                  <div className="text-[10px] text-[#3E2723]/60 uppercase tracking-wide">Orders</div>
                </div>
                <div className="p-2 rounded-lg bg-[#F5F7FA]">
                  <div className="text-lg font-bold text-[#4FC3F7]">
                    {recurringOrders.filter((r) => r.isActive).length}
                  </div>
                  <div className="text-[10px] text-[#3E2723]/60 uppercase tracking-wide">Active Subs</div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#3E2723]/10">
                <h2 className="text-base font-bold text-[#3E2723]">Recent Alerts</h2>
              </div>
              <div className="divide-y divide-[#3E2723]/8">
                {notifications.map((ntf) => (
                  <div key={ntf.id} className="px-5 py-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#4FC3F7] uppercase tracking-wider">
                        WhatsApp
                      </span>
                      <span className="text-[10px] text-[#3E2723]/50">{ntf.time}</span>
                    </div>
                    <p className="text-xs text-[#3E2723]/80 leading-relaxed">{ntf.message}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
