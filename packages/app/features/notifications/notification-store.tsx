'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface StoredNotification {
    id: string;
    title: string;
    body: string;
    type: 'new' | 'update';
    timestamp: number;
    read: boolean;
}

interface NotificationStore {
    notifications: StoredNotification[];
    addNotification: (title: string, body: string, type: 'new' | 'update') => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAllNotifications: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationStore | undefined>(undefined);

const STORAGE_KEY = 'savor_notifications';
const MAX_NOTIFICATIONS = 50; // Keep last 50 notifications

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load notifications from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setNotifications(parsed);
                }
            } catch (error) {
                console.error('Failed to load notifications:', error);
            }
            setIsInitialized(true);
        }
    }, []);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
            } catch (error) {
                console.error('Failed to save notifications:', error);
            }
        }
    }, [notifications, isInitialized]);

    const addNotification = useCallback((title: string, body: string, type: 'new' | 'update') => {
        const newNotification: StoredNotification = {
            id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            title,
            body,
            type,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            // Keep only the most recent MAX_NOTIFICATIONS
            return updated.slice(0, MAX_NOTIFICATIONS);
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, read: true }))
        );
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearNotification,
                clearAllNotifications,
                unreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationStore() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationStore must be used within a NotificationProvider');
    }
    return context;
}
