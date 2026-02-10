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
    
    // Brand colors - from Savor logo
    primary: string;          // Orange/Gold #E68B2C
    primaryLight: string;
    primaryDark: string;
    secondary: string;        // Green #7FA14B
    secondaryLight: string;
    accent: string;           // Dark Brown #3B2415
    accentLight: string;
    
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
    
    text: '#3B2415',
    textSecondary: '#78716c',
    textTertiary: '#a8a29e',
    
    border: '#e7e5e4',
    borderLight: '#f3f4f6',
    
    primary: '#E68B2C',
    primaryLight: '#ffedd5',
    primaryDark: '#D97706',
    secondary: '#7FA14B',
    secondaryLight: '#f0fdf4',
    accent: '#3B2415',
    accentLight: '#78350f',
    
    success: '#7FA14B',
    successLight: '#f0fdf4',
    error: '#dc2626',
    errorLight: '#fef2f2',
    warning: '#E68B2C',
    warningLight: '#fff7ed',
    
    gradientPrimary: 'linear-gradient(135deg, #E68B2C 0%, #D97706 100%)',
    gradientBackground: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
    gradientSurface: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
};

const darkTheme: ThemeColors = {
    background: '#0c0a08',
    backgroundSecondary: '#1a1410',
    backgroundTertiary: '#2b231c',
    
    surface: '#1c1814',
    surfaceHover: '#252119',
    
    text: '#fafaf9',
    textSecondary: '#e7e5e4',
    textTertiary: '#d6d3d1',
    
    border: '#3B2415',
    borderLight: '#4a3d2f',
    
    primary: '#E68B2C',
    primaryLight: '#92520a',
    primaryDark: '#B45309',
    secondary: '#8fb458',
    secondaryLight: '#1e3a1e',
    accent: '#3B2415',
    accentLight: '#1a0f08',
    
    success: '#8fb458',
    successLight: '#1e3a1e',
    error: '#ef4444',
    errorLight: '#450a0a',
    warning: '#E68B2C',
    warningLight: '#78350f',
    
    gradientPrimary: 'linear-gradient(135deg, #E68B2C 0%, #D97706 100%)',
    gradientBackground: 'linear-gradient(180deg, #0c0a08 0%, #1a1410 50%, #2b231c 100%)',
    gradientSurface: 'linear-gradient(135deg, #1c1814 0%, #252119 100%)',
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
