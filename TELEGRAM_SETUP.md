# Telegram Bot Setup for Tridentrix

## Overview
The Telegram bot sends automatic alerts when critical or caution states are detected, keeping you informed about your crop conditions.

## Setup Instructions

### 1. Bot Token (⚠️ SECURITY: Get New Token)

**⚠️ IMPORTANT:** The previous token was exposed and MUST be revoked!

1. Open **@BotFather** on Telegram
2. Send: `/revoke`
3. Select your bot: **@Skibidiagribot**
4. Get the NEW token from BotFather
5. Add to `server/.env`:
```
TELEGRAM_BOT_TOKEN=YOUR_NEW_TOKEN_FROM_BOTFATHER
```

**Never share or commit your token!**

### 2. Get Your Chat ID

**Method 1: Send a message to the bot**
1. Open Telegram and search for: `@Skibidiagribot`
2. Start a conversation with the bot
3. Send any message (e.g., "Hello")
4. The bot will automatically set your Chat ID
5. Check server logs for: `✅ Telegram chat ID set: [your_chat_id]`

**Method 2: Manual setup**
1. Send a message to `@userinfobot` on Telegram
2. Copy your Chat ID (a number like `123456789`)
3. Add to `server/.env`:
   ```
   TELEGRAM_CHAT_ID=123456789
   ```
4. Restart the server

### 3. Enable/Disable
In `server/.env`:
```
TELEGRAM_ENABLED=true  # Set to false to disable
```

## How It Works

### Automatic Alerts
- **Critical State**: Sends alert when moisture <30% or >75%
- **Caution State**: Sends alert when moisture 30-40% or 60-75%
- **Rate Limited**: Minimum 2 seconds between messages
- **Cooldown**: Same alert type won't repeat for 5 minutes

### Alert Content
Each alert includes:
- Status (Critical/Caution)
- Crop name
- Current moisture level
- Temperature, humidity, NPK values
- Recommendations
- Timestamp

### Rate Limiting
- Minimum 2 seconds between messages
- Maximum 10 messages per minute
- 5-minute cooldown for duplicate alerts
- Prevents overloading Telegram API

## Testing

### Test the Bot
```bash
curl -X POST http://localhost:5001/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test from Tridentrix"}'
```

### Check Bot Status
The bot will automatically respond when you send it a message on Telegram.

## Troubleshooting

### Bot Not Responding
1. Check `TELEGRAM_ENABLED=true` in `.env`
2. Verify `TELEGRAM_BOT_TOKEN` is correct
3. Ensure Chat ID is set (send message to bot)
4. Check server logs for errors

### No Alerts Received
1. Verify moisture levels trigger alerts:
   - Critical: <30% or >75%
   - Caution: 30-40% or 60-75%
2. Check cooldown period (5 minutes between same alerts)
3. Verify ESP32 service is working (alerts trigger after ESP32 updates)

### Too Many Messages
- Rate limiting is built-in (2 sec minimum delay)
- Cooldown prevents duplicate alerts (5 minutes)
- Adjust `MIN_DELAY_MS` in `telegramService.js` if needed

## Bot Commands (Future)
Currently, the bot responds automatically. Future commands may include:
- `/status` - Get current system status
- `/crops` - List monitored crops
- `/alerts` - View recent alerts

## Security Notes
- Keep your bot token secure
- Don't commit `.env` file to git
- Chat ID is private - don't share it

