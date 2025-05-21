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
  // Top tier (10% of rewards pool - 50 million)
  { rank: 1, amount: 10000000 },  // 10,000,000 $PB (2% of rewards pool)
  { rank: 2, amount: 7500000 },   // 7,500,000 $PB (1.5% of rewards pool)
  { rank: 3, amount: 5000000 },   // 5,000,000 $PB (1% of rewards pool)
  { rank: 4, amount: 3500000 },   // 3,500,000 $PB (0.7% of rewards pool)
  { rank: 5, amount: 2500000 },   // 2,500,000 $PB (0.5% of rewards pool)

  // Second tier (15% of rewards pool - 75 million)
  { rank: 6, amount: 2000000 },   // 2,000,000 $PB (0.4% of rewards pool)
  { rank: 7, amount: 1750000 },   // 1,750,000 $PB (0.35% of rewards pool)
  { rank: 8, amount: 1500000 },   // 1,500,000 $PB (0.3% of rewards pool)
  { rank: 9, amount: 1250000 },   // 1,250,000 $PB (0.25% of rewards pool)
  { rank: 10, amount: 1000000 },  // 1,000,000 $PB (0.2% of rewards pool)
  { rank: 11, amount: 950000 },   // 950,000 $PB
  { rank: 12, amount: 900000 },   // 900,000 $PB
  { rank: 13, amount: 850000 },   // 850,000 $PB
  { rank: 14, amount: 800000 },   // 800,000 $PB
  { rank: 15, amount: 750000 },   // 750,000 $PB
  { rank: 16, amount: 700000 },   // 700,000 $PB
  { rank: 17, amount: 650000 },   // 650,000 $PB
  { rank: 18, amount: 600000 },   // 600,000 $PB
  { rank: 19, amount: 550000 },   // 550,000 $PB
  { rank: 20, amount: 500000 },   // 500,000 $PB

  // Third tier (5% of rewards pool - 25 million)
  { rank: 21, amount: 450000 },   // 450,000 $PB
  { rank: 22, amount: 425000 },   // 425,000 $PB
  { rank: 23, amount: 400000 },   // 400,000 $PB
  { rank: 24, amount: 375000 },   // 375,000 $PB
  { rank: 25, amount: 350000 },   // 350,000 $PB
  { rank: 26, amount: 325000 },   // 325,000 $PB
  { rank: 27, amount: 300000 },   // 300,000 $PB
  { rank: 28, amount: 275000 },   // 275,000 $PB
  { rank: 29, amount: 250000 },   // 250,000 $PB
  { rank: 30, amount: 225000 },   // 225,000 $PB

  // Fourth tier (~3% of rewards pool - 15 million)
  { rank: 31, amount: 200000 },   // 200,000 $PB
  { rank: 32, amount: 190000 },   // 190,000 $PB
  { rank: 33, amount: 180000 },   // 180,000 $PB
  { rank: 34, amount: 170000 },   // 170,000 $PB
  { rank: 35, amount: 160000 },   // 160,000 $PB
  { rank: 36, amount: 150000 },   // 150,000 $PB
  { rank: 37, amount: 140000 },   // 140,000 $PB
  { rank: 38, amount: 130000 },   // 130,000 $PB
  { rank: 39, amount: 120000 },   // 120,000 $PB
  { rank: 40, amount: 110000 },   // 110,000 $PB

  // Fifth tier (~2% of rewards pool - 10 million)
  { rank: 41, amount: 100000 },   // 100,000 $PB
  { rank: 42, amount: 95000 },    // 95,000 $PB
  { rank: 43, amount: 90000 },    // 90,000 $PB
  { rank: 44, amount: 85000 },    // 85,000 $PB
  { rank: 45, amount: 80000 },    // 80,000 $PB
  { rank: 46, amount: 75000 },    // 75,000 $PB
  { rank: 47, amount: 70000 },    // 70,000 $PB
  { rank: 48, amount: 65000 },    // 65,000 $PB
  { rank: 49, amount: 60000 },    // 60,000 $PB
  { rank: 50, amount: 55000 }     // 55,000 $PB
];
