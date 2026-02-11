'use client'

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useTheme } from '../theme/theme-context';
import { useNotificationStore } from './notification-store';

export function NotificationBell() {
    const { colors } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        // Format as date for older notifications
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getNotificationIcon = (type: 'new' | 'update') => {
        if (type === 'new') return '🛒';
        return '📦';
    };

    return (
        <View style={{ position: 'relative' }}>
            <Pressable
                onPress={() => setIsOpen(!isOpen)}
                style={({ pressed }) => ({
                    position: 'relative',
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: pressed ? colors.surfaceHover : 'transparent',
                })}
            >
                <Bell size={20} color={colors.text} />
                {unreadCount > 0 && (
                    <View style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: '#ef4444',
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 4,
                        borderWidth: 2,
                        borderColor: colors.background,
                    }}>
                        <Text style={{
                            color: '#ffffff',
                            fontSize: 10,
                            fontWeight: '800',
                        }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </Pressable>

            {isOpen && (
                <View
                    // @ts-ignore - ref works for web
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: 45,
                        right: 0,
                        width: 400,
                        maxHeight: 600,
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 24,
                        zIndex: 9999,
                    }}
                >
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    }}>
                        <View>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '800',
                                color: colors.text,
                            }}>
                                Notifications
                            </Text>
                            {unreadCount > 0 && (
                                <Text style={{
                                    fontSize: 12,
                                    color: colors.textSecondary,
                                    marginTop: 2,
                                }}>
                                    {unreadCount} unread
                                </Text>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {unreadCount > 0 && (
                                <Pressable
                                    onPress={markAllAsRead}
                                    style={({ pressed }) => ({
                                        padding: 6,
                                        borderRadius: 6,
                                        backgroundColor: pressed ? colors.surfaceHover : colors.surface,
                                    })}
                                >
                                    <CheckCheck size={16} color={colors.primary} />
                                </Pressable>
                            )}
                            {notifications.length > 0 && (
                                <Pressable
                                    onPress={clearAllNotifications}
                                    style={({ pressed }) => ({
                                        padding: 6,
                                        borderRadius: 6,
                                        backgroundColor: pressed ? colors.surfaceHover : colors.surface,
                                    })}
                                >
                                    <Trash2 size={16} color={colors.error} />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* Notification List */}
                    <ScrollView style={{ maxHeight: 500 }}>
                        {notifications.length === 0 ? (
                            <View style={{
                                padding: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Bell size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                                <Text style={{
                                    fontSize: 14,
                                    color: colors.textSecondary,
                                    marginTop: 16,
                                    textAlign: 'center',
                                }}>
                                    No notifications yet
                                </Text>
                            </View>
                        ) : (
                            notifications.map((notification) => (
                                <Pressable
                                    key={notification.id}
                                    onPress={() => markAsRead(notification.id)}
                                    style={({ pressed }) => ({
                                        padding: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border,
                                        backgroundColor: notification.read 
                                            ? (pressed ? colors.surfaceHover : 'transparent')
                                            : (pressed ? colors.primaryLight : colors.primaryLight + '40'),
                                    })}
                                >
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <Text style={{ fontSize: 20 }}>
                                            {getNotificationIcon(notification.type)}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={{
                                                    fontSize: 13,
                                                    fontWeight: '700',
                                                    color: colors.text,
                                                    flex: 1,
                                                }}>
                                                    {notification.title}
                                                </Text>
                                                {!notification.read && (
                                                    <View style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: colors.primary,
                                                    }} />
                                                )}
                                            </View>
                                            <Text style={{
                                                fontSize: 12,
                                                color: colors.textSecondary,
                                                marginTop: 4,
                                            }}>
                                                {notification.body}
                                            </Text>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginTop: 8,
                                            }}>
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: colors.textSecondary,
                                                    fontWeight: '600',
                                                }}>
                                                    {formatTimestamp(notification.timestamp)}
                                                </Text>
                                                <Pressable
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        clearNotification(notification.id);
                                                    }}
                                                    style={({ pressed }) => ({
                                                        padding: 4,
                                                        borderRadius: 4,
                                                        opacity: pressed ? 0.7 : 1,
                                                    })}
                                                >
                                                    <X size={14} color={colors.textSecondary} />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}
