require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function uuidToBigInt(val) {
  if (!val) return val;
  if (/^\d+$/.test(String(val))) return String(val);
  const hex = val.replace(/-/g, '');
  const n = BigInt('0x' + hex);
  return String(n);
}

async function main() {
  console.log('\n=== USERS TABLE ===');
  const { data: users } = await supabase.from('users').select('id, name, phone, area, role');
  console.table(users);

  console.log('\n=== ORDERS TABLE ===');
  const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
  if (ordersError) {
    console.error('Orders error:', ordersError.message);
  } else {
    console.log('Total orders:', orders?.length);
    console.table(orders);
  }

  // Try placing a test order directly via supabase
  if (users && users.length > 0) {
    const user = users[0];
    console.log(`\n=== Testing findByCustomer for user id=${user.id} ===`);
    const { data: customerOrders, error: coErr } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id);
    if (coErr) {
      console.error('findByCustomer error:', coErr.message);
    } else {
      console.log(`Orders for customer ${user.id}:`, customerOrders?.length);
      console.table(customerOrders);
    }
  }
}

main().catch(console.error);
