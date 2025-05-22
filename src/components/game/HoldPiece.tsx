import React, { type FC } from 'react';
import type { TetrominoType } from '../../utils/constants';

interface HoldPieceProps {
  tetromino: { type: TetrominoType, shape: number[][] } | null;
  isHoldUsed: boolean;
}

export const HoldPiece: FC<HoldPieceProps> = ({ tetromino, isHoldUsed }) => {
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

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 border border-violet-500 rounded-md shadow-[0_0_10px_rgba(124,58,237,0.7)]">
      <h3 className="text-lg font-bold text-purple-300">Hold</h3>

      <div className="grid grid-cols-4 gap-1 justify-center bg-gray-900 p-3 rounded-md">
        {isHoldUsed && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
            <span className="text-yellow-500 font-bold text-sm">Used</span>
          </div>
        )}

        {tetromino ? (
          // If there's a held tetromino, display it
          Array.from({ length: 4 }).map((_, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {Array.from({ length: 4 }).map((_, cellIndex) => {
                // Check if the current cell is part of the tetromino shape
                const isFilledCell =
                  rowIndex < tetromino.shape.length &&
                  cellIndex < tetromino.shape[0].length &&
                  tetromino.shape[rowIndex][cellIndex] !== 0;

                const colorClass = tetromino ? tetrominoColors[tetromino.type] : '';

                return (
                  <div
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className={`w-6 h-6 border ${
                      isFilledCell
                        ? `${colorClass} border-opacity-70 shadow-glow ${isHoldUsed ? 'opacity-50' : 'animate-pulse-slow'}`
                        : 'border-gray-700 bg-transparent'
                    } rounded-sm transition-all duration-200`}
                  />
                );
              })}
            </React.Fragment>
          ))
        ) : (
          // If there's no held tetromino, display an empty grid
          Array.from({ length: 4 }).map((_, rowIndex) => (
            <React.Fragment key={`empty-row-${rowIndex}`}>
              {Array.from({ length: 4 }).map((_, cellIndex) => (
                <div
                  key={`empty-cell-${rowIndex}-${cellIndex}`}
                  className="w-6 h-6 border border-gray-700 bg-transparent rounded-sm"
                />
              ))}
            </React.Fragment>
          ))
        )}
      </div>

      <div className="text-xs text-center text-gray-400 mt-1">Press H to hold</div>
    </div>
  );
};
