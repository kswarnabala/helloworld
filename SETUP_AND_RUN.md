# AgriWater AI - Setup and Run Instructions

## Project Overview
This is an AI-powered agricultural irrigation monitoring system with ESP32 hardware integration for visual and audio alerts.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- ESP32 device with WiFi connectivity
- Arduino IDE (for ESP32 programming)

## Project Structure
```
agri/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express)
└── SETUP_AND_RUN.md # This file
```

## Step 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd agri/server
npm install
```

### 1.2 Configure Environment Variables
Create a `.env` file in the `server` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agriwater?retryWrites=true&w=majority

# Server Port (default: 5000)
PORT=5000

# ESP32 Configuration
ESP32_IP=192.168.1.100    # Your ESP32's IP address
ESP32_PORT=80              # ESP32 web server port
ESP32_ENABLED=true         # Set to false to disable ESP32 integration

# Optional: OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_api_key_here

# Optional: Gemini API Key (for AI image analysis)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 1.3 Seed Database (Optional)
If you need sample data:
```bash
cd agri/server
node seed.js
```

### 1.4 Start Backend Server
```bash
cd agri/server
npm start
# or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

## Step 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd agri/client
npm install
```

### 2.2 Configure API Base URL
The frontend is configured to connect to `http://localhost:5001/api` by default.

**Important:** If your backend runs on a different port, update `agri/client/src/App.jsx`:
```javascript
const API_BASE = 'http://localhost:5000/api'; // Change to match your backend port
```

### 2.3 Start Frontend Development Server
```bash
cd agri/client
npm run dev
```

The frontend will start on `http://localhost:5173` (or another available port).

## Step 3: ESP32 Setup

### 3.1 Upload Code to ESP32

1. Open Arduino IDE
2. Install ESP32 board support:
   - Go to `File > Preferences`
   - Add to Additional Board Manager URLs: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to `Tools > Board > Boards Manager`
   - Search for "ESP32" and install

3. Install required libraries:
   - WiFi (built-in)
   - WebServer (built-in)

4. Copy the ESP32 code (provided by user) to Arduino IDE

5. Update WiFi credentials in the code:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* pass = "YOUR_WIFI_PASSWORD";
   ```

6. Upload to ESP32:
   - Select your ESP32 board: `Tools > Board > ESP32 Dev Module`
   - Select the correct COM port
   - Click Upload

### 3.2 Get ESP32 IP Address

1. Open Serial Monitor (Tools > Serial Monitor) at 115200 baud
2. After upload, the ESP32 will connect to WiFi
3. Look for the line: `ESP32 IP: 192.168.1.XXX`
4. Copy this IP address

### 3.3 Configure Backend with ESP32 IP

Update your `server/.env` file:
```env
ESP32_IP=192.168.1.XXX  # Use the IP from Serial Monitor
ESP32_PORT=80
ESP32_ENABLED=true
```

### 3.4 Test ESP32 Connection

Test the connection from your backend:
```bash
curl http://YOUR_ESP32_IP/set?state=normal
```

Or use the API endpoint:
```bash
curl http://localhost:5000/api/esp32/test
```

## Step 4: Running the Complete System

### 4.1 Start Backend
```bash
cd agri/server
npm start
```

You should see:
```
🚀 AGRI-AI SERVER RUNNING ON PORT 5000
✅ All routes registered! Server ready to accept requests.
```

### 4.2 Start Frontend
```bash
cd agri/client
npm run dev
```

You should see:
```
VITE v4.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 4.3 Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## ESP32 Integration Features

### Automatic Alert System
The system automatically sends signals to ESP32 based on:
- **Critical Alerts**: Red LED + Buzzer (5 beeps)
  - Leak detection
  - Critical dry stress
  - Critical priority recommendations

- **Caution Alerts**: Blue LED + Buzzer (1 long beep)
  - High priority alerts
  - Medium priority recommendations
  - Irrigation needed

- **Normal Status**: Green LED (no buzzer)
  - All systems operating normally

### Manual ESP32 Control

You can manually control ESP32 via API:

**Set State:**
```bash
POST http://localhost:5000/api/esp32/set
Content-Type: application/json

{
  "state": "normal" | "caution" | "critical"
}
```

**Get Configuration:**
```bash
GET http://localhost:5000/api/esp32/config
```

**Test Connection:**
```bash
GET http://localhost:5000/api/esp32/test
```

## Troubleshooting

### Backend Issues

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**MongoDB Connection Failed:**
- Check your `MONGO_URI` in `.env`
- Ensure MongoDB Atlas allows your IP address
- Verify network connectivity

### Frontend Issues

**Cannot Connect to Backend:**
- Verify backend is running on the correct port
- Check `API_BASE` in `App.jsx` matches backend port
- Check CORS settings in backend

### ESP32 Issues

**ESP32 Not Responding:**
- Verify ESP32 is connected to WiFi
- Check IP address in Serial Monitor
- Ensure ESP32 IP matches `.env` configuration
- Test direct connection: `curl http://ESP32_IP/set?state=normal`

**ESP32 Not Connecting to WiFi:**
- Verify WiFi credentials in code
- Check WiFi signal strength
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

**LEDs/Buzzer Not Working:**
- Verify pin connections match code:
  - Red LED: Pin 16
  - Blue LED: Pin 21
  - Green LED: Pin 5
  - Buzzer: Pin 23
- Check wiring and component functionality

## API Endpoints

### Main Endpoints
- `GET /api/status` - Get live system status (triggers ESP32 automatically)
- `GET /api/history` - Get historical sensor data
- `GET /api/analytics` - Get analytics summary
- `GET /api/fields` - Get multi-field overview
- `GET /api/crops` - Get crop list
- `GET /api/crops/:cropType` - Get crop-specific data
- `POST /api/chatbot` - AI chatbot interaction
- `POST /api/analyze-image` - Image analysis with Gemini
- `POST /api/predict` - ML predictions

### ESP32 Endpoints
- `POST /api/esp32/set` - Manually set ESP32 state
- `GET /api/esp32/config` - Get ESP32 configuration
- `GET /api/esp32/test` - Test ESP32 connection

## Development Notes

- Backend auto-reloads with `npm run dev` (requires nodemon)
- Frontend hot-reloads automatically with Vite
- ESP32 state is cached to avoid duplicate requests
- ESP32 updates are non-blocking (won't slow down API responses)

## Next Steps

1. Configure your MongoDB Atlas connection
2. Set up ESP32 with your WiFi credentials
3. Update ESP32 IP in backend `.env`
4. Start both backend and frontend servers
5. Access the web interface and monitor your fields!

For issues or questions, check the console logs for detailed error messages.

