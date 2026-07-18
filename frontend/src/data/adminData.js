// ─── Jal Seva Admin — Dummy Data ───────────────────────────────────────────

export const ADMIN_CREDENTIALS = {
  email: 'admin@jalseva.com',
  password: 'admin123',
};

export const AREAS = [
  'Shivajinagar',
  'Kothrud',
  'Aundh',
  'Baner',
  'Hadapsar',
  'Pimpri',
];

// Status: 'pending' | 'delivered' | 'cancelled'
export const ORDERS_TODAY = [
  { id: 'ORD-001', customer: 'Ramesh Patil',    address: '12, Samarth Nagar, Shivajinagar',  area: 'Shivajinagar', cans: 2, timeSlot: '9 AM – 11 AM',  status: 'delivered', phone: '9876543210' },
  { id: 'ORD-002', customer: 'Sunita Desai',    address: '34, Prabhat Road, Shivajinagar',   area: 'Shivajinagar', cans: 1, timeSlot: '9 AM – 11 AM',  status: 'pending',   phone: '9823456781' },
  { id: 'ORD-003', customer: 'Anand Kulkarni',  address: '7, Dnyaneshwar Society, Kothrud',  area: 'Kothrud',      cans: 3, timeSlot: '11 AM – 1 PM', status: 'pending',   phone: '9765432109' },
  { id: 'ORD-004', customer: 'Meera Joshi',     address: '22, Warje Road, Kothrud',          area: 'Kothrud',      cans: 2, timeSlot: '11 AM – 1 PM', status: 'delivered', phone: '9988776655' },
  { id: 'ORD-005', customer: 'Vijay Shinde',    address: '9, Parihar Chowk, Aundh',         area: 'Aundh',        cans: 4, timeSlot: '7 AM – 9 AM',  status: 'delivered', phone: '9871234560' },
  { id: 'ORD-006', customer: 'Priya Naik',      address: '3, Sus Road, Aundh',              area: 'Aundh',        cans: 1, timeSlot: '1 PM – 3 PM',  status: 'pending',   phone: '9765098765' },
  { id: 'ORD-007', customer: 'Rahul Bhosale',   address: '56, Baner Gaon Road, Baner',      area: 'Baner',        cans: 2, timeSlot: '3 PM – 5 PM',  status: 'pending',   phone: '9812345678' },
  { id: 'ORD-008', customer: 'Kavita More',     address: '88, Balewadi Road, Baner',        area: 'Baner',        cans: 3, timeSlot: '11 AM – 1 PM', status: 'cancelled', phone: '9823498765' },
  { id: 'ORD-009', customer: 'Suresh Gaikwad',  address: '15, Magarpatta City, Hadapsar',   area: 'Hadapsar',     cans: 2, timeSlot: '7 AM – 9 AM',  status: 'delivered', phone: '9834512340' },
  { id: 'ORD-010', customer: 'Nirmala Iyer',    address: '40, Phursungi Road, Hadapsar',    area: 'Hadapsar',     cans: 1, timeSlot: '9 AM – 11 AM',  status: 'pending',   phone: '9945678901' },
  { id: 'ORD-011', customer: 'Ganesh Mane',     address: '67, MIDC Road, Pimpri',           area: 'Pimpri',       cans: 5, timeSlot: '7 AM – 9 AM',  status: 'delivered', phone: '9867453210' },
  { id: 'ORD-012', customer: 'Lata Sawant',     address: '23, Chinchwad Station, Pimpri',   area: 'Pimpri',       cans: 2, timeSlot: '1 PM – 3 PM',  status: 'pending',   phone: '9754321098' },
];

