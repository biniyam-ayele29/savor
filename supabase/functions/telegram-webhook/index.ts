import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured')
    }

    const update = await req.json()
    console.log('Telegram update received:', JSON.stringify(update))

    const message = update.message

    if (!message?.text) {
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    const chatId = message.chat.id
    const text = message.text.trim()
    const firstName = message.from?.first_name || 'there'

    console.log(`Message from ${firstName} (${chatId}): ${text}`)

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        botToken,
        chatId,
        `👋 Welcome to Savor Order Notifications, ${firstName}!\n\n` +
        `📱 To receive order updates, please send your registered phone number.\n\n` +
        `Format: +251912345678 or 0912345678`
      )
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Handle /help command
    if (text === '/help') {
      await sendTelegramMessage(
        botToken,
        chatId,
        `🆘 <b>Help</b>\n\n` +
        `Send your registered phone number to link your account and receive order notifications.\n\n` +
        `<b>Commands:</b>\n` +
        `/start - Start the bot\n` +
        `/help - Show this help message\n` +
        `/status - Check if you're registered`,
        'HTML'
      )
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Handle /status command
    if (text === '/status') {
      const { data: employee } = await supabase
        .from('employees')
        .select('name, phone')
        .eq('telegram_chat_id', chatId.toString())
        .single()

      if (employee) {
        await sendTelegramMessage(
          botToken,
          chatId,
          `✅ <b>You're registered!</b>\n\n` +
          `<b>Name:</b> ${employee.name}\n` +
          `<b>Phone:</b> ${employee.phone}\n\n` +
          `You will receive order notifications here. 📦`,
          'HTML'
        )
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `❌ You're not registered yet.\n\n` +
          `Send your phone number to register.`
        )
      }
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Phone number registration
    const cleanedPhone = text.replace(/[\s-()]/g, '')
    const phoneRegex = /^(\+251|0)?9\d{8}$/

    if (phoneRegex.test(cleanedPhone)) {
      // Normalize phone number
      let normalizedPhone = cleanedPhone
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+251' + normalizedPhone.substring(1)
      } else if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = '+251' + normalizedPhone
      }

      console.log(`Attempting to register phone: ${normalizedPhone}`)

      // Try to find and update employee
      const { data, error } = await supabase
        .from('employees')
        .update({ telegram_chat_id: chatId.toString() })
        .or(`phone.eq.${text},phone.eq.${cleanedPhone},phone.eq.${normalizedPhone}`)
        .select()

      console.log('Database response:', { data, error })

      if (error) {
        console.error('Database error:', error)
        await sendTelegramMessage(
          botToken,
          chatId,
          '❌ An error occurred. Please try again later.'
        )
      } else if (!data || data.length === 0) {
        await sendTelegramMessage(
          botToken,
          chatId,
          `❌ <b>Phone number not found</b>\n\n` +
          `The number <code>${text}</code> is not registered in our system.\n\n` +
          `Please make sure you entered the same number you registered with.`,
          'HTML'
        )
      } else {
        await sendTelegramMessage(
          botToken,
          chatId,
          `✅ <b>Success!</b>\n\n` +
          `Welcome, ${data[0].name}! 🎉\n\n` +
          `You will now receive order notifications via Telegram.\n\n` +
          `📦 You'll be notified when:\n` +
          `  • Your order is being prepared\n` +
          `  • Your order is out for delivery\n` +
          `  • Your order has been delivered`,
          'HTML'
        )
      }
    } else {
      await sendTelegramMessage(
        botToken,
        chatId,
        `❌ <b>Invalid phone number format</b>\n\n` +
        `Please send your phone number in one of these formats:\n` +
        `  • +251912345678\n` +
        `  • 0912345678\n\n` +
        `Use /help for more information.`,
        'HTML'
      )
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  })

  const result = await response.json()
  console.log('Telegram API response:', JSON.stringify(result))
  
  return result
}
