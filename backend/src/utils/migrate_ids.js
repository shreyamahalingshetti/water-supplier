require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// New 12-char hash function (JS-safe)
function uuidToBigIntSafe(uuid) {
  const hash = crypto.createHash('sha256').update(uuid).digest('hex');
  const hexPart = hash.slice(0, 12);
  return BigInt('0x' + hexPart).toString();
}

// Old 15-char hash function (broken)
function uuidToBigIntOld(uuid) {
  const hash = crypto.createHash('sha256').update(uuid).digest('hex');
  const hexPart = hash.slice(0, 15);
  return BigInt('0x' + hexPart).toString();
}

async function fetchRaw(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(process.env.SUPABASE_URL + path);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    };
    https.get(opts, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function main() {
  // Get all auth users from Supabase Auth
  const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Failed to list auth users:', error.message);
    return;
  }

  console.log(`Found ${authUsers.length} auth users`);

  // Get current DB users with raw IDs
  const rawUsers = await fetchRaw('/rest/v1/users?select=id,phone');
  const dbUsers = JSON.parse(rawUsers);
  console.log('Current DB users (raw):', rawUsers);

  // Get current orders with raw IDs
  const rawOrders = await fetchRaw('/rest/v1/orders?select=id,customer_id');
  const dbOrders = JSON.parse(rawOrders);
  console.log('Current orders (raw):', rawOrders);

  for (const authUser of authUsers) {
    const uuid = authUser.id;
    const oldId = uuidToBigIntOld(uuid);
    const newId = uuidToBigIntSafe(uuid);
    
    console.log(`\nAuth user: ${uuid}`);
    console.log(`  Old BigInt ID (15-char): ${oldId}`);
    console.log(`  New BigInt ID (12-char): ${newId}`);

    // Compare as raw strings from the API response to avoid JS precision loss
    // Parse the raw JSON manually using regex to extract exact string values
    const rawIdMatches = rawUsers.match(/"id":(\d+)/g) || [];
    const rawIds = rawIdMatches.map(m => m.replace('"id":', ''));
    
    const currentRawId = rawIds.find(rid => rid === oldId || rid === newId);
    
    if (currentRawId) {
      if (currentRawId !== newId) {
        console.log(`  Updating users.id from ${currentRawId} -> ${newId}`);
        // Use raw fetch with PATCH for exact BigInt strings
        const patchRes = await new Promise((resolve, reject) => {
          const url = new URL(process.env.SUPABASE_URL + `/rest/v1/users?id=eq.${currentRawId}`);
          const body = JSON.stringify({ id: parseInt(newId) });
          const opts = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'PATCH',
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          };
          const req = require('https').request(opts, res => {
            let b = ''; res.on('data', d => b += d); res.on('end', () => resolve({ status: res.statusCode, body: b }));
          });
          req.on('error', reject);
          req.write(body);
          req.end();
        });
        console.log(`  Users PATCH response: ${patchRes.status} ${patchRes.body}`);

        // Update matching orders
        const rawOrderMatches = rawOrders.match(/"customer_id":(\d+)/g) || [];
        const rawCustomerIds = rawOrderMatches.map(m => m.replace('"customer_id":', ''));
        const rawOrderIds = (rawOrders.match(/"id":(\d+)/g) || []).map(m => m.replace('"id":', ''));
        
        for (let i = 0; i < rawCustomerIds.length; i++) {
          if (rawCustomerIds[i] === currentRawId) {
            const orderId = rawOrderIds[i];
            console.log(`  Updating order ${orderId} customer_id ${currentRawId} -> ${newId}`);
            const { error: oErr } = await supabase.from('orders').update({ customer_id: parseInt(newId) }).eq('id', parseInt(orderId));
            if (oErr) console.error('  Order update error:', oErr.message);
            else console.log('  Order updated OK');
          }
        }
      } else {
        console.log(`  Already using correct ID: ${newId}`);
      }
    } else {
      console.log(`  No DB user found for this auth user (old: ${oldId})`);
    }
  }


  console.log('\n=== Final state ===');
  console.log('Users:', await fetchRaw('/rest/v1/users?select=id,name,phone'));
  console.log('Orders:', await fetchRaw('/rest/v1/orders?select=id,customer_id'));
}

main().catch(console.error);
