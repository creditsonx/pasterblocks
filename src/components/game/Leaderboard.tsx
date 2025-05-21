// Remove the test panel and utility functions
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useLeaderboard from '../../hooks/useLeaderboard';
import { calculatePayout, getRewardTier } from '../../utils/leaderboardUtils';
import Button from '../ui/Button';
import type { PlayerScore } from '../../types/leaderboard';

const Leaderboard = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [adminToken, setAdminToken] = useState('');
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

  // Number of players per page
  const pageSize = 10;
  const totalPages = Math.ceil(topPlayers.length / pageSize);

  // Players to show on current page
  const visiblePlayers = topPlayers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Navigate pages
  const goToNextPage = useCallback(() => {
    setCurrentPage(current => Math.min(current + 1, totalPages - 1));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(current => Math.max(current - 1, 0));
  }, []);

  // Check if the user has a score
  const hasScoreOnBoard = useCallback(() => {
    if (!publicKey || !topPlayers.length) return false;
    return topPlayers.some((player: PlayerScore) => player.playerAddress === publicKey.toString());
  }, [publicKey, topPlayers]);

  // Reset to page 0 when leaderboard changes
  useEffect(() => {
    setCurrentPage(0);
  }, [topPlayers.length]);

  // Set up periodic refresh every 10 minutes
  useEffect(() => {
    // Initial refresh
    refreshLeaderboard();

    // Set up interval for refreshing every 10 minutes
    const intervalId = setInterval(() => {
      refreshLeaderboard();
      console.log('Leaderboard refreshed automatically (10-minute interval)');
    }, 10 * 60 * 1000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshLeaderboard]);

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

  return (
    <div className="bg-gray-900 border border-violet-500 p-3 rounded-lg text-white shadow-lg w-full max-h-[600px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Leaderboard</h3>
        <div className="flex items-center space-x-1">
          <span className={`w-2 h-2 rounded-full ${usingLocalStorage ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
          <span className="text-xs text-gray-400">
            {usingLocalStorage ? 'Using Local Data' : 'Online Leaderboard'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-center text-gray-400">Loading leaderboard...</div>
      ) : error ? (
        <div className="py-4 text-center text-red-400">{error}</div>
      ) : topPlayers.length === 0 ? (
        <div className="py-4 text-center text-gray-400">No scores yet. Be the first!</div>
      ) : (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-purple-300 font-semibold">
              Leaderboard
            </div>
            <div className="text-xs text-gray-400">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>

          <div className="grid grid-cols-12 text-xs text-gray-400 px-2 py-1">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-3 text-right">Score</div>
            <div className="col-span-3 text-right">$PB Reward</div>
          </div>

          {visiblePlayers.map((player: PlayerScore, index: number) => {
            const rank = currentPage * pageSize + index + 1;

            // Format the player's display name
            let displayText = player.displayName;

            // If it's a wallet address, format it nicely
            if (player.walletAddress && (!player.displayName || player.displayName === player.walletAddress)) {
              displayText = formatAddress(player.walletAddress);
            } else if (player.playerAddress && (!player.displayName || player.displayName === player.playerAddress)) {
              displayText = formatAddress(player.playerAddress);
            }

            return (
              <div
                key={`${player.playerAddress || player.walletAddress}-${rank}`}
                className={`grid grid-cols-12 items-center text-sm px-2 py-2 rounded-md ${
                  publicKey && (player.playerAddress === publicKey.toString() || player.walletAddress === publicKey.toString())
                    ? 'bg-violet-900/30 border border-violet-500/50'
                    : rank % 2 === 0
                    ? 'bg-gray-800/50'
                    : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  {rank <= 50 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs bg-gradient-to-r ${getRewardTier(rank).color} text-white`}>
                    {rank}
                  </span>
                  )}
                  {rank > 50 && (
                    <span className="px-1.5 py-0.5 rounded-md text-xs bg-gray-700 text-gray-300">
                      {rank}
                    </span>
                  )}
                </div>
                <div className="col-span-5 truncate font-semibold text-gray-300">
                  {displayText}
                </div>
                <div className="col-span-3 text-right font-mono">
                  {player.score >= 10000 ? (
                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getRewardTier(rank).color}`}>
                      {player.score.toLocaleString()}
                    </span>
                  ) : (
                    player.score.toLocaleString()
                  )}
                </div>
                <div className="col-span-3 text-right text-xs">
                  {rank <= 50 ? (
                    <span className="text-yellow-400">
                      {calculatePayout(rank).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="text-xs py-1"
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="text-xs py-1"
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