export const RECENT_ORDERS = [
  ...ORDERS_TODAY,
  { id: 'ORD-013', customer: 'Deepak Holkar',   address: '5, Model Colony, Shivajinagar',   area: 'Shivajinagar', cans: 1, timeSlot: '9 AM – 11 AM',  status: 'delivered', phone: '9812309876', date: '2026-07-15' },
  { id: 'ORD-014', customer: 'Shobha Pawar',    address: '99, Karve Nagar, Kothrud',        area: 'Kothrud',      cans: 2, timeSlot: '11 AM – 1 PM', status: 'delivered', phone: '9823409871', date: '2026-07-15' },
  { id: 'ORD-015', customer: 'Nitin Wagh',      address: '11, ITI Road, Aundh',             area: 'Aundh',        cans: 3, timeSlot: '7 AM – 9 AM',  status: 'cancelled', phone: '9765431234', date: '2026-07-14' },
  { id: 'ORD-016', customer: 'Shalini Deshpande', address: '33, Hinjewadi Phase 1, Baner',  area: 'Baner',        cans: 1, timeSlot: '3 PM – 5 PM',  status: 'delivered', phone: '9876501234', date: '2026-07-14' },
].map((o) => ({ ...o, date: o.date || '2026-07-16' }));

export const CUSTOMERS = [
  { id: 'C-001', name: 'Ramesh Patil',     area: 'Shivajinagar', phone: '9876543210', totalOrders: 24, recurring: true  },
  { id: 'C-002', name: 'Sunita Desai',     area: 'Shivajinagar', phone: '9823456781', totalOrders: 12, recurring: false },
  { id: 'C-003', name: 'Anand Kulkarni',   area: 'Kothrud',      phone: '9765432109', totalOrders: 30, recurring: true  },
  { id: 'C-004', name: 'Meera Joshi',      area: 'Kothrud',      phone: '9988776655', totalOrders: 8,  recurring: false },
  { id: 'C-005', name: 'Vijay Shinde',     area: 'Aundh',        phone: '9871234560', totalOrders: 45, recurring: true  },
  { id: 'C-006', name: 'Priya Naik',       area: 'Aundh',        phone: '9765098765', totalOrders: 5,  recurring: false },
  { id: 'C-007', name: 'Rahul Bhosale',    area: 'Baner',        phone: '9812345678', totalOrders: 17, recurring: true  },
  { id: 'C-008', name: 'Kavita More',      area: 'Baner',        phone: '9823498765', totalOrders: 9,  recurring: false },
  { id: 'C-009', name: 'Suresh Gaikwad',   area: 'Hadapsar',     phone: '9834512340', totalOrders: 38, recurring: true  },
  { id: 'C-010', name: 'Nirmala Iyer',     area: 'Hadapsar',     phone: '9945678901', totalOrders: 3,  recurring: false },
  { id: 'C-011', name: 'Ganesh Mane',      area: 'Pimpri',       phone: '9867453210', totalOrders: 52, recurring: true  },
  { id: 'C-012', name: 'Lata Sawant',      area: 'Pimpri',       phone: '9754321098', totalOrders: 7,  recurring: false },
];

export const STATS = {
  todaysOrders:       ORDERS_TODAY.length,
  pendingDeliveries:  ORDERS_TODAY.filter(o => o.status === 'pending').length,
  deliveredToday:     ORDERS_TODAY.filter(o => o.status === 'delivered').length,
  totalCustomers:     CUSTOMERS.length,
};

export const NOTIFICATIONS = [
  { id: 1, type: 'order',       message: 'New order from Priya Naik (Aundh)', time: '10 min ago',  read: false },
  { id: 2, type: 'order',       message: 'Order ORD-008 cancelled by Kavita More', time: '25 min ago', read: false },
  { id: 3, type: 'disruption',  message: 'Low supply alert — Baner area', time: '1 hr ago',   read: true  },
  { id: 4, type: 'order',       message: 'ORD-005 marked as delivered', time: '2 hr ago',   read: true  },
  { id: 5, type: 'system',      message: 'Recurring orders refreshed for today', time: '6 hr ago',   read: true  },
];

export const RECURRING_ORDERS = CUSTOMERS.filter(c => c.recurring).map((c, i) => ({
  id: `REC-${String(i + 1).padStart(3, '0')}`,
  customer:  c.name,
  area:      c.area,
  cans:      [1, 2, 3][i % 3],
  frequency: ['Daily', 'Mon–Fri', 'Mon, Wed, Fri'][i % 3],
  nextDelivery: '2026-07-17',
  active: true,
}));
