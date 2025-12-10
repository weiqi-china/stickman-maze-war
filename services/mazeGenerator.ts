import { CellType, Position } from '../types';

export const generateMaze = (width: number, height: number): { grid: CellType[][], start: Position, end: Position } => {
  // Initialize grid with walls
  const grid: CellType[][] = Array(height).fill(null).map(() => Array(width).fill(CellType.WALL));

  // Helper to check bounds
  const isValid = (x: number, y: number) => x > 0 && x < width - 1 && y > 0 && y < height - 1;

  // Directions: Up, Right, Down, Left (move 2 steps to skip walls)
  const directions = [
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 }
  ];

  // Shuffle array helper
  const shuffle = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  // DFS Recursive Backtracker
  const carve = (x: number, y: number) => {
    grid[y][x] = CellType.PATH;

    const dirs = shuffle([...directions]);

    for (const dir of dirs) {
      const nx = x + dir.x;
      const ny = y + dir.y;

      if (isValid(nx, ny) && grid[ny][nx] === CellType.WALL) {
        // Carve the wall between current and next
        grid[y + dir.y / 2][x + dir.x / 2] = CellType.PATH;
        carve(nx, ny);
      }
    }
  };

  // Start carving from top-left (1,1)
  const start: Position = { x: 1, y: 1 };
  carve(start.x, start.y);

  // Set End point at bottom-right
  // Find a valid path cell near the bottom right
  let end: Position = { x: width - 2, y: height - 2 };
  
  // Ensure end is on a path (it should be with this algorithm, but just safety)
  if (grid[end.y][end.x] === CellType.WALL) {
      grid[end.y][end.x] = CellType.PATH;
      // Connect it if isolated (rare edge case with odd dimensions)
      if (grid[end.y][end.x - 1] === CellType.WALL && grid[end.y - 1][end.x] === CellType.WALL) {
        grid[end.y][end.x - 1] = CellType.PATH;
      }
  }

  // Mark start and end
  grid[start.y][start.x] = CellType.START;
  grid[end.y][end.x] = CellType.END;

  // For higher complexity (simulating loops or open areas), randomly remove some walls
  // This helps prevent "only one path" frustration in higher levels
  const removeWallChance = 0.05; // 5% chance to remove a wall
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === CellType.WALL && Math.random() < removeWallChance) {
        // Only remove if it connects two paths (don't make massive open squares)
        let pathNeighbors = 0;
        if (grid[y - 1][x] !== CellType.WALL) pathNeighbors++;
        if (grid[y + 1][x] !== CellType.WALL) pathNeighbors++;
        if (grid[y][x - 1] !== CellType.WALL) pathNeighbors++;
        if (grid[y][x + 1] !== CellType.WALL) pathNeighbors++;
        
        if (pathNeighbors >= 2) {
             grid[y][x] = CellType.PATH;
        }
      }
    }
  }

  return { grid, start, end };
};
