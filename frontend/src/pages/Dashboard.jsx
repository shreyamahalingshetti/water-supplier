import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translations, t } from '../utils/translations.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Customer Dashboard for Jal Seva
 */

/* ── JWT decoder (no crypto — just reads payload) ── */
function decodeJwtSub(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub || null;
  } catch {
    return null;
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const tr = translations[language];

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  /* ── Data states ── */
  const [profile,         setProfile]         = useState(() => {
    // Seed profile immediately from login cache so name/area show instantly
    try {
      const cached = localStorage.getItem('userProfile');
      if (cached) {
        const p = JSON.parse(cached);
        const nameParts = (p.name || '').trim().split(' ');
        const initials =
          nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : (p.name || 'U').slice(0, 2).toUpperCase();
        return { ...p, initials };
      }
    } catch {}
    return null;
  });
  const [orders,          setOrders]          = useState([]);
  const [recurringOrders, setRecurringOrders] = useState([]);
  const [disruptions,     setDisruptions]     = useState([]);
  const [notifications,   setNotifications]   = useState([]);

  /* ── UI states ── */
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState('');
  const [togglingId,     setTogglingId]     = useState(null); // recurring order being toggled

  /* ── Auth helper ── */
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  /* ── 401 handler ── */
  const handle401 = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfile');
    navigate('/login');
  }, [navigate]);

  /* ── Fetch all dashboard data ── */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const customerId = decodeJwtSub(token);
    if (!customerId) {
      navigate('/login');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const [profileRes, ordersRes, recurringRes, disruptionRes, notifRes] =
          await Promise.all([
            fetch(`${API_URL}/users/${customerId}`,                    { headers: getAuthHeaders() }),
            fetch(`${API_URL}/orders/customer/${customerId}`,          { headers: getAuthHeaders() }),
            fetch(`${API_URL}/recurring-orders/customer/${customerId}`,{ headers: getAuthHeaders() }),
            fetch(`${API_URL}/disruptions/today`),
            fetch(`${API_URL}/notifications/customer/${customerId}`,   { headers: getAuthHeaders() }),
          ]);

        // Check for 401s
        if ([profileRes, ordersRes, recurringRes, notifRes].some((r) => r.status === 401)) {
          handle401();
          return;
        }

        /* Profile */
        if (profileRes.ok) {
          const d = await profileRes.json();
          const p = d.data || d;
          const nameParts = (p.name || '').trim().split(' ');
          const initials =
            nameParts.length >= 2
              ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              : (p.name || 'U').slice(0, 2).toUpperCase();
          const updatedProfile = { ...p, initials };
          setProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(p));
        }

        /* Orders */
        if (ordersRes.ok) {
          const d = await ordersRes.json();
          setOrders(d.data || d || []);
        }

        /* Recurring orders */
        if (recurringRes.ok) {
          const d = await recurringRes.json();
          setRecurringOrders(d.data || d || []);
        }

        /* Disruption */
        if (disruptionRes.ok) {
          const d = await disruptionRes.json();
          const list = d.data?.disruptions || (d.data?.disruption ? [d.data.disruption] : []);
          setDisruptions(list);
        }

        /* Notifications */
        if (notifRes.ok) {
          const d = await notifRes.json();
          setNotifications(d.data || d || []);
        }
      } catch (err) {
        setFetchError('Failed to load dashboard data. Please refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, handle401]);

  /* ── Pause / Resume recurring order ── */
  const toggleRecurringActive = async (rec) => {
    const action = rec.is_active ? 'pause' : 'resume';
    setTogglingId(rec.id);
    try {
      const res = await fetch(`${API_URL}/recurring-orders/${rec.id}/${action}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (res.status === 401) { handle401(); return; }
      if (!res.ok) throw new Error('Failed to update subscription.');

      const token      = localStorage.getItem('accessToken');
      const customerId = decodeJwtSub(token);
      const refreshRes = await fetch(
        `${API_URL}/recurring-orders/customer/${customerId}`,
        { headers: getAuthHeaders() }
      );
      if (refreshRes.ok) {
        const d = await refreshRes.json();
        setRecurringOrders(d.data || d || []);
      }
    } catch (err) {
      setRecurringOrders((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, is_active: !r.is_active } : r))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── Computed helpers ── */
  const initials   = profile?.initials   ?? '?';
  const name       = profile?.name       ?? '—';
  const phone      = profile?.phone      ?? '—';
  const area       = profile?.area       ?? '—';
  const activeSubs = recurringOrders.filter((r) => r.is_active).length;

  const getStatusText = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'pending') return tr.dash_status_pending || 'Pending';
    if (s === 'delivered') return tr.dash_status_delivered || 'Delivered';
    return tr.dash_status_cancelled || 'Cancelled';
  };

  /* ── Status badge helper ── */
  const statusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'pending')
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (s === 'delivered')
      return 'bg-[#4FC3F7]/15 text-[#0288D1] border border-[#4FC3F7]/40';
    return 'bg-[#3E2723]/10 text-[#3E2723]/70 border border-[#3E2723]/20';
  };

  /* ── Format relative time ── */
  const relTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return language === 'kn' ? 'ಈಗಷ್ಟೇ' : 'Just now';
    if (mins  < 60) return language === 'kn' ? `${mins} ನಿಮಿಷದ ಹಿಂದೆ` : `${mins} min${mins > 1 ? 's' : ''} ago`;
    if (hours < 24) return language === 'kn' ? `${hours} ಗಂಟೆಯ ಹಿಂದೆ` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return language === 'kn' ? `${days} ದಿನದ ಹಿಂದೆ` : `${days} day${days > 1 ? 's' : ''} ago`;
  };

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
              <span className="text-lg font-bold text-[#3E2723] leading-none">{tr.brand_name}</span>
              <p className="text-[11px] text-[#3E2723]/60 leading-none mt-0.5 hidden sm:block">
                {tr.brand_tagline}
              </p>
            </div>
          </div>

          {/* Nav right */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-water-blue text-water-blue text-xs font-bold hover:bg-water-blue hover:text-white transition-all duration-200"
              style={{ borderColor: '#4FC3F7', color: '#4FC3F7' }}
            >
              🌐 <span>{tr.lang_current}</span>
              <span className="opacity-60">|</span>
              <span className="opacity-80">{tr.lang_toggle}</span>
            </button>

            <button
              onClick={() => navigate('/place-order')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#4FC3F7] text-white font-semibold rounded-lg text-sm hover:bg-[#29B6F6] active:scale-95 transition-all"
            >
              <span className="text-lg leading-none">+</span> {tr.dash_new_order_menu}
            </button>

            {/* Account avatar with dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-[#3E2723]/8 transition-colors"
                aria-label="Account menu"
              >
                <div className="w-9 h-9 rounded-full bg-[#4FC3F7] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-[#3E2723] leading-tight">{name}</div>
                  <div className="text-[11px] text-[#3E2723]/60 leading-tight">{area}</div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 text-[#3E2723]/50 transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#3E2723]/10 overflow-hidden z-50 animate-[fadeIn_0.15s_ease]">
                  <div className="px-4 py-3 bg-[#4FC3F7]/8 border-b border-[#3E2723]/10">
                    <div className="font-semibold text-[#3E2723] text-sm">{name}</div>
                    <div className="text-[11px] text-[#3E2723]/60 mt-0.5">{phone}</div>
                    <div className="text-[11px] text-[#3E2723]/60">{area}</div>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#3E2723] hover:bg-[#F5F7FA] transition-colors text-left"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#4FC3F7]">person</span>
                      {tr.dash_my_profile}
                    </button>
                    <button
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#3E2723] hover:bg-[#F5F7FA] transition-colors text-left"
                      onClick={() => { setAccountMenuOpen(false); navigate('/place-order'); }}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#4FC3F7]">add_shopping_cart</span>
                      {tr.dash_new_order_menu}
                    </button>
                    <div className="border-t border-[#3E2723]/10 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      {tr.dash_logout}
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

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-[#4FC3F7]/30 border-t-[#4FC3F7] rounded-full animate-spin" />
            <p className="text-sm text-[#3E2723]/60">{language === 'kn' ? 'ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' : 'Loading your dashboard…'}</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="text-sm">
              <span className="font-bold block mb-0.5">{language === 'kn' ? 'ದೋಷ' : 'Error'}</span>
              {fetchError}
            </div>
          </div>
        )}

        {!loading && !fetchError && (
          <>
            {/* Disruption banners */}
            {disruptions.length > 0 && disruptions.map((dis, idx) => (
              <div key={dis.id || idx} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="material-symbols-outlined text-amber-500 mt-0.5 shrink-0">warning</span>
                <div className="text-sm">
                  <span className="font-bold uppercase tracking-wider text-xs block mb-0.5">
                    {tr.dash_service_announcement}
                  </span>
                  {dis.message}
                </div>
              </div>
            ))}

            {/* ── MAIN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 space-y-6">

                {/* Your Bookings */}
                <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#3E2723]/10">
                    <h2 className="text-base font-bold text-[#3E2723]">{tr.dash_your_bookings}</h2>
                    <button
                      onClick={() => navigate('/place-order')}
                      className="flex items-center gap-1 px-4 py-2 bg-[#4FC3F7] text-white font-semibold rounded-lg text-xs hover:bg-[#29B6F6] active:scale-95 transition-all"
                    >
                      {tr.dash_new_order}
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="px-6 py-10 text-center text-[#3E2723]/50 text-sm">
                      {tr.dash_no_orders}{' '}
                      <button className="text-[#4FC3F7] font-semibold hover:underline" onClick={() => navigate('/place-order')}>
                        {tr.dash_place_first}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#3E2723]/8">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#F5F7FA] transition-colors">
                          <div className="space-y-1">
                            <div className="font-semibold text-[#3E2723] text-sm">
                              #{order.id}&nbsp;·&nbsp;{order.quantity} {language === 'kn' ? 'ಕ್ಯಾನ್' : 'Can'}{order.quantity > 1 ? (language === 'kn' ? 'ಗಳು' : 's') : ''} ({order.can_size || '20L'})
                            </div>
                            <div className="text-xs text-[#3E2723]/60">
                              {order.delivery_date}&nbsp;|&nbsp;{
                                order.time_slot === 'Morning 7am-10am' ? tr.order_slot_morning :
                                order.time_slot === 'Afternoon 12pm-3pm' ? tr.order_slot_afternoon : tr.order_slot_evening
                              }
                            </div>
                            {order.area && (
                              <div className="text-xs text-[#3E2723]/60">{order.area}</div>
                            )}
                          </div>
                          <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${statusBadge(order.status)}`}>
                            {getStatusText(order.status).toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recurring Subscriptions */}
                <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#3E2723]/10">
                    <h2 className="text-base font-bold text-[#3E2723]">{tr.dash_recurring_subs}</h2>
                  </div>

                  {recurringOrders.length === 0 ? (
                    <div className="px-6 py-10 text-center text-[#3E2723]/50 text-sm">
                      {tr.dash_no_recurring}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#3E2723]/8">
                      {recurringOrders.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-[#F5F7FA] transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold text-[#3E2723] text-sm">
                              #{rec.id}&nbsp;·&nbsp;{rec.quantity} {language === 'kn' ? 'ಕ್ಯಾನ್' : 'Can'}{rec.quantity > 1 ? (language === 'kn' ? 'ಗಳು' : 's') : ''}
                            </div>
                            <div className="text-xs text-[#3E2723]/60">
                              {t(tr, 'dash_every_x_days', { days: rec.frequency_days })}
                              {(rec.next_delivery || rec.next_delivery_date) && (
                                <>&nbsp;·&nbsp;{language === 'kn' ? 'ಮುಂದಿನ ಡೆಲಿವರಿ' : 'Next'}: {rec.next_delivery || rec.next_delivery_date}</>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[11px] font-bold ${rec.is_active ? 'text-[#4FC3F7]' : 'text-[#3E2723]/40'}`}>
                              {rec.is_active ? tr.dash_active.toUpperCase() : tr.dash_paused.toUpperCase()}
                            </span>
                            <button
                              onClick={() => toggleRecurringActive(rec)}
                              disabled={togglingId === rec.id}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-300 outline-none focus:ring-2 focus:ring-[#4FC3F7]/40 ${
                                togglingId === rec.id
                                  ? 'opacity-50 cursor-wait'
                                  : rec.is_active
                                  ? 'bg-[#4FC3F7]'
                                  : 'bg-[#3E2723]/20'
                              }`}
                            >
                              {togglingId === rec.id ? (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </span>
                              ) : (
                                <span
                                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                                    rec.is_active ? 'left-7' : 'left-1'
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#4FC3F7] flex items-center justify-center text-white font-bold text-base shadow">
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold text-[#3E2723] text-sm">{name}</div>
                      <div className="text-[11px] text-[#3E2723]/60">{phone}</div>
                      <div className="text-[11px] text-[#3E2723]/60">{area}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[#F5F7FA]">
                      <div className="text-lg font-bold text-[#4FC3F7]">{orders.length}</div>
                      <div className="text-[10px] text-[#3E2723]/60 uppercase tracking-wide">{tr.dash_orders}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5F7FA]">
                      <div className="text-lg font-bold text-[#4FC3F7]">{activeSubs}</div>
                      <div className="text-[10px] text-[#3E2723]/60 uppercase tracking-wide">{tr.dash_active_subs}</div>
                    </div>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white rounded-2xl border border-[#3E2723]/10 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#3E2723]/10">
                    <h2 className="text-base font-bold text-[#3E2723]">{tr.dash_recent_alerts}</h2>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center text-[#3E2723]/50 text-sm">
                      {tr.dash_no_notifs}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#3E2723]/8">
                      {notifications.map((ntf) => (
                        <div key={ntf.id} className="px-5 py-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#4FC3F7] uppercase tracking-wider">
                              {ntf.channel || 'WhatsApp'}
                            </span>
                            <span className="text-[10px] text-[#3E2723]/50">
                              {relTime(ntf.created_at) || ntf.time}
                            </span>
                          </div>
                          <p className="text-xs text-[#3E2723]/80 leading-relaxed">{ntf.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
