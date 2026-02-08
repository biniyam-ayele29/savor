'use client'

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '@my-app/api';
import { useRouter } from 'next/navigation';
import { TextLink } from 'solito/link';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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
                    color: '#374151',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2
                }}>
                    Email
                </Text>
                <TextInput
                    style={{
                        backgroundColor: '#f9fafb',
                        padding: 20,
                        borderRadius: 20,
                        border: '2px solid #f3f4f6',
                        fontSize: 16,
                        color: '#111827',
                        fontWeight: '500'
                    }}
                    placeholder="name@company.com"
                    placeholderTextColor="#9ca3af"
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
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: 1.2
                    }}>
                        Password
                    </Text>
                    <Pressable>
                        <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600' }}>Forgot?</Text>
                    </Pressable>
                </View>
                <TextInput
                    style={{
                        backgroundColor: '#f9fafb',
                        padding: 20,
                        borderRadius: 20,
                        border: '2px solid #f3f4f6',
                        fontSize: 16,
                        color: '#111827',
                        fontWeight: '500'
                    }}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={{
                    backgroundColor: '#111827',
                    padding: 20,
                    borderRadius: 20,
                    alignItems: 'center',
                    marginTop: 12,
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
                <Text style={{ color: '#6b7280', fontWeight: '500' }}>New admin?</Text>
                <TextLink href="/register">
                    <Text style={{ color: '#ea580c', fontWeight: '800' }}>Create account</Text>
                </TextLink>
            </View>
        </View>
    );
}
