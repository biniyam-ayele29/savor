'use client'

interface TelegramMessage {
    chat_id: string | number;
    text: string;
    parse_mode?: 'HTML' | 'Markdown';
}

export class TelegramService {
    private botToken: string;
    private apiUrl: string;

    constructor(botToken: string) {
        this.botToken = botToken;
        this.apiUrl = `https://api.telegram.org/bot${botToken}`;
    }

    async sendMessage(chatId: string | number, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: parseMode,
                }),
            });

            const data = await response.json();
            
            if (!data.ok) {
                console.error('Telegram API error:', data);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to send Telegram message:', error);
            return false;
        }
    }

    async sendOrderNotification(
        chatId: string | number,
        orderId: string,
        status: string,
        items: { name: string; quantity: number }[],
        totalPrice: number,
        companyName?: string
    ): Promise<boolean> {
        const statusEmojis: Record<string, string> = {
            pending: '⏳',
            preparing: '👨‍🍳',
            delivering: '🚚',
            delivered: '✅',
        };

        const emoji = statusEmojis[status.toLowerCase()] || '📦';
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);

        const itemsList = items
            .map(item => `  • ${item.quantity}x ${item.name}`)
            .join('\n');

        const message = `
${emoji} <b>Order Status Update</b>

<b>Order ID:</b> #${orderId.slice(0, 8)}
<b>Status:</b> ${statusText}
${companyName ? `<b>Company:</b> ${companyName}\n` : ''}
<b>Items:</b>
${itemsList}

<b>Total:</b> ETB ${totalPrice.toFixed(2)}

${this.getStatusMessage(status)}
        `.trim();

        return this.sendMessage(chatId, message);
    }

    private getStatusMessage(status: string): string {
        const messages: Record<string, string> = {
            pending: 'Your order has been received and is being processed.',
            preparing: 'Your order is being prepared by our kitchen staff.',
            delivering: 'Your order is on the way to your location!',
            delivered: 'Your order has been delivered. Enjoy your meal! 🎉',
        };

        return messages[status.toLowerCase()] || 'Your order status has been updated.';
    }
}

// Singleton instance
let telegramService: TelegramService | null = null;

export function getTelegramService(botToken?: string): TelegramService {
    if (!telegramService && botToken) {
        telegramService = new TelegramService(botToken);
    }
    
    if (!telegramService) {
        throw new Error('Telegram service not initialized. Please provide a bot token.');
    }
    
    return telegramService;
}
