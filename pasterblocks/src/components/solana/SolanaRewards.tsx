import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import useLeaderboard from '../../hooks/useLeaderboard';
import { calculatePayout, getRewardTier } from '../../utils/leaderboardUtils';

export const SolanaRewards = () => {
  const { publicKey } = useWallet();
  const [playerRank, setPlayerRank] = useState(-1);
  const [playerScore, setPlayerScore] = useState(0);

  const { topPlayers } = useLeaderboard();

  // Calculate player's rank based on topPlayers data
  useEffect(() => {
    if (!publicKey || !topPlayers.length) {
      setPlayerRank(-1);
      setPlayerScore(0);
      return;
    }

    const playerAddress = publicKey.toString();
    const playerIndex = topPlayers.findIndex(player => player.playerAddress === playerAddress);

    if (playerIndex >= 0) {
      setPlayerRank(playerIndex + 1);
      setPlayerScore(topPlayers[playerIndex].score);
    } else {
      setPlayerRank(-1);
      setPlayerScore(0);
    }
  }, [publicKey, topPlayers]);

  // Get player's reward tier if ranked
  const rewardTier = playerRank > 0 && playerRank <= 15
    ? getRewardTier(playerRank)
    : null;

  // Calculate reward amount
  const rewardAmount = playerRank > 0 && playerRank <= 15
    ? calculatePayout(playerRank)
    : 0;

  return (
    <div className="bg-gray-900 border border-violet-500 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-3 text-center">Your Rewards</h2>

      {!publicKey ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-gray-400 text-sm mb-2">
            Connect your wallet to see your rewards
          </p>
          <WalletMultiButton className="!bg-violet-700 !hover:bg-violet-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-center text-xs text-gray-400 mb-1">
            Wallet Connected
          </div>

          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-300">Your Address:</div>
              <div className="text-sm font-mono truncate max-w-[120px]">
                {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-300">Rank:</div>
              <div className="text-sm">
                {playerRank > 0 ? (
                  <span className="font-bold text-yellow-400">#{playerRank}</span>
                ) : (
                  <span className="text-gray-500">Not ranked</span>
                )}
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-300">Your Score:</div>
              <div className="text-sm">
                {playerScore > 0 ? (
                  <span className="font-bold">{playerScore.toLocaleString()}</span>
                ) : (
                  <span className="text-gray-500">No score yet</span>
                )}
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-300">Status:</div>
              <div className="text-sm">
                {playerRank > 0 && playerRank <= 15 ? (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full bg-gradient-to-r ${rewardTier?.color} text-white`}>
                    {playerRank <= 3
                      ? 'Gold'
                      : playerRank <= 7
                      ? 'Silver'
                      : playerRank <= 10
                      ? 'Bronze'
                      : playerRank <= 15
                      ? 'Violet'
                      : 'Standard'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-400 rounded-full">
                    Unranked
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-gray-300">Reward:</div>
                <div>
                  {rewardAmount > 0 ? (
                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${rewardTier?.color} font-bold`}>
                      {rewardAmount.toLocaleString()} $PB
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {playerRank <= 0 && (
            <div className="mt-2 text-center text-sm text-gray-400">
              Play the game to earn $PBLOCKS rewards!
            </div>
          )}

          {playerRank > 15 && (
            <div className="mt-2 text-center text-sm text-amber-400">
              Reach top 15 to earn $PBLOCKS rewards!
            </div>
          )}

          {playerRank > 0 && playerRank <= 15 && (
            <div className="mt-2 text-center text-sm text-green-400">
              Rewards are distributed every 24 hours!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
