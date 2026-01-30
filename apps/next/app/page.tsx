'use client'

import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LoginForm } from 'app/features/auth/login-form';
import { useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);
    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            {/* Background Aesthetic */}
            <View style={{
                position: 'absolute',
                top: -200,
                right: -200,
                width: 600,
                height: 600,
                borderRadius: 300,
                backgroundColor: 'rgba(234, 88, 12, 0.05)',
                filter: 'blur(80px)'
            }} />
            <View style={{
                position: 'absolute',
                bottom: -150,
                left: -150,
                width: 500,
                height: 500,
                borderRadius: 250,
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                filter: 'blur(80px)'
            }} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <View style={{ maxWidth: 480, width: '100%', alignItems: 'center' }}>
                    <View style={{ marginBottom: 40, alignItems: 'center' }}>
                        <Text style={{ fontSize: 48, marginBottom: 16 }}>☕</Text>
                        <Text style={{
                            fontSize: 40,
                            fontWeight: '900',
                            color: '#111827',
                            textAlign: 'center',
                            letterSpacing: -1.5,
                            marginBottom: 8
                        }}>
                            Office Cafe
                        </Text>
                        <Text style={{
                            fontSize: 18,
                            color: '#6b7280',
                            textAlign: 'center',
                            fontWeight: '500'
                        }}>
                            Premium coffee management for your workplace.
                        </Text>
                    </View>

                    <View style={{
                        width: '100%',
                        backgroundColor: 'white',
                        padding: 40,
                        borderRadius: 32,
                        border: '1px solid rgba(229, 231, 235, 0.5)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
                    }}>
                        <LoginForm />
                    </View>

                    <Text style={{
                        marginTop: 40,
                        color: '#9ca3af',
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
