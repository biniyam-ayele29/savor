'use client'

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@my-app/api';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/login', '/register', '/'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
            
            // If not logged in and trying to access protected route, redirect to login
            if (!user && !isPublicRoute) {
                router.push('/login');
            }
            
            // If logged in and trying to access login/register, redirect to dashboard
            if (user && isPublicRoute) {
                router.push('/dashboard');
            }
        }
    }, [user, isLoading, pathname, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                minHeight: '100vh',
                backgroundColor: '#fafaf9',
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
                    shadowColor: '#E68B2C',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                }}>
                    <ActivityIndicator size="large" color="#E68B2C" />
                </View>
                <Text style={{ 
                    fontSize: 16, 
                    color: '#78716c', 
                    fontWeight: '600',
                    letterSpacing: 0.3 
                }}>
                    Loading Savor...
                </Text>
            </View>
        );
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Don't render protected content if not authenticated
    if (!user && !isPublicRoute) {
        return null;
    }

    // Don't render public routes if already authenticated
    if (user && isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}
