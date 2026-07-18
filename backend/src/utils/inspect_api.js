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
    
    if (data.definitions && data.definitions.disruptions) {
      console.log('\n--- disruptions properties ---');
      console.log(data.definitions.disruptions.properties);
    }
  } catch (err) {
    console.error('Error fetching API spec:', err);
  }
}

main();

