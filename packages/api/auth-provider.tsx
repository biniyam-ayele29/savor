'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    companyId: string | null;
    companyName: string | null;
    companyDomain: string | null;
    role: 'admin' | 'super_admin' | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [companyDomain, setCompanyDomain] = useState<string | null>(null);
    const [role, setRole] = useState<'admin' | 'super_admin' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchAdminCompany(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchAdminCompany(session.user.id);
            } else {
                setCompanyId(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchAdminCompany = async (userId: string) => {
        try {
            // Fetch everything in one go from the aligned company_admins junction table
            const { data, error } = await supabase
                .from('company_admins')
                .select(`
                    role,
                    company_id,
                    companies:company_id (
                        name,
                        domain
                    )
                `)
                .eq('user_id', userId)
                .maybeSingle();

            if (data) {
                setRole(data.role as any);
                setCompanyId(data.company_id);
                if (data.companies) {
                    const company = data.companies as any;
                    setCompanyName(company.name);
                    setCompanyDomain(company.domain);
                }
            } else {
                console.warn(`No admin company association found for user ID: ${userId}`);
                // Still try to fetch role from profiles just in case it's a super admin with no company
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                setRole(profile?.role as any || null);
                setCompanyId(null);
                setCompanyName(null);
                setCompanyDomain(null);
            }
        } catch (err) {
            console.error('Error fetching admin profile/company:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user,
            companyId,
            companyName,
            companyDomain,
            role,
            isLoading,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
