'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useMenuItems, useCreateOrder, OrderItem, useCompanies, useEmployees, useAuth, useOrders, useUpdateOrderStatus, supabase } from '@my-app/api';
import { MenuList } from 'app/features/menu/menu-list';
import { OrderStatus } from '@my-app/api/types';

const STATUS_COLORS = {
    pending: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', label: 'Pending' },
    preparing: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'Preparing' },
    delivering: { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff', label: 'Delivering' },
    delivered: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Delivered' }
};

export default function OrderPage() {
    const { companyId, companyName, user } = useAuth();
    const { data: menu = [], isLoading: menuLoading } = useMenuItems();
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();
    const { data: orders = [], isLoading: ordersLoading } = useOrders();
    const createOrder = useCreateOrder();
    const updateStatus = useUpdateOrderStatus();

    const [cart, setCart] = useState<OrderItem[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || '');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Sync selectedCompanyId if companyId from auth arrives late
    useEffect(() => {
        if (companyId) {
            setSelectedCompanyId(companyId);
        }
    }, [companyId]);

    const { data: employees = [], isLoading: employeesLoading } = useEmployees(selectedCompanyId);

    // Fetch the current user's company details directly for delivery point
    const [userCompanyDetails, setUserCompanyDetails] = useState<any>(null);

    useEffect(() => {
        const fetchUserCompany = async () => {
            if (!companyId) return;

            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', companyId)
                    .single();

                if (data && !error) {
                    setUserCompanyDetails(data);
                }
            } catch (err) {
                console.error('Error fetching user company:', err);
            }
        };

        fetchUserCompany();
    }, [companyId]);

    // Auto-update location based on user's company
    const floor = userCompanyDetails?.floorNumber?.toString() || '';

    const addToCart = (item: any) => {
        if (!item.available) return;
        setCart(prev => {
            const existing = prev.find(i => i.itemId === item.id);
            if (existing) {
                return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { itemId: item.id, name: item.name, quantity: 1, price: item.price }];
        });
    };

    const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus) => {
        const statusFlow: OrderStatus[] = ['pending', 'preparing', 'delivering', 'delivered'];
        const currentIndex = statusFlow.indexOf(currentStatus);
        if (currentIndex < statusFlow.length - 1) {
            const nextStatus = statusFlow[currentIndex + 1];
            try {
                await updateStatus.mutateAsync({ orderId, status: nextStatus });
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const placeOrder = async () => {
        if (!selectedCompanyId || !selectedEmployeeId) {
            alert('Please select your profile');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            await createOrder.mutateAsync({
                items: cart,
                totalPrice: total,
                floorNumber: Number(floor),
                companyId: selectedCompanyId,
                employeeId: selectedEmployeeId,
                status: 'pending'
            });

            setOrderPlaced(true);
            setCart([]);
            // Don't reset company/employee to keep the context for fast re-orders if needed
            // But we can reset employee if it's a kiosk style, for now let's keep it simple
            setTimeout(() => setOrderPlaced(false), 3000);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const activeOrders = orders.filter((o: any) => ['pending', 'preparing', 'delivering'].includes(o.status));
    const recentHistory = orders.filter((o: any) => o.status === 'delivered').slice(0, 5);

    // Only block on menu and companies loading - orders can load in the background
    if (menuLoading || companiesLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <ActivityIndicator size="large" color="#ea580c" />
                <Text style={{ fontSize: 20, color: '#6b7280', fontWeight: '600', marginTop: 24 }}>Preparing your workspace...</Text>
            </View>
        );
    }

    console.log('Order Page Loaded - Menu items:', menu.length, 'Company:', companyName, 'Floor:', floor);

    const displayHeaderLabel = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Office Cafe';

    return (
        <View style={{
            flex: 1,
            backgroundColor: '#f8fafc',
            height: 'calc(100vh - 144px)',
            overflow: 'hidden'
        }}>
            {/* Unified Header */}
            <View style={{
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
                backgroundColor: 'white',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 }}>
                        {displayHeaderLabel} <Text style={{ color: '#ea580c' }}>Cafe</Text> ☕
                    </Text>
                    <View style={{ height: 24, width: 1, backgroundColor: '#e2e8f0' }} />
                    <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Unified Order Dashboard</Text>
                </View>

                {orderPlaced && (
                    <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, border: '1px solid #a7f3d0' }}>
                        <Text style={{ color: '#059669', fontWeight: '800', fontSize: 13 }}>Order Received! ✅</Text>
                    </View>
                )}
            </View>

            {/* Tri-Pane Main Content */}
            <View style={{ flexDirection: 'row', flex: 1, overflow: 'hidden' }}>

                {/* 1. Activity & History Feed */}
                <View style={{ flex: 1, backgroundColor: '#fdfdfe', borderRightWidth: 1, borderRightColor: '#f1f5f9' }}>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Live Activity Feed</Text>

                        {activeOrders.length === 0 && recentHistory.length === 0 ? (
                            <View style={{ padding: 32, backgroundColor: '#f8fafc', borderRadius: 24, border: '1px dashed #e2e8f0', alignItems: 'center' }}>
                                <Text style={{ fontSize: 24, marginBottom: 12 }}>📡</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>No recent activity to track.</Text>
                            </View>
                        ) : (
                            <View style={{ gap: 16 }}>
                                {activeOrders.map((order: any) => {
                                    const statusConfig = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
                                    return (
                                        <View key={order.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <View style={{ backgroundColor: statusConfig.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                    <Text style={{ color: statusConfig.text, fontSize: 10, fontWeight: '800' }}>{statusConfig.label}</Text>
                                                </View>
                                                <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600' }}>#{order.id.slice(0, 4)}</Text>
                                            </View>
                                            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 14 }}>{order.employeeName}</Text>
                                            <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>{order.items.length} items • ETB {order.totalPrice}</Text>
                                            <Pressable
                                                onPress={() => handleUpdateStatus(order.id, order.status)}
                                                style={{ backgroundColor: '#111827', paddingVertical: 8, borderRadius: 10, alignItems: 'center' }}
                                            >
                                                <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Next Step →</Text>
                                            </Pressable>
                                        </View>
                                    );
                                })}

                                {recentHistory.length > 0 && (
                                    <View style={{ marginTop: 24 }}>
                                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Recent Completions</Text>
                                        {recentHistory.map((order: any) => (
                                            <View key={order.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', opacity: 0.7 }}>
                                                <View>
                                                    <Text style={{ fontWeight: '700', color: '#334155', fontSize: 13 }}>{order.employeeName}</Text>
                                                    <Text style={{ color: '#94a3b8', fontSize: 11 }}>Delivered at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                                </View>
                                                <Text style={{ color: '#059669', fontSize: 12, fontWeight: '800' }}>Done</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* 2. Menu Showcase (Center) */}
                <View style={{ flex: 1.8, borderRightWidth: 1, borderRightColor: '#f1f5f9', backgroundColor: '#ffffff' }}>
                    <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }}>Artisanal Menu</Text>
                        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Select items to add to your cart</Text>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 40 }} showsVerticalScrollIndicator={false}>
                        {menu.length === 0 ? (
                            <View style={{ padding: 48, alignItems: 'center' }}>
                                <Text style={{ fontSize: 48, marginBottom: 16 }}>🍽️</Text>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 8 }}>Menu Loading...</Text>
                                <Text style={{ fontSize: 13, color: '#94a3b8' }}>Preparing today's selection</Text>
                            </View>
                        ) : (
                            <MenuList items={menu} onItemPress={addToCart} />
                        )}
                    </ScrollView>
                </View>

                {/* 3. Savour Ticket (Right) */}
                <View style={{ flex: 1, backgroundColor: '#fdfdfe', padding: 32, justifyContent: 'center' }}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 32,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.05,
                        shadowRadius: 40,
                        overflow: 'hidden'
                    }}>
                        <View style={{ backgroundColor: '#111827', padding: 24 }}>
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 }}>Your Savour Ticket</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>#{Math.floor(1000 + Math.random() * 9000)}</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>{new Date().toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <View style={{ padding: 24 }}>
                            <View style={{ marginBottom: 24 }}>
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Delivery Point</Text>
                                    <View style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                                        <Text style={{ fontWeight: '800', color: '#111827', fontSize: 15 }}>{companyName || 'Office Workspace'}</Text>
                                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '600' }}>
                                            {floor ? `FLOOR ${floor}` : 'Workspace Profile'}
                                        </Text>
                                    </View>
                                </View>

                                <View>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Recipient Profile</Text>
                                    <select
                                        style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, border: '2px solid #e2e8f0', fontSize: 15, width: '100%', color: '#111827', fontWeight: '700', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                                        value={selectedEmployeeId}
                                        onChange={(e: any) => setSelectedEmployeeId(e.target.value)}
                                    >
                                        <option value="">Who is this for?</option>
                                        {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </View>
                            </View>

                            <View style={{ borderTopWidth: 2, borderTopColor: '#f1f5f9', borderTopStyle: 'dashed', paddingTop: 20 }}>
                                {cart.length > 0 ? (
                                    <View>
                                        {cart.map(item => (
                                            <View key={item.itemId} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                                <Text style={{ color: '#334155', fontWeight: '600', fontSize: 14 }}>{item.quantity}x {item.name}</Text>
                                                <Text style={{ fontWeight: '700', color: '#111827', fontSize: 14 }}>ETB {item.price * item.quantity}</Text>
                                            </View>
                                        ))}
                                        <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 16, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#ea580c' }}>ETB {totalPrice}</Text>
                                        </View>
                                        <Pressable onPress={placeOrder} disabled={createOrder.isPending} style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, alignItems: 'center', opacity: createOrder.isPending ? 0.7 : 1 }}>
                                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Finalize Order</Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 20 }}>
                                        <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>Basket is empty.</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

