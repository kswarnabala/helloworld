# 🚀 How to Run the Project - Step by Step

## Quick Start (2 Terminals Needed)

### Terminal 1: Backend Server

```bash
# Navigate to server directory
cd agri/server

# Start the server
npm start
```

**Expected Output:**
```
✅ DATABASE LINKED: test
📊 Database ready for queries
🚀 AGRI-AI SERVER RUNNING ON PORT 5001
✅ All routes registered! Server ready to accept requests.
```

**Keep this terminal open!**

---

### Terminal 2: Frontend Client

```bash
# Open a NEW terminal window
# Navigate to client directory
cd agri/client

# Start the frontend
npm run dev
```

**Expected Output:**
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal open too!**

---

## Step 3: Open in Browser

Open your web browser and go to:
```
http://localhost:5173
```

You should see the AgriWater AI dashboard!

---

## Step 4: Test ESP32 Connection (Optional)

If your ESP32 is connected and configured:

```bash
# In a new terminal or use the backend terminal
curl http://localhost:5001/api/esp32/test
```

**Expected Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "ESP32 is reachable",
  "url": "http://172.16.44.171:80/set?state=normal"
}
```

---

## Troubleshooting

### ❌ Backend won't start?

**Port already in use:**
```bash
# Windows - Find and kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F
```

**MongoDB connection error:**
- Check your `.env` file has correct `MONGO_URI`
- Verify MongoDB Atlas allows your IP address

### ❌ Frontend can't connect?

**Check backend is running:**
- Look for "🚀 AGRI-AI SERVER RUNNING" message
- Verify it's on port 5001 (check your .env PORT setting)

**Update API URL if needed:**
- If backend is on different port, edit `agri/client/src/App.jsx`
- Change: `const API_BASE = 'http://localhost:5001/api';`

### ❌ ESP32 not responding?

1. **Check ESP32 is on WiFi:**
   - Open Serial Monitor in Arduino IDE
   - Look for "WiFi connected" and IP address

2. **Verify IP in .env:**
   - Check `ESP32_IP=172.16.44.171` matches ESP32's actual IP
   - Check `ESP32_ENABLED=true`

3. **Test direct connection:**
   ```bash
   curl http://172.16.44.171/set?state=normal
   ```

---

## What to Expect

Once running, you'll see:

1. **Dashboard** - Real-time sensor data and metrics
2. **Automatic ESP32 Alerts:**
   - 🔴 Critical issues → Red LED + Buzzer
   - 🟡 Caution → Blue LED + Buzzer
   - 🟢 Normal → Green LED
3. **Analytics** - Historical data and trends
4. **Chatbot** - AI assistant for crop questions

---

## Development Mode

For auto-reload during development:

**Backend:**
```bash
cd agri/server
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd agri/client
npm run dev  # Already has hot-reload enabled
```

---

## Stopping the Servers

Press `Ctrl + C` in each terminal to stop the servers.

---

## Next Steps After Running

1. ✅ Verify dashboard loads
2. ✅ Check ESP32 responds (if connected)
3. ✅ Test chatbot functionality
4. ✅ Upload crop images for analysis
5. ✅ Monitor alerts and ESP32 signals

**You're all set! 🎉**

