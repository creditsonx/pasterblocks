import { pool } from './database.js';

const createTablesSQL = `
-- Create players table
CREATE TABLE IF NOT EXISTS players (
  wallet_address VARCHAR(44) PRIMARY KEY,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) REFERENCES players(wallet_address),
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  game_time INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE,
  verification_signature TEXT,
  verification_data TEXT,
  client_info JSON,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  rewards_amount BIGINT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS scores_wallet_idx ON scores(wallet_address);
CREATE INDEX IF NOT EXISTS scores_score_idx ON scores(score DESC);
`;

export const handler = async (event, context) => {
  // Only allow POST requests with an authorization header
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get the authorization token from the request
  const authHeader = event.headers.authorization || '';
  const token = authHeader.split(' ')[1] || '';

  // Check the token (in a real app, use a secure method)
  if (token !== process.env.ADMIN_TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Initialize the database
    await pool.query(createTablesSQL);

    // Optionally insert some default data
    const defaultPlayer = {
      wallet_address: 'Gq8KbTRnspUxTJtMjuBNnUHaKFhfNtQANX8xwKMNt4qZ',
      display_name: 'PasterBlocks Admin'
    };

    await pool.query(
      'INSERT INTO players (wallet_address, display_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [defaultPlayer.wallet_address, defaultPlayer.display_name]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Database initialized successfully' })
    };
  } catch (error) {
    console.error('Error initializing database:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error initializing database', details: error.message })
    };
  }
};
