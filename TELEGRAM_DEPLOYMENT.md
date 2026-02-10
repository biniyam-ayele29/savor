# Telegram Bot Deployment Guide

## Quick Setup (5 minutes)

### 1. Create Your Telegram Bot

Open Telegram and chat with [@BotFather](https://t.me/BotFather):

```
You: /newbot
BotFather: Alright, a new bot. How are we going to call it?
You: Savor Order Bot
BotFather: Good. Now let me know your bot's username.
You: savor_order_bot
BotFather: Done! Your bot token is: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Save the token!** ⚠️

### 2. Add Database Column

In Supabase SQL Editor, run:

```sql
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

CREATE INDEX IF NOT EXISTS idx_employees_telegram_chat_id 
ON employees(telegram_chat_id);
```

### 3. Configure Environment Variables

Add to `/home/benny/gebeya/savor-apps/savour/.env.local`:

```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

In Supabase Dashboard → Edge Functions → Secrets, add:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 4. Deploy Edge Function

```bash
cd /home/benny/gebeya/savor-apps/savour

# Install Supabase CLI if not installed
# brew install supabase/tap/supabase  # macOS
# or visit: https://supabase.com/docs/guides/cli

# Deploy the function
npx supabase functions deploy telegram-webhook --no-verify-jwt

# Get the function URL
npx supabase functions list
```

You'll get a URL like:
```
https://your-project.supabase.co/functions/v1/telegram-webhook
```

### 5. Set Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.supabase.co/functions/v1/telegram-webhook"}'
```

Should return:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 6. Test It!

1. Open Telegram and search for your bot (e.g., `@savor_order_bot`)
2. Send `/start`
3. Send your registered phone number (e.g., `+251912345678` or `0912345678`)
4. Bot should confirm registration
5. Update an order status from admin panel
6. You should receive a Telegram message! 📱

## Bot Commands

- `/start` - Start the bot and get instructions
- `/help` - Show help message
- `/status` - Check if you're registered

## Message Format

When order status changes, users receive:

```
🚚 Order Status Update

Order ID: #a1b2c3d4
Status: Delivering
Company: Gebeya Tech

Items:
  • 2x Espresso
  • 1x Croissant

Total: ETB 85.00

Your order is on the way to your location!
```

## Troubleshooting

### Bot not responding to commands

Check webhook is set:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Phone number not found

- Check the phone number format matches what's in the database
- Check `employees` table has the phone number
- Try both formats: `+251912345678` and `0912345678`

### Not receiving order notifications

1. Check user is registered:
   ```sql
   SELECT name, phone, telegram_chat_id FROM employees WHERE phone = '+251912345678';
   ```

2. Check Edge Function logs in Supabase Dashboard

3. Verify `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` is in `.env.local`

4. Make sure you're running the app after adding the token

### Edge Function errors

View logs:
```bash
npx supabase functions logs telegram-webhook --tail
```

## Alternative: Simple Node.js Bot (No Edge Function)

If you prefer not to use Edge Functions, you can run this locally:

```bash
npm install node-telegram-bot-api @supabase/supabase-js dotenv
```

Create `telegram-bot.js`:

```javascript
require('dotenv').config({ path: '.env.local' })
const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')

const bot = new TelegramBot(process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN, { polling: true })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    '👋 Welcome to Savor!\n\nSend your phone number to receive order notifications.'
  )
})

bot.on('message', async (msg) => {
  if (msg.text.startsWith('/')) return

  const phone = msg.text.replace(/[\s-()]/g, '')
  const { data } = await supabase
    .from('employees')
    .update({ telegram_chat_id: msg.chat.id.toString() })
    .or(`phone.eq.${msg.text},phone.eq.${phone}`)
    .select()

  if (data?.length > 0) {
    bot.sendMessage(msg.chat.id, `✅ Welcome ${data[0].name}! You'll receive order updates here.`)
  } else {
    bot.sendMessage(msg.chat.id, '❌ Phone number not found.')
  }
})

console.log('Bot running...')
```

Run:
```bash
node telegram-bot.js
```

## Production Deployment

For production, consider:

1. **Edge Functions** (Recommended) - Serverless, scalable
2. **Docker Container** - If you want full control
3. **Cloud Run / Lambda** - For Node.js bot
4. **PM2** - For VPS deployment

## Security Notes

- Bot token is sensitive - keep it secret!
- Use service role key in Edge Functions for database access
- Enable RLS on `employees` table
- Validate phone numbers before updating database
