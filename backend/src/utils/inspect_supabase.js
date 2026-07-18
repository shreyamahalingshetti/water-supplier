require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

async function main() {
  console.log('Fetching sample records from Supabase...');
  try {
    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);

    if (orderErr) {
      console.error('Error fetching orders:', orderErr);
    } else {
      console.log('Orders columns:', orderData && orderData.length > 0 ? Object.keys(orderData[0]) : 'No rows found in orders');
    }

    const { data: recData, error: recErr } = await supabaseAdmin
      .from('recurring_orders')
      .select('*')
      .limit(1);

    if (recErr) {
      console.error('Error fetching recurring orders:', recErr);
    } else {
      console.log('Recurring orders columns:', recData && recData.length > 0 ? Object.keys(recData[0]) : 'No rows found in recurring_orders');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();
