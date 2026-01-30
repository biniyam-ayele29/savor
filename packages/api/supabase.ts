import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
    public: {
        Tables: {
            menu_items: {
                Row: {
                    id: string;
                    name: string;
                    price: number;
                    category: 'drinks' | 'food' | 'snacks';
                    available: boolean;
                    image: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    price: number;
                    category: 'drinks' | 'food' | 'snacks';
                    available?: boolean;
                    image?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    price?: number;
                    category?: 'drinks' | 'food' | 'snacks';
                    available?: boolean;
                    image?: string | null;
                    created_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    total_price: number;
                    floor_number: number;
                    status: 'pending' | 'preparing' | 'delivering' | 'delivered';
                    company_id: string | null;
                    employee_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    total_price: number;
                    floor_number: number;
                    status?: 'pending' | 'preparing' | 'delivering' | 'delivered';
                    company_id?: string | null;
                    employee_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    total_price?: number;
                    floor_number?: number;
                    status?: 'pending' | 'preparing' | 'delivering' | 'delivered';
                    company_id?: string | null;
                    employee_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    item_id: string;
                    item_name: string;
                    quantity: number;
                    price: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    item_id: string;
                    item_name: string;
                    quantity: number;
                    price: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    item_id?: string;
                    item_name?: string;
                    quantity?: number;
                    price?: number;
                    created_at?: string;
                };
            };
            companies: {
                Row: {
                    id: string;
                    name: string;
                    floor_number: number;
                    contact_email: string | null;
                    contact_phone: string | null;
                    logo_url: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    floor_number: number;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    logo_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    floor_number?: number;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    logo_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            employees: {
                Row: {
                    id: string;
                    company_id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    position: string | null;
                    avatar_url: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    name: string;
                    email: string;
                    phone?: string | null;
                    position?: string | null;
                    avatar_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    name?: string;
                    email?: string;
                    phone?: string | null;
                    position?: string | null;
                    avatar_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
};
