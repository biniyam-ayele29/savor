# Telegram Bot Setup Guide

This guide will help you set up Telegram notifications for order status updates.

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to choose a name and username for your bot
4. BotFather will give you a **Bot Token** - save this! It looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

## Step 2: Add Bot Token to Environment Variables

Add your bot token to `/home/benny/gebeya/savor-apps/savour/.env.local`:

```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Step 3: Add Telegram Chat ID Column to Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Add telegram_chat_id column to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_telegram_chat_id 
ON employees(telegram_chat_id);

-- Add comment
COMMENT ON COLUMN employees.telegram_chat_id IS 'Telegram chat ID for receiving order notifications';
```

## Step 4: Create a Registration Bot Command Handler

Create a simple bot handler that links phone numbers to Telegram chat IDs. Here's a basic Node.js script:

```javascript
// telegram-bot-handler.js
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot('YOUR_BOT_TOKEN', { polling: true });
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        'Welcome to Savor Order Notifications! 🍽️\n\n' +
        'To receive order updates, please send your registered phone number:\n' +
        'Format: +251912345678'
    );
});

// Handle phone number registration
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Skip commands
    if (text.startsWith('/')) return;

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(text.replace(/[\s-]/g, ''))) {
        bot.sendMessage(
            chatId,
            '❌ Invalid phone number format. Please send your phone number like: +251912345678'
        );
        return;
    }

    try {
        // Update employee with telegram_chat_id
        const { data, error } = await supabase
            .from('employees')
            .update({ telegram_chat_id: chatId.toString() })
            .eq('phone', text)
            .select();

        if (error || !data || data.length === 0) {
            bot.sendMessage(
                chatId,
                '❌ Phone number not found in our system. Please make sure you entered the correct number you registered with.'
            );
            return;
        }

        bot.sendMessage(
            chatId,
            '✅ Success! You will now receive order notifications via Telegram.\n\n' +
            `Welcome, ${data[0].name}! 🎉`
        );
    } catch (error) {
        console.error('Database error:', error);
        bot.sendMessage(
            chatId,
            '❌ An error occurred. Please try again later.'
        );
    }
});

console.log('Bot is running...');
```

## Step 5: Alternative - Webhook Approach (Supabase Edge Function)

Instead of running a separate Node.js process, you can create a Supabase Edge Function:

```typescript
// supabase/functions/telegram-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const update = await req.json()
    const message = update.message

    if (!message?.text) {
      return new Response('OK', { status: 200 })
    }

    const chatId = message.chat.id
    const text = message.text

    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        'Welcome to Savor! 🍽️\n\nSend your phone number to receive order updates.'
      )
      return new Response('OK', { status: 200 })
    }

    // Phone number registration
    const phoneRegex = /^\+?\d{10,15}$/
    if (phoneRegex.test(text.replace(/[\s-]/g, ''))) {
      const { data, error } = await supabase
        .from('employees')
        .update({ telegram_chat_id: chatId.toString() })
        .eq('phone', text)
        .select()

      if (error || !data || data.length === 0) {
        await sendTelegramMessage(
          chatId,
          '❌ Phone number not found. Please check and try again.'
        )
      } else {
        await sendTelegramMessage(
          chatId,
          `✅ Success! Welcome ${data[0].name}! 🎉\n\nYou'll receive order notifications here.`
        )
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
})

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}
```

Set webhook:
```bash
curl -F "url=https://YOUR_PROJECT.supabase.co/functions/v1/telegram-webhook" \
     https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook
```

## Step 6: Test the Integration

1. Start your bot (Node.js or deploy Edge Function)
2. Open Telegram and search for your bot
3. Send `/start` to your bot
4. Send your registered phone number
5. Bot should confirm registration
6. Test by updating an order status from the admin panel

## How It Works

1. User opens your Telegram bot and sends their phone number
2. Bot links their Telegram chat ID to their employee record
3. When an order status changes, the system:
   - Detects the change via Supabase Realtime
   - Looks up the employee's Telegram chat ID
   - Sends a formatted notification with order details

## Message Format

Users will receive messages like:

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

- **Bot not responding**: Check that the bot token is correct
- **Not receiving notifications**: Verify `telegram_chat_id` is saved in database
- **Database errors**: Check RLS policies allow reading employee records
- **Webhook not working**: Check Edge Function logs in Supabase Dashboard
