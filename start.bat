@echo off
echo ========================================================
echo  SETU: Self-Healing Supply Chain Platform
echo ========================================================
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
call npm run dev
pause
