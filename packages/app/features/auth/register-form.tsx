'use client'

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '@my-app/api';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            alert('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            alert('Registration successful! You can now log in.');
            router.push('/login');
        } catch (error: any) {
            console.error('Registration error:', error.message);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ gap: 20, width: '100%' }}>
            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Full Name</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                />
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Work Email (name@company.com)</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="alice@techinnovators.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Create Password</Text>
                <TextInput
                    style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16 }}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <Pressable
                onPress={handleRegister}
                disabled={isLoading}
                style={{ backgroundColor: '#ea580c', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, opacity: isLoading ? 0.7 : 1 }}
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Register Admin Account</Text>}
            </Pressable>
        </View>
    );
}
