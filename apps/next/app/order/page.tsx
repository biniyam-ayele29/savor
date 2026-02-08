'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useMenuItems, useCreateOrder, OrderItem, useCompanies, useEmployees, useAuth, useOrders, supabase } from '@my-app/api';
import { MenuList } from 'app/features/menu/menu-list';
import { OrderStatus } from '@my-app/api/types';
import {
    Coffee,
    CheckCircle2,
    Activity,
    UtensilsCrossed,
    Receipt,
    Plus,
    Minus,
    X,
    Clock,
    MapPin,
    Building2,
    Mail,
    Phone
} from 'lucide-react';

const STATUS_COLORS = {
    pending: { bg: '#FFF7ED', text: '#9A3412', border: '#FFEDD5', label: 'Pending' },
    preparing: { bg: '#EFF6FF', text: '#1E40AF', border: '#DBEAFE', label: 'Preparing' },
    delivering: { bg: '#F5F3FF', text: '#5B21B6', border: '#EDE9FE', label: 'Delivering' },
    delivered: { bg: '#ECFDF5', text: '#065F46', border: '#D1FAE5', label: 'Delivered' },
    unknown: { bg: '#F5F5F4', text: '#44403C', border: '#E7E5E4', label: 'Unknown' }
};

const THEME = {
    primary: '#B45309',
    secondary: '#D97706',
    surface: '#FFFFFF',
    background: '#FAFAF9',
    text: '#1C1917',
    textMuted: '#78716C',
    border: '#E7E5E4',
    accent: '#FEF3C7'
};

const getStatusConfig = (status: string) => {
    if (!status) return STATUS_COLORS.unknown;

    // Normalize status
    const normalized = status.toLowerCase().trim();

    // Direct match
    if (STATUS_COLORS[normalized as keyof typeof STATUS_COLORS]) {
        return STATUS_COLORS[normalized as keyof typeof STATUS_COLORS];
    }

    // Mappings for non-standard statuses
    if (normalized.includes('ready') || normalized.includes('pickup')) {
        return { ...STATUS_COLORS.delivering, label: 'Ready for Pick Up' };
    }

    if (normalized.includes('being prepared') || normalized.includes('cooking')) {
        return { ...STATUS_COLORS.preparing, label: status }; // Keep original label but use preparing colors
    }

    if (normalized.includes('way') || normalized.includes('route')) {
        return { ...STATUS_COLORS.delivering, label: status };
    }

    if (normalized.includes('done') || normalized.includes('complete')) {
        return { ...STATUS_COLORS.delivered, label: status };
    }

    // Default fallback - show original text with neutral styling
    return { ...STATUS_COLORS.unknown, label: status };
};

const CircularStatusIndicator = ({ status, size = 32 }: { status: string; size?: number }) => {
    const config = getStatusConfig(status);
    const normalized = status.toLowerCase().trim();

    // Map status to progress percentage
    let progress = 0.1;
    if (normalized === 'pending') progress = 0.25;
    else if (normalized.includes('prepare') || normalized.includes('cook')) progress = 0.5;
    else if (normalized.includes('ready') || normalized.includes('pickup')) progress = 0.75;
    else if (normalized.includes('deliver') || normalized.includes('way')) progress = 0.85;
    else if (normalized.includes('done') || normalized.includes('complete') || normalized === 'delivered') progress = 1;

    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Circle for progress */}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={THEME.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={config.text}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <View style={{ position: 'absolute' }}>
                {normalized === 'pending' && <Clock size={size * 0.5} color={config.text} />}
                {(normalized.includes('prepare') || normalized.includes('cook')) && <Activity size={size * 0.5} color={config.text} />}
                {(normalized.includes('ready') || normalized.includes('pickup')) && <MapPin size={size * 0.5} color={config.text} />}
                {(normalized.includes('deliver') || normalized.includes('way')) && <MapPin size={size * 0.5} color={config.text} />}
                {(normalized.includes('done') || normalized.includes('complete') || normalized === 'delivered') && <CheckCircle2 size={size * 0.5} color={config.text} />}
            </View>
        </View>
    );
};

