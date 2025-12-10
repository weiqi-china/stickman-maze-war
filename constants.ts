import { EnemyBehavior, LevelConfig, Skin } from './types';

export const SKINS: Skin[] = [
  { id: 'red', name: 'Classic Red', color: '#ef4444', unlockLevel: 0 },
  { id: 'blue', name: 'Cool Blue', color: '#3b82f6', unlockLevel: 0 },
  { id: 'yellow', name: 'Speedy Yellow', color: '#eab308', unlockLevel: 0 },
  { id: 'black', name: 'Ninja Black', color: '#171717', unlockLevel: 10 },
  { id: 'green', name: 'Neon Green', color: '#22c55e', unlockLevel: 20 },
  { id: 'camo', name: 'Camo', color: '#57534e', unlockLevel: 30 },
];

export const getLevelConfig = (level: number): LevelConfig => {
  // Base configuration
  let gridSize = 15;
  let enemyCount = 1;
  let enemyBehavior = EnemyBehavior.PATROL;
  let enemySpeed = 600;

  if (level <= 5) {
    gridSize = 15;
    enemyCount = 1;
    enemyBehavior = EnemyBehavior.PATROL;
    enemySpeed = 700;
  } else if (level <= 10) {
    gridSize = 19;
    enemyCount = 2 + Math.floor((level - 6) / 2); // 2 to 4
    enemyBehavior = EnemyBehavior.RANDOM;
    enemySpeed = 500;
  } else if (level <= 20) {
    gridSize = 21;
    enemyCount = 4 + Math.floor((level - 11) / 3);
    enemyBehavior = EnemyBehavior.CHASE;
    enemySpeed = 400;
  } else {
    gridSize = 25;
    enemyCount = 6 + Math.floor((level - 20) / 2);
    enemyBehavior = EnemyBehavior.CHASE;
    enemySpeed = 300;
  }

  return {
    level,
    gridSize,
    enemyCount,
    enemyBehavior,
    enemySpeed,
  };
};

export const STUCK_TIMEOUT_MS = 10000; // 10 seconds before declaring "stuck" failure
