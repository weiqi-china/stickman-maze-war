import React, { useMemo } from 'react';
import { CellType, Position, Enemy, Skin } from '../types';
import { Stickman } from './Stickman';
import { Pet } from './Pet';
import { Lock, DoorOpen, MapPin, Skull } from 'lucide-react';

interface GameBoardProps {
  grid: CellType[][];
  playerPos: Position;
  enemies: Enemy[];
  playerSkin: Skin;
  status: string; // "PLAYING" | "WON" | "LOST"
  startPos: Position;
  endPos: Position;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  grid, 
  playerPos, 
  enemies, 
  playerSkin, 
  status,
  startPos,
  endPos
}) => {
  const height = grid.length;
  const width = grid[0]?.length || 0;
  
  return (
    <div 
      className="relative shadow-2xl rounded-lg overflow-hidden ring-8 ring-gray-800 bg-gray-900"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
        aspectRatio: `${width}/${height}`,
        width: '100%',
        maxWidth: '600px',
      }}
    >
      {grid.map((row, y) => (
        row.map((cell, x) => {
          const isPlayer = playerPos.x === x && playerPos.y === y;
          const isEnemy = enemies.find(e => e.position.x === x && e.position.y === y);
          const isEnd = x === endPos.x && y === endPos.y;
          const isStart = x === startPos.x && y === startPos.y;
          
          let content = null;

          if (isPlayer) {
             content = (
                <div className={`w-full h-full p-0.5 z-20 relative transition-transform duration-100 ${status === 'LOST' ? 'scale-0 opacity-50' : 'scale-110'}`}>
                  <Stickman color={playerSkin.color} />
                  {/* The Little Character (Pet) */}
                  {/* Positioned absolute relative to player cell, but with a slight delay visual hack using transition */}
                  <div className="absolute -top-3 -right-3 w-3/4 h-3/4 pointer-events-none transition-all duration-300 ease-out delay-75">
                    <Pet />
                  </div>
                </div>
             );
          } else if (isEnemy) {
             content = (
               <div className={`w-full h-full p-0.5 z-20 relative transition-transform duration-300 ${status === 'LOST' && isEnemy.position.x === playerPos.x && isEnemy.position.y === playerPos.y ? 'animate-pulse scale-125' : ''}`}>
                 <Stickman color="#2563eb" isPolice />
               </div>
             );
          } else if (isEnd) {
             content = (
               <div className="w-full h-full flex items-center justify-center p-0.5 z-10 relative">
                 <div className="w-full h-full bg-black/20 rounded-full absolute bottom-0 scale-x-75 h-2 blur-[1px]"></div>
                 <DoorOpen className="w-full h-full text-yellow-900 drop-shadow-md relative z-10" />
               </div>
             );
          } else if (isStart) {
             content = <MapPin className="w-full h-full text-white/50 p-1 z-10" />;
          }

          return (
            <div 
              key={`${x}-${y}`} 
              className={`
                relative flex items-center justify-center
                ${cell === CellType.WALL ? 'bg-brick wall-3d z-10' : 'bg-grass'}
              `}
            >
                {content}
            </div>
          );
        })
      ))}
    </div>
  );
};