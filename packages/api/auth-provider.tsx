'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    companyId: string | null;
    companyName: string | null;
    companyDomain: string | null;
    companyLogoUrl: string | null;
    companyFloor: string | null;
    companyEmail: string | null;
    companyPhone: string | null;
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
    const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
    const [companyFloor, setCompanyFloor] = useState<string | null>(null);
    const [companyEmail, setCompanyEmail] = useState<string | null>(null);
    const [companyPhone, setCompanyPhone] = useState<string | null>(null);
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
            // 1. Try company_admins first (advisors/admins)
            const { data: adminData } = await supabase
                .from('company_admins')
                .select(`
                    role,
                    company_id,
                    companies:company_id (
                        name,
                        domain,
                        logo_url,
                        floor_number,
                        contact_email,
                        contact_phone
                    )
                `)
                .eq('user_id', userId)
                .maybeSingle();

            if (adminData) {
                setRole(adminData.role as any);
                setCompanyId(adminData.company_id);
                if (adminData.companies) {
                    const company = adminData.companies as any;
                    setCompanyName(company.name);
                    setCompanyDomain(company.domain);
                    setCompanyLogoUrl(company.logo_url);
                    setCompanyFloor(company.floor_number?.toString() || null);
                    setCompanyEmail(company.contact_email);
                    setCompanyPhone(company.contact_phone);
                }
                setIsLoading(false);
                return;
            }

            // 2. Fallback to profiles table for regular employees
            const { data: profileData } = await supabase
                .from('profiles')
                .select(`
                    role,
                    company_id,
                    companies:company_id (
                        name,
                        domain,
                        logo_url,
                        floor_number,
                        contact_email,
                        contact_phone
                    )
                `)
                .eq('id', userId)
                .maybeSingle();

            if (profileData) {
                setRole(profileData.role as any || null);
                setCompanyId(profileData.company_id);
                if (profileData.companies) {
                    const company = profileData.companies as any;
                    setCompanyName(company.name);
                    setCompanyDomain(company.domain);
                    setCompanyLogoUrl(company.logo_url);
                    setCompanyFloor(company.floor_number?.toString() || null);
                    setCompanyEmail(company.contact_email);
                    setCompanyPhone(company.contact_phone);
                }
            } else {
                console.warn(`No context found for user ID: ${userId}`);
                setRole(null);
                setCompanyId(null);
                setCompanyName(null);
                setCompanyDomain(null);
                setCompanyLogoUrl(null);
            }
        } catch (err) {
            console.error('Error fetching user context:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // Redirect to login page after sign out
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            companyId,
            companyName,
            companyDomain,
            companyLogoUrl,
            companyFloor,
            companyEmail,
            companyPhone,
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
