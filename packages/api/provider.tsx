'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AuthProvider } from './auth-provider';

export const queryClient = new QueryClient();

export function APIProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => queryClient);

    return (
        <QueryClientProvider client={client}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
}
