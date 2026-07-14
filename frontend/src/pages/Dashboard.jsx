import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Customer Dashboard Component for Jal Seva
 * Adheres strictly to the 3-color scheme:
 * 1. Light water blue (#4FC3F7) - buttons, toggle buttons, highlights, accents
 * 2. White (#FFFFFF) - backgrounds, cards
 * 3. Warm brown (#8D6E63) - text, headers, outlines, borders, labels
 */
function Dashboard() {
  const navigate = useNavigate();

  // Mock initial customer profile details
  const [profile] = useState({
    name: 'John Doe',
    phone: '+91 9876543210',
    area: 'Indiranagar'
  });

  // Mock state for orders
  const [orders, setOrders] = useState([
    {
      id: 'ORD-8291',
      quantity: 2,
      deliveryDate: '2026-07-15',
      timeSlot: 'Morning 7am-10am',
      address: 'No 42, 5th Cross, Indiranagar',
      status: 'Pending'
    },
    {
      id: 'ORD-7193',
      quantity: 1,
      deliveryDate: '2026-07-12',
      timeSlot: 'Afternoon 12pm-3pm',
      address: 'No 42, 5th Cross, Indiranagar',
      status: 'Delivered'
    }
  ]);

  // Mock state for recurring orders (allows toggling active state in UI)
  const [recurringOrders, setRecurringOrders] = useState([
    {
      id: 'REC-304',
      quantity: 1,
      frequencyDays: 3,
      nextDelivery: '2026-07-17',
      address: 'No 42, 5th Cross, Indiranagar',
      isActive: true
    },
    {
      id: 'REC-112',
      quantity: 2,
      frequencyDays: 7,
      nextDelivery: '2026-07-21',
      address: 'No 42, 5th Cross, Indiranagar',
      isActive: false
    }
  ]);

  // Mock disruption alert
  const [disruption] = useState(
    'Notice: Delivery services will be suspended on 2026-07-16 due to local pipe main repair works. Please stock up accordingly.'
  );

  // Mock notification history
  const [notifications] = useState([
    {
      id: 'NTF-1',
      time: '10 mins ago',
      message: 'Your order ORD-8291 has been confirmed for delivery on 2026-07-15.',
      status: 'sent'
    },
    {
      id: 'NTF-2',
      time: '2 days ago',
      message: 'Your order ORD-7193 was successfully delivered.',
      status: 'sent'
    }
  ]);

  const toggleRecurringActive = (id) => {
    setRecurringOrders(
      recurringOrders.map((rec) =>
        rec.id === id ? { ...rec, isActive: !rec.isActive } : rec
      )
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header Branding & User details */}
        <div className="w-full p-6 border border-[#8D6E63]/30 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            {/* Logo illustration */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4FC3F7"
              strokeWidth="2.0"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-[#4FC3F7]"
            >
              <rect x="10" y="2" width="4" height="2" rx="0.5" fill="#4FC3F7" />
              <path d="M11 4h2v2h-2z" />
              <path d="M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" />
              <path d="M7 15c2-1 3 1 5 0s3-1 5 0" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-[#8D6E63]">Jal Seva</h1>
              <p className="text-xs text-[#8D6E63]/80">Fresh water, delivered to your door</p>
            </div>
          </div>

          <div className="text-center md:text-right text-[#8D6E63]">
            <div className="font-bold">{profile.name}</div>
            <div className="text-xs">{profile.phone} | {profile.area}</div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-[#8D6E63] text-[#8D6E63] font-bold rounded-lg hover:bg-[#8D6E63]/10 transition-all text-sm outline-none"
          >
            Logout
          </button>
        </div>

        {/* Disruption Alert banner if present */}
        {disruption && (
          <div className="w-full p-4 border border-[#8D6E63] rounded-xl bg-[#FFFFFF] flex items-start gap-3 animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-[#8D6E63] mt-0.5">warning</span>
            <div className="text-sm text-[#8D6E63]">
              <span className="font-bold block uppercase tracking-wider text-xs mb-1">Service Announcement</span>
              {disruption}
            </div>
          </div>
        )}

        {/* Quick actions panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Active Bookings List */}
            <div className="p-6 border border-[#8D6E63]/30 rounded-xl bg-[#FFFFFF] space-y-4">
              <div className="flex justify-between items-center border-b border-[#8D6E63]/20 pb-2">
                <h2 className="text-lg font-bold text-[#8D6E63]">Your Bookings</h2>
                <button
                  onClick={() => navigate('/place-order')}
                  className="px-4 py-2 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-opacity-90 active:scale-95 transition-all text-xs outline-none"
                >
                  + New Order
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-[#8D6E63]/20 rounded-lg text-sm text-[#8D6E63] flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="font-bold">{order.id} ({order.quantity} Can{order.quantity > 1 ? 's' : ''})</div>
                      <div className="text-xs text-[#8D6E63]/80">Date: {order.deliveryDate} | {order.timeSlot}</div>
                      <div className="text-xs text-[#8D6E63]/80">Address: {order.address}</div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Pending'
                            ? 'border border-[#8D6E63] text-[#8D6E63]'
                            : 'bg-[#4FC3F7] text-[#FFFFFF]'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring Schedules */}
            <div className="p-6 border border-[#8D6E63]/30 rounded-xl bg-[#FFFFFF] space-y-4">
              <h2 className="text-lg font-bold text-[#8D6E63] border-b border-[#8D6E63]/20 pb-2">
                Recurring Subscriptions
              </h2>

              <div className="space-y-3">
                {recurringOrders.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 border border-[#8D6E63]/20 rounded-lg text-sm text-[#8D6E63] flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold">{rec.id} ({rec.quantity} Can{rec.quantity > 1 ? 's' : ''})</div>
                      <div className="text-xs text-[#8D6E63]/80">Frequency: Deliver every {rec.frequencyDays} Days</div>
                      <div className="text-xs text-[#8D6E63]/80">Next delivery: {rec.nextDelivery}</div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <span
                        className={`text-xs font-bold ${
                          rec.isActive ? 'text-[#4FC3F7]' : 'text-[#8D6E63]/50 line-through'
                        }`}
                      >
                        {rec.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                      <button
                        onClick={() => toggleRecurringActive(rec.id)}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 outline-none ${
                          rec.isActive ? 'bg-[#4FC3F7]' : 'bg-[#FFFFFF] border border-[#8D6E63]'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-[9px] font-bold ${
                            rec.isActive
                              ? 'translate-x-6 bg-[#FFFFFF] text-[#4FC3F7]'
                              : 'translate-x-0 bg-[#8D6E63] text-[#FFFFFF]'
                          }`}
                        >
                          {rec.isActive ? 'ON' : 'OFF'}
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Notification logs */}
          <div className="space-y-6">
            <div className="p-6 border border-[#8D6E63]/30 rounded-xl bg-[#FFFFFF] space-y-4">
              <h2 className="text-lg font-bold text-[#8D6E63] border-b border-[#8D6E63]/20 pb-2">
                Recent Alerts
              </h2>

              <div className="space-y-4">
                {notifications.map((ntf) => (
                  <div key={ntf.id} className="space-y-1 text-sm text-[#8D6E63]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#4FC3F7] text-xs">WHATSAPP</span>
                      <span className="text-[10px] text-[#8D6E63]/60">{ntf.time}</span>
                    </div>
                    <p className="text-[#8D6E63]/90 text-xs leading-relaxed">{ntf.message}</p>
                    <div className="border-b border-[#8D6E63]/10 pt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
