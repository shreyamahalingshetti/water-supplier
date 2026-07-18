require('dotenv').config();

async function main() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/`;
  console.log('Fetching API specification from:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    const data = await res.json();
    console.log('Definitions found:', Object.keys(data.definitions || {}));
    
    if (data.definitions && data.definitions.orders) {
      console.log('\n--- orders properties ---');
      console.log(data.definitions.orders.properties);
    }

    if (data.definitions && data.definitions.recurring_orders) {
      console.log('\n--- recurring_orders properties ---');
      console.log(data.definitions.recurring_orders.properties);
    }
  } catch (err) {
    console.error('Error fetching API spec:', err);
  }
}

main();
