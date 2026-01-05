# 🔧 Fix Port 5000 Already in Use Error

## The Problem
```
Error: listen EADDRINUSE: address already in use :::5000
```

This means another process is already using port 5000.

## ✅ Quick Fix (3 Options)

### Option 1: Kill Process on Port 5000 (Recommended)
**Windows:**
1. Double-click: `KILL_PORT_5000.bat`
   OR
2. Run in PowerShell:
   ```powershell
   # Find process
   netstat -ano | findstr :5000
   
   # Kill it (replace <PID> with the number from above)
   taskkill /PID <PID> /F
   ```

**Then restart server:**
```bash
cd agri/server
npm start
```

### Option 2: Use Different Port
```bash
# Set different port
set PORT=5001

# Then start server
cd agri/server
npm start
```

Update frontend API calls to use port 5001.

### Option 3: Find and Close the Other Server
- Check other terminal windows
- Close any other Node.js servers running
- Check Task Manager for `node.exe` processes

## ✅ What I Fixed:

1. **Better error handling** - Server now shows clear error message
2. **MongoDB timeout** - Reduced connection timeout to 5 seconds
3. **Database connection checks** - Routes check if DB is connected before querying
4. **Graceful degradation** - Server can run even if DB is not connected (for testing routes)

## 🔍 Verify It's Fixed:

After killing the process, restart server and you should see:
```
✅ Crop routes loaded successfully
🚀 AGRI-AI SERVER RUNNING ON PORT 5000
```

**The 404 errors for /api/crops should now be fixed!** ✅

