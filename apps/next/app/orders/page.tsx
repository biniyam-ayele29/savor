'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useOrders, useUpdateOrderStatus, useAuth, useOrderNotifications, useTelegramNotifications, setToastCallback } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@my-app/api/types';
import { useTheme } from 'app/features/theme/theme-context';
import { NotificationPermissionButton } from 'app/features/notifications/notification-button';
import { useToast } from 'app/features/notifications';

const STATUS_COLORS = {
    pending: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'Pending' },
    preparing: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Preparing' },
    delivering: { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff', label: 'Delivering' },
    delivered: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Delivered' }
};

export default function OrdersPage() {
    const { user, companyId, companyName, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const { showToast } = useToast();
    const { data: orders = [], isLoading: ordersLoading } = useOrders();
    const updateStatus = useUpdateOrderStatus();

    // Set up toast callback for notifications
    useEffect(() => {
        setToastCallback((title, message, type) => {
            showToast({ title, message, type });
        });
    }, [showToast]);

    // Enable real-time notifications for admin
    useOrderNotifications(companyId || undefined);
    
    // Enable Telegram notifications
    useTelegramNotifications();

    const [view, setView] = useState<'live' | 'history'>('live');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading]);

    if (authLoading || ordersLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
            }}>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                }}>
                    <ActivityIndicator size="large" color="#E68B2C" />
                </View>
                <Text style={{ fontSize: 15, color: '#78716c', fontWeight: '600' }}>Loading Orders...</Text>
            </View>
        );
    }

    if (!user || !companyId) return null;

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'delivering'].includes(o.status));
    const historicalOrders = orders.filter(o => o.status === 'delivered');
    const displayOrders = view === 'live' ? activeOrders : historicalOrders;

    const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus) => {
        const statusFlow: OrderStatus[] = ['pending', 'preparing', 'delivering', 'delivered'];
        const currentIndex = statusFlow.indexOf(currentStatus);
        if (currentIndex < statusFlow.length - 1) {
            const nextStatus = statusFlow[currentIndex + 1];
            try {
                await updateStatus.mutateAsync({ orderId, status: nextStatus });
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Failed to update status');
            }
        }
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}
        >
            <View style={{ maxWidth: 1280, width: '100%', padding: 40 }}>
                {/* Header */}
                <View style={{ marginBottom: 48, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
                        <Text style={{
                            fontSize: 44,
                            fontWeight: '900',
                            color: colors.text,
                            letterSpacing: -1,
                            textAlign: 'center',
                        }}>
                            Order Management
                        </Text>
                        <NotificationPermissionButton />
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '500', textAlign: 'center', marginBottom: 32 }}>
                        Track live deliveries and review your company order history
                    </Text>

                    {/* View Switcher */}
                    <View style={{
                        flexDirection: 'row',
                        backgroundImage: colors.gradientSurface,
                        padding: 6,
                        borderRadius: 16,
                        width: 340,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                    }}>
                        <Pressable
                            onPress={() => setView('live')}
                            style={{
                                flex: 1,
                                paddingVertical: 14,
                                borderRadius: 12,
                                backgroundImage: view === 'live' ? 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)' : 'transparent',
                                alignItems: 'center',
                                shadowColor: view === 'live' ? '#000' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: view === 'live' ? 0.06 : 0,
                                shadowRadius: view === 'live' ? 8 : 0,
                                borderWidth: 1,
                                borderColor: view === 'live' ? 'rgba(180, 83, 9, 0.2)' : 'transparent',
                            }}
                        >
                            <Text style={{ fontWeight: view === 'live' ? '800' : '600', color: view === 'live' ? '#1c1917' : '#78716c', fontSize: 14 }}>
                                Live Tracking ({activeOrders.length})
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setView('history')}
                            style={{
                                flex: 1,
                                paddingVertical: 14,
                                borderRadius: 12,
                                backgroundImage: view === 'history' ? 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)' : 'transparent',
                                alignItems: 'center',
                                shadowColor: view === 'history' ? '#000' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: view === 'history' ? 0.06 : 0,
                                shadowRadius: view === 'history' ? 8 : 0,
                                borderWidth: 1,
                                borderColor: view === 'history' ? 'rgba(180, 83, 9, 0.2)' : 'transparent',
                            }}
                        >
                            <Text style={{ fontWeight: view === 'history' ? '800' : '600', color: view === 'history' ? '#1c1917' : '#78716c', fontSize: 14 }}>
                                History ({historicalOrders.length})
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Orders Content */}
                <View style={{ gap: 24 }}>
                    {displayOrders.length > 0 ? (
                        displayOrders.map((order) => (
                            <View
                                key={order.id}
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                                    borderRadius: 20,
                                    padding: 28,
                                    borderWidth: 1,
                                    borderColor: '#e7e5e4',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 16,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 24,
                                }}
                            >
                                <View style={{ flex: 1, minWidth: 200 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <View style={{
                                            backgroundImage: `linear-gradient(135deg, ${STATUS_COLORS[order.status].bg} 0%, ${STATUS_COLORS[order.status].border} 100%)`,
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            borderColor: STATUS_COLORS[order.status].border,
                                        }}>
                                            <Text style={{ color: STATUS_COLORS[order.status].text, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>
                                                {STATUS_COLORS[order.status].label}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#78716c', fontSize: 13, fontWeight: '600' }}>#{order.id.slice(0, 8)}</Text>
                                        <Text style={{ color: '#a8a29e' }}>•</Text>
                                        <Text style={{ color: '#78716c', fontSize: 13 }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <View style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 1,
                                            borderColor: '#e7e5e4',
                                        }}>
                                            <Text style={{ fontSize: 22 }}>👤</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1c1917' }}>{order.employeeName || 'Unknown Employee'}</Text>
                                            <Text style={{ color: '#78716c', fontSize: 14, fontWeight: '500' }}>Floor {order.floorNumber}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flex: 1, minWidth: 180, paddingHorizontal: 16 }}>
                                    <View style={{ gap: 6 }}>
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <Text key={idx} style={{ color: '#44403c', fontSize: 15, fontWeight: '500' }}>
                                                {item.quantity}x {item.name}
                                            </Text>
                                        ))}
                                        {order.items.length > 2 && (
                                            <Text style={{ color: '#a8a29e', fontSize: 13 }}>+ {order.items.length - 2} more items</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-end', gap: 16 }}>
                                    <View style={{
                                        backgroundImage: 'linear-gradient(90deg, #E68B2C, #D97706)',
                                        paddingHorizontal: 14,
                                        paddingVertical: 6,
                                        borderRadius: 10,
                                    }}>
                                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff', fontVariant: ['tabular-nums'] }}>
                                            ETB {order.totalPrice.toFixed(2)}
                                        </Text>
                                    </View>

                                    {view === 'live' && (
                                        <Pressable
                                            onPress={() => handleUpdateStatus(order.id, order.status)}
                                            style={({ pressed }) => ({
                                                backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                                paddingHorizontal: 22,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.15,
                                                shadowRadius: 12,
                                                opacity: pressed ? 0.95 : 1,
                                            })}
                                        >
                                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Next Step →</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={{
                            padding: 64,
                            alignItems: 'center',
                            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                            borderRadius: 20,
                            borderWidth: 2,
                            borderColor: '#e7e5e4',
                            borderStyle: 'dashed',
                        }}>
                            <View style={{
                                width: 96,
                                height: 96,
                                borderRadius: 48,
                                backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24,
                            }}>
                                <Text style={{ fontSize: 44 }}>{view === 'live' ? '☕' : '📁'}</Text>
                            </View>
                            <Text style={{ color: '#1c1917', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>
                                {view === 'live' ? 'No active orders' : 'History is empty'}
                            </Text>
                            <Text style={{ color: '#78716c', fontSize: 15, textAlign: 'center', maxWidth: 400 }}>
                                {view === 'live'
                                    ? 'Any new orders from your staff will appear here instantly for live tracking.'
                                    : 'Completed deliveries from your company will be archived here.'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