export default function OrderPage() {
    const cleanDescription = (desc: string) => {
        if (!desc) return '';
        return desc.replace('driver pickup', 'pick up').replace('driver ', '');
    };
    const {
        companyId,
        companyName,
        companyFloor,
        companyEmail: companyEmailFromAuth,
        companyPhone: companyPhoneFromAuth,
        companyLogoUrl,
        user,
        isLoading: authLoading
    } = useAuth();
    const { data: menu = [], isLoading: menuLoading } = useMenuItems();
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();
    const { data: orders = [], isLoading: ordersLoading } = useOrders();
    const createOrder = useCreateOrder();

    const [cart, setCart] = useState<OrderItem[]>([]);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || '');
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Quantity selector modal state
    const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
    const [itemQuantity, setItemQuantity] = useState(1);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (companyId) {
            setSelectedCompanyId(companyId);
        }
    }, [companyId]);

    // We use data directly from useAuth context

    // Cleanup the redundant fetching logic that caused the console error

    // Use centralized details from useAuth context
    const floor = companyFloor || '';
    const companyEmail = companyEmailFromAuth || '';
    const companyPhone = companyPhoneFromAuth || '';

    // Open quantity modal when clicking an item
    const handleItemClick = (item: any) => {
        if (!item.available) return;
        setSelectedMenuItem(item);
        // Check if item already in cart, use that quantity as default
        const existingItem = cart.find(i => i.itemId === item.id);
        setItemQuantity(existingItem ? existingItem.quantity : 1);
    };

    // Add item with selected quantity to cart
    const addToCartWithQuantity = () => {
        if (!selectedMenuItem) return;
        setCart(prev => {
            const existing = prev.find(i => i.itemId === selectedMenuItem.id);
            if (existing) {
                return prev.map(i => i.itemId === selectedMenuItem.id ? { ...i, quantity: itemQuantity } : i);
            }
            return [...prev, { itemId: selectedMenuItem.id, name: selectedMenuItem.name, quantity: itemQuantity, price: selectedMenuItem.price }];
        });
        setSelectedMenuItem(null);
        setItemQuantity(1);
    };

    // Close the quantity modal
    const closeQuantityModal = () => {
        setSelectedMenuItem(null);
        setItemQuantity(1);
    };

    // Update cart item quantity
    const updateCartQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or less
            setCart(prev => prev.filter(i => i.itemId !== itemId));
        } else {
            setCart(prev => prev.map(i =>
                i.itemId === itemId ? { ...i, quantity: newQuantity } : i
            ));
        }
    };

    // Remove item from cart
    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.itemId !== itemId));
    };

    const placeOrder = async () => {
        // Use multiple fallbacks for companyId
        const orderCompanyId = selectedCompanyId || companyId;

        if (!orderCompanyId || !user?.id) {
            alert('Missing order credentials. Please try logging in again.');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderFloor = companyFloor || '1';

        try {
            await createOrder.mutateAsync({
                items: cart,
                totalPrice: total,
                floorNumber: Number(orderFloor),
                companyId: orderCompanyId,
                employeeId: user.id,
                status: 'pending'
            });

            setOrderPlaced(true);
            setCart([]);
            setShowConfirmation(false);
            setTimeout(() => setOrderPlaced(false), 3000);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const [view, setView] = useState<'live' | 'history'>('live');

    // Robust status grouping helpers
    const isActiveStatus = (status: string) => {
        if (!status) return true; // Treat unknown/new as active
        const s = status.toLowerCase();
        return !s.includes('delivered') && !s.includes('cancelled') && !s.includes('done') && !s.includes('complete');
    };

    const isHistoryStatus = (status: string) => {
        if (!status) return false;
        const s = status.toLowerCase();
        return s.includes('delivered') || s.includes('cancelled') || s.includes('done') || s.includes('complete');
    };

    const activeOrders = orders.filter((o: any) => isActiveStatus(o.status));
    const historyOrders = orders.filter((o: any) => isHistoryStatus(o.status));
    const displayOrders = view === 'live' ? activeOrders : historyOrders;

    // Helper: total item count from order_items (sum of quantities)
    const getTotalItemCount = (order: any) =>
        (order.items || []).reduce((sum: number, i: OrderItem) => sum + (i.quantity || 0), 0);

    if (authLoading || menuLoading || companiesLoading || ordersLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fafaf9',
            }}>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: '#fed7aa',
                }}>
                    <ActivityIndicator size="large" color="#b45309" />
                </View>
                <Text style={{
                    fontSize: 15,
                    color: '#78716c',
                    fontWeight: '600',
                    letterSpacing: 0.3,
                }}>Preparing your workspace...</Text>
                <Text style={{
                    fontSize: 13,
                    color: '#a8a29e',
                    marginTop: 6,
                }}>Loading menu, orders, and activity</Text>
            </View>
        );
    }

    const displayHeaderLabel = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Savor';

    return (
        <View style={{
            flex: 1,
            backgroundColor: THEME.background,
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* Header - Premium Gradient */}
            <View style={{
                paddingHorizontal: 32,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: THEME.border,
                backgroundColor: THEME.surface,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 10,
                zIndex: 10
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                    <Text style={{ color: THEME.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Live Kitchen</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {orderPlaced && (
                        <View style={{
                            backgroundColor: '#D1FAE5',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 100,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            borderWidth: 1,
                            borderColor: '#A7F3D0',
                        }}>
                            <CheckCircle2 size={16} color="#065F46" strokeWidth={3} />
                            <Text style={{ color: '#065F46', fontWeight: '800', fontSize: 13 }}>Order Confirmed</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Main Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
            }}>

                {/* Activity Feed */}
                <div style={{
                    flex: '1',
                    backgroundColor: '#F5F5F4',
                    borderRight: '1px solid ' + THEME.border,
                    maxWidth: '340px',
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                        {/* Segmented Control Toggle */}
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: THEME.surface,
                            borderRadius: 12,
                            padding: 6,
                            marginBottom: 28,
                            borderWidth: 1,
                            borderColor: THEME.border,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                        }}>
                            <Pressable
                                onPress={() => setView('live')}
                                style={({ pressed }: any) => ({
                                    flex: 1,
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    backgroundColor: view === 'live' ? THEME.text : 'transparent',
                                    alignItems: 'center',
                                    transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}
                            >
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '800',
                                    color: view === 'live' ? '#FFFFFF' : THEME.textMuted,
                                    letterSpacing: 0.3
                                }}>Live</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setView('history')}
                                style={({ pressed }: any) => ({
                                    flex: 1,
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    backgroundColor: view === 'history' ? THEME.text : 'transparent',
                                    alignItems: 'center',
                                    transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}
                            >
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '800',
                                    color: view === 'history' ? '#FFFFFF' : THEME.textMuted,
                                    letterSpacing: 0.3
                                }}>History</Text>
                            </Pressable>
                        </View>

                        {/* Activity Content */}
                        {view === 'live' ? (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                    <Activity size={18} color={THEME.primary} />
                                    <Text style={{ fontSize: 15, fontWeight: '800', color: THEME.text }}>Live Activity</Text>
                                </View>
                                {activeOrders.length === 0 ? (
                                    <View style={{
                                        alignItems: 'center',
                                        backgroundColor: THEME.surface,
                                        borderRadius: 16,
                                        padding: 32,
                                        borderWidth: 1,
                                        borderColor: THEME.border,
                                        borderStyle: 'dashed',
                                    }}>
                                        <View style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            backgroundColor: THEME.accent,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 14,
                                        }}>
                                            <Coffee size={26} color={THEME.primary} />
                                        </View>
                                        <Text style={{ color: THEME.text, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>All Quiet</Text>
                                        <Text style={{ color: THEME.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' }}>No active orders at the moment</Text>
                                    </View>
                                ) : (
                                    <View style={{ gap: 14 }}>
                                        {activeOrders.map((order: any) => (
                                            <Pressable
                                                key={order.id}
                                                onPress={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                style={({ pressed }: any) => ({
                                                    backgroundColor: THEME.surface,
                                                    borderRadius: 14,
                                                    padding: 16,
                                                    borderWidth: 1,
                                                    borderColor: expandedOrderId === order.id ? THEME.primary : THEME.border,
                                                    opacity: pressed ? 0.9 : 1,
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: expandedOrderId === order.id ? 0.08 : 0.03,
                                                    shadowRadius: 8,
                                                })}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                                    <CircularStatusIndicator status={order.status} size={36} />
                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text style={{ fontSize: 13, fontWeight: '800', color: THEME.text }}>
                                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                                            </Text>
                                                            <Text style={{ fontSize: 13, fontWeight: '900', color: THEME.primary }}>
                                                                ETB {order.totalPrice}
                                                            </Text>
                                                        </View>
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.textMuted, marginTop: 2, textTransform: 'capitalize' }}>
                                                            {order.status} • {getTotalItemCount(order)} Item{getTotalItemCount(order) > 1 ? 's' : ''}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {expandedOrderId === order.id && (
                                                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f5f5f4' }}>
                                                        {/* Status Description */}
                                                        {order.statusDescription && (
                                                            <View style={{ backgroundColor: THEME.accent, padding: 10, borderRadius: 10, marginBottom: 16 }}>
                                                                <Text style={{ fontSize: 12, color: THEME.text, fontWeight: '700', textAlign: 'center' }}>
                                                                    "{cleanDescription(order.statusDescription)}"
                                                                </Text>
                                                            </View>
                                                        )}

                                                        {/* Item Breakdown */}
                                                        <View style={{ marginBottom: 16 }}>
                                                            <Text style={{ fontSize: 11, fontWeight: '800', color: THEME.textMuted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                                                                Items Ordered
                                                            </Text>
                                                            {(order.items || []).map((item: any, idx: number) => (
                                                                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                                    <Text style={{ fontSize: 13, color: THEME.text, fontWeight: '600' }}>
                                                                        <Text style={{ color: THEME.primary }}>{item.quantity}x</Text> {item.name}
                                                                    </Text>
                                                                    <Text style={{ fontSize: 13, color: THEME.textMuted, fontVariant: ['tabular-nums'] }}>
                                                                        ETB {item.price * item.quantity}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                        </View>

                                                        {/* Waiter info if available */}
                                                        {order.waiterName && (
                                                            <View style={{ gap: 10, backgroundColor: '#fafaf9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f5f5f4' }}>
                                                                <Text style={{ fontSize: 11, fontWeight: '800', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                                    Assigned Waiting Staff
                                                                </Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                                        {order.waiterAvatarUrl ? (
                                                                            <img
                                                                                src={order.waiterAvatarUrl}
                                                                                style={{ width: 36, height: 36, borderRadius: 18, objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                                                            />
                                                                        ) : (
                                                                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                                                <Text style={{ fontSize: 14, fontWeight: '800', color: THEME.primary }}>{order.waiterName[0].toUpperCase()}</Text>
                                                                            </View>
                                                                        )}
                                                                        <View>
                                                                            <Text style={{ fontSize: 14, fontWeight: '700', color: THEME.text }}>{order.waiterName}</Text>
                                                                            <Text style={{ fontSize: 11, color: THEME.textMuted }}>Savor Specialist</Text>
                                                                        </View>
                                                                    </View>
                                                                    {order.waiterPhone && (
                                                                        <Pressable
                                                                            onPress={() => window.location.href = `tel:${order.waiterPhone}`}
                                                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                                                        >
                                                                            <Phone size={14} color={THEME.primary} />
                                                                            <Text style={{ fontSize: 13, fontWeight: '700', color: THEME.primary, textDecorationLine: 'underline' }}>{order.waiterPhone}</Text>
                                                                        </Pressable>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                    <Receipt size={18} color={THEME.primary} />
                                    <Text style={{ fontSize: 15, fontWeight: '800', color: THEME.text }}>History</Text>
                                </View>
                                {historyOrders.length === 0 ? (
                                    <View style={{
                                        alignItems: 'center',
                                        backgroundColor: THEME.surface,
                                        borderRadius: 16,
                                        padding: 32,
                                        borderWidth: 1,
                                        borderColor: THEME.border,
                                        borderStyle: 'dashed',
                                    }}>
                                        <View style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            backgroundColor: THEME.accent,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 14,
                                        }}>
                                            <CheckCircle2 size={26} color={THEME.primary} />
                                        </View>
                                        <Text style={{ color: THEME.text, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>No History</Text>
                                        <Text style={{ color: THEME.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' }}>Completed orders will appear here</Text>
                                    </View>
                                ) : (
                                    <View style={{ gap: 14 }}>
                                        {historyOrders.map((order: any) => (
                                            <Pressable
                                                key={order.id}
                                                onPress={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                style={({ pressed }: any) => ({
                                                    backgroundColor: THEME.surface,
                                                    borderRadius: 14,
                                                    padding: 16,
                                                    borderWidth: 1,
                                                    borderColor: expandedOrderId === order.id ? THEME.primary : THEME.border,
                                                    opacity: pressed ? 0.9 : 0.8,
                                                })}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                                    <CircularStatusIndicator status={order.status} size={36} />
                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text style={{ fontSize: 13, fontWeight: '800', color: THEME.text }}>
                                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                                            </Text>
                                                            <CheckCircle2 size={16} color="#15803d" />
                                                        </View>
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: THEME.textMuted, marginTop: 2, textTransform: 'capitalize' }}>
                                                            {order.status} • {getTotalItemCount(order)} Item{getTotalItemCount(order) > 1 ? 's' : ''}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {expandedOrderId === order.id && (
                                                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f5f5f4' }}>
                                                        {order.statusDescription && (
                                                            <View style={{ backgroundColor: THEME.accent, padding: 10, borderRadius: 10, marginBottom: 12 }}>
                                                                <Text style={{ fontSize: 12, color: THEME.text, fontWeight: '700', textAlign: 'center' }}>
                                                                    "{cleanDescription(order.statusDescription)}"
                                                                </Text>
                                                            </View>
                                                        )}
                                                        <View style={{ marginBottom: 16 }}>
                                                            {(order.items || []).map((item: any, idx: number) => (
                                                                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                                                    <Text style={{ fontSize: 13, color: THEME.text }}>
                                                                        {item.quantity}x {item.name}
                                                                    </Text>
                                                                    <Text style={{ fontSize: 13, color: THEME.textMuted }}>
                                                                        ETB {item.price * item.quantity}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f5f5f4', paddingTop: 12, marginTop: 8 }}>
                                                                <Text style={{ fontSize: 13, fontWeight: '800', color: THEME.text }}>Total</Text>
                                                                <Text style={{ fontSize: 13, fontWeight: '800', color: THEME.primary }}>ETB {order.totalPrice}</Text>
                                                            </View>
                                                        </View>

                                                        {/* Waiter info if available */}
                                                        {order.waiterName && (
                                                            <View style={{ gap: 10, backgroundColor: '#fafaf9', padding: 12, borderRadius: 12, borderTopWidth: 1, borderTopColor: '#f5f5f4' }}>
                                                                <Text style={{ fontSize: 11, fontWeight: '800', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                                    Handled By
                                                                </Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                                    {order.waiterAvatarUrl ? (
                                                                        <img
                                                                            src={order.waiterAvatarUrl}
                                                                            style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                                                        />
                                                                    ) : (
                                                                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' }}>
                                                                            <Text style={{ fontSize: 12, fontWeight: '800', color: THEME.primary }}>{order.waiterName[0].toUpperCase()}</Text>
                                                                        </View>
                                                                    )}
                                                                    <View>
                                                                        <Text style={{ fontSize: 13, fontWeight: '700', color: THEME.text }}>{order.waiterName}</Text>
                                                                        {order.waiterPhone ? (
                                                                            <Pressable onPress={() => window.location.href = `tel:${order.waiterPhone}`}>
                                                                                <Text style={{ fontSize: 11, color: THEME.primary, textDecorationLine: 'underline' }}>{order.waiterPhone}</Text>
                                                                            </Pressable>
                                                                        ) : (
                                                                            <Text style={{ fontSize: 11, color: THEME.textMuted }}>Savor Specialist</Text>
                                                                        )}
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </div>

                {/* Menu Section - Independent Scroll */}
                <div style={{
                    flex: '1.8',
                    borderRight: '1px solid ' + THEME.border,
                    backgroundColor: THEME.surface,
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <View style={{
                        padding: 28,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f5f5f4',
                        backgroundColor: '#ffffff',
                    }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1c1917', letterSpacing: -0.3 }}>Menu Selection</Text>
                        <Text style={{ fontSize: 14, color: '#78716c', marginTop: 6 }}>Explore our categories and add items to your ticket</Text>
                    </View>
                    <div style={{
                        height: 'calc(100vh - 200px)',
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '32px',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {menu.length === 0 ? (
                            <View style={{ padding: 56, alignItems: 'center' }}>
                                <View style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: '#fff7ed',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                    borderWidth: 1,
                                    borderColor: '#fed7aa',
                                }}>
                                    <UtensilsCrossed size={40} color="#c2410c" />
                                </View>
                                <Text style={{ fontSize: 17, fontWeight: '600', color: '#44403c', marginBottom: 8 }}>Menu Loading</Text>
                                <Text style={{ fontSize: 14, color: '#a8a29e' }}>Preparing today's selection</Text>
                            </View>
                        ) : (
                            <MenuList items={menu} onItemPress={handleItemClick} />
                        )}
                    </div>
                </div>

                {/* Order Ticket Sidebar - Sticky Right */}
                <View style={{
                    flex: 1.2,
                    backgroundColor: THEME.background,
                    padding: 32,
                    alignItems: 'center',
                    minWidth: 420,
                    zIndex: 20,
                    borderLeftWidth: 1,
                    borderLeftColor: THEME.border,
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    <View style={{
                        width: '100%',
                        maxWidth: 400,
                        backgroundColor: THEME.surface,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: THEME.border,
                        overflow: 'hidden',
                        shadowColor: THEME.primary,
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.1,
                        shadowRadius: 40,
                        elevation: 12,
                        maxHeight: '100%', // Ensure it doesn't exceed its parent
                    }}>
                        {/* Receipt Header */}
                        <View style={{
                            backgroundColor: THEME.text,
                            padding: 28,
                            paddingBottom: 24,
                            position: 'relative'
                        }}>
                            <View style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                backgroundColor: THEME.primary
                            }} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    }}>
                                        <Receipt size={22} color="#FFFFFF" strokeWidth={2.5} />
                                    </View>
                                    <View>
                                        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>Order Ticket</Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Checkout</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: THEME.primary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>Token</Text>
                                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] }}>#TK-29</Text>
                                </View>
                            </View>
                        </View>

                        {/* Order Details - Scrollable if too long */}
                        <ScrollView
                            style={{ flexShrink: 1 }}
                            contentContainerStyle={{ padding: 28 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Destination Display */}
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 12, fontWeight: '800', color: THEME.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Delivery Destination</Text>
                                <View style={{
                                    padding: 18,
                                    backgroundColor: THEME.background,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: THEME.border,
                                }}>
                                    {authLoading ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <ActivityIndicator size="small" color={THEME.primary} />
                                            <Text style={{ color: THEME.textMuted, fontSize: 14 }}>Locating kitchen...</Text>
                                        </View>
                                    ) : companyName ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                            <View style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                backgroundColor: THEME.surface,
                                                borderWidth: 1,
                                                borderColor: THEME.border,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}>
                                                {companyLogoUrl ? (
                                                    <img src={companyLogoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Building2 size={24} color={THEME.textMuted} />
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontWeight: '900', color: THEME.text, fontSize: 16 }}>
                                                    {companyName}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                    <View style={{ backgroundColor: THEME.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                        <Text style={{ color: THEME.primary, fontSize: 11, fontWeight: '800' }}>Floor {companyFloor || '1'}</Text>
                                                    </View>
                                                    <Text style={{ color: THEME.textMuted, fontSize: 12, fontWeight: '600' }}>{companyEmailFromAuth ? 'Verified' : 'General delivery'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={{ padding: 4, alignItems: 'center' }}>
                                            <Text style={{ color: THEME.textMuted, fontSize: 13, fontStyle: 'italic' }}>Please select a kitchen from settings</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Recipient Section (Fixed to User) */}
                            <View style={{
                                marginBottom: 28,
                                padding: 18,
                                backgroundColor: THEME.background,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: THEME.border,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: THEME.accent,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{ color: THEME.primary, fontWeight: '800', fontSize: 16 }}>
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ordering for</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: THEME.text }}>{user?.email || 'Logged in user'}</Text>
                                </View>
                            </View>

                            {/* Cart Section */}
                            <View style={{
                                paddingTop: 24,
                                borderTopWidth: 2,
                                borderTopColor: THEME.border,
                                borderTopStyle: 'dashed',
                            }}>
                                {cart.length > 0 ? (
                                    <View>
                                        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                                            <View style={{ gap: 12 }}>
                                                {cart.map(item => (
                                                    <View
                                                        key={item.itemId}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 12,
                                                            padding: 12,
                                                            backgroundColor: THEME.background,
                                                            borderRadius: 14,
                                                            borderWidth: 1,
                                                            borderColor: THEME.border,
                                                        }}
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: THEME.text, fontWeight: '800', fontSize: 14 }}>{item.name}</Text>
                                                            <Text style={{ color: THEME.primary, fontWeight: '700', fontSize: 12 }}>ETB {item.price}</Text>
                                                        </View>

                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: THEME.surface,
                                                            borderRadius: 10,
                                                            borderWidth: 1,
                                                            borderColor: THEME.border,
                                                            padding: 4,
                                                            gap: 10
                                                        }}>
                                                            <Pressable
                                                                onPress={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                                                                style={{ padding: 4 }}
                                                            >
                                                                <Minus size={14} color={THEME.text} />
                                                            </Pressable>
                                                            <Text style={{ fontWeight: '800', fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Text>
                                                            <Pressable
                                                                onPress={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                                                                style={{ padding: 4 }}
                                                            >
                                                                <Plus size={14} color={THEME.text} />
                                                            </Pressable>
                                                        </View>

                                                        <Pressable
                                                            onPress={() => removeFromCart(item.itemId)}
                                                            style={{ padding: 6, opacity: 0.6 }}
                                                        >
                                                            <X size={16} color={THEME.textMuted} strokeWidth={2.5} />
                                                        </Pressable>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>

                                        <View style={{ marginTop: 28 }}>
                                            {!showConfirmation ? (
                                                <>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                                        <Text style={{ fontSize: 14, fontWeight: '700', color: THEME.textMuted }}>Grand Total</Text>
                                                        <Text style={{ fontSize: 28, fontWeight: '900', color: THEME.text, fontVariant: ['tabular-nums'] }}>
                                                            <Text style={{ fontSize: 16, color: THEME.primary }}>ETB</Text> {totalPrice}
                                                        </Text>
                                                    </View>

                                                    <Pressable
                                                        onPress={() => setShowConfirmation(true)}
                                                        style={({ pressed }: any) => ({
                                                            backgroundColor: pressed ? THEME.secondary : THEME.primary,
                                                            paddingVertical: 18,
                                                            borderRadius: 18,
                                                            alignItems: 'center',
                                                            shadowColor: THEME.primary,
                                                            shadowOffset: { width: 0, height: 8 },
                                                            shadowOpacity: pressed ? 0.2 : 0.4,
                                                            shadowRadius: 16,
                                                            transform: [{ scale: pressed ? 0.98 : 1 }],
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            gap: 12
                                                        })}
                                                    >
                                                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }}>
                                                            Place Your Order
                                                        </Text>
                                                    </Pressable>
                                                </>
                                            ) : (
                                                <View style={{
                                                    backgroundColor: THEME.accent,
                                                    padding: 24,
                                                    borderRadius: 20,
                                                    borderWidth: 1,
                                                    borderColor: THEME.secondary,
                                                }}>
                                                    <Text style={{ fontSize: 18, fontWeight: '900', color: THEME.text, marginBottom: 8, textAlign: 'center' }}>
                                                        Confirm Your Order?
                                                    </Text>
                                                    <Text style={{ fontSize: 13, color: THEME.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
                                                        You are about to place an order for {cart.reduce((sum, i) => sum + i.quantity, 0)} items totaling <Text style={{ fontWeight: '700', color: THEME.text }}>ETB {totalPrice}</Text>.
                                                    </Text>

                                                    <Pressable
                                                        onPress={placeOrder}
                                                        disabled={createOrder.isPending}
                                                        style={({ pressed }: any) => ({
                                                            backgroundColor: createOrder.isPending ? THEME.textMuted : (pressed ? '#166534' : '#15803d'),
                                                            paddingVertical: 16,
                                                            borderRadius: 14,
                                                            alignItems: 'center',
                                                            marginBottom: 12,
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            gap: 8
                                                        })}
                                                    >
                                                        {createOrder.isPending && <ActivityIndicator size="small" color="#FFFFFF" />}
                                                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                                                            {createOrder.isPending ? 'Placing...' : 'Yes, Confirm Order'}
                                                        </Text>
                                                    </Pressable>

                                                    <Pressable
                                                        onPress={() => setShowConfirmation(false)}
                                                        disabled={createOrder.isPending}
                                                        style={({ pressed }: any) => ({
                                                            paddingVertical: 12,
                                                            alignItems: 'center',
                                                            opacity: pressed ? 0.6 : 1
                                                        })}
                                                    >
                                                        <Text style={{ color: THEME.primary, fontSize: 14, fontWeight: '700' }}>
                                                            Go Back to Cart
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ) : (
                                    <View style={{
                                        alignItems: 'center',
                                        backgroundColor: THEME.background,
                                        borderRadius: 20,
                                        padding: 40,
                                        borderWidth: 1,
                                        borderColor: THEME.border,
                                        borderStyle: 'dashed',
                                    }}>
                                        <View style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 32,
                                            backgroundColor: THEME.surface,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 16,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 10,
                                        }}>
                                            <UtensilsCrossed size={28} color={THEME.border} />
                                        </View>
                                        <Text style={{ color: THEME.text, fontSize: 16, fontWeight: '800', textAlign: 'center' }}>Your cart is empty</Text>
                                        <Text style={{ color: THEME.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>Select items from the menu to build your order</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </div>

            {/* Quantity Selector Modal */}
            {
                selectedMenuItem && (
                    <Pressable
                        onPress={closeQuantityModal}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <Pressable
                            onPress={(e: any) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: 20,
                                padding: 28,
                                width: 340,
                                maxWidth: '90%',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.25,
                                shadowRadius: 20,
                                elevation: 10,
                            }}
                        >
                            {/* Modal Header */}
                            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1c1917', marginBottom: 4 }}>
                                    {selectedMenuItem.name}
                                </Text>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#b45309' }}>
                                    ETB {selectedMenuItem.price} each
                                </Text>
                            </View>

                            {/* Quantity Selector */}
                            <View style={{ alignItems: 'center', marginBottom: 28 }}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: '#78716c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Quantity
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <Pressable
                                        onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                                        style={({ pressed }: any) => ({
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            backgroundColor: pressed ? '#f5f5f4' : '#ffffff',
                                            borderWidth: 1,
                                            borderColor: '#e7e5e4',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        })}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#78716c' }}>-</Text>
                                    </Pressable>

                                    <View style={{
                                        minWidth: 60,
                                        paddingHorizontal: 16,
                                        height: 44,
                                        backgroundColor: '#fafaf9',
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: '#e7e5e4',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1c1917' }}>{itemQuantity}</Text>
                                    </View>

                                    <Pressable
                                        onPress={() => setItemQuantity(itemQuantity + 1)}
                                        style={({ pressed }: any) => ({
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            backgroundColor: pressed ? '#f5f5f4' : '#ffffff',
                                            borderWidth: 1,
                                            borderColor: '#e7e5e4',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        })}
                                    >
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#b45309' }}>+</Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Total Price */}
                            <View style={{
                                backgroundColor: '#fafaf9',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 20,
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 12, color: '#78716c', marginBottom: 4 }}>Subtotal</Text>
                                <Text style={{ fontSize: 24, fontWeight: '800', color: '#1c1917' }}>
                                    ETB {selectedMenuItem.price * itemQuantity}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Pressable
                                    onPress={closeQuantityModal}
                                    style={({ pressed }: any) => ({
                                        flex: 1,
                                        paddingVertical: 14,
                                        borderRadius: 12,
                                        backgroundColor: pressed ? '#f5f5f4' : '#ffffff',
                                        borderWidth: 1,
                                        borderColor: '#e7e5e4',
                                        alignItems: 'center',
                                    })}
                                >
                                    <Text style={{ fontWeight: '700', color: '#78716c', fontSize: 15 }}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    onPress={addToCartWithQuantity}
                                    style={({ pressed }: any) => ({
                                        flex: 2,
                                        paddingVertical: 14,
                                        borderRadius: 12,
                                        backgroundColor: pressed ? THEME.secondary : THEME.primary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    })}
                                >
                                    <Text style={{ fontWeight: '800', color: '#ffffff', fontSize: 15 }}>Update Cart</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                )
            }
        </View >
    );
}
