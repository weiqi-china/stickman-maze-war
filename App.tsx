import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CellType, Direction, GameStatus, Position, Enemy, EnemyBehavior, Skin } from './types';
import { getLevelConfig, SKINS, STUCK_TIMEOUT_MS } from './constants';
import { generateMaze } from './services/mazeGenerator';
import { audioService } from './services/audioService';
import { useSwipe } from './hooks/useSwipe';
import { GameBoard } from './components/GameBoard';
import { LevelSelector } from './components/LevelSelector';
import { RotateCcw, Menu, ArrowRight, AlertTriangle, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // --- Persistent State ---
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('stickman_maze_unlocked');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedSkin, setSelectedSkin] = useState<Skin>(SKINS[0]);

  // --- Game State ---
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [startPos, setStartPos] = useState<Position>({ x: 1, y: 1 });
  const [endPos, setEndPos] = useState<Position>({ x: 1, y: 1 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Logic helpers
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [stuckWarning, setStuckWarning] = useState(false);
  const stuckTimerRef = useRef<number | null>(null);
  
  // --- Refs for Game Loop ---
  const enemyMoveTimerRef = useRef<number | null>(null);
  const enemiesRef = useRef<Enemy[]>([]); // Ref to access current enemies inside intervals
  
  // Track player pos in ref for AI to access current pos without effect dependency
  const playerPosRef = useRef(playerPos);
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('stickman_maze_unlocked', unlockedLevel.toString());
  }, [unlockedLevel]);

  // --- Save Management ---
  const handleResetProgress = () => {
    setUnlockedLevel(1);
    setSelectedSkin(SKINS[0]);
    localStorage.removeItem('stickman_maze_unlocked');
  };

  const handleImportSave = (dataString: string): boolean => {
    try {
      const decoded = atob(dataString);
      const data = JSON.parse(decoded);
      if (typeof data.l === 'number' && data.l > 0) {
        setUnlockedLevel(data.l);
        return true;
      }
    } catch (e) {
      console.error("Invalid save code");
    }
    return false;
  };

  // --- Audio Logic ---
  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const initAudioIfNeeded = () => {
    audioService.init();
    if (!isMuted) audioService.startMusic();
  };

  // --- Game Logic: Start Level ---
  const startLevel = useCallback((level: number) => {
    const config = getLevelConfig(level);
    const { grid: newGrid, start, end } = generateMaze(config.gridSize, config.gridSize);

    setGrid(newGrid);
    setStartPos(start);
    setEndPos(end);
    setPlayerPos(start);
    setCurrentLevel(level);
    setLastMoveTime(Date.now());
    setStuckWarning(false);
    setStatus(GameStatus.PLAYING);

    // Init Audio
    initAudioIfNeeded();

    // Spawn Enemies
    const newEnemies: Enemy[] = [];
    const validSpawns: Position[] = [];

    // Find valid spawn points (path, not start/end, not too close to start)
    for (let y = 1; y < config.gridSize - 1; y++) {
      for (let x = 1; x < config.gridSize - 1; x++) {
        if (newGrid[y][x] === CellType.PATH && (x !== start.x || y !== start.y)) {
           // Simple distance check
           if (Math.abs(x - start.x) + Math.abs(y - start.y) > 5) {
             validSpawns.push({ x, y });
           }
        }
      }
    }

    // Shuffle spawns
    validSpawns.sort(() => Math.random() - 0.5);

    for (let i = 0; i < config.enemyCount; i++) {
      if (validSpawns.length > 0) {
        const spawn = validSpawns.pop()!;
        newEnemies.push({
          id: i,
          position: spawn,
          behavior: config.enemyBehavior,
          direction: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT][Math.floor(Math.random() * 4)],
          speedTick: config.enemySpeed
        });
      }
    }
    
    setEnemies(newEnemies);
    enemiesRef.current = newEnemies;
  }, [isMuted]);

  // --- Game Logic: Player Movement ---
  const movePlayer = useCallback((dir: Direction) => {
    if (status !== GameStatus.PLAYING) return;
    
    // Ensure audio context is running on first interaction
    audioService.init();

    setPlayerPos((prev) => {
      let nextX = prev.x;
      let nextY = prev.y;

      switch (dir) {
        case Direction.UP: nextY--; break;
        case Direction.DOWN: nextY++; break;
        case Direction.LEFT: nextX--; break;
        case Direction.RIGHT: nextX++; break;
      }

      // Check bounds & walls
      if (
        nextY >= 0 && nextY < grid.length &&
        nextX >= 0 && nextX < grid[0].length &&
        grid[nextY][nextX] !== CellType.WALL
      ) {
        // Reset stuck timer
        setLastMoveTime(Date.now());
        setStuckWarning(false);
        audioService.playMove(); // SFX
        
        // Check win
        if (nextX === endPos.x && nextY === endPos.y) {
          handleWin();
        }
        
        return { x: nextX, y: nextY };
      }
      return prev;
    });
  }, [status, grid, endPos]);

  // --- Game Logic: Win/Lose ---
  const handleWin = () => {
    setStatus(GameStatus.WON);
    audioService.playWin();
    if (currentLevel >= unlockedLevel) {
      setUnlockedLevel(prev => prev + 1);
    }
  };

  const handleLose = (reason: 'CAUGHT' | 'STUCK') => {
    setStatus(GameStatus.LOST);
    audioService.playLose();
    if (reason === 'STUCK') {
        setStuckWarning(true); // Ensure message shows
    }
  };

  // --- Game Logic: Check Collisions ---
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    // Check collision with any enemy
    const collision = enemies.some(e => e.position.x === playerPos.x && e.position.y === playerPos.y);
    if (collision) {
      handleLose('CAUGHT');
    }
  }, [playerPos, enemies, status]);

  // --- Game Logic: Stuck Detection ---
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const interval = setInterval(() => {
        const now = Date.now();
        // Warn at 7 seconds, fail at 10
        if (now - lastMoveTime > STUCK_TIMEOUT_MS) {
            handleLose('STUCK');
        } else if (now - lastMoveTime > STUCK_TIMEOUT_MS - 3000) {
            setStuckWarning(true);
        }
    }, 1000);
    stuckTimerRef.current = interval;

    return () => clearInterval(interval);
  }, [status, lastMoveTime]);


  // --- Game Logic: Enemy AI Loop ---
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const config = getLevelConfig(currentLevel);

    // Helpers
    const getOpposite = (d: Direction) => {
        if (d === Direction.UP) return Direction.DOWN;
        if (d === Direction.DOWN) return Direction.UP;
        if (d === Direction.LEFT) return Direction.RIGHT;
        return Direction.LEFT;
    };
    
    const isValid = (x: number, y: number) => 
        x >= 0 && x < grid[0].length && y >= 0 && y < grid.length && grid[y][x] !== CellType.WALL;

    const getDeltas = (d: Direction) => {
        if (d === Direction.UP) return { x: 0, y: -1 };
        if (d === Direction.DOWN) return { x: 0, y: 1 };
        if (d === Direction.LEFT) return { x: -1, y: 0 };
        return { x: 1, y: 0 };
    }

    const moveEnemies = () => {
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          let nextPos = { ...enemy.position };
          let newDir = enemy.direction;

          // AI Logic
          if (enemy.behavior === EnemyBehavior.PATROL) {
             const delta = getDeltas(newDir);
             
             if (isValid(nextPos.x + delta.x, nextPos.y + delta.y)) {
                // Continue Patrol
                nextPos.x += delta.x;
                nextPos.y += delta.y;
             } else {
                // Hit wall -> Bounce immediately
                const opposite = getOpposite(newDir);
                newDir = opposite;
                
                // Try moving in new direction immediately to avoid "pause"
                const newDelta = getDeltas(opposite);
                if (isValid(nextPos.x + newDelta.x, nextPos.y + newDelta.y)) {
                    nextPos.x += newDelta.x;
                    nextPos.y += newDelta.y;
                } else {
                    // If stuck even after bounce (dead end), try other directions
                    const alts = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
                    for(const alt of alts) {
                        const d = getDeltas(alt);
                        if(isValid(nextPos.x + d.x, nextPos.y + d.y)){
                            nextPos.x += d.x;
                            nextPos.y += d.y;
                            newDir = alt;
                            break;
                        }
                    }
                }
             }
          } 
          else if (enemy.behavior === EnemyBehavior.RANDOM) {
             const moves = [
                { d: Direction.UP, x: 0, y: -1 },
                { d: Direction.DOWN, x: 0, y: 1 },
                { d: Direction.LEFT, x: -1, y: 0 },
                { d: Direction.RIGHT, x: 1, y: 0 },
             ];
             const validMoves = moves.filter(m => isValid(nextPos.x + m.x, nextPos.y + m.y));
             
             if (validMoves.length > 0) {
                 // Bias towards NOT turning 180 degrees immediately if possible
                 const forwardMoves = validMoves.filter(m => m.d !== getOpposite(enemy.direction));
                 const selection = forwardMoves.length > 0 && Math.random() > 0.2 
                    ? forwardMoves[Math.floor(Math.random() * forwardMoves.length)] 
                    : validMoves[Math.floor(Math.random() * validMoves.length)];
                 
                 nextPos.x += selection.x;
                 nextPos.y += selection.y;
                 newDir = selection.d;
             }
          }
          else if (enemy.behavior === EnemyBehavior.CHASE) {
              const target = playerPosRef.current;
              
              // 20% Chance to be "confused" or just move randomly (prevents perfect camping)
              if (Math.random() < 0.2) {
                   const moves = [
                        { d: Direction.UP, x: 0, y: -1 },
                        { d: Direction.DOWN, x: 0, y: 1 },
                        { d: Direction.LEFT, x: -1, y: 0 },
                        { d: Direction.RIGHT, x: 1, y: 0 },
                    ].filter(m => isValid(nextPos.x + m.x, nextPos.y + m.y));
                    if (moves.length > 0) {
                        const m = moves[Math.floor(Math.random() * moves.length)];
                        return { ...enemy, position: {x: nextPos.x + m.x, y: nextPos.y + m.y}, direction: m.d };
                    }
              }

              const dx = target.x - enemy.position.x;
              const dy = target.y - enemy.position.y;
              
              const moves = [];
              if (Math.abs(dx) > Math.abs(dy)) {
                  moves.push(dx > 0 ? {d: Direction.RIGHT, x:1, y:0} : {d: Direction.LEFT, x:-1, y:0});
                  moves.push(dy > 0 ? {d: Direction.DOWN, x:0, y:1} : {d: Direction.UP, x:0, y:-1});
              } else {
                  moves.push(dy > 0 ? {d: Direction.DOWN, x:0, y:1} : {d: Direction.UP, x:0, y:-1});
                  moves.push(dx > 0 ? {d: Direction.RIGHT, x:1, y:0} : {d: Direction.LEFT, x:-1, y:0});
              }
              
              [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT].forEach(d => {
                  const delta = getDeltas(d);
                  moves.push({d, x: delta.x, y: delta.y});
              });
              
              for(const m of moves) {
                  if(isValid(nextPos.x + m.x, nextPos.y + m.y)) {
                      nextPos.x += m.x;
                      nextPos.y += m.y;
                      newDir = m.d;
                      break; 
                  }
              }
          }

          return { ...enemy, position: nextPos, direction: newDir };
        });
      });
    };

    enemyMoveTimerRef.current = setInterval(moveEnemies, config.enemySpeed);

    return () => {
      if (enemyMoveTimerRef.current) clearInterval(enemyMoveTimerRef.current);
    };
  }, [status, currentLevel, grid]);

  // --- Input Handlers ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': movePlayer(Direction.UP); break;
      case 'ArrowDown': movePlayer(Direction.DOWN); break;
      case 'ArrowLeft': movePlayer(Direction.LEFT); break;
      case 'ArrowRight': movePlayer(Direction.RIGHT); break;
      case ' ': 
        if(status === GameStatus.PLAYING) startLevel(currentLevel); 
        break;
    }
  }, [movePlayer, status, startLevel, currentLevel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const swipeHandlers = useSwipe({ onSwipe: movePlayer });

  // --- Render ---

  if (status === GameStatus.MENU) {
    return (
      <div className="h-screen w-full bg-[#1a2e05] flex flex-col justify-center items-center">
        <LevelSelector 
          unlockedLevel={unlockedLevel}
          selectedSkin={selectedSkin}
          onSelectLevel={startLevel}
          onSelectSkin={setSelectedSkin}
          onResetProgress={handleResetProgress}
          onImportSave={handleImportSave}
        />
        {/* Simple Audio Toggle on Menu */}
        <button onClick={toggleMute} className="mt-8 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-full bg-[#1a2e05] flex flex-col items-center justify-center overflow-hidden touch-none"
      {...swipeHandlers}
    >
      {/* Header */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-transparent z-10 pointer-events-none">
        <button onClick={() => setStatus(GameStatus.MENU)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white pointer-events-auto transition-transform active:scale-90">
          <Menu size={24} className="text-green-900" />
        </button>
        <div className="px-6 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg">
          <div className="text-xl font-black text-green-900">LEVEL {currentLevel}</div>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
             <button onClick={toggleMute} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-transform active:scale-90 text-green-900">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <button onClick={() => startLevel(currentLevel)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-transform active:scale-90 text-green-900">
              <RotateCcw size={24} />
            </button>
        </div>
      </div>

      {/* Warning Overlay */}
      {stuckWarning && status === GameStatus.PLAYING && (
         <div className="absolute top-24 bg-red-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse z-20 shadow-xl border-2 border-white">
           <AlertTriangle size={20} /> RUN! {Math.max(0, 10 - Math.floor((Date.now() - lastMoveTime)/1000))}s
         </div>
      )}

      {/* Game Board */}
      <div className="p-4 flex-1 flex items-center justify-center w-full max-h-[85vh]">
         <GameBoard 
            grid={grid}
            playerPos={playerPos}
            enemies={enemies}
            playerSkin={selectedSkin}
            status={status}
            startPos={startPos}
            endPos={endPos}
         />
      </div>

      {/* Mobile Controls Hint */}
      <div className="absolute bottom-8 text-white/50 text-sm font-bold tracking-widest uppercase animate-pulse pointer-events-none">
        Swipe to escape
      </div>

      {/* Overlays: Win/Lose */}
      {(status === GameStatus.WON || status === GameStatus.LOST) && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100 ring-4 ring-white/20">
            {status === GameStatus.WON ? (
              <>
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ArrowRight size={40} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">ESCAPED!</h2>
                <p className="text-gray-500 mb-8 font-medium">Level {currentLevel} Complete</p>
                <button 
                  onClick={() => startLevel(currentLevel + 1)}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 active:scale-95 transition-all mb-3 shadow-lg shadow-green-200"
                >
                  NEXT LEVEL
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  {stuckWarning && (Date.now() - lastMoveTime > STUCK_TIMEOUT_MS) ? <AlertTriangle size={40} /> : <div className="text-5xl">👮</div>}
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">BUSTED!</h2>
                <p className="text-gray-500 mb-8 font-medium">
                    {stuckWarning && (Date.now() - lastMoveTime > STUCK_TIMEOUT_MS) ? "Don't stop running!" : "The police caught you."}
                </p>
                <button 
                  onClick={() => startLevel(currentLevel)}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-700 active:scale-95 transition-all mb-3 shadow-lg shadow-red-200"
                >
                  TRY AGAIN
                </button>
              </>
            )}
            <button 
              onClick={() => setStatus(GameStatus.MENU)}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}