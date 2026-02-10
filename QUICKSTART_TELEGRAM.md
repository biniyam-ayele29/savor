# 🚀 Quick Start - Telegram Notifications

## ⚡ 5-Minute Setup

### 1️⃣ Create Bot (2 min)
```
1. Open Telegram → Search @BotFather
2. Send: /newbot
3. Name: Savor Order Bot
4. Username: savor_order_bot
5. Copy token: 123456789:ABC...
```

### 2️⃣ Add Token (30 sec)
Edit `.env.local`:
```bash
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_token_here
```

### 3️⃣ Update Database (30 sec)
Run in Supabase SQL Editor:
```sql
ALTER TABLE employees ADD COLUMN telegram_chat_id TEXT;
CREATE INDEX idx_employees_telegram_chat_id ON employees(telegram_chat_id);
```

### 4️⃣ Start Bot (1 min)
```bash
npm install node-telegram-bot-api
node telegram-bot-simple.js
```

### 5️⃣ Test (1 min)
```
1. Open Telegram
2. Search your bot
3. Send: /start
4. Send: +251912345678
5. Bot replies: ✅ Success!
```

### 6️⃣ Verify (30 sec)
```
Admin panel → Update order status → User gets Telegram message! 🎉
```

---

## 📱 Bot Commands

| Command | Action |
|---------|--------|
| `/start` | Start bot & get instructions |
| `/help` | Show help message |
| `/status` | Check registration status |
| `+251912345678` | Register phone number |

---

## 🔍 Troubleshooting

### Bot not responding?
```bash
# Check bot token
grep TELEGRAM .env.local

# Test token
curl https://api.telegram.org/bot<TOKEN>/getMe
```

### Phone not found?
```sql
-- Check database
SELECT name, phone FROM employees WHERE phone LIKE '%912345678%';

-- Try both formats
-- +251912345678
-- 0912345678
```

### Still not working?
```bash
# Check bot logs
node telegram-bot-simple.js
# Look for "Phone not found" or "Database error"

# Check console in browser
# Look for "Telegram notification sent"
```

---

## 📦 Files Created

```
packages/api/
  ├── telegram.ts                    # Telegram API service
  └── use-telegram-notifications.ts  # React hook

apps/next/app/
  └── orders/page.tsx                # Updated with Telegram

supabase/functions/
  └── telegram-webhook/index.ts      # Edge Function (optional)

telegram-bot-simple.js               # Node.js bot (easy testing)
setup-telegram.sh                    # Automated setup script
```

---

## 🎯 Production Checklist

- [ ] Bot token in production environment
- [ ] Database column added
- [ ] Edge Function deployed (or bot running)
- [ ] Webhook configured
- [ ] Tested with real phone numbers
- [ ] Error monitoring enabled

---

## 📚 Documentation

- `README_NOTIFICATIONS.md` - Complete overview
- `TELEGRAM_SETUP.md` - Detailed setup
- `TELEGRAM_DEPLOYMENT.md` - Production deployment
- `ARCHITECTURE_NOTIFICATIONS.md` - Technical architecture

---

## 💡 Tips

✅ **Use Node.js bot for testing** - Easier to debug  
✅ **Use Edge Functions for production** - Serverless & scalable  
✅ **Test with your own phone first** - Before rolling out  
✅ **Keep bot token secret** - Never commit to git  
✅ **Check console logs** - Most issues show there  

---

## 🆘 Need Help?

1. Check console logs (browser + bot)
2. Read error messages carefully
3. Verify phone number format
4. Test with `/status` command
5. Check documentation files above

---

**🎉 That's it! Your users can now receive order updates via Telegram!**
