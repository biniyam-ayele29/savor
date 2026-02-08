'use client'

import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LoginForm } from 'app/features/auth/login-form';
import { useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { user, isLoading, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            if (role === 'admin' || role === 'super_admin') {
                router.push('/dashboard');
            } else {
                router.push('/order');
            }
        }
    }, [user, role, isLoading, router]);
    return (
        <View style={{ flex: 1, backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <View style={{ maxWidth: 480, width: '100%', alignItems: 'center' }}>
                    <View style={{ marginBottom: 40, alignItems: 'center' }}>
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
                            <Text style={{ fontSize: 40 }}>☕</Text>
                        </View>
                        <Text style={{
                            fontSize: 40,
                            fontWeight: '900',
                            color: '#1c1917',
                            textAlign: 'center',
                            letterSpacing: -1,
                            marginBottom: 8
                        }}>
                            Savor
                        </Text>
                        <Text style={{
                            fontSize: 18,
                            color: '#78716c',
                            textAlign: 'center',
                            fontWeight: '500'
                        }}>
                            Premium coffee management for your workplace.
                        </Text>
                    </View>

                    <View style={{
                        width: '100%',
                        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                        padding: 40,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#e7e5e4',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.06,
                        shadowRadius: 24,
                    }}>
                        <LoginForm />
                    </View>

                    <Text style={{
                        marginTop: 40,
                        color: '#a8a29e',
                        fontSize: 14,
                        fontWeight: '500'
                    }}>
                        © 2026 Savour Technologies. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
