const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:vnishdnjhncj@db.xktrqbufinnkjgpggtsg.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database');

  try {
    const ordersRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log('--- orders columns ---');
    console.table(ordersRes.rows);

    const recurringRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'recurring_orders';
    `);
    console.log('--- recurring_orders columns ---');
    console.table(recurringRes.rows);

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
