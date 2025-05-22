import firebaseLeaderboard from './firebaseLeaderboard';

// Generate a random Solana address
function generateRandomSolanaAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';

  // Solana addresses are 44 characters long
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return address;
}

// Generate placeholder data
function generatePlaceholderData(count = 50) {
  console.log(`Generating ${count} placeholder scores`);
  const placeholders = [];

  for (let i = 0; i < count; i++) {
    const walletAddress = generateRandomSolanaAddress();

    // Generate more realistic score distribution (high scores for top players with gradual decrease)
    // Top 15 players get higher scores
    let baseScore;
    if (i < 15) {
      // Top 15 players have higher scores (22000-30000)
      baseScore = 30000 - (i * 600);
    } else {
      // Everyone else has lower scores (5000-21500)
      baseScore = Math.max(21500 - ((i - 15) * 350), 5000);
    }

    // Add some randomness to make it look realistic
    const score = baseScore + Math.floor(Math.random() * (i < 5 ? 200 : 800));

    placeholders.push({
      id: `placeholder-${i}`,
      playerAddress: walletAddress,
      walletAddress,
      // No display name - we'll just use wallet addresses
      displayName: '',
      score,
      level: Math.floor(score / 1000),
      lines: Math.floor(score / 200),
      timestamp: Date.now() - (i * 3600000), // Staggered timestamps
      verified: true,
      pBlocksEarned: Math.floor(score / 3000) // Scale reward points
    });
  }

  return placeholders;
}

// Store existing data in memory for consistency
const placeholderScores = generatePlaceholderData(100);

// Random update frequency between 5-10 minutes (in milliseconds)
const UPDATE_INTERVAL = Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000;

// Periodically update scores with small variations
setInterval(() => {
  console.log(`Updating scores with variations (${Math.floor(UPDATE_INTERVAL/60000)}-minute interval)`);

  // Update each score with a small random variation
  placeholderScores.forEach(score => {
    // Small change for top 15 (±100), larger for others (±300)
    const variation = score.score > 22000
      ? Math.floor(Math.random() * 201) - 100
      : Math.floor(Math.random() * 601) - 300;

    // Update the score
    score.score = Math.max(1000, score.score + variation);

    // Update level, lines and pBlocksEarned based on new score
    score.level = Math.floor(score.score / 1000);
    score.lines = Math.floor(score.score / 200);
    score.pBlocksEarned = Math.floor(score.score / 3000);

    // Update timestamp
    score.timestamp = Date.now() - Math.floor(Math.random() * 86400000); // Random time in last 24h
  });

  // Re-sort the scores
  placeholderScores.sort((a, b) => b.score - a.score);

}, UPDATE_INTERVAL);

// Leaderboard API client
const leaderboardApiClient = {
  /**
   * Submit a score to the leaderboard
   * @param {Object} scoreData - Score data
   * @returns {Promise<Object>} - Response
   */
  async submitScore(scoreData) {
    console.log('Submitting score (placeholder):', scoreData);

    // Get a random score ID
    const scoreId = `score-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      success: true,
      data: {
        id: scoreId,
        ...scoreData
      }
    };
  },

  /**
   * Get the top scores from the leaderboard
   * @param {number} limit - Number of scores to return
   * @returns {Promise<Object>} - Response with scores data
   */
  async getTopScores(limit = 15) { // Default to 15 instead of 50
    console.log(`Getting top ${limit} scores (placeholder)`);

    // Create a copy to avoid modifying the original
    const scores = [...placeholderScores]
      // Add a small random variation
      .map(score => ({
        ...score,
        score: score.score + (Math.floor(Math.random() * 101) - 50) // Smaller variations
      }))
      // Sort by score
      .sort((a, b) => b.score - a.score)
      // Take only the requested number
      .slice(0, limit);

    return {
      success: true,
      data: scores
    };
  },

  /**
   * Get a player's scores
   * @param {string} walletAddress - Player's wallet address
   * @param {number} limit - Number of scores to return
   * @returns {Promise<Object>} - Response with player scores
   */
  async getPlayerScores(walletAddress, limit = 10) {
    console.log(`Getting player scores for ${walletAddress} (placeholder)`);

    // Generate some random scores for this player
    const playerScores = Array.from({ length: limit }, (_, i) => ({
      id: `player-score-${i}`,
      playerAddress: walletAddress,
      walletAddress,
      displayName: '', // No display name
      score: 15000 - (i * 1000) + Math.floor(Math.random() * 500),
      level: Math.floor((15000 - (i * 1000)) / 1000),
      lines: Math.floor((15000 - (i * 1000)) / 200),
      timestamp: Date.now() - (i * 3600000),
      verified: true,
      pBlocksEarned: Math.floor((15000 - (i * 1000)) / 3000)
    }));

    return {
      success: true,
      data: playerScores
    };
  },

  /**
   * Get a player's rank on the leaderboard
   * @param {string} walletAddress - Player's wallet address
   * @returns {Promise<Object>} - Response with rank info
   */
  async getPlayerRank(walletAddress) {
    console.log(`Getting player rank for ${walletAddress} (placeholder)`);

    // Assign a random rank between 1-100
    const rank = Math.floor(Math.random() * 100) + 1;
    const score = rank <= 15
      ? 30000 - (rank * 500) + Math.floor(Math.random() * 200)
      : 20000 - (rank * 150) + Math.floor(Math.random() * 300);

    return {
      success: true,
      data: {
        walletAddress,
        rank,
        score
      }
    };
  },

  /**
   * Claim rewards for a score
   * @param {string} scoreId - Score ID
   * @param {number} rewardsAmount - Amount of rewards
   * @returns {Promise<Object>} - Response
   */
  async claimRewards(scoreId, rewardsAmount) {
    console.log(`Claiming rewards for score ${scoreId} (placeholder)`);
    return {
      success: true,
      data: {
        scoreId,
        rewardsAmount,
        claimed: true,
        claimedAt: Date.now()
      }
    };
  }
};

// Export the API client
export default leaderboardApiClient;

// Export individual functions for direct use
export const submitScore = leaderboardApiClient.submitScore;
export const getTopScores = leaderboardApiClient.getTopScores;
export const getPlayerScores = leaderboardApiClient.getPlayerScores;
export const getPlayerRank = leaderboardApiClient.getPlayerRank;
export const claimRewards = leaderboardApiClient.claimRewards;
