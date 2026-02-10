'use client'

import React from 'react';
import { View, Text } from 'react-native';
import { RegisterForm } from 'app/features/auth/register-form';
import { TextLink } from 'solito/link';
import { useTheme } from 'app/features/theme/theme-context';

export default function RegisterPage() {
    const { colors } = useTheme();
    
    return (
        <View style={{
            flex: 1,
            backgroundImage: colors.gradientBackground,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        }}>
            <View style={{ width: '100%', maxWidth: 480, padding: 40 }}>
                <Text style={{
                    fontSize: 36,
                    fontWeight: '900',
                    color: colors.text,
                    marginBottom: 10,
                    textAlign: 'center',
                    letterSpacing: -0.5,
                }}>
                    Create Admin Account
                </Text>
                <Text style={{
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginBottom: 40,
                    fontSize: 16,
                    lineHeight: 24,
                }}>
                    Register your office to start managing your team.
                </Text>

                <View style={{
                    backgroundImage: colors.gradientSurface,
                    padding: 36,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 20,
                }}>
                    <RegisterForm />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 8 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Already have an account?</Text>
                    <TextLink href="/login">
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Sign In</Text>
                    </TextLink>
                </View>
            </View>
        </View>
    );
}
