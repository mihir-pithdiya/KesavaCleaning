@echo off
setlocal
title KesavaCleaning Storefront Launcher
cd /d "%~dp0"

echo ===================================================================
echo             KESAVA CLEANING - PURE LIQUID FORMULATIONS
echo ===================================================================
echo  1. Launch React + Vite Storefront (Accessible on Phone and Laptop)
echo  2. Open Standalone HTML Storefront (Zero-Dependency Direct Browser)
echo  3. Launch Python Full-Stack Backend
echo ===================================================================

set /p choice="Enter your choice (1, 2, or 3) [Default: 1]: "
if "%choice%"=="" set choice=1

if "%choice%"=="1" (
  echo.
  echo Starting Vite Dev Server on http://localhost:5173 and your local network...
  echo Share the Network IP shown below with your phone and other laptops!
  npm run dev
  goto end
)

if "%choice%"=="2" (
  echo.
  echo Opening kesavacleaning_standalone.html directly in your default browser...
  start "" "kesavacleaning_standalone.html"
  goto end
)

if "%choice%"=="3" (
  echo.
  echo Starting Python Full-Stack Backend...
  python run.py
  goto end
)

:end
pause
