import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log('Testing connection to Neon PostgreSQL database...');

  try {
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Connected to the database successfully!');

    // Test query to get PostgreSQL version
    const result = await client.query('SELECT version()');
    console.log(`PostgreSQL Version: ${result.rows[0].version}`);

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log('\nExisting tables:');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found. You need to initialize the database.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }

    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error('❌ Error connecting to the database:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
  } finally {
    // End the pool
    await pool.end();
  }
}

// Run the test
testConnection().catch(console.error);
