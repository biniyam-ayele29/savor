'use client'

import { useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeChannel } from '@supabase/supabase-js';

// This will be injected by the component using this hook
let toastCallback: ((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void) | null = null;

export function setToastCallback(callback: typeof toastCallback) {
    toastCallback = callback;
}

export function useOrderNotifications(companyId?: string) {
    const queryClient = useQueryClient();

    const showNotification = useCallback((title: string, body: string, type: 'new' | 'update' = 'new') => {
        // Show in-app toast notification
        if (toastCallback) {
            toastCallback(title, body, type === 'new' ? 'success' : 'info');
        }

        // Also show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/savor-logo.png',
                badge: '/savor-logo.png',
                tag: type === 'new' ? 'new-order' : 'order-update',
                requireInteraction: false,
            });

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }

        // Console log for debugging
        console.log(`[${type.toUpperCase()}] ${title}: ${body}`);
    }, []);

    useEffect(() => {
        let channel: RealtimeChannel;
        let retryTimeout: NodeJS.Timeout;

        const setupRealtimeSubscription = async () => {
            console.log('🔔 Setting up realtime notifications');
            console.log('   Company ID:', companyId);
            
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                console.log('📱 Requesting notification permission...');
                await Notification.requestPermission();
            }

            console.log('📱 Current notification permission:', Notification.permission);

            // Subscribe to order changes
            channel = supabase
                .channel('orders-changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'orders',
                    },
                    (payload) => {
                        console.log('✅ INSERT EVENT RECEIVED!', payload);
                        
                        const order = payload.new as any;
                        showNotification(
                            '🛒 New Order Received!',
                            `Order #${order.id.slice(0, 8)} - ETB ${order.total_price}`,
                            'new'
                        );

                        // Invalidate queries to refresh the UI
                        queryClient.invalidateQueries({ queryKey: ['orders'] });
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                    },
                    (payload) => {
                        console.log('🔄 UPDATE EVENT RECEIVED!', payload);
                        
                        const order = payload.new as any;
                        const oldOrder = payload.old as any;

                        // Only notify if status actually changed
                        if (order.status !== oldOrder.status) {
                            console.log('✅ Status changed! Showing notification...');
                            const statusEmoji = {
                                pending: '⏳',
                                preparing: '👨‍🍳',
                                delivering: '🚚',
                                delivered: '✅',
                            }[order.status] || '📦';

                            showNotification(
                                `${statusEmoji} Order Status Updated`,
                                `Order #${order.id.slice(0, 8)} is now ${order.status}`,
                                'update'
                            );
                        }

                        // Invalidate queries to refresh the UI
                        queryClient.invalidateQueries({ queryKey: ['orders'] });
                    }
                )
                .subscribe((status, err) => {
                    console.log('📡 Realtime subscription status:', status);
                    
                    if (err) {
                        console.error('❌ Realtime subscription error details:', err);
                    }
                    
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Successfully subscribed to order changes!');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Failed to subscribe to realtime channel');
                        console.error('   Error details:', err);
                        console.log('   Possible causes:');
                        console.log('   1. Realtime not enabled in Supabase Dashboard');
                        console.log('   2. RLS policies blocking subscription');
                        console.log('   3. Network/connection issue');
                        console.log('🔄 Will retry in 5 seconds...');
                        // Retry after 5 seconds
                        retryTimeout = setTimeout(() => {
                            if (channel) {
                                supabase.removeChannel(channel);
                            }
                            setupRealtimeSubscription();
                        }, 5000);
                    } else if (status === 'TIMED_OUT') {
                        console.error('⏱️ Realtime subscription timed out');
                        console.log('🔄 Will retry in 5 seconds...');
                        // Retry after 5 seconds
                        retryTimeout = setTimeout(() => {
                            if (channel) {
                                supabase.removeChannel(channel);
                            }
                            setupRealtimeSubscription();
                        }, 5000);
                    }
                });
        };

        if (typeof window !== 'undefined') {
            setupRealtimeSubscription();
        }

        // Cleanup subscription on unmount
        return () => {
            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }
            if (channel) {
                console.log('🔌 Unsubscribing from realtime channel...');
                supabase.removeChannel(channel);
            }
        };
    }, [companyId, queryClient, showNotification]);

    return { requestNotificationPermission: async () => {
        if ('Notification' in window) {
            return await Notification.requestPermission();
        }
        return 'denied';
    }};
}
