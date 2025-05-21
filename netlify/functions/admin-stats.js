import { query } from './database.js';

// Helper function to respond
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

export const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  // Get the authorization token from the request
  const authHeader = event.headers.authorization || '';
  const token = authHeader.split(' ')[1] || '';

  // Check the token (in a real app, use a secure method)
  if (token !== process.env.ADMIN_TOKEN) {
    return response(401, { error: 'Unauthorized' });
  }

  try {
    // Get suspicious scores
    const suspiciousScores = await query(
      `SELECT s.id, s.wallet_address, p.display_name, s.score, s.level, s.lines,
              s.game_time, s.timestamp, s.verified, s.client_info->>'anti_cheat' as anti_cheat
       FROM scores s
       JOIN players p ON s.wallet_address = p.wallet_address
       WHERE s.client_info->>'anti_cheat'->>'analysis_result' = 'suspicious'
       ORDER BY s.score DESC
       LIMIT 50`
    );

    // Get general stats
    const stats = await query(`
      SELECT
        COUNT(DISTINCT wallet_address) as total_players,
        COUNT(*) as total_scores,
        MAX(score) as highest_score,
        AVG(score) as average_score,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_scores,
        COUNT(CASE WHEN rewards_claimed = true THEN 1 END) as rewards_claimed
      FROM scores
    `);

    // Get top 10 player scores
    const topScores = await query(
      `SELECT s.id, s.wallet_address, p.display_name, s.score, s.level, s.lines,
              s.game_time, s.timestamp, s.verified, s.rewards_claimed
       FROM scores s
       JOIN players p ON s.wallet_address = p.wallet_address
       ORDER BY s.score DESC
       LIMIT 10`
    );

    return response(200, {
      suspiciousScores: suspiciousScores.rows,
      stats: stats.rows[0],
      topScores: topScores.rows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return response(500, { error: 'Internal server error' });
  }
};
