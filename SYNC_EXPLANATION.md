# Simple Sync System - How It Works

## Overview
Everything syncs together: Frontend ↔ Backend ↔ ESP32 ↔ Telegram

## Sync Flow

### 1. Data Refresh (Every 2 Minutes)
- Frontend calls `/api/status` every 2 minutes
- Backend fetches latest sensor data
- All components sync based on this refresh

### 2. State Calculation (Simple)
```
Moisture 40-60%  → Normal  (Green LED)
Moisture 30-40%  → Caution (Blue LED + Buzzer)
Moisture 60-75%  → Caution (Blue LED + Buzzer)
Moisture <30%    → Critical (Red LED + Buzzer)
Moisture >75%    → Critical (Red LED + Buzzer)
```

### 3. Sync Process
1. **Frontend** gets new data (every 2 min)
2. **Frontend** calculates expected state from moisture
3. **Frontend** sends to ESP32 if state changed
4. **Backend** also sends to ESP32 (backup)
5. **Backend** sends Telegram alert if critical/caution

### 4. Test Buttons (One-Time Override)
- Click test button → ESP32 receives signal
- Override flag set for 1 second
- After 1 second → Override cleared
- Next data refresh → Auto-sync resumes

## What Gets Synced

✅ **Frontend Display** - Shows current ESP32 state
✅ **Backend Status** - Calculates state from moisture
✅ **ESP32 Device** - Receives state signals
✅ **Telegram Bot** - Sends alerts for critical/caution

## Timing

- **Data Refresh**: Every 2 minutes (120 seconds)
- **Sync Check**: Only when data timestamp changes
- **Test Override**: 1 second (then auto-resumes)
- **Telegram Cooldown**: 1 minute (allows updates when moisture changes)

## Status Indicators

- 🟢 **Synced** - Everything in sync
- 🟡 **Test Override** - Manual test active (auto-resumes)
- 🔴 **Error** - Check connection

## Troubleshooting

### Not Syncing?
1. Check data is refreshing (timestamp updates every 2 min)
2. Check ESP32 is reachable
3. Check manual override is cleared
4. Check server logs for errors

### Telegram Not Sending?
1. Check Chat ID is set
2. Check token is valid
3. Check cooldown period (1 minute)
4. Check moisture level triggers alert

