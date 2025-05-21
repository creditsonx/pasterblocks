import type React from 'react';
import type { BoardCell } from '../../utils/constants';

interface CellProps {
  type: BoardCell;
}

export const Cell: React.FC<CellProps> = ({ type }) => {
  // If there is no type, return an empty cell
  if (!type) {
    return <div className="w-6 h-6 bg-gray-900 border border-gray-800" />;
  }

  // Color mapping based on tetromino type (will match our neon theme)
  const colorMap: Record<string, string> = {
    I: 'bg-cyan-500 border-cyan-300 shadow-[0_0_5px_rgba(6,182,212,0.7)]',
    J: 'bg-blue-500 border-blue-300 shadow-[0_0_5px_rgba(59,130,246,0.7)]',
    L: 'bg-orange-500 border-orange-300 shadow-[0_0_5px_rgba(249,115,22,0.7)]',
    O: 'bg-yellow-500 border-yellow-300 shadow-[0_0_5px_rgba(234,179,8,0.7)]',
    S: 'bg-green-500 border-green-300 shadow-[0_0_5px_rgba(34,197,94,0.7)]',
    T: 'bg-purple-500 border-purple-300 shadow-[0_0_5px_rgba(168,85,247,0.7)]',
    Z: 'bg-pink-500 border-pink-300 shadow-[0_0_5px_rgba(236,72,153,0.7)]',
    ghost: 'bg-gray-700 border-gray-500 opacity-30',
  };

  const cellClass = `w-6 h-6 border ${colorMap[type] || 'bg-gray-500'}`;

  return <div className={cellClass} />;
};
