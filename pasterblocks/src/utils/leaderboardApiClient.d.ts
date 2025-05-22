interface LeaderboardApiClient {
  baseUrl: string;
  token: string | null;

  setToken(token: string): void;
  getHeaders(): Record<string, string>;
  request(endpoint: string, method?: string, data?: any): Promise<any>;
  submitScore(scoreData: any): Promise<any>;
  getTopScores(limit?: number): Promise<any>;
  getPlayerScores(walletAddress: string, limit?: number): Promise<any>;
  getPlayerRank(walletAddress: string): Promise<any>;
  updatePlayerName(walletAddress: string, displayName: string): Promise<any>;
  signAndVerifyScore(walletAddress: string, gameData: any, wallet: any): Promise<any>;
  claimRewards(scoreId: string, rewardsAmount: number): Promise<any>;
}

declare const leaderboardApi: LeaderboardApiClient;
export default leaderboardApi;
