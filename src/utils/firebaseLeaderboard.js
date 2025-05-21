import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Saves a player's score to the Firebase leaderboard
 * @param {Object} scoreData - Score and player data
 * @returns {Promise<Object>} - Promise with the result
 */
export const saveScore = async (scoreData) => {
  try {
    const { walletAddress, displayName, score, level, lines, gameTime, verificationData } = scoreData;

    // Create a unique key for this score
    const scoreListRef = ref(database, 'scores');
    const newScoreRef = push(scoreListRef);

    // Prepare the data to save
    const scoreToSave = {
      walletAddress,
      displayName,
      score,
      level,
      lines,
      gameTime,
      verified: true,  // We'll assume all scores are verified by default
      timestamp: Date.now(),
      rewards: {
        claimed: false,
        amount: 0
      }
    };

    // Add verification data if available
    if (verificationData) {
      scoreToSave.verificationData = verificationData;
    }

    // Save to Firebase
    await set(newScoreRef, scoreToSave);

    // Update or create player record
    const playerRef = ref(database, `players/${walletAddress}`);
    const playerSnap = await get(playerRef);

    if (playerSnap.exists()) {
      // Update existing player
      const playerData = playerSnap.val();
      const highScore = Math.max(score, playerData.highScore || 0);

      await set(playerRef, {
        ...playerData,
        displayName,
        highScore,
        lastActive: Date.now()
      });
    } else {
      // Create new player
      await set(playerRef, {
        displayName,
        highScore: score,
        created: Date.now(),
        lastActive: Date.now()
      });
    }

    return { success: true, scoreId: newScoreRef.key };
  } catch (error) {
    console.error('Error saving score to Firebase:', error);
    throw error;
  }
};

/**
 * Gets the top scores from Firebase
 * @param {number} limit - Number of scores to retrieve
 * @returns {Promise<Array>} - Promise with array of scores
 */
export const getTopScores = async (limit = 50) => {
  try {
    // Query scores, ordered by score (highest first), limited to 'limit'
    const scoresRef = ref(database, 'scores');
    const scoresQuery = query(
      scoresRef,
      orderByChild('score'),  // Order by score
      limitToLast(limit)      // Get only the highest 'limit' scores
    );

    const snapshot = await get(scoresQuery);

    // Convert Firebase snapshot to array
    const scores = [];
    snapshot.forEach((childSnapshot) => {
      scores.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    // Sort by score (highest first) since Firebase returns them in ascending order
    return scores.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting top scores from Firebase:', error);
    throw error;
  }
};

/**
 * Gets a player's scores
 * @param {string} walletAddress - Player's wallet address
 * @param {number} limit - Number of scores to retrieve
 * @returns {Promise<Array>} - Promise with array of scores
 */
export const getPlayerScores = async (walletAddress, limit = 10) => {
  try {
    // Get all scores first
    const scoresRef = ref(database, 'scores');
    const snapshot = await get(scoresRef);

    // Filter scores by wallet address
    const playerScores = [];
    snapshot.forEach((childSnapshot) => {
      const score = childSnapshot.val();
      if (score.walletAddress === walletAddress) {
        playerScores.push({
          id: childSnapshot.key,
          ...score
        });
      }
    });

    // Sort by score (highest first) and limit
    return playerScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting player scores from Firebase:', error);
    throw error;
  }
};

/**
 * Gets a player's rank on the leaderboard
 * @param {string} walletAddress - Player's wallet address
 * @returns {Promise<Object>} - Promise with rank info
 */
export const getPlayerRank = async (walletAddress) => {
  try {
    // Get all scores
    const scores = await getTopScores(1000); // Get a large number to ensure we find the player

    // Find the player's highest score
    const playerScores = scores.filter(score => score.walletAddress === walletAddress);

    if (playerScores.length === 0) {
      return { rank: -1, score: 0 }; // Player not found
    }

    // Get player's highest score
    const highestScore = playerScores.reduce(
      (max, score) => Math.max(max, score.score),
      0
    );

    // Find the rank
    const rank = scores.findIndex(score =>
      score.score === highestScore && score.walletAddress === walletAddress
    ) + 1; // +1 because arrays are 0-indexed

    return { rank, score: highestScore };
  } catch (error) {
    console.error('Error getting player rank from Firebase:', error);
    throw error;
  }
};

/**
 * Claim rewards for a score
 * @param {string} scoreId - Score ID
 * @param {number} rewardsAmount - Amount of rewards to claim
 * @returns {Promise<Object>} - Promise with result
 */
export const claimRewards = async (scoreId, rewardsAmount) => {
  try {
    const scoreRef = ref(database, `scores/${scoreId}`);
    const snapshot = await get(scoreRef);

    if (!snapshot.exists()) {
      throw new Error('Score not found');
    }

    const score = snapshot.val();

    // Update rewards info
    await set(ref(database, `scores/${scoreId}/rewards`), {
      claimed: true,
      amount: rewardsAmount,
      claimedAt: Date.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error claiming rewards in Firebase:', error);
    throw error;
  }
};

// Export all functions
export default {
  saveScore,
  getTopScores,
  getPlayerScores,
  getPlayerRank,
  claimRewards
};
