import React, { type FC } from 'react';
import type { TetrominoType } from '../../utils/constants';

interface NextTetrominoProps {
  tetromino: { type: TetrominoType, shape: number[][] } | null;
  hideTitle?: boolean;
}

export const NextTetromino: FC<NextTetrominoProps> = ({ tetromino, hideTitle = false }) => {
  if (!tetromino) {
    return null;
  }

  const { type, shape } = tetromino;

  // Colors based on tetromino type
  const tetrominoColors: Record<TetrominoType, string> = {
    I: 'bg-cyan-500 border-cyan-300',
    J: 'bg-blue-500 border-blue-300',
    L: 'bg-orange-500 border-orange-300',
    O: 'bg-yellow-500 border-yellow-300',
    S: 'bg-green-500 border-green-300',
    T: 'bg-purple-500 border-purple-300',
    Z: 'bg-red-500 border-red-300'
  };

  // Get the color based on the tetromino type
  const colorClass = tetrominoColors[type];

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 border border-violet-500 rounded-md shadow-[0_0_10px_rgba(124,58,237,0.7)]">
      {!hideTitle && <h3 className="text-lg font-bold text-purple-300">Next Piece</h3>}

      <div className="grid grid-cols-4 gap-1 justify-center bg-gray-900 p-3 rounded-md">
        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {Array.from({ length: 4 }).map((_, cellIndex) => {
              // Check if the current cell is part of the tetromino shape
              const isFilledCell =
                rowIndex < shape.length &&
                cellIndex < shape[0].length &&
                shape[rowIndex][cellIndex] !== 0;

              return (
                <div
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className={`w-6 h-6 border ${
                    isFilledCell
                      ? `${colorClass} border-opacity-70 shadow-glow animate-pulse-slow`
                      : 'border-gray-700 bg-transparent'
                  } rounded-sm transition-all duration-200`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
