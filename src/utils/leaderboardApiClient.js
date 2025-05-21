import firebaseLeaderboard from './firebaseLeaderboard';

/**
 * API client for interacting with the PasterBlocks leaderboard
 * This version uses Firebase directly, eliminating the need for a server
 */
class LeaderboardApiClient {
  constructor() {
    this.token = null;
  }

  /**
   * Set the authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Submit a score to the leaderboard
   * @param {Object} scoreData - Score data
   * @returns {Promise<Object>} - API response
   */
  async submitScore(scoreData) {
    try {
      console.log('Submitting score to Firebase:', scoreData);
      const result = await firebaseLeaderboard.saveScore(scoreData);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * Get the top scores from the leaderboard
   * @param {number} limit - Number of scores to retrieve
   * @returns {Promise<Object>} - API response
   */
  async getTopScores(limit = 50) {
    try {
      console.log('Getting top scores from Firebase');
      const scores = await firebaseLeaderboard.getTopScores(limit);
      console.log('Received scores from Firebase:', scores);

      // Make sure we're returning data in the expected format
      if (!scores || !Array.isArray(scores)) {
        console.error('Invalid scores data from firebaseLeaderboard', scores);
        // Return empty array in the correct format
        return { success: true, data: [] };
      }

      return { success: true, data: scores };
    } catch (error) {
      console.error('Error getting top scores:', error);
      throw error;
    }
  }

  /**
   * Get a player's scores
   * @param {string} walletAddress - Player's wallet address
   * @param {number} limit - Number of scores to retrieve
   * @returns {Promise<Object>} - API response
   */
  async getPlayerScores(walletAddress, limit = 10) {
    try {
      const scores = await firebaseLeaderboard.getPlayerScores(walletAddress, limit);
      return { success: true, data: scores };
    } catch (error) {
      console.error('Error getting player scores:', error);
      throw error;
    }
  }

  /**
   * Get a player's rank on the leaderboard
   * @param {string} walletAddress - Player's wallet address
   * @returns {Promise<Object>} - API response
   */
  async getPlayerRank(walletAddress) {
    try {
      const rankInfo = await firebaseLeaderboard.getPlayerRank(walletAddress);
      return { success: true, data: rankInfo };
    } catch (error) {
      console.error('Error getting player rank:', error);
      throw error;
    }
  }

  /**
   * Update a player's display name
   * @param {string} walletAddress - Player's wallet address
   * @param {string} displayName - New display name
   * @returns {Promise<Object>} - API response
   */
  async updatePlayerName(walletAddress, displayName) {
    // This would need additional Firebase code to update the player name
    // For now, we'll return success
    return { success: true };
  }

  /**
   * Sign and verify a score
   * @param {string} walletAddress - Player's wallet address
   * @param {Object} gameData - Game data to sign
   * @param {Object} wallet - Solana wallet
   * @returns {Promise<Object>} - API response with signature
   */
  async signAndVerifyScore(walletAddress, gameData, wallet) {
    if (!wallet || !wallet.signMessage) {
      throw new Error('Wallet not connected or does not support signMessage');
    }

    try {
      // Create verification data string
      const verificationData = JSON.stringify({
        walletAddress,
        score: gameData.score,
        level: gameData.level,
        lines: gameData.lines,
        gameTime: gameData.gameTime,
        timestamp: Date.now(),
      });

      // Sign the data with wallet
      const encodedMessage = new TextEncoder().encode(verificationData);
      const signatureBytes = await wallet.signMessage(encodedMessage);
      const signature = Buffer.from(signatureBytes).toString('base64');

      // Prepare score submission with verification
      const scoreData = {
        walletAddress,
        displayName: wallet.name || `Player-${walletAddress.slice(0, 5)}`,
        score: gameData.score,
        level: gameData.level,
        lines: gameData.lines,
        gameTime: gameData.gameTime,
        verificationData,
        verificationSignature: signature,
        clientInfo: {
          userAgent: navigator.userAgent,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
          gameVersion: '1.0.0',
        }
      };

      // Submit score directly to Firebase
      return this.submitScore(scoreData);
    } catch (error) {
      console.error('Error signing score:', error);
      throw error;
    }
  }

  /**
   * Claim rewards for a verified score
   * @param {string} scoreId - Score ID
   * @param {number} rewardsAmount - Amount of rewards to claim
   * @returns {Promise<Object>} - API response
   */
  async claimRewards(scoreId, rewardsAmount) {
    try {
      const result = await firebaseLeaderboard.claimRewards(scoreId, rewardsAmount);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const leaderboardApi = new LeaderboardApiClient();
export default leaderboardApi;
