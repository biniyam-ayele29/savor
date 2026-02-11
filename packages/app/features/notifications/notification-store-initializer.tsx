'use client'

import { useEffect } from 'react';
import { setNotificationStoreCallback } from '@my-app/api';
import { useNotificationStore } from './notification-store';

/**
 * This component connects the notification hook to the notification store.
 * It must be placed inside both NotificationProvider and AuthGuard.
 */
export function NotificationStoreInitializer() {
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        // Connect the notification store to the notification hook
        setNotificationStoreCallback((title, body, type) => {
            addNotification(title, body, type);
        });

        // Cleanup on unmount
        return () => {
            setNotificationStoreCallback(null);
        };
    }, [addNotification]);

    return null;
}
