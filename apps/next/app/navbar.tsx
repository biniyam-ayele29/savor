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
    const { user, companyName, companyLogoUrl, signOut, role } = useAuth();

    if (pathname === '/login' || (pathname === '/' && !user)) return null;

    const displayHeaderLabel = user && companyName ? `@${companyName.replace(/\s+/g, '')}` : 'Savor';

    // Filter nav items based on role
    const visibleNavItems = NAV_ITEMS.filter(item => {
        if (role === 'admin' || role === 'super_admin') return true;
        // Default users only see "Place Order"
        return item.href === '/order';
    });

    return (
        <View style={{
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e7e5e4',
            borderBottomStyle: 'solid',
            zIndex: 1000,
            position: 'sticky',
            top: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
        }}>
            {/* Tier 1: System Bar (Logo & Profile) */}
            <View style={{ alignItems: 'center', borderBottomWidth: user ? 1 : 0, borderBottomColor: '#f5f5f4', borderBottomStyle: 'solid' }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 48,
                    paddingVertical: 16,
                    width: '100%',
                    maxWidth: 1400,
                }}>
                    <TextLink href={role === 'admin' || role === 'super_admin' ? "/dashboard" : "/order"}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{
                                width: 72,
                                height: 72,
                                borderRadius: 16,
                                backgroundColor: '#FFFFFF',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                borderWidth: 1,
                                borderColor: '#e7e5e4',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                            }}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/savour/company-logos/savor_logo.png`}
                                    alt="Company Logo"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                    }}
                                />
                            </View>
                            <View>
                                <Text style={{ color: '#FFAC1C', fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>
                                    {companyName || 'Savor'}
                                </Text>
                            </View>
                        </View>
                    </TextLink>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
                        {user ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#1c1917', fontSize: 14, fontWeight: '800' }}>{user.email?.split('@')[0]}</Text>
                                    <Text style={{ color: '#78716c', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>
                                        {role === 'admin' || role === 'super_admin' ? 'Administrator' : 'Member'}
                                    </Text>
                                </View>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: '#FFFFFF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: '#e7e5e4',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={companyLogoUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/savour/company-logos/savor_logo.png`}
                                        alt="User Company Logo"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </View>
                                <Pressable
                                    onPress={() => signOut()}
                                    style={({ pressed }: { pressed: boolean }) => ({
                                        backgroundImage: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                        paddingHorizontal: 18,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#fecaca',
                                        opacity: pressed ? 0.9 : 1,
                                        shadowColor: '#ef4444',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 6,
                                    })}
                                >
                                    <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: 13 }}>Log Out</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <TextLink href="/login">
                                <View style={{
                                    backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                                    paddingHorizontal: 24,
                                    paddingVertical: 12,
                                    borderRadius: 14,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 12,
                                }}>
                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Manager Portal</Text>
                                </View>
                            </TextLink>
                        )}
                    </View>
                </View>
            </View>

            {/* Tier 2: Navigation Tabs */}
            {user && (
                <View style={{
                    backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)',
                    paddingVertical: 14,
                    alignItems: 'center',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundImage: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                        padding: 6,
                        borderRadius: 16,
                        gap: 6,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.04)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                    }}>
                        {visibleNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
                            return (
                                <View key={item.href} style={{ flex: 1, minWidth: 140 }}>
                                    <TextLink href={item.href}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 10,
                                            paddingHorizontal: 20,
                                            paddingVertical: 14,
                                            borderRadius: 12,
                                            minHeight: 48,
                                            backgroundImage: isActive ? 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)' : 'transparent',
                                            shadowColor: isActive ? '#000' : 'transparent',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: isActive ? 0.06 : 0,
                                            shadowRadius: isActive ? 8 : 0,
                                            borderWidth: 1,
                                            borderColor: isActive ? 'rgba(180, 83, 9, 0.25)' : 'transparent',
                                        }}>
                                            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: isActive ? '800' : '600',
                                                color: isActive ? '#1c1917' : '#78716c',
                                            }} numberOfLines={1}>
                                                {item.label}
                                            </Text>
                                        </View>
                                    </TextLink>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}

