import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';
import firebaseConfig from './firebaseConfig';

// Sample Solana addresses for placeholders
const SOLANA_ADDRESSES = [
  'FjPHBQZvN7SJ3iP3BKiYVdyXCqo2dqYNAX6jryC44v8r',
  'CUNrRfUaSzxj6yAcVw3GZyVnR4o4qJxprKWjbucpHvKc',
  'DkzFBCj5N6sAV4fDk3UNJHHM8SPcHLZpxGkENJ4Y1bAF',
  'GXkMwheVGxHsAJXZ1mPEXUKg8i81GQFa81jT9ktTvjft',
  'E5J7xdEVZxzGDPCh8rxAFGqi6ANC8sY1K8KpphqXnxnr',
  '2XGHgAGK9JVTGa3tXSZAK3ao35mEBL1awipKnDKrLQS5',
  'FNDGe7HUWj6uGPHgZmupMWAy3H6KWXUD13BzWcKgRgtJ',
  'AK5Ah3MxYXWfMXkhbfSQGU8ntKKvuW1jvhfHgnqhSJp4',
  'GYvtxJecPbBYbwGdvZNR4ZMEYXvG3cd7uGhysRKzxsM5',
  'HdMRfJLsTYuZgdXvnGphshCbP3U9Fsj9aoKUiSsbxpwL',
  'BxLZRCvQCG7iAjCnbKp5xvGR9ZtWqnKcTvQUDFfnUhS5',
  '9ipzm9Cj2QHLDVMNSkRfLQJd7VCWiqeqpNLB97VpCcCB',
  '6Df9JWpXz8a7hqG5kxNSPESjq9dMgHkgkZMqx17S78DG',
  'Gu5sojJKQunPt7ete6HjhqhQUQyXFuunL54VC8JPtmGf',
  'GGe2UMCj7N9mMbobUyFqjfLCtJiuKDEpvhkRkBgsDTw1'
];

// Sample display names
const PLAYER_NAMES = [
  'SolanaWhale',
  'TetraMaster',
  'CryptoGamer',
  'BlockDropper',
  'PBKing',
  'Bloxfinity',
  'SolTetra',
  'PasterChamp',
  'BlockMaster',
  'TetrisLegend',
  'SolStacker',
  'ChainGamer',
  'CubeStacker',
  'BlockBuilder',
  'PBCollector'
];

// Initialize Firebase
console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL
});

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('Firebase initialized successfully');

// Add placeholder data if the database is empty
const initializePlaceholderData = async () => {
  try {
    console.log('Checking if placeholder data needs to be initialized...');
    const scoresRef = ref(database, 'scores');
    const snapshot = await get(scoresRef);

    if (!snapshot.exists() || snapshot.size === 0) {
      console.log('No existing scores found, adding placeholder data');

      // Create placeholder scores using Solana addresses
      for (let i = 0; i < SOLANA_ADDRESSES.length; i++) {
        const walletAddress = SOLANA_ADDRESSES[i];
        const displayName = PLAYER_NAMES[i % PLAYER_NAMES.length];

        // Generate a score inverse to index (higher index = lower score)
        // This gives us a nice distribution of scores
        const baseScore = 30000 - (i * 1500);
        // Add some randomness
        const score = baseScore + Math.floor(Math.random() * 1000);

        const level = Math.floor(score / 1000); // Roughly level based on score
        const lines = level * 5 + Math.floor(Math.random() * 10);

        const newScoreRef = push(scoresRef);
        await set(newScoreRef, {
          walletAddress,
          displayName,
          score,
          level,
          lines,
          verified: true,
          timestamp: Date.now() - (i * 3600000), // Stagger timestamps
          rewards: {
            claimed: false,
            amount: 0
          }
        });
      }

      console.log('Placeholder data added successfully');
    } else {
      console.log('Database already has scores, skipping placeholder data');
    }
  } catch (error) {
    console.error('Error initializing placeholder data:', error);
  }
};

// Initialize placeholder data
initializePlaceholderData();

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
