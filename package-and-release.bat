@echo off
REM ───────────────────────────────────────────────────────────────
REM  MiSTer 2nd‑Screen: Install deps, build web, package desktop
REM  Just double‑click this file in Explorer
REM ───────────────────────────────────────────────────────────────

REM 1) Install all project dependencies (React, Vite, etc.)
npm install

REM 2) Ensure Electron & builder are present (adds to devDependencies)
npm install --save-dev electron electron-builder

REM 3) Build the React app into docs/ (for both web & desktop)
npm run build

REM 4) Package the desktop app into release/
npm run build:electron

REM 5) Done! Press any key to see output / close this window
pause
