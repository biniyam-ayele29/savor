'use client'

import React from 'react';
import { View, Text } from 'react-native';
import { RegisterForm } from 'app/features/auth/register-form';
import { TextLink } from 'solito/link';

export default function RegisterPage() {
    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ width: '100%', maxWidth: 480, padding: 40 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: '#111827', marginBottom: 8, textAlign: 'center', letterSpacing: -1 }}>Create Admin Account</Text>
                <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 40, fontSize: 16 }}>Register your office to start managing your team.</Text>

                <RegisterForm />

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 6 }}>
                    <Text style={{ color: '#6b7280' }}>Already have an account?</Text>
                    <TextLink href="/login">
                        <Text style={{ color: '#ea580c', fontWeight: 'bold' }}>Sign In</Text>
                    </TextLink>
                </View>
            </View>
        </View>
    );
}
