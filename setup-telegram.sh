#!/bin/bash

# Telegram Bot Quick Start Script
# This script helps you set up Telegram notifications quickly

echo "🚀 Savor Telegram Bot Setup"
echo "============================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo "Create .env.local file first with your Supabase credentials."
    exit 1
fi

# Check if TELEGRAM_BOT_TOKEN is set
if ! grep -q "NEXT_PUBLIC_TELEGRAM_BOT_TOKEN" .env.local; then
    echo "⚠️  NEXT_PUBLIC_TELEGRAM_BOT_TOKEN not found in .env.local"
    echo ""
    echo "📱 Step 1: Create your Telegram bot"
    echo "   1. Open Telegram and search for @BotFather"
    echo "   2. Send: /newbot"
    echo "   3. Follow instructions to get your bot token"
    echo ""
    read -p "Enter your bot token: " BOT_TOKEN
    echo "NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=$BOT_TOKEN" >> .env.local
    echo "✅ Bot token added to .env.local"
else
    echo "✅ Bot token found in .env.local"
fi

echo ""
echo "📊 Step 2: Database Setup"
echo "Run this SQL in Supabase SQL Editor:"
echo ""
echo "ALTER TABLE employees ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;"
echo "CREATE INDEX IF NOT EXISTS idx_employees_telegram_chat_id ON employees(telegram_chat_id);"
echo ""
read -p "Press Enter after running the SQL..."

echo ""
echo "📦 Step 3: Install dependencies"
if [ ! -d "node_modules/node-telegram-bot-api" ]; then
    echo "Installing node-telegram-bot-api..."
    npm install node-telegram-bot-api
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🤖 Step 4: Start the bot"
echo ""
echo "Choose deployment method:"
echo "  1) Simple Node.js bot (for testing - easiest)"
echo "  2) Supabase Edge Function (for production)"
echo ""
read -p "Choose (1 or 2): " CHOICE

if [ "$CHOICE" == "1" ]; then
    echo ""
    echo "🚀 Starting Node.js bot..."
    echo "Press Ctrl+C to stop"
    echo ""
    node telegram-bot-simple.js
elif [ "$CHOICE" == "2" ]; then
    echo ""
    echo "📤 Deploying to Supabase..."
    echo ""
    
    # Check if supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        echo "❌ Supabase CLI not installed"
        echo "Install it: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    # Deploy function
    npx supabase functions deploy telegram-webhook --no-verify-jwt
    
    echo ""
    echo "✅ Function deployed!"
    echo ""
    echo "📡 Now set the webhook:"
    echo ""
    
    # Get bot token from .env.local
    BOT_TOKEN=$(grep NEXT_PUBLIC_TELEGRAM_BOT_TOKEN .env.local | cut -d '=' -f2)
    
    echo "Run this command (replace YOUR_PROJECT_URL):"
    echo ""
    echo "curl -X POST \"https://api.telegram.org/bot$BOT_TOKEN/setWebhook\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"url\": \"https://YOUR_PROJECT_URL.supabase.co/functions/v1/telegram-webhook\"}'"
    echo ""
else
    echo "Invalid choice"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Testing:"
echo "  1. Open Telegram"
echo "  2. Search for your bot"
echo "  3. Send: /start"
echo "  4. Send your phone number"
echo "  5. Update an order status from admin panel"
echo "  6. You should receive a Telegram message!"
echo ""
echo "📚 For more help, see:"
echo "  - README_NOTIFICATIONS.md"
echo "  - TELEGRAM_SETUP.md"
echo "  - TELEGRAM_DEPLOYMENT.md"
