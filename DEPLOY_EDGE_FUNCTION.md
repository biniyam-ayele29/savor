# 🚀 Deploy Telegram Edge Function

## Quick Deploy (3 steps)

### Step 1: Add Your Bot Token

Add to `.env.local`:
```bash
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

### Step 2: Deploy the Edge Function

```bash
# Deploy to Supabase
npx supabase functions deploy telegram-webhook --no-verify-jwt
```

This will output a URL like:
```
https://your-project-ref.supabase.co/functions/v1/telegram-webhook
```

### Step 3: Set Telegram Webhook

Replace `<BOT_TOKEN>` and `<YOUR_PROJECT_REF>` with your values:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/telegram-webhook"}'
```

**Should return:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

## Verify Webhook is Set

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

Should show your webhook URL.

---

## Add Secrets to Supabase

In Supabase Dashboard:
1. Go to **Edge Functions** → **Secrets**
2. Add secret:
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: Your bot token

---

## Test It

1. Open Telegram, search for your bot
2. Send: `/start`
3. Send your phone number: `+251912345678`
4. Bot should reply with confirmation
5. Update an order status
6. User receives Telegram message!

---

## Troubleshooting

### Check Function Logs
```bash
npx supabase functions logs telegram-webhook --tail
```

### Check Webhook Status
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### Delete Webhook (if needed)
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
```

---

## What's Already Working

✅ **Notification Sending** - The `use-telegram-notifications.ts` hook in your app already sends messages when order status changes

📝 **Bot Registration** - The Edge Function handles user registration (phone number linking)

You only need to deploy the Edge Function once, then it runs serverless! 🎉
