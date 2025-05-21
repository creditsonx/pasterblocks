import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';
import firebaseConfig from './firebaseConfig';

// Function to generate a random Solana address
function generateRandomSolanaAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';

  // Solana addresses are 44 characters long
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return address;
}

// Generate 100 random Solana addresses
const SOLANA_ADDRESSES = Array.from({ length: 100 }, () => generateRandomSolanaAddress());

// Additional player names for more variety
const EXPANDED_PLAYER_NAMES = [
  'SolanaWhale', 'TetraMaster', 'CryptoGamer', 'BlockDropper', 'PBKing',
  'Bloxfinity', 'SolTetra', 'PasterChamp', 'BlockMaster', 'TetrisLegend',
  'SolStacker', 'ChainGamer', 'CubeStacker', 'BlockBuilder', 'PBCollector',
  'TokenMaster', 'GamersDelight', 'SpaceDropper', 'SolanaKing', 'PBWarrior',
  'ChainChamp', 'CryptoBuilder', 'BlockSolver', 'TetraCoder', 'SolBeast',
  'LineBreaker', 'PBHunter', 'GridMaster', 'PixelKing', 'TetrisWizard',
  'CryptoCaptain', 'SolBlocks', 'PBLegend', 'TetraPro', 'SolanaPlayer',
  'BlockWhiz', 'ChainBuilder', 'PBChamp', 'TetrisKing', 'SolWarrior',
];

// Initialize Firebase
console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL
});

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('Firebase initialized successfully');

// Update placeholder data function to create 100 entries
const initializePlaceholderData = async () => {
  try {
    console.log('Checking if placeholder data needs to be initialized...');
    const scoresRef = ref(database, 'scores');
    const snapshot = await get(scoresRef);

    if (!snapshot.exists() || snapshot.size === 0) {
      console.log('No existing scores found, adding placeholder data for 100 players');

      // Create placeholder scores using generated Solana addresses
      for (let i = 0; i < SOLANA_ADDRESSES.length; i++) {
        const walletAddress = SOLANA_ADDRESSES[i];
        const displayName = EXPANDED_PLAYER_NAMES[i % EXPANDED_PLAYER_NAMES.length];

        // Generate a score with better distribution
        // Top players have higher scores, with gradual decrease
        const baseScore = Math.max(25000 - (i * 220), 2000);
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
          timestamp: Date.now() - (i * 2000), // Stagger timestamps more closely
          rewards: {
            claimed: false,
            amount: 0
          }
        });
      }

      console.log('Placeholder data added successfully for 100 players');
    } else {
      console.log('Database already has scores, updating with random variations');

      // Update existing scores with random variations
      try {
        updateScoresWithRandomVariations();
      } catch (updateError) {
        console.error('Error updating existing scores:', updateError);
      }
    }
  } catch (error) {
    console.error('Error initializing placeholder data:', error);
  }
};

// Function to update existing scores with random variations
const updateScoresWithRandomVariations = async () => {
  try {
    console.log('Updating existing scores with random variations...');
    const scoresRef = ref(database, 'scores');
    const snapshot = await get(scoresRef);

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const score = childSnapshot.val();
        const scoreRef = ref(database, `scores/${childSnapshot.key}`);

        // Add random variation to score (up to ±500 points)
        const variation = Math.floor(Math.random() * 1001) - 500;
        const newScore = Math.max(1000, score.score + variation);

        // Update the score
        set(scoreRef, {
          ...score,
          score: newScore,
          timestamp: Date.now() // Update timestamp
        });
      });

      console.log('Scores updated successfully with random variations');
    }
  } catch (error) {
    console.error('Error updating scores with random variations:', error);
  }
};

// Initialize placeholder data
initializePlaceholderData();

// Set up periodic updates every 5 minutes
setInterval(() => {
  console.log('Running periodic score updates (5-minute interval)');
  updateScoresWithRandomVariations();
}, 5 * 60 * 1000);

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
