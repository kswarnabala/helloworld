# 🔧 Server Restart Instructions - Fix 404 Errors

## The Problem
You're seeing 404 errors for `/api/crops` because the server needs to be restarted to load the new routes.

## Solution Steps:

### 1. Stop Current Server
- Press `Ctrl+C` in the terminal where the server is running
- Or close the terminal window

### 2. Navigate to Server Directory
```bash
cd agri/server
```

### 3. Restart Server
```bash
npm start
```

**OR** if using nodemon (auto-restart):
```bash
npm run dev
```

### 4. Verify Server Started
You should see:
```
✅ DATABASE LINKED: [your-database-name]
🚀 AGRI-AI SERVER RUNNING ON PORT 5000
📡 Available endpoints:
   GET /api/status
   GET /api/history
   GET /api/analytics
   GET /api/fields
   GET /api/crops          ← This should appear!
   GET /api/crops/:cropType ← This too!
   GET /api/health
```

### 5. Test the Endpoint
Open in browser: `http://localhost:5000/api/crops`
- Should return: `[]` (empty array) or array of crops

### 6. Refresh Frontend
- Refresh your browser
- 404 errors should be gone!

## Troubleshooting

If you still see 404 errors after restart:
1. Check server console for errors
2. Verify MongoDB connection is working
3. Check that `index.js` has the `/api/crops` routes (lines 225-263)
4. Make sure you're running the updated `index.js` file

## Quick Test Commands

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test crops endpoint
curl http://localhost:5000/api/crops

# Test specific crop
curl http://localhost:5000/api/crops/Wheat
```

