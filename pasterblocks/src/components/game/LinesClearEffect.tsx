import type React from 'react';
import { type FC, useState, useEffect, useRef } from 'react'
import { Particles } from './Particles';

interface LinesClearEffectProps {
  lines: number;
  count: number;
  isTetrominoLocked: boolean;
  boardRef: React.RefObject<HTMLDivElement>;
}

export const LinesClearEffect: FC<LinesClearEffectProps> = ({
  lines,
  count,
  isTetrominoLocked,
  boardRef
}) => {
  const [showParticles, setShowParticles] = useState(false);
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });
  const prevLinesRef = useRef(lines);
  const prevIsTetrominoLockedRef = useRef(isTetrominoLocked);

  // Calculate the center of the board for positioning particles
  useEffect(() => {
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      setParticlePosition({
        x: boardRect.left + boardRect.width / 2,
        y: boardRect.top + boardRect.height / 2
      });
    }
  }, [boardRef]);

  // Trigger particle effects when lines are cleared
  useEffect(() => {
    // Check if lines count increased and a tetromino was just locked
    if (lines > prevLinesRef.current && isTetrominoLocked && !prevIsTetrominoLockedRef.current) {
      setShowParticles(true);

      // Reset the trigger after a brief delay
      const timer = setTimeout(() => {
        setShowParticles(false);
      }, 100);

      return () => clearTimeout(timer);
    }

    prevLinesRef.current = lines;
    prevIsTetrominoLockedRef.current = isTetrominoLocked;
  }, [lines, isTetrominoLocked]);

  return (
    <>
      <Particles
        trigger={showParticles}
        count={count}
        duration={1500}
        x={particlePosition.x}
        y={particlePosition.y}
        colors={['#A78BFA', '#818CF8', '#38BDF8', '#FB7185', '#F472B6']}
      />
    </>
  );
};
