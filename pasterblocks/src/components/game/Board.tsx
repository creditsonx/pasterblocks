import type React from 'react';
import { Cell } from './Cell';
import { BOARD_WIDTH, BOARD_HEIGHT, type BoardCell } from '../../utils/constants';

interface BoardProps {
  board: BoardCell[][];
}

export const Board: React.FC<BoardProps> = ({ board }) => {
  // Generate unique IDs for rows based on their content
  const getRowKey = (row: BoardCell[], index: number): string => {
    // Create a string representation of the row combined with the index
    const rowContent = row.map(cell => cell || 'empty').join('-');
    return `row-${index}-${rowContent}`;
  };

  // Generate unique IDs for cells based on their position and content
  const getCellKey = (cell: BoardCell, rowIndex: number, colIndex: number): string => {
    return `cell-${rowIndex}-${colIndex}-${cell || 'empty'}`;
  };

  return (
    <div className="grid gap-[1px] bg-gray-800 p-1 border-2 border-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.7)]">
      {board.map((row, rowIndex) => (
        <div key={getRowKey(row, rowIndex)} className="flex">
          {row.map((cell, colIndex) => (
            <Cell key={getCellKey(cell, rowIndex, colIndex)} type={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};
