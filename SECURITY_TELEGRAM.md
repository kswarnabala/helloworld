# 🔐 Telegram Bot Security - URGENT ACTION REQUIRED

## ⚠️ CRITICAL: Token Exposed

Your Telegram bot token was publicly shared and **MUST be revoked immediately**.

## Immediate Steps

### 1. Revoke Old Token (DO THIS NOW)

1. Open Telegram and search for **@BotFather**
2. Send: `/revoke`
3. Select your bot: **@Skibidiagribot**
4. Confirm token revocation
5. BotFather will generate a **NEW token**

### 2. Get Your Chat ID

**Option A: Automatic (Recommended)**
1. Send any message to your bot: `@Skibidiagribot`
2. The bot will automatically capture your Chat ID
3. Check server logs for: `✅ Telegram chat ID set: [your_chat_id]`

**Option B: Manual**
1. Send `/start` to your bot
2. Open in browser (replace `NEW_TOKEN` with your new token):
   ```
   https://api.telegram.org/bot<NEW_TOKEN>/getUpdates
   ```
3. Look for `"chat": { "id": 123456789 }`
4. Copy the ID number

### 3. Update Environment Variables

Edit `agri/server/.env`:

```env
# Telegram Bot Configuration
# ⚠️ NEVER commit this file to Git!
TELEGRAM_BOT_TOKEN=YOUR_NEW_TOKEN_FROM_BOTFATHER
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
TELEGRAM_ENABLED=true
```

### 4. Restart Server

```bash
cd agri/server
npm start
```

## Security Best Practices

### ✅ DO:
- ✅ Store token in `.env` file only
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables
- ✅ Revoke tokens if exposed
- ✅ Rotate tokens periodically

### ❌ DON'T:
- ❌ Hard-code tokens in code
- ❌ Commit `.env` to Git
- ❌ Share tokens publicly
- ❌ Use tokens in frontend code
- ❌ Store tokens in client-side code

## Current Implementation

The code is now secure:
- ✅ Token only from `process.env.TELEGRAM_BOT_TOKEN`
- ✅ No hardcoded tokens
- ✅ Service disabled if token missing
- ✅ All API calls from backend only

## Verification

After updating your token:

1. **Test the bot:**
   ```bash
   curl -X POST http://localhost:5001/api/telegram/test \
     -H "Content-Type: application/json" \
     -d '{"message": "Security test"}'
   ```

2. **Send message to bot on Telegram:**
   - Bot should respond automatically
   - Check server logs for confirmation

3. **Verify alerts work:**
   - Trigger critical/caution state
   - Should receive Telegram alert

## .gitignore Check

Ensure `.env` is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

## If Token Was Committed to Git

If you accidentally committed the token:

1. **Revoke token immediately** (see step 1 above)
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch agri/server/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (if already pushed):
   ```bash
   git push origin --force --all
   ```
4. **Generate new token** and update `.env`

## Need Help?

- Telegram Bot API: https://core.telegram.org/bots/api
- BotFather: @BotFather on Telegram
- Security Guide: https://core.telegram.org/bots/faq#what-messages-will-my-bot-get

---

**Remember:** Your bot token is like a password. Keep it secret!

