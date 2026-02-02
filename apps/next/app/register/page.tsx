'use client'

import React from 'react';
import { View, Text } from 'react-native';
import { RegisterForm } from 'app/features/auth/register-form';
import { TextLink } from 'solito/link';

export default function RegisterPage() {
    return (
        <View style={{
            flex: 1,
            backgroundImage: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        }}>
            <View style={{ width: '100%', maxWidth: 480, padding: 40 }}>
                <Text style={{
                    fontSize: 36,
                    fontWeight: '900',
                    color: '#1c1917',
                    marginBottom: 10,
                    textAlign: 'center',
                    letterSpacing: -0.5,
                }}>
                    Create Admin Account
                </Text>
                <Text style={{
                    color: '#78716c',
                    textAlign: 'center',
                    marginBottom: 40,
                    fontSize: 16,
                    lineHeight: 24,
                }}>
                    Register your office to start managing your team.
                </Text>

                <View style={{
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                    padding: 36,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#e7e5e4',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 20,
                }}>
                    <RegisterForm />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 8 }}>
                    <Text style={{ color: '#78716c', fontSize: 15 }}>Already have an account?</Text>
                    <TextLink href="/login">
                        <Text style={{ color: '#b45309', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
                    </TextLink>
                </View>
            </View>
        </View>
    );
}
