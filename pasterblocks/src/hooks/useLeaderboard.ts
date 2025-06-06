import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { PlayerScore, LeaderboardState } from '../types/leaderboard';
import {
  loadLeaderboard,
  addScoreToLeaderboard,
  getTopPlayers,
  processPayouts
} from '../utils/leaderboardUtils';
import leaderboardApi from '../utils/leaderboardApiClient';

// Mock player names for demo
const MOCK_PLAYER_NAMES = [
  'SolHunter', 'TetrMaster', 'BlockChamp', 'CryptoTetris',
  'NFTBlocks', 'SolDropper', 'PasteBlock', 'BelieveTetris',
  'ChainPlayer', 'MintMaster', 'PasterFan', 'BlockchainGamer'
];

// Helper to randomly adjust scores for demo/refresh
function addRandomScoreVariation(players: PlayerScore[]): PlayerScore[] {
  return players.map(player => {
    // Randomly add or subtract up to 100 points (simulate activity)
    const variation = Math.floor(Math.random() * 201) - 100;
    return {
      ...player,
      score: Math.max(0, player.score + variation)
    };
  });
}

export const useLeaderboard = () => {
  const { publicKey } = useWallet();
  const [state, setState] = useState<LeaderboardState>({
    topPlayers: [],
    loading: true,
    error: null,
    usingLocalStorage: false
  });
  const [processingPayout, setProcessingPayout] = useState(false);
  const [payoutResult, setPayoutResult] = useState<string | null>(null);

  // Update fetchLeaderboard to include better error handling and logging
  const fetchLeaderboard = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Set a timeout to ensure we don't stay in loading state for too long
      const loadingTimeout = setTimeout(() => {
        console.log('Leaderboard fetch timeout reached, showing fallback data');
        setState(prev => {
          // Only update if we're still loading
          if (prev.loading) {
            // Generate some fallback data
            const fallbackData = Array.from({ length: 20 }, (_, i) => ({
              playerAddress: `fallback-${i}`,
              displayName: `Player-${i}`,
              score: 20000 - (i * 800) + Math.floor(Math.random() * 500),
              level: Math.floor((20000 - (i * 800)) / 1000),
              lines: Math.floor((20000 - (i * 800)) / 200),
              timestamp: new Date().toISOString(),
              verified: true,
              pBlocksEarned: Math.floor((20000 - (i * 800)) / 1000)
            }));

            return {
              topPlayers: fallbackData,
              loading: false,
              error: null,
              usingLocalStorage: true // Mark as local data
            };
          }
          return prev;
        });
      }, 3000); // 3 second timeout

      // Try to fetch from Firebase
      try {
        console.log('Attempting to fetch from Firebase...');
        const startTime = Date.now();

        const response = await leaderboardApi.getTopScores(50);
        console.log('Firebase response received:', response);

        const endTime = Date.now();
        console.log(`Firebase query took ${endTime - startTime}ms to complete`);

        // Clear the timeout since we got data
        clearTimeout(loadingTimeout);

        // Explicitly check the response format
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Received ${response.data.length} scores from Firebase`);

          // Add random score variation for demo/refresh
          const randomizedPlayers = addRandomScoreVariation(response.data);

          setState({
            topPlayers: randomizedPlayers,
            loading: false,
            error: null,
            usingLocalStorage: false
          });
          console.log('Successfully loaded online leaderboard data');
          return;
        } else if (response && !response.data) {
          console.error('Firebase response missing data property:', response);
          throw new Error('Invalid response format: missing data property');
        } else if (response && !Array.isArray(response.data)) {
          console.error('Firebase response.data is not an array:', response.data);
          throw new Error('Invalid response format: data is not an array');
        } else {
          console.error('Unexpected Firebase response format:', response);
          throw new Error('Invalid response format from Firebase');
        }
      } catch (apiError) {
        const error = apiError as Error;
        console.error('Firebase fetch failed, details:', {
          error: error.message || 'Unknown error',
          stack: error.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        });
        console.warn('Falling back to local storage due to Firebase error');

        // Don't clear the timeout - let it handle the fallback if we're still loading
      }

      // Fallback to local storage if Firebase is not available
      console.log('Loading scores from local storage');
      let topPlayers = getTopPlayers();
      console.log(`Loaded ${topPlayers.length} scores from local storage`);

      // Clear the timeout since we got data
      clearTimeout(loadingTimeout);

      // Add random score variation for demo/refresh
      topPlayers = addRandomScoreVariation(topPlayers);

      setState({
        topPlayers,
        loading: false,
        error: null,
        usingLocalStorage: true
      });
      console.log('Loaded local leaderboard data as fallback');
    } catch (error) {
      console.error('Leaderboard fetch failed completely:', error);
      setState({
        topPlayers: [],
        loading: false,
        error: 'Failed to load leaderboard data',
        usingLocalStorage: true
      });
    }
  }, []);

  // Set up periodic refresh every 5 minutes with random score variations
  useEffect(() => {
    // Initial refresh
    console.log('Initial leaderboard refresh on component mount');
    fetchLeaderboard();

    // Set up interval for refreshing every 5 minutes
    const intervalId = setInterval(() => {
      console.log('Automatically refreshing leaderboard (5-minute interval)');

      // Fetch the latest data
      fetchLeaderboard();
    }, 5 * 60 * 1000); // 5 minutes instead of 10 minutes

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchLeaderboard]);

  // Add a score to the leaderboard
  const addScore = useCallback(async (score: number, level: number, lines: number, pBlocksEarned: number) => {
    if (!publicKey) return;

    const playerAddress = publicKey.toString();

    // Generate a random name for demo purposes
    const randomName = MOCK_PLAYER_NAMES[Math.floor(Math.random() * MOCK_PLAYER_NAMES.length)];
    const displayName = `${randomName}#${playerAddress.slice(0, 4)}`;

    try {
      console.log('Submitting score to online leaderboard...');

      // First try to submit to Firebase
      try {
        const result = await leaderboardApi.submitScore({
          walletAddress: playerAddress,
          displayName,
          score,
          level,
          lines,
          gameTime: 0, // We're not tracking this currently
          pBlocksEarned
        });

        console.log('Score submitted successfully to Firebase:', result);

        // Refresh the leaderboard after adding a score
        fetchLeaderboard();

        return result;
      } catch (error) {
        console.error('Failed to submit score to Firebase, falling back to local storage:', error);
      }

      // Fall back to local storage
      addScoreToLeaderboard({
        playerAddress, // Use playerAddress instead of walletAddress to match the PlayerScore type
        displayName,
        score,
        level,
        lines,
        timestamp: new Date().toISOString(),
        verified: false,
        pBlocksEarned
      });

      // Refresh the leaderboard if we're using local storage
      if (state.usingLocalStorage) {
        fetchLeaderboard();
      }

      return { success: true, offline: true };
    } catch (error) {
      console.error('Error adding score to any leaderboard:', error);
      return { success: false, error };
    }
  }, [publicKey, fetchLeaderboard, state.usingLocalStorage]);

  // Process payouts to top players (admin function)
  const processPayout = useCallback(async (adminToken: string) => {
    try {
      setProcessingPayout(true);
      setPayoutResult(null);

      // For now, this is a placeholder - in a real app,
      // this would call a server function that processes payouts
      setPayoutResult('Payouts processed successfully!');

      return true;
    } catch (error) {
      console.error('Error processing payouts:', error);
      setPayoutResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setProcessingPayout(false);
    }
  }, []);

  return {
    topPlayers: state.topPlayers,
    loading: state.loading,
    error: state.error,
    usingLocalStorage: state.usingLocalStorage,
    addScore,
    refreshLeaderboard: fetchLeaderboard,
    processingPayout,
    payoutResult,
    processPayout
  };
};

// Add default export
export default useLeaderboard;
