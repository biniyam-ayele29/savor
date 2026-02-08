'use client'

import React from 'react';
import { View, Text } from 'react-native';
import { LoginForm } from 'app/features/auth/login-form';
import { useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user && !isLoading) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                minHeight: '100vh',
                backgroundColor: '#fafaf9',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Text style={{ color: '#78716c', fontSize: 16 }}>Loading...</Text>
            </View>
        );
    }

    if (user) {
        return null; // Will redirect
    }

    return (
        <View style={{
            flex: 1,
            minHeight: '100vh',
            backgroundImage: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <View style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 48,
                width: '100%',
                maxWidth: 440,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.1,
                shadowRadius: 40,
                borderWidth: 1,
                borderColor: '#e7e5e4',
            }}>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <View style={{
                        width: 72,
                        height: 72,
                        borderRadius: 20,
                        backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ fontSize: 36 }}>🏢</Text>
                    </View>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: '900',
                        color: '#1c1917',
                        letterSpacing: -0.5,
                        marginBottom: 8,
                    }}>
                        Manager Portal
                    </Text>
                    <Text style={{
                        fontSize: 15,
                        color: '#78716c',
                        textAlign: 'center',
                    }}>
                        Sign in to manage your workspace
                    </Text>
                </View>

                {/* Login Form */}
                <LoginForm />
            </View>

            {/* Footer */}
            <View style={{ marginTop: 32 }}>
                <Text style={{ color: '#a8a29e', fontSize: 13, textAlign: 'center' }}>
                    Savor Management System
                </Text>
            </View>
        </View>
    );
}
