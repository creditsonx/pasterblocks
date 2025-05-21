// Player score type for the leaderboard
export interface PlayerScore {
  id?: string;
  playerAddress: string;
  walletAddress?: string; // Used for Firebase compatibility
  displayName: string;
  score: number;
  level: number;
  lines: number;
  timestamp?: string;
  verified?: boolean;
  pasterBlocksEarned: number;
  gameTime?: number;
  date?: number;
  paid?: boolean;
  rewards?: {
    claimed: boolean;
    amount: number;
    claimedAt?: number;
  };
}

// Leaderboard state
export interface LeaderboardState {
  topPlayers: PlayerScore[];
  loading: boolean;
  error: string | null;
  usingLocalStorage: boolean;
}

// Payout amounts by rank
export interface PayoutAmount {
  rank: number;
  amount: number;
}

// Define payout amounts for players (rewards distributed every 24 hours)
export const PAYOUT_SCHEDULE: PayoutAmount[] = [
  // Top tier rewards - scaled to max 10,000 $PB
  { rank: 1, amount: 10000 },    // 10,000 $PB (1st place)
  { rank: 2, amount: 8500 },     // 8,500 $PB (2nd place)
  { rank: 3, amount: 7000 },     // 7,000 $PB (3rd place)
  { rank: 4, amount: 6000 },     // 6,000 $PB (4th place)
  { rank: 5, amount: 5000 },     // 5,000 $PB (5th place)

  // Second tier
  { rank: 6, amount: 4500 },     // 4,500 $PB
  { rank: 7, amount: 4000 },     // 4,000 $PB
  { rank: 8, amount: 3500 },     // 3,500 $PB
  { rank: 9, amount: 3000 },     // 3,000 $PB
  { rank: 10, amount: 2500 },    // 2,500 $PB

  // Third tier
  { rank: 11, amount: 2000 },    // 2,000 $PB
  { rank: 12, amount: 1500 },    // 1,500 $PB
  { rank: 13, amount: 1000 },    // 1,000 $PB
  { rank: 14, amount: 750 },     // 750 $PB
  { rank: 15, amount: 500 }      // 500 $PB
];
