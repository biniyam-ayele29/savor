'use client'

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useAuth, useEmployees, useOrders } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { TextLink } from 'solito/link';

export default function DashboardPage() {
    const { user, companyName, companyId, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const { data: employees = [] } = useEmployees(companyId || undefined);
    const { data: orders = [] } = useOrders();

    // Security: Only allow authenticated admins
    if (!authLoading && !user) {
        router.push('/');
        return null;
    }

    if (authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <Text style={{ fontSize: 20, color: '#6b7280', fontWeight: '500' }}>Initializing Dashboard...</Text>
            </View>
        );
    }

    const companyOrders = orders.filter(o => o.companyId === companyId);
    const pendingOrders = companyOrders.filter(o => o.status === 'pending');
    const displayHeader = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Dashboard';

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={{ maxWidth: 1200, width: '100%', padding: 40, alignItems: 'center' }}>

                {/* Header Section */}
                <View style={{ marginBottom: 48, alignItems: 'center' }}>
                    <Text style={{ fontSize: 56, fontWeight: '900', color: '#111827', letterSpacing: -2, marginBottom: 12, textAlign: 'center' }}>
                        {displayHeader}
                    </Text>
                    <View style={{ backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, marginBottom: 16 }}>
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Administrator Portal</Text>
                    </View>
                    <Text style={{ fontSize: 22, color: '#6b7280', fontWeight: '500', textAlign: 'center' }}>
                        Welcome back, {user?.email?.split('@')[0]}
                    </Text>
                </View>

                {/* Metrics Grid */}
                <View style={{ flexDirection: 'row', gap: 24, marginBottom: 56, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundColor: 'white',
                        padding: 32,
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderStyle: 'solid',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.04,
                        shadowRadius: 30,
                    }}>
                        <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Total Staff</Text>
                        <Text style={{ fontSize: 48, fontWeight: '900', color: '#111827' }}>{employees.length}</Text>
                        <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 12 }}>
                            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '700' }}>Active Members</Text>
                        </View>
                    </View>

                    <View style={{ flex: 1, minWidth: 280, backgroundColor: 'white', padding: 32, borderRadius: 28, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', alignItems: 'center' }}>
                        <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Pending Orders</Text>
                        <Text style={{ fontSize: 48, fontWeight: '900', color: '#ea580c' }}>{pendingOrders.length}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600', marginTop: 12 }}>Total: {companyOrders.length}</Text>
                    </View>

                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundColor: 'white',
                        padding: 32,
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderStyle: 'solid',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.04,
                        shadowRadius: 30,
                    }}>
                        <Text style={{ color: '#9ca3af', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Office Context</Text>
                        <Text style={{ fontSize: 28, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 4 }}>{companyName}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '600' }}>Office Space</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 32 }}>Workspace Management</Text>
                <View style={{ flexDirection: 'row', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <TextLink href="/employees">
                        <View style={{
                            backgroundColor: 'white',
                            padding: 40,
                            borderRadius: 32,
                            width: 360,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderStyle: 'solid',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: 0.05,
                            shadowRadius: 40,
                        }}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Text style={{ fontSize: 40 }}>👥</Text>
                            </View>
                            <Text style={{ color: '#111827', fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Manage Staff</Text>
                            <Text style={{ color: '#6b7280', fontSize: 15, lineHeight: 22, textAlign: 'center' }}>Register and update team members for your office.</Text>
                        </View>
                    </TextLink>

                    <TextLink href="/order">
                        <View style={{
                            backgroundColor: '#111827',
                            padding: 40,
                            borderRadius: 32,
                            width: 360,
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 25 },
                            shadowOpacity: 0.25,
                            shadowRadius: 50,
                        }}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Text style={{ fontSize: 40 }}>🛒</Text>
                            </View>
                            <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Place Order</Text>
                            <Text style={{ color: '#9ca3af', fontSize: 15, lineHeight: 22, textAlign: 'center' }}>Direct delivery of drinks and snacks to your team.</Text>
                        </View>
                    </TextLink>
                </View>

                {/* Recent Activity Placeholder */}
                <View style={{ marginTop: 80, padding: 60, backgroundColor: '#ffffff', borderRadius: 40, border: '2px dashed #e5e7eb', alignItems: 'center', width: '100%', maxWidth: 800 }}>
                    <Text style={{ fontSize: 40, marginBottom: 20 }}>📊</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#374151' }}>No recent activity</Text>
                    <Text style={{ color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>All your office orders and staff updates will appear here in real-time.</Text>
                </View>
            </View>
        </ScrollView>
    );
}
