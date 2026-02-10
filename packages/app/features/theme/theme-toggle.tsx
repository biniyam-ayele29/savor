'use client'

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from './theme-context';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme === 'light' ? '#f5f5f4' : '#292524',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme === 'light' ? '#e7e5e4' : '#44403c',
                opacity: pressed ? 0.7 : 1,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
            })}
        >
            <Text style={{ fontSize: 18 }}>
                {theme === 'light' ? '🌙' : '☀️'}
            </Text>
        </Pressable>
    );
}
