import { useState, useEffect, useCallback } from 'react';
import { useGameBoard } from './useGameBoard';
import {
  INITIAL_SPEED,
  SPEED_INCREASE_PER_LEVEL,
  MIN_SPEED,
  POINTS_SINGLE,
  POINTS_DOUBLE,
  POINTS_TRIPLE,
  POINTS_TETRIS,
  BOARD_WIDTH,
  type BoardCell,
  type TetrominoType,
  TETROMINOES
} from '../utils/constants';

export const useGame = () => {
  const {
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
  } = useGameBoard();

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [solanaRewards, setSolanaRewards] = useState(0);
  const [nextTetromino, setNextTetromino] = useState<{ type: TetrominoType, shape: number[][] } | null>(null);
  const [holdTetromino, setHoldTetromino] = useState<{ type: TetrominoType, shape: number[][] } | null>(null);
  const [isHoldUsed, setIsHoldUsed] = useState(false);
  const [isTetrominoLocked, setIsTetrominoLocked] = useState(false);

  // Calculate the drop speed based on level
  const calculateSpeed = useCallback((level: number) => {
    const newSpeed = INITIAL_SPEED - (level - 1) * SPEED_INCREASE_PER_LEVEL;
    return Math.max(newSpeed, MIN_SPEED);
  }, []);

  // Check for completed lines
  const checkLines = useCallback(() => {
    let clearedLines = 0;
    const newBoard = board.filter(row => {
      const isComplete = row.every(cell => cell !== null);
      if (isComplete) {
        clearedLines++;
        return false;
      }
      return true;
    });

    // Add empty lines at the top
    while (newBoard.length < board.length) {
      newBoard.unshift(Array(board[0].length).fill(null));
    }

    if (clearedLines > 0) {
      // Award points based on the number of lines cleared
      let pointsGained = 0;
      let solanaGained = 0;

      switch (clearedLines) {
        case 1:
          pointsGained = POINTS_SINGLE * level;
          break;
        case 2:
          pointsGained = POINTS_DOUBLE * level;
          break;
        case 3:
          pointsGained = POINTS_TRIPLE * level;
          break;
        case 4:
          pointsGained = POINTS_TETRIS * level;
          // Additional Solana reward for a Tetris!
          solanaGained = 0.0005;
          break;
      }

      setScore(prev => prev + pointsGained);
      setSolanaRewards(prev => prev + solanaGained);
      setLines(prev => {
        const newLines = prev + clearedLines;
        // Level up for every 10 lines
        if (Math.floor(newLines / 10) > Math.floor(prev / 10)) {
          const newLevel = Math.floor(newLines / 10) + 1;
          setLevel(newLevel);
          setSpeed(calculateSpeed(newLevel));
          // Additional Solana reward for leveling up
          setSolanaRewards(prev => prev + 0.0001);
        }
        return newLines;
      });
      setBoard(newBoard);
    }
  }, [board, level, calculateSpeed, setBoard]);

  // Lock the tetromino when it can't move down further
  const lockTetromino = useCallback(() => {
    // Set the tetromino locked flag for effects
    setIsTetrominoLocked(true);

    // Add the current tetromino to the board
    const newBoard = updateBoard();
    if (newBoard) {
      setBoard(newBoard);

      // Check for completed lines
      checkLines();

      // Use the next tetromino if available, otherwise generate a new one
      const tetrominoToUse = nextTetromino ? {
        ...nextTetromino,
        pos: {
          x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextTetromino.shape.length / 2),
          y: 0
        }
      } : generateTetromino();

      // Generate a new next tetromino
      const newNextTetromino = generateTetromino();
      setNextTetromino({
        type: newNextTetromino.type,
        shape: newNextTetromino.shape
      });

      // Reset hold usage for the new tetromino
      setIsHoldUsed(false);

      // Check if the new tetromino can be placed
      if (!isValidPosition(tetrominoToUse, newBoard)) {
        setGameOver(true);
      } else {
        setActiveTetromino(tetrominoToUse);
      }

      // Reset the tetromino locked flag after a short delay
      setTimeout(() => {
        setIsTetrominoLocked(false);
      }, 100);
    }
  }, [updateBoard, setBoard, checkLines, generateTetromino, isValidPosition, setActiveTetromino, nextTetromino]);

  // Hold the current tetromino
  const holdCurrentTetromino = useCallback(() => {
    if (!activeTetromino || !gameStarted || gameOver || isPaused || isHoldUsed) return;

    // Store the current active tetromino type and shape
    const currentTetrominoInfo = {
      type: activeTetromino.type,
      shape: TETROMINOES[activeTetromino.type].shape,
    };

    let nextTetrominoToUse;

    if (holdTetromino) {
      // If there's a held tetromino, swap it with the current one
      nextTetrominoToUse = {
        pos: {
          x: Math.floor(BOARD_WIDTH / 2) - Math.floor(holdTetromino.shape[0].length / 2),
          y: 0
        },
        type: holdTetromino.type,
        shape: holdTetromino.shape
      };
    } else {
      // If there's no held tetromino, use the next one and generate a new next
      if (!nextTetromino) return;

      nextTetrominoToUse = {
        pos: {
          x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextTetromino.shape[0].length / 2),
          y: 0
        },
        type: nextTetromino.type,
        shape: nextTetromino.shape
      };

      // Generate a new next tetromino
      const newNextTetromino = generateTetromino();
      setNextTetromino({
        type: newNextTetromino.type,
        shape: newNextTetromino.shape
      });
    }

    // Update the held tetromino
    setHoldTetromino(currentTetrominoInfo);

    // Set the new active tetromino
    setActiveTetromino(nextTetrominoToUse);

    // Mark hold as used for this turn
    setIsHoldUsed(true);
  }, [activeTetromino, gameStarted, gameOver, isPaused, isHoldUsed, holdTetromino, nextTetromino, generateTetromino, setNextTetromino, setHoldTetromino, setActiveTetromino, setIsHoldUsed]);

  // Game tick - move the tetromino down each tick
  const gameTick = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const moved = moveDown();
    if (!moved) {
      lockTetromino();
    }
  }, [gameOver, isPaused, gameStarted, moveDown, lockTetromino]);

  // Handle key presses
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver || isPaused || !gameStarted) return;

    switch (e.key) {
      case 'ArrowLeft':
        moveLeft();
        break;
      case 'ArrowRight':
        moveRight();
        break;
      case 'ArrowDown':
        moveDown();
        break;
      case 'ArrowUp':
        rotateTetromino();
        break;
      case ' ':
        hardDrop();
        break;
      case 'p':
        setIsPaused(prev => !prev);
        break;
      case 'c':
      case 'C':
        holdCurrentTetromino();
        break;
    }
  }, [gameOver, isPaused, gameStarted, moveLeft, moveRight, moveDown, rotateTetromino, hardDrop, holdCurrentTetromino]);

  // Set up game tick interval
  useEffect(() => {
    let gameInterval: ReturnType<typeof setInterval> | null = null;

    if (gameStarted && !isPaused && !gameOver) {
      gameInterval = setInterval(gameTick, speed);
    }

    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [gameStarted, isPaused, gameOver, speed, gameTick]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Start a new game
  const startGame = useCallback(() => {
    resetGame();
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setSpeed(INITIAL_SPEED);
    setSolanaRewards(0);
    setIsPaused(false);
    setGameStarted(true);
    setHoldTetromino(null);
    setIsHoldUsed(false);

    // Initialize the next tetromino
    const initialNextTetromino = generateTetromino();
    setNextTetromino({
      type: initialNextTetromino.type,
      shape: initialNextTetromino.shape
    });
  }, [resetGame, generateTetromino]);

  // Pause the game
  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameStarted, gameOver]);

  // Get the game board with the active tetromino
  const getGameBoard = useCallback(() => {
    if (!activeTetromino) {
      return board;
    }

    // Create a copy of the board
    const boardWithTetromino = board.map(row => [...row]) as BoardCell[][];

    // Add the active tetromino to the board
    activeTetromino.shape.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell !== 0) {
          const boardX = activeTetromino.pos.x + cellIndex;
          const boardY = activeTetromino.pos.y + rowIndex;

          if (
            boardX >= 0 &&
            boardX < board[0].length &&
            boardY >= 0 &&
            boardY < board.length
          ) {
            boardWithTetromino[boardY][boardX] = activeTetromino.type;
          }
        }
      });
    });

    return boardWithTetromino;
  }, [activeTetromino, board]);

  return {
    board: getGameBoard(),
    score,
    level,
    lines,
    gameOver,
    isPaused,
    gameStarted,
    solanaRewards,
    nextTetromino,
    holdTetromino,
    isHoldUsed,
    isTetrominoLocked,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotateTetromino,
    hardDrop,
    holdPiece: holdCurrentTetromino
  };
};
