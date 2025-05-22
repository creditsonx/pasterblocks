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

  const pageSize = 15;

  useEffect(() => {
    if (loading && !forceShowPlaceholderData) {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        setForceShowPlaceholderData(true);
        refreshLeaderboard();
      }, 5000);
    } else if (!loading) {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (forceShowPlaceholderData && topPlayers.length > 0) {
        setForceShowPlaceholderData(false);
      }
    }

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [loading, forceShowPlaceholderData, topPlayers.length, refreshLeaderboard]);

  useEffect(() => {
    setCurrentPage(0);
  }, [topPlayers.length]);

  useEffect(() => {
    refreshLeaderboard();
    const minutes = Math.floor(Math.random() * 6) + 5;
    const milliseconds = minutes * 60 * 1000;
    const intervalId = setInterval(() => {
      refreshLeaderboard();
    }, milliseconds);
    return () => clearInterval(intervalId);
  }, [refreshLeaderboard]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(current => Math.min(current + 1, Math.max(1, Math.ceil(displayPlayers.length / pageSize)) - 1));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(current => Math.max(current - 1, 0));
  }, []);

  const hasScoreOnBoard = useCallback(() => {
    if (!publicKey || !topPlayers.length) return false;
    return topPlayers.some((player: PlayerScore) => player.playerAddress === publicKey.toString());
  }, [publicKey, topPlayers]);

  const handleProcessPayouts = useCallback(async () => {
    if (!adminToken) return;
    const success = await processPayout(adminToken);
    setShowPayoutModal(false);
  }, [adminToken, processPayout]);

  const formatTimestamp = (timestamp: string | number | Date) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    if (address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const generatePlaceholderData = useCallback(() => {
    const placeholders: PlayerScore[] = [];
    for (let i = 0; i < 20; i++) {
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let address = '';
      for (let j = 0; j < 44; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const baseScore = 20000 - (i * 800);
      const score = baseScore + Math.floor(Math.random() * 500);

      placeholders.push({
        playerAddress: address,
        walletAddress: address,
        displayName: '',
        score,
        level: Math.floor(score / 1000),
        lines: Math.floor(score / 200),
        timestamp: new Date().toISOString(),
        verified: true,
        pBlocksEarned: Math.floor(score / 3000)
      });
    }

    return placeholders;
  }, []);

  const displayPlayers: PlayerScore[] = (loading && forceShowPlaceholderData)
    ? generatePlaceholderData()
    : topPlayers;

  const totalPages = Math.max(1, Math.ceil(displayPlayers.length / pageSize));
  const visiblePlayers = displayPlayers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="bg-gray-900 border border-violet-500 p-4 rounded-lg text-white shadow-lg w-full md:w-[560px] max-h-[600px] overflow-auto">
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
            <div className="text-sm font-semibold flex items-center">
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

          <div className="grid grid-cols-11 text-xs font-semibold text-gray-400 py-2 border-b border-gray-800">
            <div className="col-span-1 pl-2 min-w-[32px]">#</div>
            <div className="col-span-4 pl-1 min-w-[120px]">Wallet</div>
            <div className="col-span-3 text-right min-w-[80px]">Score</div>
            <div className="col-span-3 text-right pr-2 min-w-[100px]">$PB Reward</div>
          </div>

          <div className="space-y-3">
            {visiblePlayers.map((player: PlayerScore, index: number) => {
              const rank = currentPage * pageSize + index + 1;
              const displayText = formatAddress(player.walletAddress || player.playerAddress);

              return (
                <div
                  key={`${player.playerAddress || player.walletAddress}-${rank}`}
                  className={`grid grid-cols-11 items-center text-sm px-4 py-4 rounded-md ${
                    publicKey && (player.playerAddress === publicKey.toString() || player.walletAddress === publicKey.toString())
                      ? 'bg-violet-900/30 border border-violet-500/50'
                      : rank % 2 === 0
                      ? 'bg-gray-800/50'
                      : ''
                  }`}
                >
                  <div className="col-span-1 flex justify-center min-w-[32px]">
                    {rank <= 15 ? (
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs bg-gradient-to-r ${getRewardTier(rank).color} text-white font-bold`}>
                        {rank}
                      </span>
                    ) : (
                      <span className="w-7 h-7 flex items-center justify-center rounded-md text-xs bg-gray-700 text-gray-300">
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-4 truncate font-mono text-gray-300 pl-2 min-w-[120px]">
                    {displayText}
                  </div>
                  <div className="col-span-3 text-right font-mono pr-3 min-w-[80px]">
                    {player.score >= 10000 ? (
                      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getRewardTier(rank).color}`}>
                        {player.score.toLocaleString()}
                      </span>
                    ) : (
                      player.score.toLocaleString()
                    )}
                  </div>
                  <div className="col-span-3 text-right text-xs pr-2 min-w-[100px]">
                    {rank <= 15 ? (
                      <span className="text-yellow-400 font-semibold whitespace-nowrap">
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
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="text-xs py-2"
                variant="secondary"
              >
                Previous
              </Button>
              <Button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="text-xs py-2"
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
