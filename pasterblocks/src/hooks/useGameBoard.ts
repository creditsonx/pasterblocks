import { useState, useCallback } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, type TetrominoType, TETROMINOES, type BoardCell } from '../utils/constants';

// Create an empty board
export const createEmptyBoard = (): BoardCell[][] =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );

// Types
type Tetromino = {
  pos: { x: number, y: number };
  type: TetrominoType;
  shape: number[][];
};

export const useGameBoard = () => {
  const [board, setBoard] = useState<BoardCell[][]>(createEmptyBoard());
  const [activeTetromino, setActiveTetromino] = useState<Tetromino | null>(null);

  // Generate a random tetromino
  const generateTetromino = useCallback((): Tetromino => {
    // Get a random tetromino type
    const tetrominoTypes = Object.keys(TETROMINOES) as TetrominoType[];
    const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];

    const tetromino = TETROMINOES[randomType];

    return {
      pos: {
        // Use proper number casting to fix the arithmetic operation error
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape.length / 2),
        y: 0
      },
      type: randomType,
      shape: tetromino.shape,
    };
  }, []);

  // Reset the game
  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setActiveTetromino(generateTetromino());
  }, [generateTetromino]);

  // Check if position is valid (not colliding with walls or other blocks)
  const isValidPosition = useCallback((tetromino: Tetromino, board: BoardCell[][]): boolean => {
    return tetromino.shape.every((row, rowIndex) => {
      return row.every((cell, cellIndex) => {
        if (cell === 0) return true;

        const boardX = tetromino.pos.x + cellIndex;
        const boardY = tetromino.pos.y + rowIndex;

        // Check if position is within board boundaries
        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY < 0 ||
          boardY >= BOARD_HEIGHT
        ) {
          return false;
        }

        // Check if position is already occupied
        return !board[boardY][boardX];
      });
    });
  }, []);

  // Update board with current tetromino
  const updateBoard = useCallback(() => {
    if (!activeTetromino) return;

    // Create a copy of the board without the active tetromino
    const newBoard = board.map(row => [...row]);

    // Add the active tetromino to the board
    activeTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell !== 0) {
          const boardX = activeTetromino.pos.x + cellIndex;
          const boardY = activeTetromino.pos.y + rowIndex;

          if (
            boardX >= 0 &&
            boardX < BOARD_WIDTH &&
            boardY >= 0 &&
            boardY < BOARD_HEIGHT
          ) {
            newBoard[boardY][boardX] = activeTetromino.type;
          }
        }
      });
    });

    return newBoard;
  }, [activeTetromino, board]);

  // Move tetromino down
  const moveDown = useCallback(() => {
    if (!activeTetromino) return false;

    const movedTetromino = {
      ...activeTetromino,
      pos: { ...activeTetromino.pos, y: activeTetromino.pos.y + 1 }
    };

    if (isValidPosition(movedTetromino, board)) {
      setActiveTetromino(movedTetromino);
      return true;
    }

    return false;
  }, [activeTetromino, board, isValidPosition]);

  // Move tetromino left
  const moveLeft = useCallback(() => {
    if (!activeTetromino) return;

    const movedTetromino = {
      ...activeTetromino,
      pos: { ...activeTetromino.pos, x: activeTetromino.pos.x - 1 }
    };

    if (isValidPosition(movedTetromino, board)) {
      setActiveTetromino(movedTetromino);
    }
  }, [activeTetromino, board, isValidPosition]);

  // Move tetromino right
  const moveRight = useCallback(() => {
    if (!activeTetromino) return;

    const movedTetromino = {
      ...activeTetromino,
      pos: { ...activeTetromino.pos, x: activeTetromino.pos.x + 1 }
    };

    if (isValidPosition(movedTetromino, board)) {
      setActiveTetromino(movedTetromino);
    }
  }, [activeTetromino, board, isValidPosition]);

  // Rotate tetromino
  const rotateTetromino = useCallback(() => {
    if (!activeTetromino) return;

    // Matrix rotation algorithm
    const rotatedShape = activeTetromino.shape.map((_, index) =>
      activeTetromino.shape.map(col => col[index]).reverse()
    );

    const rotatedTetromino = {
      ...activeTetromino,
      shape: rotatedShape
    };

    if (isValidPosition(rotatedTetromino, board)) {
      setActiveTetromino(rotatedTetromino);
    }
  }, [activeTetromino, board, isValidPosition]);

  // Hard drop - move tetromino all the way down
  const hardDrop = useCallback(() => {
    if (!activeTetromino) return;

    let droppedTetromino = { ...activeTetromino };

    while (isValidPosition(
      {
        ...droppedTetromino,
        pos: {
          ...droppedTetromino.pos,
          y: droppedTetromino.pos.y + 1
        }
      },
      board
    )) {
      droppedTetromino = {
        ...droppedTetromino,
        pos: {
          ...droppedTetromino.pos,
          y: droppedTetromino.pos.y + 1
        }
      };
    }

    setActiveTetromino(droppedTetromino);
  }, [activeTetromino, board, isValidPosition]);

  return {
    board,
    setBoard,
    activeTetromino,
    setActiveTetromino,
    generateTetromino,
    resetGame,
    isValidPosition,
    updateBoard,
    moveDown,
    moveLeft,
    moveRight,
    rotateTetromino,
    hardDrop
  };
};
