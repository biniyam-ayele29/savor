'use client'

import { useEffect } from 'react';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getTelegramService } from './telegram';

export function useTelegramNotifications() {
    useEffect(() => {
        let channel: RealtimeChannel;

        const setupTelegramNotifications = async () => {
            const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
            
            if (!botToken) {
                console.warn('⚠️ Telegram bot token not configured. Set NEXT_PUBLIC_TELEGRAM_BOT_TOKEN in .env.local');
                return;
            }

            console.log('📱 Setting up Telegram notifications...');

            const telegramService = getTelegramService(botToken);

            // Subscribe to order updates
            channel = supabase
                .channel('telegram-order-updates')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                    },
                    async (payload) => {
                        const order = payload.new as any;
                        const oldOrder = payload.old as any;

                        // Only send notification if status changed
                        if (order.status !== oldOrder.status) {
                            console.log('📨 Sending Telegram notification for order:', order.id);

                            try {
                                // Get employee/user information with telegram_chat_id
                                const { data: employee, error } = await supabase
                                    .from('employees')
                                    .select('name, phone, telegram_chat_id')
                                    .eq('id', order.employee_id)
                                    .single();

                                if (error) {
                                    console.error('Failed to fetch employee:', error);
                                    return;
                                }

                                if (!employee?.telegram_chat_id) {
                                    console.log('⚠️ Employee does not have Telegram linked:', employee?.name);
                                    return;
                                }

                                // Get company name
                                const { data: company } = await supabase
                                    .from('companies')
                                    .select('name')
                                    .eq('id', order.company_id)
                                    .single();

                                // Parse order items
                                const items = typeof order.items === 'string' 
                                    ? JSON.parse(order.items) 
                                    : order.items;

                                // Send Telegram message
                                const success = await telegramService.sendOrderNotification(
                                    employee.telegram_chat_id,
                                    order.id,
                                    order.status,
                                    items,
                                    order.total_price,
                                    company?.name
                                );

                                if (success) {
                                    console.log('✅ Telegram notification sent successfully!');
                                } else {
                                    console.error('❌ Failed to send Telegram notification');
                                }
                            } catch (error) {
                                console.error('Error processing Telegram notification:', error);
                            }
                        }
                    }
                )
                .subscribe((status) => {
                    console.log('📡 Telegram notifications subscription status:', status);
                });
        };

        if (typeof window !== 'undefined') {
            setupTelegramNotifications();
        }

        return () => {
            if (channel) {
                console.log('🔌 Unsubscribing from Telegram notifications...');
                supabase.removeChannel(channel);
            }
        };
    }, []);
}
