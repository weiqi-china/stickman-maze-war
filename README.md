# Stickman Maze War

A stealth puzzle game where you control a stickman thief trying to escape mazes while avoiding the police.

## Features

- **Procedural Generation**: Endless variations of mazes with increasing difficulty.
- **Smart AI**: Police enemies with Patrol, Random, and Chase behaviors.
- **Progress System**: Unlockable skins and level progression.
- **Save/Load**: Export and import your progress via save codes.
- **Audio Engine**: Custom Web Audio API implementation for procedural background music and SFX.
- **Responsive Design**: Mobile-friendly swipe controls and desktop keyboard support.

## Project Structure

- `App.tsx`: Main game loop and state management.
- `components/`: UI components (GameBoard, LevelSelector, Stickman, etc.).
- `services/`: Core logic for Maze Generation and Audio.
- `hooks/`: Custom hooks like `useSwipe`.

## How to Deploy to GitHub

1. **Initialize Git**
   ```bash
   git init
   ```

2. **Add Files**
   ```bash
   git add .
   ```

3. **Commit**
   ```bash
   git commit -m "Initial commit"
   ```

4. **Push to GitHub**
   Create a new repository on GitHub, then run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/stickman-maze-war.git
   git branch -M main
   git push -u origin main
   ```
