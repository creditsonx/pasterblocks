import { pool, query } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Debug Netlify function to test database connection and configuration
 */
export const handler = async (event, context) => {
  // Only allow this endpoint with the correct admin token
  const token = event.queryStringParameters?.token;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!token || token !== adminToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized access' })
    };
  }

  try {
    const results = {
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_URL_LENGTH: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 12) + '...' : 'not set',
        ADMIN_TOKEN_SET: !!process.env.ADMIN_TOKEN,
      },
      connection: {
        status: 'pending'
      },
      poolInfo: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      },
      tables: {}
    };

    // Test database connection
    try {
      // Simple query to test connection
      const connectionTest = await query('SELECT NOW() as time');
      results.connection = {
        status: 'connected',
        serverTime: connectionTest.rows[0].time,
        message: 'Database connection successful'
      };

      // Check if tables exist
      const tablesQuery = await query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        AND table_type='BASE TABLE'
      `);

      results.tables.list = tablesQuery.rows.map(row => row.table_name);

      // Count rows in each table
      for (const table of results.tables.list) {
        const countQuery = await query(`SELECT COUNT(*) as count FROM ${table}`);
        results.tables[table] = {
          count: parseInt(countQuery.rows[0].count)
        };
      }

      // Get sample data from players and scores (if they exist)
      if (results.tables.list.includes('players')) {
        const playersQuery = await query('SELECT * FROM players LIMIT 5');
        results.tables.playersSample = playersQuery.rows;
      }

      if (results.tables.list.includes('scores')) {
        const scoresQuery = await query('SELECT * FROM scores LIMIT 5');
        results.tables.scoresSample = scoresQuery.rows;
      }

    } catch (dbError) {
      results.connection = {
        status: 'error',
        message: dbError.message,
        error: dbError.toString()
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(results, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An error occurred running diagnostics',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
