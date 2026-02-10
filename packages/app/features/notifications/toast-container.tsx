'use client'

import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useToast } from './toast-context';
import { useTheme } from '../theme/theme-context';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, ShoppingCart, Clock, Truck, Package } from 'lucide-react';

export function ToastContainer() {
    const { toasts, removeToast } = useToast();
    const { colors } = useTheme();

    const getToastIcon = (type: string, message: string) => {
        // Check message content for context
        if (message.includes('New Order')) return <ShoppingCart size={20} color="#ffffff" />;
        if (message.includes('pending')) return <Clock size={20} color="#ffffff" />;
        if (message.includes('preparing')) return <Package size={20} color="#ffffff" />;
        if (message.includes('delivering')) return <Truck size={20} color="#ffffff" />;
        if (message.includes('delivered')) return <CheckCircle2 size={20} color="#ffffff" />;
        
        // Default by type
        if (type === 'success') return <CheckCircle2 size={20} color="#ffffff" />;
        if (type === 'error') return <AlertCircle size={20} color="#ffffff" />;
        if (type === 'warning') return <AlertTriangle size={20} color="#ffffff" />;
        return <Info size={20} color="#ffffff" />;
    };

    const getToastColors = (type: string) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '#059669',
                };
            case 'error':
                return {
                    bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: '#dc2626',
                };
            case 'warning':
                return {
                    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: '#d97706',
                };
            default: // info
                return {
                    bg: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                    border: '#ea580c',
                };
        }
    };

    if (toasts.length === 0) return null;

    return (
        <View style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            gap: 12,
            maxWidth: 400,
            pointerEvents: 'box-none',
        }}>
            {toasts.map((toast, index) => {
                const toastColors = getToastColors(toast.type);
                
                return (
                    <View
                        key={toast.id}
                        style={{
                            backgroundImage: toastColors.bg,
                            borderRadius: 16,
                            padding: 20,
                            paddingRight: 16,
                            borderWidth: 1,
                            borderColor: toastColors.border,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 24,
                            minWidth: 340,
                            maxWidth: 400,
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: 14,
                            pointerEvents: 'auto',
                            // Animation
                            opacity: 1,
                            transform: [{ translateX: 0 }],
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        {/* Icon */}
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {getToastIcon(toast.type, toast.message)}
                        </View>

                        {/* Content */}
                        <View style={{ flex: 1, paddingTop: 2 }}>
                            <Text style={{
                                color: '#ffffff',
                                fontSize: 15,
                                fontWeight: '800',
                                marginBottom: 4,
                                letterSpacing: -0.2,
                            }}>
                                {toast.title}
                            </Text>
                            <Text style={{
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontSize: 14,
                                fontWeight: '500',
                                lineHeight: 20,
                            }}>
                                {toast.message}
                            </Text>
                        </View>

                        {/* Close Button */}
                        <Pressable
                            onPress={() => removeToast(toast.id)}
                            style={({ pressed }) => ({
                                padding: 4,
                                opacity: pressed ? 0.6 : 0.8,
                                marginTop: -4,
                                marginRight: -4,
                            })}
                        >
                            <X size={18} color="#ffffff" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                );
            })}
        </View>
    );
}
