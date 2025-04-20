@echo off
REM ───────────────────────────────────────────────────────────
REM  MiSTer 2nd‑Screen: install deps, build web, package desktop
REM ───────────────────────────────────────────────────────────

call npm install --legacy-peer-deps
call npm run build
call npm run build:electron

pause
