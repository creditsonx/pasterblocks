// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Game speed (ms)
export const INITIAL_SPEED = 1000;
export const SPEED_INCREASE_PER_LEVEL = 100;
export const MIN_SPEED = 100;

// Points
export const POINTS_SINGLE = 100;
export const POINTS_DOUBLE = 300;
export const POINTS_TRIPLE = 500;
export const POINTS_TETRIS = 800;
export const POINTS_SOFT_DROP = 1;
export const POINTS_HARD_DROP = 2;

// Solana rewards (in lamports)
export const REWARD_PER_LEVEL = 100000; // 0.0001 SOL
export const REWARD_PER_TETRIS = 500000; // 0.0005 SOL

// Tetromino types
export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

// Board cell type
export type BoardCell = TetrominoType | null;
export type Board = BoardCell[][];

// Tetromino shapes
export const TETROMINOES: Record<TetrominoType, { shape: number[][], color: TetrominoType }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "I",
  },
  J: {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: "J",
  },
  L: {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: "L",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "O",
  },
  S: {
    shape: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "S",
  },
  T: {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "T",
  },
  Z: {
    shape: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "Z",
  },
};
