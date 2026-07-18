const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:vnishdnjhncj@db.xktrqbufinnkjgpggtsg.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database');

  try {
    const res = await client.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;');
    console.log('Column added successfully:', res);
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
