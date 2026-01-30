'use client'

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TextLink } from 'solito/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@my-app/api';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Manage Staff', href: '/employees', icon: '👥' },
    { label: 'Place Order', href: '/order', icon: '🛒' },
];

export function NavBar() {
    const pathname = usePathname();
    const { user, companyName, signOut } = useAuth();

    // Hide entire NavBar on login page to center the experience
    // Also hide on landing page if not logged in (since landing is now the login page)
    if (pathname === '/login' || (pathname === '/' && !user)) return null;

    const displayHeaderLabel = user && companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Office Cafe';

    return (
        <View style={{
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
            borderBottomStyle: 'solid',
            zIndex: 1000,
            position: 'sticky',
            top: 0,
        }}>
            {/* Tier 1: System Bar (Logo & Profile) */}
            <View style={{ alignItems: 'center', borderBottomWidth: user ? 1 : 0, borderBottomColor: '#f8fafc', borderBottomStyle: 'solid' }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 48,
                    paddingVertical: 16,
                    width: '100%',
                    maxWidth: 1400,
                }}>
                    <TextLink href="/dashboard">
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 24 }}>{user ? '🏢' : '☕'}</Text>
                            </View>
                            <View>
                                <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -1 }}>
                                    {displayHeaderLabel}
                                </Text>
                                {user && <Text style={{ fontSize: 10, color: '#ea580c', fontWeight: '800', letterSpacing: 1 }}>WORKSPACE CAPTAIN</Text>}
                            </View>
                        </View>
                    </TextLink>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
                        {user ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#111827', fontSize: 14, fontWeight: '800' }}>{user.email?.split('@')[0]}</Text>
                                    <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>Administrator</Text>
                                </View>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 18 }}>🛡️</Text>
                                </View>
                                <Pressable
                                    onPress={() => signOut()}
                                    style={({ pressed }) => ({
                                        backgroundColor: '#fef2f2',
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#fee2e2',
                                        opacity: pressed ? 0.8 : 1
                                    })}
                                >
                                    <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 13 }}>Log Out</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <TextLink href="/login">
                                <View style={{ backgroundColor: '#111827', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Manager Portal</Text>
                                </View>
                            </TextLink>
                        )}
                    </View>
                </View>
            </View>

            {/* Tier 2: Navigation Dashboard (Centered Tabs) */}
            {user && (
                <View style={{
                    backgroundColor: '#ffffff',
                    paddingVertical: 12,
                    alignItems: 'center',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#f1f5f9',
                        padding: 6,
                        borderRadius: 18,
                        gap: 6
                    }}>
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <TextLink key={item.href} href={item.href}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                        paddingHorizontal: 28,
                                        paddingVertical: 12,
                                        borderRadius: 14,
                                        backgroundColor: isActive ? 'white' : 'transparent',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: isActive ? 0.04 : 0,
                                        shadowRadius: 10,
                                        borderWidth: 1,
                                        borderColor: isActive ? '#e2e8f0' : 'transparent'
                                    }}>
                                        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                                        <Text style={{
                                            fontSize: 15,
                                            fontWeight: isActive ? '800' : '600',
                                            color: isActive ? '#111827' : '#64748b',
                                        }}>
                                            {item.label}
                                        </Text>
                                    </View>
                                </TextLink>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}

