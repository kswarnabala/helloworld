# Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v16+)
- [ ] MongoDB Atlas account or local MongoDB
- [ ] ESP32 device (optional but recommended)

## 1. Backend Setup (5 minutes)

```bash
# Navigate to server directory
cd agri/server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and ESP32 IP
# Minimum required:
# MONGO_URI=your_mongodb_connection_string
# ESP32_IP=192.168.1.XXX (your ESP32 IP from Serial Monitor)

# Start server
npm start
```

**Expected Output:**
```
✅ DATABASE LINKED: agriwater
🚀 AGRI-AI SERVER RUNNING ON PORT 5000
```

## 2. Frontend Setup (2 minutes)

```bash
# Open new terminal, navigate to client directory
cd agri/client

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v4.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

## 3. ESP32 Setup (10 minutes)

1. **Upload Code:**
   - Open Arduino IDE
   - Install ESP32 board support (see SETUP_AND_RUN.md)
   - Copy your ESP32 code
   - Update WiFi credentials:
     ```cpp
     const char* ssid = "YOUR_WIFI_SSID";
     const char* pass = "YOUR_WIFI_PASSWORD";
     ```
   - Upload to ESP32

2. **Get IP Address:**
   - Open Serial Monitor (115200 baud)
   - Look for: `ESP32 IP: 192.168.1.XXX`
   - Copy this IP

3. **Configure Backend:**
   - Update `server/.env`:
     ```env
     ESP32_IP=192.168.1.XXX
     ESP32_ENABLED=true
     ```
   - Restart backend server

4. **Test Connection:**
   ```bash
   curl http://localhost:5000/api/esp32/test
   ```

## 4. Access Application

Open browser: **http://localhost:5173**

## Troubleshooting

### Backend won't start
- Check if port 5000 is in use: `netstat -ano | findstr :5000` (Windows)
- Verify MongoDB connection in `.env`
- Check console for error messages

### Frontend can't connect
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure `API_BASE` in `App.jsx` matches backend port

### ESP32 not responding
- Verify ESP32 is on same WiFi network
- Check IP address in Serial Monitor
- Test direct: `curl http://ESP32_IP/set?state=normal`
- Verify ESP32_IP in `server/.env`

## What Happens Next?

Once running:
1. **Dashboard** shows real-time sensor data
2. **Alerts** automatically trigger ESP32:
   - 🔴 Critical → Red LED + Buzzer
   - 🟡 Caution → Blue LED + Buzzer  
   - 🟢 Normal → Green LED
3. **Analytics** provides insights
4. **Chatbot** answers questions about your crops

## Need More Help?

See `SETUP_AND_RUN.md` for detailed instructions.

