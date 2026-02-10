# 🎉 Complete Notification System

Your Savor app now has a **complete notification system** with three channels:

## 1. 🎨 In-App Toast Notifications
Beautiful notifications that appear in the top right corner of the UI.

**Features:**
- Gradient backgrounds (green for new orders, orange for updates)
- Context-aware icons (cart, clock, truck, checkmark)
- Auto-dismiss after 5 seconds
- Smooth animations

**Already Integrated:** ✅ Working on `/order` and `/orders` pages

---

## 2. 🔔 Browser Push Notifications
Native browser notifications when the tab is inactive.

**Features:**
- Shows when browser tab is in background
- Includes order details
- Auto-closes after 5 seconds

**Already Integrated:** ✅ Works alongside toast notifications

---

## 3. 📱 Telegram Bot Notifications
Send order updates directly to users via Telegram!

### Quick Setup (5 minutes):

#### Step 1: Create Telegram Bot
1. Open Telegram, search for `@BotFather`
2. Send: `/newbot`
3. Choose name: `Savor Order Bot`
4. Choose username: `savor_order_bot` (or similar)
5. **Save the bot token!** (looks like: `123456789:ABCdefGHI...`)

#### Step 2: Add Database Column
Run in Supabase SQL Editor:
```sql
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

CREATE INDEX IF NOT EXISTS idx_employees_telegram_chat_id 
ON employees(telegram_chat_id);
```

#### Step 3: Add Bot Token
Add to `.env.local`:
```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

#### Step 4: Choose Deployment Method

**Option A: Simple Node.js Bot (Easiest for Testing)**
```bash
# Install dependencies
npm install node-telegram-bot-api @supabase/supabase-js dotenv

# Run the bot
node telegram-bot-simple.js
```

**Option B: Supabase Edge Function (Production)**
```bash
# Deploy to Supabase
npx supabase functions deploy telegram-webhook --no-verify-jwt

# Set webhook
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.supabase.co/functions/v1/telegram-webhook"}'
```

#### Step 5: Test It!
1. Open Telegram, search for your bot
2. Send: `/start`
3. Send your phone number: `+251912345678` or `0912345678`
4. Bot confirms registration ✅
5. Update an order status from admin panel
6. Receive Telegram message! 📱

### Bot Commands
- `/start` - Start the bot
- `/help` - Show help
- `/status` - Check registration status

### Message Example
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

---

## 📂 Files Created

### Core System
- `packages/api/telegram.ts` - Telegram API service
- `packages/api/use-telegram-notifications.ts` - React hook for Telegram
- `packages/app/features/notifications/toast-context.tsx` - Toast state management
- `packages/app/features/notifications/toast-container.tsx` - Toast UI component

### Deployment
- `telegram-bot-simple.js` - Simple Node.js bot (for testing)
- `supabase/functions/telegram-webhook/index.ts` - Edge Function (for production)

### Documentation
- `TELEGRAM_SETUP.md` - Detailed setup guide
- `TELEGRAM_DEPLOYMENT.md` - Production deployment guide
- `README_NOTIFICATIONS.md` - This file

---

## 🧪 Testing Checklist

- [ ] Create Telegram bot with @BotFather
- [ ] Add bot token to `.env.local`
- [ ] Add `telegram_chat_id` column to database
- [ ] Choose deployment method (Node.js or Edge Function)
- [ ] Register a test user via Telegram bot
- [ ] Create a test order
- [ ] Update order status from admin panel
- [ ] Verify all 3 notification types work:
  - [ ] Toast notification in UI
  - [ ] Browser notification
  - [ ] Telegram message

---

## 🎯 How It Works

```
Order Status Changed (Admin Updates)
          ↓
    Supabase Realtime Event
          ↓
    ┌─────┴─────┐
    ↓           ↓           ↓
Toast      Browser     Telegram
Notification Notification  Message
(UI)       (Browser)    (Phone)
```

1. Admin updates order status
2. Supabase Realtime detects the change
3. Three systems trigger simultaneously:
   - **Toast**: Shows in-app notification
   - **Browser**: Shows OS notification (if tab inactive)
   - **Telegram**: Sends message to user's phone

---

## 🔧 Troubleshooting

### Telegram Bot Not Responding
```bash
# Check webhook status
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### Phone Number Not Found
- Verify phone format matches database (`+251...` or `0...`)
- Check `employees` table has the phone number
- Try both formats

### Not Receiving Notifications
1. Check user registered:
   ```sql
   SELECT name, phone, telegram_chat_id 
   FROM employees 
   WHERE telegram_chat_id IS NOT NULL;
   ```
2. Verify bot token in `.env.local`
3. Check browser console for errors
4. Restart dev server after adding bot token

---

## 🚀 Production Checklist

- [ ] Deploy Telegram webhook to Supabase Edge Functions
- [ ] Set up environment variables in Supabase Dashboard
- [ ] Configure webhook URL with Telegram API
- [ ] Test with real phone numbers
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Add rate limiting to prevent spam
- [ ] Create user documentation
- [ ] Train staff on the notification system

---

## 📚 Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

Need help? Check the detailed guides:
- `TELEGRAM_SETUP.md` - Setup instructions
- `TELEGRAM_DEPLOYMENT.md` - Deployment guide
