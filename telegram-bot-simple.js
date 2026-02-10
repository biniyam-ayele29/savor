#!/usr/bin/env node

/**
 * Simple Telegram Bot for Savor Order Notifications
 * 
 * This bot allows users to register their phone number and receive order notifications.
 * 
 * Setup:
 * 1. npm install node-telegram-bot-api @supabase/supabase-js dotenv
 * 2. Add NEXT_PUBLIC_TELEGRAM_BOT_TOKEN to .env.local
 * 3. Run: node telegram-bot-simple.js
 */

require('dotenv').config({ path: '.env.local' })
const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')

// Check environment variables
if (!process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: NEXT_PUBLIC_TELEGRAM_BOT_TOKEN not found in .env.local')
  process.exit(1)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Error: Supabase credentials not found in .env.local')
  process.exit(1)
}

// Initialize bot and Supabase
const bot = new TelegramBot(process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN, { polling: true })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('🤖 Telegram Bot Starting...')
console.log('📱 Waiting for messages...\n')

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const firstName = msg.from?.first_name || 'there'
  
  console.log(`📨 /start command from ${firstName} (${chatId})`)
  
  bot.sendMessage(
    chatId,
    `👋 Welcome to Savor Order Notifications, ${firstName}!\n\n` +
    `📱 To receive order updates, please send your registered phone number.\n\n` +
    `Format: +251912345678 or 0912345678`,
    { parse_mode: 'HTML' }
  )
})

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  
  console.log(`📨 /help command from ${msg.from?.first_name} (${chatId})`)
  
  bot.sendMessage(
    chatId,
    `🆘 <b>Help</b>\n\n` +
    `Send your registered phone number to link your account and receive order notifications.\n\n` +
    `<b>Commands:</b>\n` +
    `/start - Start the bot\n` +
    `/help - Show this help message\n` +
    `/status - Check if you're registered`,
    { parse_mode: 'HTML' }
  )
})

// Handle /status command
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id
  
  console.log(`📨 /status command from ${msg.from?.first_name} (${chatId})`)
  
  try {
    const { data: employee } = await supabase
      .from('employees')
      .select('name, phone')
      .eq('telegram_chat_id', chatId.toString())
      .single()

    if (employee) {
      bot.sendMessage(
        chatId,
        `✅ <b>You're registered!</b>\n\n` +
        `<b>Name:</b> ${employee.name}\n` +
        `<b>Phone:</b> ${employee.phone}\n\n` +
        `You will receive order notifications here. 📦`,
        { parse_mode: 'HTML' }
      )
      console.log(`✅ User registered: ${employee.name}`)
    } else {
      bot.sendMessage(
        chatId,
        `❌ You're not registered yet.\n\n` +
        `Send your phone number to register.`
      )
      console.log(`⚠️ User not registered`)
    }
  } catch (error) {
    console.error('Error checking status:', error)
    bot.sendMessage(chatId, '❌ An error occurred. Please try again.')
  }
})

// Handle phone number registration
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text?.trim()
  
  // Skip commands
  if (!text || text.startsWith('/')) return
  
  console.log(`📨 Message from ${msg.from?.first_name} (${chatId}): ${text}`)
  
  // Clean and validate phone number
  const cleanedPhone = text.replace(/[\s-()]/g, '')
  const phoneRegex = /^(\+251|0)?9\d{8}$/
  
  if (!phoneRegex.test(cleanedPhone)) {
    bot.sendMessage(
      chatId,
      `❌ <b>Invalid phone number format</b>\n\n` +
      `Please send your phone number in one of these formats:\n` +
      `  • +251912345678\n` +
      `  • 0912345678\n\n` +
      `Use /help for more information.`,
      { parse_mode: 'HTML' }
    )
    console.log(`❌ Invalid phone format: ${text}`)
    return
  }
  
  // Normalize phone number
  let normalizedPhone = cleanedPhone
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '+251' + normalizedPhone.substring(1)
  } else if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+251' + normalizedPhone
  }
  
  console.log(`🔍 Looking up phone: ${text}, ${cleanedPhone}, ${normalizedPhone}`)
  
  try {
    // Try to find and update employee
    const { data, error } = await supabase
      .from('employees')
      .update({ telegram_chat_id: chatId.toString() })
      .or(`phone.eq.${text},phone.eq.${cleanedPhone},phone.eq.${normalizedPhone}`)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      bot.sendMessage(
        chatId,
        '❌ An error occurred. Please try again later.'
      )
      return
    }
    
    if (!data || data.length === 0) {
      bot.sendMessage(
        chatId,
        `❌ <b>Phone number not found</b>\n\n` +
        `The number <code>${text}</code> is not registered in our system.\n\n` +
        `Please make sure you entered the same number you registered with.`,
        { parse_mode: 'HTML' }
      )
      console.log(`❌ Phone not found in database`)
    } else {
      bot.sendMessage(
        chatId,
        `✅ <b>Success!</b>\n\n` +
        `Welcome, ${data[0].name}! 🎉\n\n` +
        `You will now receive order notifications via Telegram.\n\n` +
        `📦 You'll be notified when:\n` +
        `  • Your order is being prepared\n` +
        `  • Your order is out for delivery\n` +
        `  • Your order has been delivered`,
        { parse_mode: 'HTML' }
      )
      console.log(`✅ Successfully registered: ${data[0].name} (${data[0].phone})`)
    }
  } catch (error) {
    console.error('Error processing registration:', error)
    bot.sendMessage(
      chatId,
      '❌ An error occurred. Please try again later.'
    )
  }
})

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

console.log('✅ Bot is running!')
console.log('💬 Open Telegram and search for your bot to test it.\n')
