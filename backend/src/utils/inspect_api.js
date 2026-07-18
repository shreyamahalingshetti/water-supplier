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
    
    if (data.definitions && data.definitions.users) {
      console.log('\n--- users properties ---');
      console.log(JSON.stringify(data.definitions.users.properties, null, 2));
    }

  } catch (err) {
    console.error('Error fetching API spec:', err);
  }
}

main();

