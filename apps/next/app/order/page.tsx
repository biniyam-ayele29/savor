'use client'

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useMenuItems, useCreateOrder, OrderItem, useCompanies, useEmployees, useAuth, useOrders, supabase } from '@my-app/api';
import { MenuList } from 'app/features/menu/menu-list';
import { OrderStatus } from '@my-app/api/types';

const STATUS_COLORS = {
    pending: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'Pending' },
    preparing: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Preparing' },
    delivering: { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff', label: 'Delivering' },
    delivered: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'Delivered' }
};

export default function OrderPage() {
    const { companyId, companyName, user, isLoading: authLoading } = useAuth();
    const { data: menu = [], isLoading: menuLoading } = useMenuItems();
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();
    const { data: orders = [], isLoading: ordersLoading } = useOrders();
    const createOrder = useCreateOrder();

    const [cart, setCart] = useState<OrderItem[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || '');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Quantity selector modal state
    const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
    const [itemQuantity, setItemQuantity] = useState(1);

    useEffect(() => {
        if (companyId) {
            setSelectedCompanyId(companyId);
        }
    }, [companyId]);

    const { data: employees = [], isLoading: employeesLoading } = useEmployees(selectedCompanyId);

    const [userCompanyDetails, setUserCompanyDetails] = useState<any>(null);
    const [companyLoading, setCompanyLoading] = useState(true);

    // Get company from employees (if employees load, we can get company_id from them)
    useEffect(() => {
        const fetchUserCompany = async () => {
            console.log('=== FETCHING COMPANY ===');
            console.log('Employees:', employees);
            console.log('Employees loading:', employeesLoading);
            console.log('Auth companyId:', companyId);
            console.log('User:', user?.id);

            let targetCompanyId: string | null = null;

            // Strategy 1: Get company_id from loaded employees
            if (employees.length > 0) {
                targetCompanyId = employees[0].companyId;
                console.log('✓ Got company_id from employees:', targetCompanyId);
            }

            // Strategy 2: Use companyId from auth context
            if (!targetCompanyId && companyId) {
                targetCompanyId = companyId;
                console.log('✓ Using companyId from auth:', targetCompanyId);
            }

            // Strategy 3: Query company_admins directly
            if (!targetCompanyId && user) {
                try {
                    const { data: adminData, error: adminError } = await supabase
                        .from('company_admins')
                        .select('company_id')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    console.log('company_admins query:', { adminData, adminError });

                    if (adminData?.company_id) {
                        targetCompanyId = adminData.company_id;
                        console.log('✓ Got company_id from company_admins:', targetCompanyId);
                    }
                } catch (err) {
                    console.error('Error querying company_admins:', err);
                }
            }

            // Fetch company details
            if (targetCompanyId) {
                try {
                    console.log('Fetching company details for:', targetCompanyId);
                    const { data: companyData, error: companyError } = await supabase
                        .from('companies')
                        .select('*')
                        .eq('id', targetCompanyId)
                        .single();

                    console.log('Company query result:', { companyData, companyError });

                    if (companyData && !companyError) {
                        console.log('✓ Successfully loaded company:', companyData.name);
                        setUserCompanyDetails(companyData);
                        setSelectedCompanyId(targetCompanyId);
                    } else {
                        console.error('Failed to load company. Error details:', {
                            message: companyError?.message,
                            details: companyError?.details,
                            hint: companyError?.hint,
                            code: companyError?.code
                        });
                    }
                } catch (err) {
                    console.error('Error fetching company details:', err);
                }
            } else {
                console.error('✗ No company_id found from any strategy');
            }

            setCompanyLoading(false);
        };

        // Only run when employees finish loading
        if (!employeesLoading) {
            fetchUserCompany();
        }
    }, [employees, employeesLoading, companyId, user]);

    // Company details from database (snake_case from Supabase)
    const floor = userCompanyDetails?.floor_number?.toString() || '';
    const companyEmail = userCompanyDetails?.contact_email || '';
    const companyPhone = userCompanyDetails?.contact_phone || '';

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
        const orderCompanyId = selectedCompanyId || userCompanyDetails?.id || companyId || (employees.length > 0 ? employees[0].companyId : null);
        
        if (!orderCompanyId || !selectedEmployeeId) {
            alert('Please select a recipient');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderFloor = userCompanyDetails?.floor_number || 1;

        try {
            await createOrder.mutateAsync({
                items: cart,
                totalPrice: total,
                floorNumber: Number(orderFloor),
                companyId: orderCompanyId,
                employeeId: selectedEmployeeId,
                status: 'pending'
            });

            setOrderPlaced(true);
            setCart([]);
            setTimeout(() => setOrderPlaced(false), 3000);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const activeOrders = orders.filter((o: any) => ['pending', 'preparing', 'delivering'].includes(o.status));
    const recentHistory = orders.filter((o: any) => o.status === 'delivered').slice(0, 5);

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

    const displayHeaderLabel = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Office Cafe';

    return (
        <View style={{
            flex: 1,
            backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
            minHeight: '100vh',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 28,
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: '#e7e5e4',
                backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <Text style={{
                        fontSize: 24,
                        fontWeight: '800',
                        color: '#1c1917',
                        letterSpacing: -0.5,
                    }}>
                        {displayHeaderLabel}{' '}
                        <Text style={{ color: '#b45309', fontWeight: '800' }}>Cafe</Text>
                        <Text style={{ marginLeft: 6 }}>☕</Text>
                    </Text>
                    <View style={{ height: 20, width: 1, backgroundColor: '#e7e5e4', borderRadius: 1 }} />
                    <Text style={{ color: '#78716c', fontSize: 13, fontWeight: '500' }}>Order Dashboard</Text>
                </View>

                {orderPlaced && (
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#a7f3d0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        shadowColor: '#059669',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                    }}>
                        <Text style={{ fontSize: 16 }}>✓</Text>
                        <Text style={{ color: '#047857', fontWeight: '700', fontSize: 14 }}>Order Received!</Text>
                    </View>
                )}
            </View>

            {/* Main Content */}
            <View style={{ flexDirection: 'row', flex: 1, overflow: 'hidden' }}>

                {/* Activity Feed */}
                <View style={{
                    flex: 1,
                    backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
                    borderRightWidth: 1,
                    borderRightColor: '#e7e5e4',
                    maxWidth: 320,
                }}>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: '#78716c',
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                            marginBottom: 20,
                        }}>Live Activity</Text>

                        {activeOrders.length === 0 && recentHistory.length === 0 ? (
                            <View style={{
                                padding: 36,
                                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#e7e5e4',
                                borderStyle: 'dashed',
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 16,
                                }}>
                                    <Text style={{ fontSize: 22 }}>📡</Text>
                                </View>
                                <Text style={{ color: '#a8a29e', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
                                    No recent activity to track.
                                </Text>
                                <Text style={{ color: '#d6d3d1', fontSize: 12, marginTop: 4 }}>Orders will appear here</Text>
                            </View>
                        ) : (
                            <View style={{ gap: 12 }}>
                                {activeOrders.map((order: any) => {
                                    const statusConfig = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
                                    return (
                                        <View
                                            key={order.id}
                                            style={{
                                                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                                                padding: 18,
                                                borderRadius: 14,
                                                borderWidth: 1,
                                                borderColor: '#e7e5e4',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.04,
                                                shadowRadius: 8,
                                                elevation: 2,
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                                                <View style={{
                                                    backgroundImage: `linear-gradient(135deg, ${statusConfig.bg} 0%, ${statusConfig.border} 100%)`,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: statusConfig.border,
                                                }}>
                                                    <Text style={{ color: statusConfig.text, fontSize: 11, fontWeight: '700' }}>{statusConfig.label}</Text>
                                                </View>
                                                <Text style={{ fontSize: 11, color: '#a8a29e', fontWeight: '600', fontVariant: ['tabular-nums'] }}>#{order.id.slice(0, 8)}</Text>
                                            </View>
                                            <Text style={{ fontWeight: '700', color: '#1c1917', fontSize: 15 }}>{order.employeeName || 'Guest'}</Text>
                                            <Text style={{ color: '#78716c', fontSize: 13, marginTop: 4 }}>{getTotalItemCount(order)} items · ETB {order.totalPrice ?? 0}</Text>
                                        </View>
                                    );
                                })}

                                {recentHistory.length > 0 && (
                                    <View style={{ marginTop: 28 }}>
                                        <Text style={{
                                            fontSize: 11,
                                            fontWeight: '700',
                                            color: '#a8a29e',
                                            textTransform: 'uppercase',
                                            letterSpacing: 1,
                                            marginBottom: 14,
                                        }}>Recent Completions</Text>
                                        {recentHistory.map((order: any) => (
                                            <View
                                                key={order.id}
                                                style={{
                                                    marginBottom: 14,
                                                    padding: 14,
                                                    backgroundImage: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: '#e7e5e4',
                                                }}
                                            >
                                                {/* Header: Employee + Status */}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontWeight: '700', color: '#44403c', fontSize: 14 }}>{order.employeeName || 'Guest'}</Text>
                                                        <Text style={{ color: '#a8a29e', fontSize: 11, marginTop: 2 }}>
                                                            #{order.id?.slice(0, 8)} · Floor {order.floorNumber ?? '—'}
                                                        </Text>
                                                    </View>
                                                    <View style={{
                                                        backgroundImage: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 4,
                                                        borderRadius: 8,
                                                        borderWidth: 1,
                                                        borderColor: '#a7f3d0',
                                                    }}>
                                                        <Text style={{ color: '#047857', fontSize: 11, fontWeight: '700' }}>Delivered</Text>
                                                    </View>
                                                </View>

                                                {/* Order Items from order_items table */}
                                                {order.items && order.items.length > 0 && (
                                                    <View style={{ marginBottom: 10, paddingLeft: 4 }}>
                                                        {order.items.map((item: OrderItem, idx: number) => (
                                                            <Text key={item.itemId || idx} style={{ color: '#78716c', fontSize: 12, marginBottom: 2 }}>
                                                                {item.quantity}× {item.name} — ETB {item.price * item.quantity}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                )}

                                                {/* Footer: Total + Time */}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e7e5e4', paddingTop: 8 }}>
                                                    <Text style={{ fontWeight: '700', color: '#1c1917', fontSize: 13 }}>
                                                        Total: ETB {order.totalPrice ?? 0}
                                                    </Text>
                                                    <Text style={{ color: '#a8a29e', fontSize: 11 }}>
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Menu */}
                <View style={{
                    flex: 1.8,
                    borderRightWidth: 1,
                    borderRightColor: '#e7e5e4',
                    backgroundColor: '#ffffff',
                }}>
                    <View style={{
                        padding: 28,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f5f5f4',
                        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
                    }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1c1917', letterSpacing: -0.3 }}>Menu</Text>
                        <Text style={{ fontSize: 14, color: '#78716c', marginTop: 6 }}>Tap items to add to your order</Text>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32 }} showsVerticalScrollIndicator={false}>
                        {menu.length === 0 ? (
                            <View style={{ padding: 56, alignItems: 'center' }}>
                                <View style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                    borderWidth: 1,
                                    borderColor: '#fed7aa',
                                }}>
                                    <Text style={{ fontSize: 36 }}>🍽️</Text>
                                </View>
                                <Text style={{ fontSize: 17, fontWeight: '600', color: '#44403c', marginBottom: 8 }}>Menu Loading</Text>
                                <Text style={{ fontSize: 14, color: '#a8a29e' }}>Preparing today's selection</Text>
                            </View>
                        ) : (
                            <MenuList items={menu} onItemPress={handleItemClick} />
                        )}
                    </ScrollView>
                </View>

                {/* Order Ticket / Place Order */}
                <View style={{
                    flex: 1,
                    backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 100%)',
                    padding: 28,
                    justifyContent: 'center',
                    minWidth: 360,
                }}>
                    <View style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        overflow: 'hidden',
                        shadowColor: '#b45309',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.08,
                        shadowRadius: 24,
                        elevation: 8,
                    }}>
                        {/* Ticket Header */}
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
                            padding: 24,
                            paddingBottom: 20,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{ fontSize: 20 }}>🎫</Text>
                                </View>
                                <View>
                                    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>Your Order</Text>
                                    <Text style={{ color: '#a8a29e', fontSize: 12, marginTop: 2 }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ padding: 24 }}>
                            {/* Delivery Info - Exact company details from database */}
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: '#78716c',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    marginBottom: 10,
                                }}>Delivery Point</Text>
                                <View style={{
                                    backgroundColor: '#fafaf9',
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: userCompanyDetails ? '#d1d5db' : '#e7e5e4',
                                }}>
                                    {companyLoading ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <ActivityIndicator size="small" color="#b45309" />
                                            <Text style={{ color: '#78716c', fontSize: 14 }}>Loading company...</Text>
                                        </View>
                                    ) : userCompanyDetails || companyName ? (
                                        <>
                                            {/* Company Logo and Name */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                {userCompanyDetails?.logo_url && (
                                                    <img
                                                        src={userCompanyDetails.logo_url}
                                                        alt={`${userCompanyDetails.name} logo`}
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 8,
                                                            objectFit: 'cover',
                                                            border: '1px solid #e7e5e4',
                                                        }}
                                                    />
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontWeight: '700', color: '#1c1917', fontSize: 15 }}>
                                                        {userCompanyDetails?.name || companyName || 'Your Company'}
                                                    </Text>
                                                    {userCompanyDetails?.floor_number && (
                                                        <Text style={{ color: '#78716c', fontSize: 12, marginTop: 2, fontWeight: '500' }}>
                                                            Floor {userCompanyDetails.floor_number}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            {/* Contact Email */}
                                            {userCompanyDetails?.contact_email && (
                                                <Text style={{ color: '#a8a29e', fontSize: 12, marginTop: 4 }}>
                                                    {userCompanyDetails.contact_email}
                                                </Text>
                                            )}
                                            {/* Contact Phone */}
                                            {userCompanyDetails?.contact_phone && (
                                                <Text style={{ color: '#a8a29e', fontSize: 12, marginTop: 2 }}>
                                                    {userCompanyDetails.contact_phone}
                                                </Text>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Text style={{ fontWeight: '600', color: '#a8a29e', fontSize: 14 }}>
                                                No company assigned
                                            </Text>
                                            <Text style={{ color: '#d6d3d1', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                                                Please contact an administrator
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            {/* Recipient Select */}
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: '700',
                                    color: '#78716c',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    marginBottom: 10,
                                }}>Recipient</Text>
                                <select
                                    className="order-recipient-select"
                                    value={selectedEmployeeId}
                                    onChange={(e: any) => setSelectedEmployeeId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        fontSize: 15,
                                        fontWeight: '600',
                                        color: '#1c1917',
                                        backgroundColor: '#fafaf9',
                                        border: '1px solid #e7e5e4',
                                        borderRadius: 12,
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        backgroundSize: 18,
                                        paddingRight: 44,
                                    }}
                                >
                                    <option value="">Who is this for?</option>
                                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </View>

                            {/* Cart & Place Order */}
                            <View style={{
                                borderTopWidth: 2,
                                borderTopColor: '#e7e5e4',
                                borderTopStyle: 'dashed',
                                paddingTop: 24,
                            }}>
                                {cart.length > 0 ? (
                                    <View>
                                        {cart.map(item => (
                                            <View
                                                key={item.itemId}
                                                style={{
                                                    marginBottom: 14,
                                                    paddingVertical: 10,
                                                    paddingHorizontal: 12,
                                                    backgroundColor: '#fafaf9',
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: '#e7e5e4',
                                                }}
                                            >
                                                {/* Item name and remove button */}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                    <Text style={{ color: '#1c1917', fontWeight: '700', fontSize: 14, flex: 1 }}>{item.name}</Text>
                                                    <Pressable
                                                        onPress={() => removeFromCart(item.itemId)}
                                                        style={({ pressed }: any) => ({
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: 12,
                                                            backgroundColor: pressed ? '#fee2e2' : 'transparent',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        })}
                                                    >
                                                        <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '700' }}>×</Text>
                                                    </Pressable>
                                                </View>
                                                
                                                {/* Quantity controls and price */}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                        {/* Minus button */}
                                                        <Pressable
                                                            onPress={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                                                            style={({ pressed }: any) => ({
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: 6,
                                                                backgroundColor: pressed ? '#f5f5f4' : '#ffffff',
                                                                borderWidth: 1,
                                                                borderColor: '#e7e5e4',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            })}
                                                        >
                                                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#78716c' }}>-</Text>
                                                        </Pressable>
                                                        
                                                        {/* Quantity display */}
                                                        <Text style={{ 
                                                            fontSize: 15, 
                                                            fontWeight: '800', 
                                                            color: '#1c1917',
                                                            minWidth: 28,
                                                            textAlign: 'center',
                                                        }}>{item.quantity}</Text>
                                                        
                                                        {/* Plus button */}
                                                        <Pressable
                                                            onPress={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                                                            style={({ pressed }: any) => ({
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: 6,
                                                                backgroundColor: pressed ? '#f5f5f4' : '#ffffff',
                                                                borderWidth: 1,
                                                                borderColor: '#e7e5e4',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            })}
                                                        >
                                                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#b45309' }}>+</Text>
                                                        </Pressable>
                                                    </View>
                                                    
                                                    {/* Item total */}
                                                    <Text style={{ fontWeight: '700', color: '#b45309', fontSize: 15, fontVariant: ['tabular-nums'] }}>
                                                        ETB {item.price * item.quantity}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: 16,
                                            marginBottom: 24,
                                            paddingTop: 16,
                                            borderTopWidth: 1,
                                            borderTopColor: '#e7e5e4',
                                        }}>
                                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#78716c' }}>Total</Text>
                                            <Text style={{ fontSize: 20, fontWeight: '800', color: '#b45309', fontVariant: ['tabular-nums'] }}>ETB {totalPrice}</Text>
                                        </View>
                                        <Pressable
                                            onPress={placeOrder}
                                            disabled={createOrder.isPending}
                                            style={({ pressed }: any) => ({
                                                backgroundColor: createOrder.isPending ? '#a8a29e' : '#b45309',
                                                paddingVertical: 16,
                                                paddingHorizontal: 24,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: pressed ? 0.9 : 1,
                                                flexDirection: 'row',
                                                gap: 10,
                                            })}
                                        >
                                            {createOrder.isPending ? (
                                                <>
                                                    <ActivityIndicator size="small" color="#ffffff" />
                                                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Placing Order...</Text>
                                                </>
                                            ) : (
                                                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Place Order</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View style={{
                                        padding: 32,
                                        alignItems: 'center',
                                        backgroundColor: '#fafaf9',
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: '#e7e5e4',
                                        borderStyle: 'dashed',
                                    }}>
                                        <View style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            backgroundColor: '#f5f5f4',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 12,
                                        }}>
                                            <Text style={{ fontSize: 20, color: '#a8a29e' }}>●</Text>
                                        </View>
                                        <Text style={{ color: '#78716c', fontSize: 14, fontWeight: '600' }}>Your cart is empty</Text>
                                        <Text style={{ color: '#a8a29e', fontSize: 13, marginTop: 4 }}>Add items from the menu</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quantity Selector Modal */}
            {selectedMenuItem && (
                <Pressable
                    onPress={closeQuantityModal}
                    style={{
                        position: 'absolute',
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
                                    backgroundColor: pressed ? '#92400e' : '#b45309',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                })}
                            >
                                <Text style={{ fontWeight: '700', color: '#ffffff', fontSize: 15 }}>Add to Cart</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            )}
        </View>
    );
}
