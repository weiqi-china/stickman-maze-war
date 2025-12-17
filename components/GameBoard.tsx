import React, { useMemo } from 'react';
import { CellType, Position, Enemy, Skin, Flower, Portal, Projectile, ItemType } from '../types';
import { Stickman } from './Stickman';
import { Pet } from './Pet';
import { Lock, DoorOpen, MapPin, Skull, Flower as FlowerIcon, Disc } from 'lucide-react';

interface GameBoardProps {
  grid: CellType[][];
  playerPos: Position;
  enemies: Enemy[];
  flowers: Flower[];
  portal: Portal | null;
  projectiles: Projectile[];
  playerSkin: Skin;
  heldItem: ItemType;
  status: string; // "PLAYING" | "WON" | "LOST"
  startPos: Position;
  endPos: Position;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  grid, 
  playerPos, 
  enemies, 
  flowers,
  portal,
  projectiles,
  playerSkin, 
  heldItem,
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
          const isFlower = flowers.find(f => f.position.x === x && f.position.y === y);
          const isPortalA = portal && portal.posA.x === x && portal.posA.y === y;
          const isPortalB = portal && portal.posB.x === x && portal.posB.y === y;
          const projectile = projectiles.find(p => p.position.x === x && p.position.y === y);
          
          const isEnd = x === endPos.x && y === endPos.y;
          const isStart = x === startPos.x && y === startPos.y;
          
          let content = null;

          // Priority: Player > Enemy > Projectile > Portal > Flower > Start/End
          
          if (isPlayer) {
             content = (
                <div className={`w-full h-full p-0.5 z-30 relative transition-transform duration-100 ${status === 'LOST' ? 'scale-0 opacity-50' : 'scale-110'}`}>
                  <Stickman color={playerSkin.color} />
                  <div className="absolute -top-3 -right-3 w-3/4 h-3/4 pointer-events-none transition-all duration-300 ease-out delay-75">
                    <Pet heldItem={heldItem} />
                  </div>
                </div>
             );
          } else if (isEnemy) {
             const isStunned = (isEnemy.stunnedUntil || 0) > Date.now();
             content = (
               <div className={`w-full h-full p-0.5 z-20 relative transition-transform duration-300 ${status === 'LOST' && isEnemy.position.x === playerPos.x && isEnemy.position.y === playerPos.y ? 'animate-pulse scale-125' : ''}`}>
                 <Stickman color="#2563eb" isPolice />
                 {isStunned && (
                    <div className="absolute inset-0 flex items-center justify-center animate-spin text-yellow-400">
                        <div className="w-full h-1 bg-yellow-400 rounded-full opacity-70"></div>
                    </div>
                 )}
               </div>
             );
          } else if (projectile) {
              content = (
                  <div className="w-full h-full z-20 flex items-center justify-center animate-spin">
                      <Disc className="text-yellow-400 w-full h-full drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                  </div>
              );
          } else if (isPortalA || isPortalB) {
              content = (
                  <div className="w-full h-full z-10 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-50"></div>
                      <div className="w-3/4 h-3/4 bg-cyan-500/30 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_10px_cyan]">
                          <div className="w-1/2 h-1/2 bg-cyan-200 rounded-full animate-pulse"></div>
                      </div>
                  </div>
              );
          } else if (isFlower) {
              content = (
                  <div className="w-full h-full z-10 flex items-center justify-center p-1 animate-bounce">
                      <FlowerIcon className="text-pink-500 w-full h-full drop-shadow-md" fill="pink" />
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
