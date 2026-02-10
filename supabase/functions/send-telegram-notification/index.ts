import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const { orderId } = await req.json()
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing notification for order:', orderId)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        employee_id,
        company_id
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get employee details with telegram_chat_id
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('name, telegram_chat_id')
      .eq('id', order.employee_id)
      .single()

    if (employeeError || !employee || !employee.telegram_chat_id) {
      console.log('Employee not found or no telegram_chat_id:', employeeError)
      return new Response(
        JSON.stringify({ error: 'Employee not registered with Telegram' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company name
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', order.company_id)
      .single()

    // Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('item_name, quantity, price')
      .eq('order_id', orderId)

    // Build message
    const statusEmojis: Record<string, string> = {
      pending: '⏳',
      preparing: '👨‍🍳',
      delivering: '🚚',
      delivered: '✅',
    }

    const emoji = statusEmojis[order.status.toLowerCase()] || '📦'
    const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1)

    const itemsList = items
      ? items.map((item: any) => `  • ${item.quantity}x ${item.item_name}`).join('\n')
      : ''

    const message = `
${emoji} <b>Order Status Update</b>

<b>Order ID:</b> #${order.id.slice(0, 8)}
<b>Status:</b> ${statusText}
${company ? `<b>Company:</b> ${company.name}\n` : ''}
${itemsList ? `<b>Items:</b>\n${itemsList}\n\n` : ''}
<b>Total:</b> ETB ${order.total_price}

${getStatusMessage(order.status)}
    `.trim()

    // Send Telegram message
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: employee.telegram_chat_id,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const telegramResult = await telegramResponse.json()
    console.log('Telegram response:', telegramResult)

    if (!telegramResult.ok) {
      throw new Error(`Telegram API error: ${JSON.stringify(telegramResult)}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: 'Your order has been received and is being processed.',
    preparing: 'Your order is being prepared by our kitchen staff.',
    delivering: 'Your order is on the way to your location!',
    delivered: 'Your order has been delivered. Enjoy your meal! 🎉',
  }
  return messages[status.toLowerCase()] || 'Your order status has been updated.'
}
