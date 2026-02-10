'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    
    // Surface colors
    surface: string;
    surfaceHover: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    
    // Border colors
    border: string;
    borderLight: string;
    
    // Brand colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    
    // Status colors
    success: string;
    successLight: string;
    error: string;
    errorLight: string;
    warning: string;
    warningLight: string;
    
    // Gradients
    gradientPrimary: string;
    gradientBackground: string;
    gradientSurface: string;
}

const lightTheme: ThemeColors = {
    background: '#fafaf9',
    backgroundSecondary: '#f5f5f4',
    backgroundTertiary: '#e7e5e4',
    
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    
    text: '#1c1917',
    textSecondary: '#78716c',
    textTertiary: '#a8a29e',
    
    border: '#e7e5e4',
    borderLight: '#f3f4f6',
    
    primary: '#E68B2C',
    primaryLight: '#ffedd5',
    primaryDark: '#D97706',
    accent: '#fef3c7',
    
    success: '#047857',
    successLight: '#ecfdf5',
    error: '#dc2626',
    errorLight: '#fef2f2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    
    gradientPrimary: 'linear-gradient(135deg, #E68B2C 0%, #D97706 100%)',
    gradientBackground: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
    gradientSurface: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
};

const darkTheme: ThemeColors = {
    background: '#0c0a09',
    backgroundSecondary: '#1c1917',
    backgroundTertiary: '#292524',
    
    surface: '#262320',
    surfaceHover: '#2d2926',
    
    text: '#fafaf9',
    textSecondary: '#d6d3d1',
    textTertiary: '#a8a29e',
    
    border: '#3f3a37',
    borderLight: '#57534e',
    
    primary: '#fb923c',
    primaryLight: '#78350f',
    primaryDark: '#ea580c',
    accent: '#78350f',
    
    success: '#22c55e',
    successLight: '#064e3b',
    error: '#ef4444',
    errorLight: '#450a0a',
    warning: '#fb923c',
    warningLight: '#451a03',
    
    gradientPrimary: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    gradientBackground: 'linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
    gradientSurface: 'linear-gradient(135deg, #262320 0%, #292524 100%)',
};

interface ThemeContextType {
    theme: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeMode>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('savor-theme') as ThemeMode;
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('savor-theme', theme);
            // Update document body class for global styles
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const colors = theme === 'light' ? lightTheme : darkTheme;

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
