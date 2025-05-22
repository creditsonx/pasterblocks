import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Error: ADMIN_TOKEN environment variable is not set');
  process.exit(1);
}

async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Call the init-db function locally - adjust the URL as needed
    const response = await fetch('http://localhost:8888/.netlify/functions/init-db', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Database initialized successfully!');
      console.log(data);
    } else {
      console.error('❌ Error initializing database:', data.error);
    }
  } catch (error) {
    console.error('❌ Error calling init-db function:', error.message);
    console.log('  - Make sure your Netlify dev server is running (netlify dev)');
    console.log('  - Check that the function endpoint is correct');
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
