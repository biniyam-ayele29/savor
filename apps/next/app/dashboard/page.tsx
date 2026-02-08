'use client'

import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useAuth, useEmployees, useOrders } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { TextLink } from 'solito/link';

export default function DashboardPage() {
    const { user, companyName, companyId, role, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const { data: employees = [] } = useEmployees(companyId || undefined);
    const { data: orders = [] } = useOrders();

    if (!authLoading && !user) {
        router.push('/');
        return null;
    }

    // Redirect default users to /order
    if (!authLoading && user && role !== 'admin' && role !== 'super_admin') {
        router.push('/order');
        return null;
    }

    if (authLoading) {
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
                    borderWidth: 1,
                    borderColor: '#fed7aa',
                }}>
                    <ActivityIndicator size="large" color="#b45309" />
                </View>
                <Text style={{ fontSize: 15, color: '#78716c', fontWeight: '600' }}>Initializing Dashboard...</Text>
            </View>
        );
    }

    const companyOrders = orders.filter(o => o.companyId === companyId);
    const pendingOrders = companyOrders.filter(o => o.status === 'pending');
    const displayHeader = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Dashboard';

    return (
        <ScrollView
            style={{ flex: 1, backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)' }}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}
        >
            <View style={{ maxWidth: 1200, width: '100%', padding: 40, alignItems: 'center' }}>

                {/* Header */}
                <View style={{ marginBottom: 48, alignItems: 'center' }}>
                    <Text style={{
                        fontSize: 48,
                        fontWeight: '900',
                        color: '#1c1917',
                        letterSpacing: -1.5,
                        marginBottom: 12,
                        textAlign: 'center',
                    }}>
                        {displayHeader}
                    </Text>
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                        borderRadius: 100,
                        marginBottom: 16,
                    }}>
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>Administrator Portal</Text>
                    </View>
                    <Text style={{ fontSize: 18, color: '#78716c', fontWeight: '500', textAlign: 'center' }}>
                        Welcome back, {user?.email?.split('@')[0]}
                    </Text>
                </View>

                {/* Metrics Grid */}
                <View style={{ flexDirection: 'row', gap: 24, marginBottom: 56, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        padding: 32,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.04,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ color: '#78716c', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Total Staff</Text>
                        <Text style={{ fontSize: 48, fontWeight: '900', color: '#1c1917' }}>{employees.length}</Text>
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 10,
                            marginTop: 12,
                            borderWidth: 1,
                            borderColor: '#a7f3d0',
                        }}>
                            <Text style={{ color: '#047857', fontSize: 13, fontWeight: '700' }}>Active Members</Text>
                        </View>
                    </View>

                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        padding: 32,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.04,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ color: '#78716c', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Pending Orders</Text>
                        <Text style={{ fontSize: 48, fontWeight: '900', color: '#b45309' }}>{pendingOrders.length}</Text>
                        <Text style={{ color: '#78716c', fontSize: 14, fontWeight: '600', marginTop: 12 }}>Total: {companyOrders.length}</Text>
                    </View>

                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        padding: 32,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.04,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ color: '#78716c', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Office Context</Text>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1c1917', textAlign: 'center', marginBottom: 4 }}>{companyName}</Text>
                        <Text style={{ color: '#78716c', fontSize: 14, fontWeight: '600' }}>Office Space</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1c1917', marginBottom: 32 }}>Workspace Management</Text>
                <View style={{ flexDirection: 'row', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <TextLink href="/employees">
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                            padding: 36,
                            borderRadius: 20,
                            width: 340,
                            borderWidth: 1,
                            borderColor: '#e7e5e4',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.05,
                            shadowRadius: 20,
                        }}>
                            <View style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundImage: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: '#bfdbfe',
                            }}>
                                <Text style={{ fontSize: 36 }}>👥</Text>
                            </View>
                            <Text style={{ color: '#1c1917', fontSize: 20, fontWeight: '800', marginBottom: 10 }}>Manage Staff</Text>
                            <Text style={{ color: '#78716c', fontSize: 14, lineHeight: 22, textAlign: 'center' }}>Register and update team members for your office.</Text>
                        </View>
                    </TextLink>

                    <TextLink href="/order">
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #ea580c 0%, #b45309 50%, #92400e 100%)',
                            padding: 36,
                            borderRadius: 20,
                            width: 340,
                            alignItems: 'center',
                            shadowColor: '#b45309',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 24,
                        }}>
                            <View style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                            }}>
                                <Text style={{ fontSize: 36 }}>🛒</Text>
                            </View>
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 10 }}>Place Order</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, textAlign: 'center' }}>Direct delivery of drinks and snacks to your team.</Text>
                        </View>
                    </TextLink>
                </View>

                {/* Recent Activity */}
                <View style={{
                    marginTop: 64,
                    padding: 48,
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: '#e7e5e4',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 800,
                }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}>
                        <Text style={{ fontSize: 32 }}>📊</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#44403c' }}>No recent activity</Text>
                    <Text style={{ color: '#a8a29e', marginTop: 10, textAlign: 'center', fontSize: 14 }}>All your office orders and staff updates will appear here in real-time.</Text>
                </View>
            </View>
        </ScrollView>
    );
}
