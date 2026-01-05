@echo off
echo ========================================
echo   AGRI-AI SERVER STARTUP
echo ========================================
echo.
echo Starting server on port 5000...
echo.
echo IMPORTANT: After starting, check console for:
echo   - "Crop routes loaded successfully"
echo   - "GET /api/crops" in the endpoints list
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d %~dp0
npm start

pause

