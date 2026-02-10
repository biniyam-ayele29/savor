'use client'

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useOrderNotifications } from '@my-app/api';
import { useAuth } from '@my-app/api';
import { useTheme } from '../theme/theme-context';
import { Bell, BellOff } from 'lucide-react';

export function NotificationPermissionButton() {
    const { companyId } = useAuth();
    const { colors } = useTheme();
    const [permission, setPermission] = React.useState<NotificationPermission>('default');
    const { requestNotificationPermission } = useOrderNotifications(companyId || undefined);

    React.useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const handleRequestPermission = async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
    };

    if (permission === 'granted') {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: colors.successLight,
                borderWidth: 1,
                borderColor: colors.success,
            }}>
                <Bell size={16} color={colors.success} />
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>
                    Notifications Active
                </Text>
            </View>
        );
    }

    if (permission === 'denied') {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: colors.errorLight,
                borderWidth: 1,
                borderColor: colors.error,
            }}>
                <BellOff size={16} color={colors.error} />
                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>
                    Notifications Blocked
                </Text>
            </View>
        );
    }

    return (
        <Pressable
            onPress={handleRequestPermission}
            style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: pressed ? colors.primaryDark : colors.primary,
                opacity: pressed ? 0.9 : 1,
            })}
        >
            <Bell size={16} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                Enable Notifications
            </Text>
        </Pressable>
    );
}
