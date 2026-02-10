'use client'

import React, { useEffect } from 'react';
import { useAuth } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from 'app/features/theme/theme-context';

export default function LandingPage() {
    const { user, isLoading, role } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                // Redirect authenticated users based on role
                if (role === 'admin' || role === 'super_admin') {
                    router.push('/dashboard');
                } else {
                    router.push('/order');
                }
            } else {
                // Redirect unauthenticated users to login
                router.push('/login');
            }
        }
    }, [user, role, isLoading, router]);

    // Show loading state during redirect
    return (
        <View style={{
            flex: 1,
            minHeight: '100vh',
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundImage: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#fed7aa',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={{ 
                fontSize: 16, 
                color: colors.textSecondary, 
                fontWeight: '600',
                letterSpacing: 0.3 
            }}>
                Loading Savor...
            </Text>
        </View>
    );
}
