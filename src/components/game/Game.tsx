import React, { type FC, useEffect, useState, useCallback, useRef } from 'react';
import { Board } from './Board';
import { useGame } from '../../hooks/useGame';
import { SolanaRewards } from '../solana/SolanaRewards';
import Leaderboard from './Leaderboard';
import { NextTetromino } from './NextTetromino';
import { HoldPiece } from './HoldPiece';
import { SoundToggle } from './SoundToggle';
import { TouchControls } from './TouchControls';
import { LinesClearEffect } from './LinesClearEffect';
import { useWallet } from '@solana/wallet-adapter-react';
import useLeaderboard from '../../hooks/useLeaderboard';
import { useSounds, SoundEffect } from '../../hooks/useSounds';

export const Game: FC = () => {
  const {
    board,
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
    rotateTetromino,
    hardDrop,
    moveDown,
    holdPiece
  } = useGame();

  const { publicKey } = useWallet();
  const { addScore } = useLeaderboard();
  const { playSound, isMuted, toggleMute } = useSounds();
  const [isScoreSaved, setIsScoreSaved] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'leaderboard'>('rewards');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Keep previous game state to detect changes
  const prevLevelRef = useRef(level);
  const prevLinesRef = useRef(lines);

  // Reference to the board element for particle effects
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload the image
    const img = new Image();
    img.src = "/assets/images/pasternak.png";
    img.onload = () => setImageLoaded(true);
  }, []);

  // Handle game over and save score
  useEffect(() => {
    if (gameOver && publicKey && score > 0 && !isScoreSaved) {
      addScore(score, level, lines, Math.floor(solanaRewards * 100000));
      setIsScoreSaved(true);
      playSound('gameOver');
    }
  }, [gameOver, publicKey, score, level, lines, solanaRewards, addScore, isScoreSaved, playSound]);

  // Play sounds for level up
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused && prevLevelRef.current !== level && level > 1) {
      playSound('levelUp');
    }
    prevLevelRef.current = level;
  }, [level, gameStarted, gameOver, isPaused, playSound]);

  // Play sounds for line clears
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused && prevLinesRef.current !== lines && lines > 0) {
      playSound('clear');

      // Check if multiple lines were cleared at once
      const linesDifference = lines - prevLinesRef.current;
      if (linesDifference >= 4) {
        // A Tetris was achieved (4 lines)
        setTimeout(() => playSound('reward'), 300);
      }
    }
    prevLinesRef.current = lines;
  }, [lines, gameStarted, gameOver, isPaused, playSound]);

  // Reset score saved flag when starting a new game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      setIsScoreSaved(false);
    }
  }, [gameStarted, gameOver]);

  const handleStartGame = useCallback(() => {
    setActiveTab('rewards');
    startGame();
    playSound('drop');
  }, [startGame, playSound]);

  // Enhanced game controls with sound effects
  const handleMove = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      moveLeft();
    } else {
      moveRight();
    }
    playSound('move');
  }, [moveLeft, moveRight, playSound]);

  const handleRotate = useCallback(() => {
    rotateTetromino();
    playSound('rotate');
  }, [rotateTetromino, playSound]);

  const handleDrop = useCallback(() => {
    hardDrop();
    playSound('drop');
  }, [hardDrop, playSound]);

  const handleMoveDown = useCallback(() => {
    moveDown();
    // No sound for soft drop to avoid too much noise
  }, [moveDown]);

  const handlePause = useCallback(() => {
    togglePause();
    playSound('move');
  }, [togglePause, playSound]);

  const handleHoldPiece = useCallback(() => {
    holdPiece();
    playSound('rotate');
  }, [holdPiece, playSound]);

  // Add keyboard controls with sound effects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused || !gameStarted) return;

      switch (e.key) {
        case 'ArrowLeft':
          handleMove('left');
          break;
        case 'ArrowRight':
          handleMove('right');
          break;
        case 'ArrowDown':
          handleMoveDown();
          break;
        case 'ArrowUp':
          handleRotate();
          break;
        case ' ':
          handleDrop();
          break;
        case 'p':
        case 'P':
          handlePause();
          break;
        case 'h':
        case 'H':
        case 'c':
        case 'C':
          handleHoldPiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, gameStarted, handleMove, handleMoveDown, handleRotate, handleDrop, handlePause, handleHoldPiece]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-md">
        PasterBlocks: Believe in Tetris
      </h1>

      <div className="text-center text-sm text-purple-300 mt-1 bg-gradient-to-r from-purple-800/30 via-blue-800/30 to-purple-800/30 p-2 rounded-xl">
        Play to earn $PASTERBLOCKS - Rewards Distributed Every 24 hours
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Left side - Profile and Hold Piece */}
        <div className="flex flex-col gap-4 md:block">
          {/* Pasternak image - only visible on desktop or when game not started */}
          <div className={`relative w-32 h-32 md:w-48 md:h-48 overflow-hidden border-4 border-violet-500 rounded-2xl transform -rotate-6 shadow-[0_0_20px_rgba(124,58,237,0.7)] transition-all duration-300 hover:rotate-0 ${gameStarted ? 'scale-100' : 'scale-90'} ${gameStarted ? 'hidden md:block' : 'mx-auto'}`}>
            {imageLoaded && (
              <img
                src="/assets/images/pasterblocks.svg"
                alt="@pasterblocks"
                className="w-full h-full object-contain bg-[#f5f3e8]"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center">
              <p className="text-white text-sm font-semibold">@pasterblocks</p>
            </div>
          </div>

          {/* Hold piece - shown on both mobile and desktop when game started */}
          {gameStarted && !gameOver && (
            <div className="flex-1 md:w-full">
              <HoldPiece tetromino={holdTetromino} isHoldUsed={isHoldUsed} />
            </div>
          )}
        </div>

        {/* Game board */}
        <div className="relative">
          <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 z-10 ${gameStarted && !gameOver && !isPaused ? 'block' : 'hidden'}`}>
            <div className="bg-black/70 px-3 py-1 rounded-xl border border-violet-500">
              <span className="text-purple-300 font-semibold">Level: {level}</span>
            </div>
          </div>

          <div ref={boardRef}>
            <Board board={board} />
          </div>

          {/* Particle effects for line clears */}
          {gameStarted && !gameOver && !isPaused && (
            <LinesClearEffect
              lines={lines}
              count={lines - prevLinesRef.current > 3 ? 80 : 30}
              isTetrominoLocked={isTetrominoLocked}
              boardRef={boardRef}
            />
          )}

          {/* Game overlay for game over or pause */}
          {(gameOver || isPaused || !gameStarted) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              {gameOver && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">Game Over!</h2>

                  <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-left">
                        <p className="text-white mb-2">Final Score: <span className="font-bold text-yellow-400">{score}</span></p>
                        <p className="text-white mb-2">Level: <span className="font-bold text-purple-400">{level}</span></p>
                        <p className="text-white mb-2">Lines: <span className="font-bold text-blue-400">{lines}</span></p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {holdTetromino && (
                          <div className="bg-gray-800 border border-violet-500 rounded-md p-2">
                            <p className="text-sm text-gray-400 mb-1">Hold:</p>
                            <div className="flex justify-center">
                              <div className="scale-75 transform origin-top-left">
                                <HoldPiece tetromino={holdTetromino} isHoldUsed={false} />
                              </div>
                            </div>
                          </div>
                        )}

                        {nextTetromino && (
                          <div className="bg-gray-800 border border-violet-500 rounded-md p-2">
                            <p className="text-sm text-gray-400 mb-1">Next:</p>
                            <div className="flex justify-center">
                              <div className="scale-75 transform origin-top-left">
                                <NextTetromino tetromino={nextTetromino} hideTitle={true} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-white mb-4">SOL Earned: {solanaRewards.toFixed(4)}</p>
                  <p className="text-white mb-6">
                    $PASTERBLOCKS: <span className="font-bold text-yellow-400">{Math.floor(solanaRewards * 100000)}</span>
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleStartGame}
                      className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => setShowLeaderboard(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      Leaderboard
                    </button>
                  </div>
                </div>
              )}

              {isPaused && !gameOver && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">Game Paused</h2>
                  <button
                    onClick={togglePause}
                    className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    Resume
                  </button>
                </div>
              )}

              {!gameStarted && !gameOver && (
                <div className="text-center p-4">
                  <div className="md:hidden w-20 h-20 mx-auto mb-4 relative overflow-hidden rounded-xl border-2 border-violet-500">
                    {imageLoaded && (
                      <img
                        src="/assets/images/pasterblocks.svg"
                        alt="@pasterblocks"
                        className="w-full h-full object-contain bg-[#f5f3e8]"
                      />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-purple-400 mb-4">
                    PasterBlocks: Believe in Tetris
                  </h2>
                  <p className="text-white mb-4">
                    The neon-block dropping game with $PASTERBLOCKS rewards!
                  </p>
                  <div className="text-white mb-6 text-left">
                    <p className="font-bold">Controls:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Arrow Left/Right: Move block</li>
                      <li>Arrow Down: Soft drop</li>
                      <li>Arrow Up: Rotate</li>
                      <li>Space: Hard drop</li>
                      <li>H or C: Hold piece</li>
                      <li>P: Pause game</li>
                    </ul>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleStartGame}
                      className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      Start Game
                    </button>
                    <button
                      onClick={() => setShowLeaderboard(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      Leaderboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Modal */}
          {showLeaderboard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-gray-900 border-2 border-violet-500 rounded-xl p-6 max-w-lg w-full shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-purple-300">Leaderboard</h2>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <Leaderboard />

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game info and controls */}
        <div className="flex flex-col gap-4 w-full md:w-64">
          {/* Mobile row for Hold and Next pieces when game is active */}
          {gameStarted && !gameOver && (
            <div className="flex flex-row md:hidden gap-2 justify-center">
              <div className="flex-1">
                {holdTetromino && (
                  <div className="scale-90 transform origin-top-left">
                    <HoldPiece tetromino={holdTetromino} isHoldUsed={isHoldUsed} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                {nextTetromino && (
                  <div className="scale-90 transform origin-top-right">
                    <NextTetromino tetromino={nextTetromino} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-4 bg-gray-800 border border-violet-500 rounded-md shadow-[0_0_10px_rgba(124,58,237,0.7)]">
              <h3 className="text-lg font-bold text-purple-300">Stats</h3>
              <div className="flex flex-row md:flex-col">
                <p className="flex-1 text-white">Score: <span className="font-bold">{score}</span></p>
                <p className="flex-1 text-white">Level: <span className="font-bold">{level}</span></p>
                <p className="flex-1 text-white">Lines: <span className="font-bold">{lines}</span></p>
              </div>
            </div>

            {/* Next piece display - desktop only */}
            {gameStarted && !gameOver && nextTetromino && (
              <div className="hidden md:block">
                <NextTetromino tetromino={nextTetromino} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
            <div className="text-xs text-gray-400">
              {isMuted ? 'Sound off' : 'Sound on'}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex rounded-t-md overflow-hidden">
              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex-1 py-2 px-4 text-center font-medium text-sm transition-colors ${
                  activeTab === 'rewards'
                    ? 'bg-violet-700 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Rewards
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 py-2 px-4 text-center font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-violet-700 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Top 50
              </button>
            </div>

            <div className="rounded-b-md">
              {activeTab === 'rewards' ? (
                <SolanaRewards />
              ) : (
                <Leaderboard />
              )}
            </div>
          </div>

          {/* Desktop pause/start controls */}
          <div className="hidden md:block">
            {gameStarted && !gameOver && (
              <button
                onClick={handlePause}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200"
              >
                {isPaused ? 'Resume Game' : 'Pause Game'}
              </button>
            )}

            {!gameStarted || gameOver ? (
              <button
                onClick={handleStartGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200"
              >
                {gameOver ? 'Play Again' : 'Start Game'}
              </button>
            ) : null}
          </div>

          {/* Mobile controls */}
          {gameStarted && !gameOver && !isPaused ? (
            <TouchControls
              onMoveLeft={() => handleMove('left')}
              onMoveRight={() => handleMove('right')}
              onMoveDown={handleMoveDown}
              onRotate={handleRotate}
              onHardDrop={handleDrop}
              onHold={handleHoldPiece}
              onPause={handlePause}
            />
          ) : (
            <div className="md:hidden mt-4">
              <button
                onClick={gameOver ? handleStartGame : (isPaused ? handlePause : handleStartGame)}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                {gameOver ? 'Play Again' : (isPaused ? 'Resume Game' : 'Start Game')}
              </button>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-800 border border-violet-500 rounded-md text-center">
            <div className="text-sm text-purple-300 font-medium">
              Powered by
            </div>
            <div className="flex items-center justify-center mt-1">
              <a
                href="https://www.x.com/pasterblocks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-bold hover:text-blue-300 transition-colors"
              >
                @pasterblocks
              </a>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Deployed on
              <a
                href="https://www.x.com/BelieveApp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 font-medium hover:text-purple-300 transition-colors ml-1"
              >
                @BelieveApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
