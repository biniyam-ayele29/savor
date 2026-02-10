'use client'

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth, useEmployees, useOrders } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { TextLink } from 'solito/link';
import { useTheme } from 'app/features/theme/theme-context';

export default function DashboardPage() {
    const { user, companyName, companyId, role, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();

    const { data: employees = [] } = useEmployees(companyId || undefined);
    const { data: orders = [] } = useOrders();

    // Redirect non-admin users to /order
    React.useEffect(() => {
        if (!authLoading && user && role !== 'admin' && role !== 'super_admin') {
            router.push('/order');
        }
    }, [authLoading, user, role, router]);

    if (authLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: colors.gradientBackground,
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
                    <ActivityIndicator size="large" color="#E68B2C" />
                </View>
                <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: '600' }}>Initializing Dashboard...</Text>
            </View>
        );
    }

    // Don't render if not admin (will redirect via useEffect)
    if (role !== 'admin' && role !== 'super_admin') {
        return null;
    }

    const companyOrders = orders.filter(o => o.companyId === companyId);
    const pendingOrders = companyOrders.filter(o => o.status === 'pending');
    const displayHeader = companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Dashboard';

    return (
        <ScrollView
            style={{ flex: 1, backgroundImage: colors.gradientBackground }}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}
        >
            <View style={{ maxWidth: 1200, width: '100%', padding: 40, alignItems: 'center' }}>

                {/* Header */}
                <View style={{ marginBottom: 48, alignItems: 'center' }}>
                    <Text style={{
                        fontSize: 48,
                        fontWeight: '900',
                        color: colors.text,
                        letterSpacing: -1.5,
                        marginBottom: 12,
                        textAlign: 'center',
                    }}>
                        {displayHeader}
                    </Text>
                    <View style={{
                        backgroundImage: 'linear-gradient(135deg, #7FA14B 0%, #6B8E3F 100%)',
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                        borderRadius: 100,
                        marginBottom: 16,
                    }}>
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>Administrator Portal</Text>
                    </View>
                    <Text style={{ fontSize: 18, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' }}>
                        Welcome back, {user?.email?.split('@')[0]}
                    </Text>
                </View>

                {/* Metrics Grid */}
                <View style={{ flexDirection: 'row', gap: 24, marginBottom: 56, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundImage: colors.gradientSurface,
                        padding: 32,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.04,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Total Staff</Text>
                        <Text style={{ fontSize: 48, fontWeight: '900', color: colors.text }}>{employees.length}</Text>
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
                        backgroundImage: colors.gradientSurface,
                        padding: 32,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.04,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Pending Orders</Text>
                        <Text style={{ fontSize: 48, fontWeight: '900', color: '#E68B2C' }}>{pendingOrders.length}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 12 }}>Total: {companyOrders.length}</Text>
                    </View>

                    <View style={{
                        flex: 1,
                        minWidth: 280,
                        backgroundImage: colors.gradientSurface,
                        padding: 32,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.04,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Office Context</Text>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 4 }}>{companyName}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>Office Space</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 32 }}>Workspace Management</Text>
                <View style={{ flexDirection: 'row', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <TextLink href="/employees">
                        <View style={{
                            backgroundImage: colors.gradientSurface,
                            padding: 36,
                            borderRadius: 20,
                            width: 340,
                            borderWidth: 1,
                            borderColor: colors.border,
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
                            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 }}>Manage Staff</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center' }}>Register and update team members for your office.</Text>
                        </View>
                    </TextLink>

                    <TextLink href="/order">
                        <View style={{
                            backgroundImage: 'linear-gradient(135deg, #E68B2C 0%, #D97706 50%, #B45309 100%)',
                            padding: 36,
                            borderRadius: 20,
                            width: 340,
                            alignItems: 'center',
                            shadowColor: '#E68B2C',
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
                    backgroundImage: colors.gradientSurface,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 800,
                }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundImage: colors.gradientSurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}>
                        <Text style={{ fontSize: 32 }}>📊</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textSecondary }}>No recent activity</Text>
                    <Text style={{ color: colors.textTertiary, marginTop: 10, textAlign: 'center', fontSize: 14 }}>All your office orders and staff updates will appear here in real-time.</Text>
                </View>
            </View>
        </ScrollView>
    );
}
