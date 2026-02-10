'use client'

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { TextLink } from 'solito/link';
import { useTheme } from 'app/features/theme/theme-context';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { colors } = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (error) throw error;
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error.message);
            alert('Invalid login credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ gap: 32, width: '100%' }}>
            <View>
                <Text style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: colors.textSecondary,
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2
                }}>
                    Email
                </Text>
                <TextInput
                    style={{
                        backgroundColor: colors.background,
                        padding: 20,
                        borderRadius: 20,
                        border: `2px solid ${colors.border}`,
                        fontSize: 16,
                        color: colors.text,
                        fontWeight: '500'
                    }}
                    placeholder="name@company.com"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 13,
                        fontWeight: '800',
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: 1.2
                    }}>
                        Password
                    </Text>
                    <Pressable>
                        <Text style={{ fontSize: 13, color: colors.textTertiary, fontWeight: '600' }}>Forgot?</Text>
                    </Pressable>
                </View>
                <TextInput
                    style={{
                        backgroundColor: colors.background,
                        padding: 20,
                        borderRadius: 20,
                        border: `2px solid ${colors.border}`,
                        fontSize: 16,
                        color: colors.text,
                        fontWeight: '500'
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={{
                    backgroundImage: colors.gradientPrimary,
                    padding: 20,
                    borderRadius: 20,
                    alignItems: 'center',
                    marginTop: 12,
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: `0 20px 25px -5px ${colors.primary}40, 0 10px 10px -5px ${colors.primary}20`
                }}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }}>
                        Sign In to Dashboard
                    </Text>
                )}
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 }}>
                <TextLink href="/register">
                    <Text style={{ color: colors.primary, fontWeight: '800' }}>Sign up</Text>
                </TextLink>
            </View>
        </View>
    );
}
