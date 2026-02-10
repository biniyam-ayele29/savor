'use client'

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/theme-context';
import { Send } from 'lucide-react';

export function TelegramNotificationButton() {
    const { colors } = useTheme();
    const botUsername = 'savor_minaye_bot';

    const handleClick = () => {
        // Open Telegram bot
        window.open(`https://t.me/${botUsername}`, '_blank');
    };

    return (
        <Pressable
            onPress={handleClick}
            style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: pressed ? colors.surfaceHover : colors.surface,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
            })}
        >
            <Send size={16} color="#0088cc" />
            <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.text,
            }}>
                Telegram
            </Text>
        </Pressable>
    );
}
