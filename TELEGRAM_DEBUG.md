# Telegram Debugging Guide

## Quick Test

### 1. Check Configuration
```bash
# Check if token and chat ID are set
curl http://localhost:5001/api/telegram/test
```

### 2. Manual Chat ID Setup
If Chat ID is not set, you can set it manually:
```bash
curl -X POST http://localhost:5001/api/telegram/set-chat-id \
  -H "Content-Type: application/json" \
  -d '{"chatId": "YOUR_CHAT_ID"}'
```

### 3. Test Message
```bash
curl -X POST http://localhost:5001/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Test from Tridentrix"}'
```

## Common Issues

### Issue: "Chat ID not configured"
**Solution:**
1. Check `.env` file has `TELEGRAM_CHAT_ID=your_chat_id`
2. Or send a message to your bot on Telegram
3. Or use the manual set endpoint above

### Issue: "Bot token not configured"
**Solution:**
1. Check `.env` has `TELEGRAM_BOT_TOKEN=your_token`
2. Restart server after updating `.env`

### Issue: Messages not sending
**Check:**
1. Server logs for errors
2. Token is valid (get new one from @BotFather if needed)
3. Chat ID is correct
4. Bot is enabled: `TELEGRAM_ENABLED=true`

## Server Logs to Watch

Look for these messages:
- `✅ Telegram service configured (Chat ID: ...)` - Good!
- `⚠️ Telegram token set but Chat ID missing` - Need to set Chat ID
- `📤 Preparing Telegram alert: ...` - Alert being prepared
- `✅ Telegram alert sent: ...` - Success!
- `❌ Telegram send error: ...` - Check error details

