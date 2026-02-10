'use client'

import React from 'react';
import { View, Text } from 'react-native';
import { LoginForm } from 'app/features/auth/login-form';
import { useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTheme } from 'app/features/theme/theme-context';

export default function LoginPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();

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
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Loading...</Text>
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
            backgroundImage: colors.gradientBackground,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <View style={{
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 48,
                width: '100%',
                maxWidth: 440,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.1,
                shadowRadius: 40,
                borderWidth: 1,
                borderColor: colors.border,
            }}>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <View style={{
                        width: 72,
                        height: 72,
                        borderRadius: 20,
                        backgroundImage: colors.gradientPrimary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                    }}>
                        <Text style={{ fontSize: 36 }}>☕</Text>
                    </View>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: '900',
                        color: colors.text,
                        letterSpacing: -0.5,
                        marginBottom: 8,
                    }}>
                        Savor
                    </Text>
                    <Text style={{
                        fontSize: 15,
                        color: colors.textSecondary,
                        textAlign: 'center',
                    }}>
                        Sign in to your account
                    </Text>
                </View>

                {/* Login Form */}
                <LoginForm />
            </View>

            {/* Footer */}
            <View style={{ marginTop: 32 }}>
                <Text style={{ color: colors.textTertiary, fontSize: 13, textAlign: 'center' }}>
                    Savor Management System
                </Text>
            </View>
        </View>
    );
}
