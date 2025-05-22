import { type PlayerScore, PAYOUT_SCHEDULE } from '../types/leaderboard';

// In a real application, this would interact with a database or blockchain
// For now, we'll use localStorage as a demo
const LEADERBOARD_STORAGE_KEY = 'pblocks_leaderboard';

// Load leaderboard data from localStorage
export const loadLeaderboard = (): PlayerScore[] => {
  try {
    const data = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
};

// Save leaderboard data to localStorage
export const saveLeaderboard = (scores: PlayerScore[]): void => {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
  }
};

// Add a new score to the leaderboard
export const addScoreToLeaderboard = (newScore: PlayerScore): PlayerScore[] => {
  const currentScores = loadLeaderboard();

  // Check if player already has a score
  const existingScoreIndex = currentScores.findIndex(
    score => score.playerAddress === newScore.playerAddress
  );

  let updatedScores: PlayerScore[];

  if (existingScoreIndex >= 0) {
    // If player's new score is higher, update it
    if (currentScores[existingScoreIndex].score < newScore.score) {
      updatedScores = [
        ...currentScores.slice(0, existingScoreIndex),
        newScore,
        ...currentScores.slice(existingScoreIndex + 1)
      ];
    } else {
      // If not higher, don't update
      return currentScores;
    }
  } else {
    // Add new player score
    updatedScores = [...currentScores, newScore];
  }

  // Sort by score (descending)
  updatedScores.sort((a, b) => b.score - a.score);

  // Save updated leaderboard
  saveLeaderboard(updatedScores);

  return updatedScores;
};

// Get the top N players
export const getTopPlayers = (count = 50): PlayerScore[] => {
  const scores = loadLeaderboard();
  return scores.slice(0, count);
};

// Calculate payout amount based on rank
export const calculatePayout = (rank: number): number => {
  const payout = PAYOUT_SCHEDULE.find(p => p.rank === rank);
  return payout ? payout.amount : 0;
};

// Helper to get the reward tier for a given rank
export const getRewardTier = (rank: number): { tier: number, color: string } => {
  if (rank <= 3) {
    return { tier: 1, color: 'from-yellow-300 to-amber-500' };   // Gold tier (Ranks 1-3)
  }
  if (rank <= 7) {
    return { tier: 2, color: 'from-slate-300 to-gray-400' };     // Silver tier (Ranks 4-7)
  }
  if (rank <= 10) {
    return { tier: 3, color: 'from-amber-700 to-orange-800' };   // Bronze tier (Ranks 8-10)
  }
  if (rank <= 15) {
    return { tier: 4, color: 'from-violet-500 to-purple-700' };  // Purple tier (Ranks 11-15)
  }

  return { tier: 5, color: 'from-gray-600 to-gray-700' };        // Standard tier (Ranks 16+)
};

// Process payouts for top players
// In a real application, this would interact with a blockchain
export const processPayouts = async (): Promise<{ success: boolean, message: string }> => {
  try {
    const topPlayers = getTopPlayers();

    if (topPlayers.length === 0) {
      return { success: false, message: 'No players on the leaderboard yet' };
    }

    // Mark players as paid and record payout amounts
    const updatedPlayers = topPlayers.map((player, index) => {
      const rank = index + 1;
      const payoutAmount = calculatePayout(rank);
      return {
        ...player,
        paid: true,
        pBlocksEarned: player.pBlocksEarned + payoutAmount
      };
    });

    // For a demo, just update the leaderboard
    const allPlayers = loadLeaderboard();
    const updatedLeaderboard = allPlayers.map(player => {
      const updatedPlayer = updatedPlayers.find(p => p.playerAddress === player.playerAddress);
      return updatedPlayer || player;
    });

    saveLeaderboard(updatedLeaderboard);

    return {
      success: true,
      message: `Successfully processed payouts for ${Math.min(50, topPlayers.length)} players!`
    };
  } catch (error) {
    console.error('Failed to process payouts:', error);
    return { success: false, message: `Failed to process payouts: ${String(error)}` };
  }
};
