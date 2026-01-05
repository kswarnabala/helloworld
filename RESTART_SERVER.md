# Server Restart Instructions

## To Fix the 404 Error for `/api/crops`:

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where the server is running

2. **Restart the server:**
   ```bash
   cd agri/server
   npm start
   ```

   Or if using nodemon:
   ```bash
   npm run dev
   ```

3. **Verify the server started:**
   You should see:
   ```
   🚀 AGRI-AI SERVER RUNNING ON PORT 5000
   📡 Available endpoints:
      GET /api/crops
      GET /api/crops/:cropType
   ```

4. **Test the endpoint:**
   Open in browser: `http://localhost:5000/api/health`
   Should show all available endpoints including `/api/crops`

5. **Refresh your frontend** - The 404 errors should be gone!

## Quick Test:
Visit: `http://localhost:5000/api/crops` in your browser
- Should return: `[]` (empty array) if no data, or an array of crops if data exists

