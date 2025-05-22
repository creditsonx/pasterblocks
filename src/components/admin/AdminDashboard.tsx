import React, { type FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface SuspiciousScore {
  id: number;
  wallet_address: string;
  display_name?: string;
  score: number;
  level: number;
  lines: number;
  game_time: number;
  timestamp: string;
  verified: boolean;
  anti_cheat: string;
}

interface TopScore {
  id: number;
  wallet_address: string;
  display_name?: string;
  score: number;
  level: number;
  lines: number;
  game_time: number;
  timestamp: string;
  verified: boolean;
  rewards_claimed: boolean;
}

interface AdminStats {
  suspiciousScores: SuspiciousScore[];
  stats: {
    total_players: number;
    total_scores: number;
    highest_score: number;
    average_score: number;
    verified_scores: number;
    rewards_claimed: number;
  };
  topScores: TopScore[];
}

export const AdminDashboard: FC = () => {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [authorized, setAuthorized] = useState(false);

  // Check if the user is an admin
  const isAdmin = publicKey?.toString() === 'creditsonx.eth';

  // Fetch admin stats
  const fetchStats = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/admin-stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      setStats(data);
      setAuthorized(true);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format JSON for display
  const formatJson = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return json;
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-gray-800 border border-red-500 rounded-md shadow-lg text-center">
        <h2 className="text-xl font-bold text-red-400 mb-3">Access Denied</h2>
        <p className="text-gray-300">You don't have permission to access this area.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 border border-violet-500 rounded-md shadow-lg">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">Admin Dashboard</h2>

      {!authorized ? (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-200 mb-2">Authentication</h3>
          <div className="flex gap-3">
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Enter admin token"
              className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 flex-grow"
            />
            <button
              onClick={fetchStats}
              disabled={loading || !adminToken}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-400">{error}</p>}
        </div>
      ) : (
        <>
          {stats && (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="bg-gray-900 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-300 mb-3">Leaderboard Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Total Players</p>
                    <p className="text-xl font-bold text-white">{stats.stats.total_players}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Total Scores</p>
                    <p className="text-xl font-bold text-white">{stats.stats.total_scores}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Highest Score</p>
                    <p className="text-xl font-bold text-yellow-400">{stats.stats.highest_score?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Average Score</p>
                    <p className="text-xl font-bold text-white">{Math.round(stats.stats.average_score)?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Verified Scores</p>
                    <p className="text-xl font-bold text-green-400">{stats.stats.verified_scores}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Rewards Claimed</p>
                    <p className="text-xl font-bold text-purple-400">{stats.stats.rewards_claimed}</p>
                  </div>
                </div>
              </div>

              {/* Suspicious Scores */}
              <div className="bg-gray-900 p-4 rounded-md">
                <h3 className="text-lg font-medium text-red-300 mb-3">Suspicious Activity</h3>
                {stats.suspiciousScores.length === 0 ? (
                  <p className="text-gray-400">No suspicious scores detected.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left">Player</th>
                          <th className="px-3 py-2 text-right">Score</th>
                          <th className="px-3 py-2 text-right">Level</th>
                          <th className="px-3 py-2 text-right">Lines</th>
                          <th className="px-3 py-2 text-center">Verified</th>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Flags</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {stats.suspiciousScores.map((score) => {
                          let antiCheat: { flags?: string[] } = {};
                          try {
                            antiCheat = JSON.parse(score.anti_cheat);
                          } catch {
                            antiCheat = { flags: [] };
                          }

                          return (
                            <tr key={score.id} className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70">
                              <td className="px-3 py-2">
                                {score.display_name || `${score.wallet_address.slice(0, 6)}...`}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold">{score.score.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right">{score.level}</td>
                              <td className="px-3 py-2 text-right">{score.lines}</td>
                              <td className="px-3 py-2 text-center">
                                {score.verified ?
                                  <span className="text-green-400">✓</span> :
                                  <span className="text-red-400">✗</span>}
                              </td>
                              <td className="px-3 py-2 text-xs">{formatDate(score.timestamp)}</td>
                              <td className="px-3 py-2 text-xs text-red-300">
                                {antiCheat?.flags?.join(', ') || 'Unknown flags'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Scores */}
              <div className="bg-gray-900 p-4 rounded-md">
                <h3 className="text-lg font-medium text-green-300 mb-3">Top Scores</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2 text-left">Player</th>
                        <th className="px-3 py-2 text-right">Score</th>
                        <th className="px-3 py-2 text-right">Level</th>
                        <th className="px-3 py-2 text-right">Lines</th>
                        <th className="px-3 py-2 text-right">Game Time</th>
                        <th className="px-3 py-2 text-center">Verified</th>
                        <th className="px-3 py-2 text-center">Rewards</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {stats.topScores.map((score, index) => (
                        <tr key={score.id} className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70">
                          <td className="px-3 py-2">#{index + 1}</td>
                          <td className="px-3 py-2">
                            {score.display_name || `${score.wallet_address.slice(0, 6)}...`}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">{score.score.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{score.level}</td>
                          <td className="px-3 py-2 text-right">{score.lines}</td>
                          <td className="px-3 py-2 text-right">{score.game_time}s</td>
                          <td className="px-3 py-2 text-center">
                            {score.verified ?
                              <span className="text-green-400">✓</span> :
                              <span className="text-gray-500">✗</span>}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {score.rewards_claimed ?
                              <span className="text-yellow-400">Claimed</span> :
                              <span className="text-gray-400">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={fetchStats}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
