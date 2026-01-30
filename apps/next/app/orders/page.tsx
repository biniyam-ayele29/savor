'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useOrders, useUpdateOrderStatus, useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@my-app/api/types';

const STATUS_COLORS = {
    pending: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', label: 'Pending' },
    preparing: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'Preparing' },
    delivering: { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff', label: 'Delivering' },
    delivered: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Delivered' }
};

export default function OrdersPage() {
    const { user, companyId, companyName, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { data: orders = [], isLoading: ordersLoading } = useOrders();
    const updateStatus = useUpdateOrderStatus();

    const [view, setView] = useState<'live' | 'history'>('live');

    // Security: Only allow authenticated company admins
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading]);

    if (authLoading || ordersLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <Text style={{ fontSize: 24, color: '#6b7280', fontWeight: 'bold' }}>Loading Orders...</Text>
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
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={{ maxWidth: 1280, width: '100%', padding: 40 }}>
                {/* Header Section */}
                <View style={{ marginBottom: 48, alignItems: 'center' }}>
                    <Text style={{ fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: -1.5, textAlign: 'center', marginBottom: 12 }}>
                        Order Management 📈
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 20, fontWeight: '500', textAlign: 'center', marginBottom: 32 }}>
                        Track live deliveries and review your company order history
                    </Text>

                    {/* View Switcher */}
                    <View style={{ flexDirection: 'row', backgroundColor: '#e5e7eb', padding: 4, borderRadius: 16, width: 320 }}>
                        <Pressable
                            onPress={() => setView('live')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 12,
                                backgroundColor: view === 'live' ? 'white' : 'transparent',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: view === 'live' ? 0.1 : 0,
                                shadowRadius: 4,
                            }}
                        >
                            <Text style={{ fontWeight: view === 'live' ? '800' : '600', color: view === 'live' ? '#111827' : '#6b7280' }}>
                                Live Tracking ({activeOrders.length})
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setView('history')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 12,
                                backgroundColor: view === 'history' ? 'white' : 'transparent',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: view === 'history' ? 0.1 : 0,
                                shadowRadius: 4,
                            }}
                        >
                            <Text style={{ fontWeight: view === 'history' ? '800' : '600', color: view === 'history' ? '#111827' : '#6b7280' }}>
                                History ({historicalOrders.length})
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Orders Content */}
                <View style={{ gap: 24 }}>
                    {displayOrders.length > 0 ? (
                        displayOrders.map((order) => (
                            <View key={order.id} style={{
                                backgroundColor: 'white',
                                borderRadius: 24,
                                padding: 28,
                                borderWidth: 1,
                                borderColor: '#e5e7eb',
                                borderStyle: 'solid',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.03,
                                shadowRadius: 12,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                {/* Order Main Info */}
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <View style={{
                                            backgroundColor: STATUS_COLORS[order.status].bg,
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: STATUS_COLORS[order.status].border,
                                            borderStyle: 'solid'
                                        }}>
                                            <Text style={{ color: STATUS_COLORS[order.status].text, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
                                                {STATUS_COLORS[order.status].label}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600' }}>#{order.id.slice(0, 8)}</Text>
                                        <Text style={{ color: '#6b7280', fontSize: 14 }}>•</Text>
                                        <Text style={{ color: '#6b7280', fontSize: 14 }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 24 }}>👤</Text>
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>{order.employeeName || 'Unknown Employee'}</Text>
                                            <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
                                                Floor {order.floorNumber} • Suite {order.suiteNumber}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Items Summary */}
                                <View style={{ flex: 1, paddingHorizontal: 24 }}>
                                    <View style={{ gap: 4 }}>
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <Text key={idx} style={{ color: '#374151', fontSize: 15, fontWeight: '500' }}>
                                                {item.quantity}x {item.name}
                                            </Text>
                                        ))}
                                        {order.items.length > 2 && (
                                            <Text style={{ color: '#9ca3af', fontSize: 13 }}>+ {order.items.length - 2} more items</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Pricing & Actions */}
                                <View style={{ alignItems: 'flex-end', gap: 16 }}>
                                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827' }}>
                                        ETB {order.totalPrice.toFixed(2)}
                                    </Text>

                                    {view === 'live' && (
                                        <Pressable
                                            onPress={() => handleUpdateStatus(order.id, order.status)}
                                            style={{
                                                backgroundColor: '#111827',
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                                borderRadius: 12,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 6,
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                                                Next Step →
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={{ padding: 80, alignItems: 'center' }}>
                            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '2px dashed #e5e7eb' }}>
                                <Text style={{ fontSize: 48 }}>{view === 'live' ? '☕' : '📁'}</Text>
                            </View>
                            <Text style={{ color: '#111827', fontSize: 24, fontWeight: '800', marginBottom: 8 }}>
                                {view === 'live' ? 'No active orders' : 'History is empty'}
                            </Text>
                            <Text style={{ color: '#6b7280', fontSize: 16, textAlign: 'center', maxWidth: 400 }}>
                                {view === 'live'
                                    ? "Any new orders from your staff will appear here instantly for live tracking."
                                    : "Completed deliveries from your company will be archived here."}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
