import { query } from './database.js';
import { verifySignature, analyzeGameData } from './solana-utils.js';

// Helper function to respond
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

// Main handler for leaderboard API
export const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  const path = event.path.replace(/\/api\/|\/\.netlify\/functions\/leaderboard\/?/g, '');
  const segments = path.split('/').filter(segment => segment);

  try {
    // Route: GET /leaderboard
    if (event.httpMethod === 'GET' && segments.length === 0) {
      const limit = event.queryStringParameters?.limit || 50;
      const result = await query(
        `SELECT s.id, s.wallet_address, p.display_name, s.score, s.level, s.lines,
                s.timestamp, s.verified, s.rewards_claimed, s.rewards_amount
         FROM scores s
         JOIN players p ON s.wallet_address = p.wallet_address
         ORDER BY s.score DESC
         LIMIT $1`,
        [limit]
      );
      return response(200, { data: result.rows });
    }

    // Route: POST /scores (submit new score)
    if (event.httpMethod === 'POST' && segments[0] === 'scores') {
      const scoreData = JSON.parse(event.body);
      const {
        walletAddress,
        displayName,
        score,
        level,
        lines,
        gameTime,
        verificationData,
        verificationSignature,
        clientInfo
      } = scoreData;

      // Validate required fields
      if (!walletAddress || !score || !level || !lines || !gameTime) {
        return response(400, { error: 'Missing required fields' });
      }

      // Check if player exists, if not create
      const playerExists = await query(
        'SELECT wallet_address FROM players WHERE wallet_address = $1',
        [walletAddress]
      );

      if (playerExists.rowCount === 0) {
        await query(
          'INSERT INTO players (wallet_address, display_name) VALUES ($1, $2)',
          [walletAddress, displayName || `Player-${walletAddress.slice(0, 5)}`]
        );
      } else if (displayName) {
        // Update display name if provided
        await query(
          'UPDATE players SET display_name = $1 WHERE wallet_address = $2',
          [displayName, walletAddress]
        );
      }

      // Check verification if provided
      let verified = false;
      let analysis = { isSuspicious: false, suspiciousFlags: [] };

      if (verificationData && verificationSignature) {
        const parsedData = JSON.parse(verificationData);
        verified = await verifySignature(
          walletAddress,
          parsedData,
          verificationSignature
        );

        // Run anti-cheat analysis
        analysis = analyzeGameData(parsedData);
      }

      // Get previous best score
      const prevBest = await query(
        'SELECT score FROM scores WHERE wallet_address = $1 ORDER BY score DESC LIMIT 1',
        [walletAddress]
      );

      // Only insert if it's better than previous score
      if (prevBest.rowCount === 0 || score > prevBest.rows[0].score) {
        // Insert the new score with anti-cheat data
        const result = await query(
          `INSERT INTO scores (
            wallet_address, score, level, lines, game_time, verified,
            verification_signature, verification_data, client_info
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [
            walletAddress, score, level, lines, gameTime, verified,
            verificationSignature, verificationData, JSON.stringify({
              ...clientInfo || {},
              anti_cheat: {
                analysis_result: analysis.isSuspicious ? 'suspicious' : 'normal',
                flags: analysis.suspiciousFlags,
                metrics: analysis.scoreMetrics
              }
            })
          ]
        );

        return response(201, {
          message: 'Score submitted successfully',
          scoreId: result.rows[0].id,
          verified,
          suspicious: analysis.isSuspicious,
          analysis: {
            suspiciousFlags: analysis.suspiciousFlags,
            metrics: analysis.scoreMetrics
          }
        });
      } else {
        return response(200, {
          message: 'Score not high enough to be recorded',
          previousBest: prevBest.rows[0].score
        });
      }
    }

    // Route: GET /players/:walletAddress/scores
    if (event.httpMethod === 'GET' && segments[0] === 'players' && segments[2] === 'scores') {
      const walletAddress = segments[1];
      const limit = event.queryStringParameters?.limit || 10;

      const result = await query(
        `SELECT id, score, level, lines, game_time, timestamp, verified, rewards_claimed, rewards_amount
         FROM scores
         WHERE wallet_address = $1
         ORDER BY score DESC
         LIMIT $2`,
        [walletAddress, limit]
      );

      return response(200, { data: result.rows });
    }

    // Route: GET /players/:walletAddress/rank
    if (event.httpMethod === 'GET' && segments[0] === 'players' && segments[2] === 'rank') {
      const walletAddress = segments[1];

      // Get player's highest score
      const playerScore = await query(
        'SELECT score FROM scores WHERE wallet_address = $1 ORDER BY score DESC LIMIT 1',
        [walletAddress]
      );

      if (playerScore.rowCount === 0) {
        return response(404, { error: 'Player has no scores' });
      }

      // Count how many players have a higher score
      const rank = await query(
        `SELECT COUNT(*) + 1 as rank
         FROM (
           SELECT wallet_address, MAX(score) as max_score
           FROM scores
           GROUP BY wallet_address
         ) as max_scores
         WHERE max_score > $1`,
        [playerScore.rows[0].score]
      );

      return response(200, { data: { rank: parseInt(rank.rows[0].rank) } });
    }

    // Route: PUT /scores/:scoreId/claim (claim rewards)
    if (event.httpMethod === 'PUT' && segments[0] === 'scores' && segments[2] === 'claim') {
      const scoreId = segments[1];
      const { rewardsAmount } = JSON.parse(event.body);

      if (!rewardsAmount) {
        return response(400, { error: 'Missing rewards amount' });
      }

      // Update the score with claimed rewards
      await query(
        'UPDATE scores SET rewards_claimed = true, rewards_amount = $1 WHERE id = $2',
        [rewardsAmount, scoreId]
      );

      return response(200, { message: 'Rewards claimed successfully' });
    }

    // Route not found
    return response(404, { error: 'Endpoint not found' });

  } catch (error) {
    console.error('API error:', error);
    return response(500, { error: 'Internal server error' });
  }
};
