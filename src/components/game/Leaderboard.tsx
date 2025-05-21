import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useLeaderboard from '../../hooks/useLeaderboard';
import { calculatePayout, getRewardTier } from '../../utils/leaderboardUtils';
import Button from '../ui/Button';
import type { PlayerScore } from '../../types/leaderboard';

const Leaderboard = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [forceShowPlaceholderData, setForceShowPlaceholderData] = useState(false);
  const { publicKey } = useWallet();
  const {
    topPlayers,
    loading,
    error,
    usingLocalStorage,
    processingPayout,
    payoutResult,
    processPayout,
    refreshLeaderboard,
  } = useLeaderboard();

  // Number of players per page (now show 15 per page)
  const pageSize = 15;

  // If leaderboard is loading for more than 5 seconds, show placeholder data
  useEffect(() => {
    if (loading && !forceShowPlaceholderData) {
      console.log('Leaderboard is loading, setting timeout to show placeholders after 5 seconds');

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a new timeout
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Loading timeout reached, forcing placeholder data display');
        setForceShowPlaceholderData(true);
        // Also trigger a refresh attempt
        refreshLeaderboard();
      }, 5000); // 5 seconds timeout
    } else if (!loading) {
      // Clear timeout if not loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // Reset force flag if we successfully loaded
      if (forceShowPlaceholderData && topPlayers.length > 0) {
        setForceShowPlaceholderData(false);
      }
    }

    return () => {
      // Clean up timeout on unmount
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading, forceShowPlaceholderData, topPlayers.length, refreshLeaderboard]);

  // Reset to page 0 when leaderboard changes
  useEffect(() => {
    setCurrentPage(0);
  }, [topPlayers.length]);

  // Set up periodic refresh every 5-10 minutes randomly
  useEffect(() => {
    // Initial refresh
    console.log('Initial leaderboard component refresh');
    refreshLeaderboard();

    // Random refresh interval between 5-10 minutes
    const minutes = Math.floor(Math.random() * 6) + 5; // 5-10 minutes
    const milliseconds = minutes * 60 * 1000;

    console.log(`Setting up leaderboard refresh every ${minutes} minutes`);

    const intervalId = setInterval(() => {
      console.log(`Leaderboard component automatically refreshing (${minutes}-minute interval)`);
      refreshLeaderboard();
    }, milliseconds);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshLeaderboard]);

  // Navigate pages
  const goToNextPage = useCallback(() => {
    setCurrentPage(current => Math.min(current + 1, Math.max(1, Math.ceil(displayPlayers.length / pageSize)) - 1));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(current => Math.max(current - 1, 0));
  }, []);

  // Check if the user has a score
  const hasScoreOnBoard = useCallback(() => {
    if (!publicKey || !topPlayers.length) return false;
    return topPlayers.some((player: PlayerScore) => player.playerAddress === publicKey.toString());
  }, [publicKey, topPlayers]);

  const handleProcessPayouts = useCallback(async () => {
    if (!adminToken) return;
    const success = await processPayout(adminToken);
    setShowPayoutModal(false);
  }, [adminToken, processPayout]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | number | Date) => {
    if (!timestamp) return 'Unknown';

    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? 'Invalid date'
      : date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format Solana address for display
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    if (address.length < 10) return address;

    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Generate placeholder data if needed
  const generatePlaceholderData = useCallback(() => {
    console.log('Generating placeholder leaderboard data');
    const placeholders: PlayerScore[] = [];

    for (let i = 0; i < 20; i++) {
      // Generate a random Solana-like address
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let address = '';
      for (let j = 0; j < 44; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Generate score (higher for top players)
      const baseScore = 20000 - (i * 800);
      const score = baseScore + Math.floor(Math.random() * 500);

      placeholders.push({
        playerAddress: address,
        walletAddress: address,
        displayName: '', // No display name, use address
        score,
        level: Math.floor(score / 1000),
        lines: Math.floor(score / 200),
        timestamp: new Date().toISOString(),
        verified: true,
        pasterBlocksEarned: Math.floor(score / 3000) // Scaled for max 10k rewards
      });
    }

    return placeholders;
  }, []);

  // Determine what to show
  const displayPlayers: PlayerScore[] = (loading && forceShowPlaceholderData)
    ? generatePlaceholderData()
    : topPlayers;

  const totalPages = Math.max(1, Math.ceil(displayPlayers.length / pageSize));
  const visiblePlayers = displayPlayers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="bg-gray-900 border border-violet-500 p-4 rounded-lg text-white shadow-lg w-full max-h-[600px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Leaderboard</h3>
        <div className="flex items-center space-x-1">
          <span className={`w-2 h-2 rounded-full ${usingLocalStorage ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
          <span className="text-xs text-gray-400">
            {usingLocalStorage ? 'Using Local Data' : 'Online Leaderboard'}
          </span>
        </div>
      </div>

      {loading && !forceShowPlaceholderData ? (
        <div className="py-4 text-center text-gray-400">Loading leaderboard...</div>
      ) : error && displayPlayers.length === 0 ? (
        <div className="py-4 text-center text-red-400">{error}</div>
      ) : displayPlayers.length === 0 ? (
        <div className="py-4 text-center text-gray-400">No scores yet. Be the first!</div>
      ) : (
        <div className="mt-2 space-y-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-purple-300 font-semibold flex items-center">
              <span className="bg-violet-500/30 py-1 px-3 rounded-full text-white">Top 15</span>
              {forceShowPlaceholderData && loading ? (
                <span className="ml-2 text-xs text-gray-400">(Preview Data)</span>
              ) : null}
            </div>
            {totalPages > 1 && (
              <div className="text-xs text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </div>
            )}
          </div>

          {/* Header row */}
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-400 py-2 border-b border-gray-800">
            <div className="col-span-1 pl-2">#</div>
            <div className="col-span-6">Wallet</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-3 text-right pr-2">$PB Reward</div>
          </div>

          {/* Player rows */}
          <div className="space-y-2.5">
            {visiblePlayers.map((player: PlayerScore, index: number) => {
              const rank = currentPage * pageSize + index + 1;

              // Always use wallet address, not display name
              const displayText = formatAddress(player.walletAddress || player.playerAddress);

              return (
                <div
                  key={`${player.playerAddress || player.walletAddress}-${rank}`}
                  className={`grid grid-cols-12 items-center text-sm px-2 py-3 rounded-md ${
                    publicKey && (player.playerAddress === publicKey.toString() || player.walletAddress === publicKey.toString())
                      ? 'bg-violet-900/30 border border-violet-500/50'
                      : rank % 2 === 0
                      ? 'bg-gray-800/50'
                      : ''
                  }`}
                >
                  <div className="col-span-1 flex items-center">
                    {rank <= 15 && (
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs bg-gradient-to-r ${getRewardTier(rank).color} text-white font-bold`}>
                      {rank}
                    </span>
                    )}
                    {rank > 15 && (
                      <span className="w-6 h-6 flex items-center justify-center rounded-md text-xs bg-gray-700 text-gray-300">
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-6 truncate font-mono text-gray-300">
                    {displayText}
                  </div>
                  <div className="col-span-2 text-right font-mono">
                    {player.score >= 10000 ? (
                      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getRewardTier(rank).color}`}>
                        {player.score.toLocaleString()}
                      </span>
                    ) : (
                      player.score.toLocaleString()
                    )}
                  </div>
                  <div className="col-span-3 text-right text-xs">
                    {rank <= 15 ? (
                      <span className="text-yellow-400 font-semibold">
                        {calculatePayout(rank).toLocaleString()} $PB
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="text-xs py-1.5"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="text-xs py-1.5"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
