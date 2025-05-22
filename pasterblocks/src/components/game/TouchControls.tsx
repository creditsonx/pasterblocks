import React, { type FC } from 'react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onPause: () => void;
}

export const TouchControls: FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onHold,
  onPause
}) => {
  return (
    <div className="md:hidden w-full mt-4">
      <div className="grid grid-cols-7 gap-2">
        {/* Top row */}
        <button
          onClick={onHold}
          className="col-span-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold p-2 rounded-lg"
          aria-label="Hold"
        >
          Hold
        </button>

        <button
          onClick={onRotate}
          className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-lg flex justify-center items-center"
          aria-label="Rotate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>

        <button
          onClick={onHardDrop}
          className="col-span-2 bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-lg"
          aria-label="Hard Drop"
        >
          Drop
        </button>

        {/* Bottom row */}
        <button
          onClick={onMoveLeft}
          className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold p-3 rounded-lg flex justify-center items-center"
          aria-label="Move Left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          onClick={onMoveDown}
          className="col-span-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold p-3 rounded-lg flex justify-center items-center"
          aria-label="Move Down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <button
          onClick={onMoveRight}
          className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold p-3 rounded-lg flex justify-center items-center"
          aria-label="Move Right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="mt-2">
        <button
          onClick={onPause}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          aria-label="Pause"
        >
          Pause
        </button>
      </div>
    </div>
  );
};
