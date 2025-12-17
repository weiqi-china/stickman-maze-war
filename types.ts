
export type Position = {
  x: number;
  y: number;
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum CellType {
  WALL = 0,
  PATH = 1,
  START = 2,
  END = 3,
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
}

export enum EnemyBehavior {
  PATROL = 'PATROL', // Moves back and forth
  RANDOM = 'RANDOM', // Moves randomly
  CHASE = 'CHASE',   // Moves towards player if aligned
}

export interface Enemy {
  id: number;
  position: Position;
  behavior: EnemyBehavior;
  direction: Direction; // Current moving direction for PATROL
  speedTick: number; // Movement speed multiplier
  stunnedUntil?: number; // Timestamp when stun ends
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  unlockLevel: number;
}

export interface LevelConfig {
  level: number;
  gridSize: number; // Odd numbers only for maze generation (e.g. 15, 21, 25)
  enemyCount: number;
  enemyBehavior: EnemyBehavior;
  enemySpeed: number; // ms per move (lower is faster)
}

// --- New Item Types ---

export enum ItemType {
  NONE = 'NONE',
  DOOR = 'DOOR',       // Anywhere Door
  SHURIKEN = 'SHURIKEN', // Ninja Star
}

export interface Flower {
  id: number;
  position: Position;
}

export interface Portal {
  id: string;
  posA: Position;
  posB: Position;
  createdAt: number;
  expiresAt: number;
}

export interface Projectile {
  id: number;
  position: Position;
  direction: Direction;
  active: boolean;
}
