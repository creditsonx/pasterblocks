import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL
});

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('Firebase initialized successfully');

// Add some test data if the database is empty
const initializeTestData = async () => {
  try {
    console.log('Checking if test data needs to be initialized...');
    const scoresRef = ref(database, 'scores');
    const snapshot = await get(scoresRef);

    if (!snapshot.exists() || snapshot.size === 0) {
      console.log('No existing scores found, adding test data');

      // Add some test scores
      const testScores = [
        {
          walletAddress: 'test1',
          displayName: 'TestPlayer1',
          score: 10000,
          level: 10,
          lines: 50,
          verified: true,
          timestamp: Date.now() - 1000000
        },
        {
          walletAddress: 'test2',
          displayName: 'TestPlayer2',
          score: 8500,
          level: 8,
          lines: 40,
          verified: true,
          timestamp: Date.now() - 900000
        },
        {
          walletAddress: 'test3',
          displayName: 'TestPlayer3',
          score: 7200,
          level: 7,
          lines: 35,
          verified: true,
          timestamp: Date.now() - 800000
        }
      ];

      for (const score of testScores) {
        const newScoreRef = push(scoresRef);
        await set(newScoreRef, score);
      }

      console.log('Test data added successfully');
    } else {
      console.log('Database already has scores, skipping test data');
    }
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
};

// Initialize test data
initializeTestData();

/**
 * Saves a player's score to the Firebase leaderboard
 * @param {Object} scoreData - Score and player data
 * @returns {Promise<Object>} - Promise with the result
 */
export const saveScore = async (scoreData) => {
  try {
    console.log('Saving score to Firebase:', scoreData);
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
    console.log('Score saved successfully with key:', newScoreRef.key);

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
      console.log('Updated existing player record');
    } else {
      // Create new player
      await set(playerRef, {
        displayName,
        highScore: score,
        created: Date.now(),
        lastActive: Date.now()
      });
      console.log('Created new player record');
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
    console.log(`Getting top ${limit} scores from Firebase`);

    // Query scores, ordered by score (highest first), limited to 'limit'
    const scoresRef = ref(database, 'scores');
    const scoresQuery = query(
      scoresRef,
      orderByChild('score'),  // Order by score
      limitToLast(limit)      // Get only the highest 'limit' scores
    );

    console.log('Executing Firebase query...');
    const snapshot = await get(scoresQuery);
    console.log('Firebase query completed, data received:', snapshot.exists(), snapshot.size);

    // Convert Firebase snapshot to array
    const scores = [];
    snapshot.forEach((childSnapshot) => {
      scores.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    console.log(`Processed ${scores.length} scores from Firebase`);

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
    console.log(`Getting scores for player ${walletAddress}`);
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

    console.log(`Found ${playerScores.length} scores for player ${walletAddress}`);

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
    console.log(`Getting rank for player ${walletAddress}`);
    // Get all scores
    const scores = await getTopScores(1000); // Get a large number to ensure we find the player

    // Find the player's highest score
    const playerScores = scores.filter(score => score.walletAddress === walletAddress);

    if (playerScores.length === 0) {
      console.log(`No scores found for player ${walletAddress}`);
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

    console.log(`Player ${walletAddress} rank: ${rank}, score: ${highestScore}`);

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
    console.log(`Claiming ${rewardsAmount} rewards for score ${scoreId}`);
    const scoreRef = ref(database, `scores/${scoreId}`);
    const snapshot = await get(scoreRef);

    if (!snapshot.exists()) {
      console.log(`Score ${scoreId} not found`);
      throw new Error('Score not found');
    }

    const score = snapshot.val();

    // Update rewards info
    await set(ref(database, `scores/${scoreId}/rewards`), {
      claimed: true,
      amount: rewardsAmount,
      claimedAt: Date.now()
    });

    console.log(`Rewards claimed successfully for score ${scoreId}`);

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
