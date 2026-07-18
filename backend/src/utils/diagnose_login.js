require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Same function used in the backend
function uuidToBigInt(val) {
  if (!val) return val;
  // Check if it's already a bigint-safe string (numeric)
  if (/^\d+$/.test(String(val))) return String(val);
  // If it's a UUID string, convert hex to BigInt
  const hex = val.replace(/-/g, '');
  const n = BigInt('0x' + hex);
  return String(n);
}

async function main() {
  const phone = '+919876543210'; // Change to your test phone
  const password = 'test123456';  // Change to your test password

  console.log('\n1. Trying login...');
  const { data, error } = await supabase.auth.signInWithPassword({ phone, password });

  if (error) {
    console.error('   Login failed:', error.message);
    return;
  }

  const authUser = data.user;
  console.log('   Login OK. Auth user ID (UUID):', authUser.id);
  
  const bigIntId = uuidToBigInt(authUser.id);
  console.log('   Converted BigInt ID:', bigIntId);

  console.log('\n2. Checking if profile exists in users table...');
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', bigIntId)
    .maybeSingle();

  if (profileError) {
    console.error('   Profile fetch error:', profileError.message);
  } else if (!profile) {
    console.log('   No profile found. Attempting to insert...');
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: bigIntId,
        name: 'Test User',
        phone,
        password,
        role: 'customer',
        area: 'Test Area',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('   Insert failed:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('   Profile inserted successfully:', inserted);
    }
  } else {
    console.log('   Profile already exists:', profile);
  }

  console.log('\n3. Final profile fetch...');
  const { data: final } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', bigIntId)
    .maybeSingle();
  console.log('   Final profile:', final);
}

main().catch(console.error);
