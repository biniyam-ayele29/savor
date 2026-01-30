import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Order, MenuItem, OrderItem, OrderStatus, Company, Employee } from './types';

// Menu Items Hooks
export function useMenuItems() {
    return useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('category');

            if (error) {
                console.warn('Error fetching menu items, using fallback:', error);
            }

            const items = (data && data.length > 0) ? data : [
                // Fallback Menu Items with valid-looking UUIDs
                { id: '11111111-1111-4111-8111-111111111111', name: 'Espresso', price: 45, category: 'drinks', available: true },
                { id: '22222222-2222-4222-8222-222222222222', name: 'Cappuccino', price: 55, category: 'drinks', available: true },
                { id: '33333333-3333-4333-8333-333333333333', name: 'Latte', price: 55, category: 'drinks', available: true },
                { id: '44444444-4444-4444-8444-444444444444', name: 'Mocha', price: 60, category: 'drinks', available: true },
                { id: '55555555-5555-4555-8555-555555555555', name: 'Croissant', price: 35, category: 'food', available: true },
                { id: '66666666-6666-4666-8666-666666666666', name: 'Blueberry Muffin', price: 40, category: 'food', available: true },
                { id: '77777777-7777-4777-8777-777777777777', name: 'Chicken Sandwich', price: 75, category: 'food', available: true },
                { id: '88888888-8888-4888-8888-888888888888', name: 'Veggie Wrap', price: 70, category: 'food', available: true },
                { id: '99999999-9999-4999-8999-999999999999', name: 'Cookie', price: 25, category: 'snacks', available: true },
                { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Brownie', price: 30, category: 'snacks', available: true }
            ];

            return items.map((item: any): MenuItem => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category as 'drinks' | 'food' | 'snacks',
                available: item.available,
                image: item.image || undefined
            }));
        }
    });
}

export function useToggleMenuItemAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ itemId, available }: { itemId: string; available: boolean }) => {
            const { error } = await supabase
                .from('menu_items')
                .update({ available })
                .eq('id', itemId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        }
    });
}

// Orders Hooks
export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data: ordersData, error: ordersError } = await supabase.rpc('get_company_orders');

            if (ordersError) throw ordersError;

            if (!ordersData || ordersData.length === 0) return [];

            // Fetch items for these orders separately since RPC join is complex
            const orderIds = ordersData.map((o: any) => o.id);
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);

            if (itemsError) throw itemsError;

            return ordersData.map((order: any): Order => ({
                id: order.id,
                items: (itemsData || [])
                    .filter((item: any) => item.order_id === order.id)
                    .map((item: any): OrderItem => ({
                        itemId: item.item_id,
                        name: item.item_name,
                        quantity: item.quantity,
                        price: item.price
                    })),
                totalPrice: Number(order.total_price),
                floorNumber: order.floor_number,
                suiteNumber: order.suite_number,
                status: order.status as OrderStatus,
                createdAt: order.created_at,
                companyId: order.company_id,
                employeeId: order.employee_id,
                employeeName: order.employee_name
            }));
        },
        refetchInterval: 5000 // Auto-refresh every 5 seconds for real-time feel
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (order: Omit<Order, 'id' | 'createdAt'>) => {
            // Insert order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    total_price: order.totalPrice,
                    floor_number: order.floorNumber,
                    suite_number: order.suiteNumber,
                    status: order.status,
                    company_id: order.companyId,
                    employee_id: order.employeeId
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = order.items.map(item => ({
                order_id: orderData.id,
                item_id: item.itemId,
                item_name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
            const { error } = await supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
    });
}

// Company Hooks
export function useCompanies() {
    return useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('name');

            if (error) throw error;

            return data.map((item): Company => ({
                id: item.id,
                name: item.name,
                floorNumber: item.floor_number,
                suiteNumber: item.suite_number,
                contactEmail: item.contact_email,
                contactPhone: item.contact_phone,
                logoUrl: item.logo_url,
                isActive: item.is_active,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
        }
    });
}

export function useCreateCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
            const { data, error } = await supabase
                .from('companies')
                .insert({
                    name: company.name,
                    floor_number: company.floorNumber,
                    suite_number: company.suiteNumber,
                    contact_email: company.contactEmail,
                    contact_phone: company.contactPhone,
                    logo_url: company.logoUrl
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        }
    });
}

// Employee Hooks
export function useEmployees(companyId?: string) {
    return useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_company_staff');

            if (error) throw error;

            return data.map((item: any): Employee => ({
                id: item.id,
                companyId: item.company_id,
                name: item.name,
                email: item.email,
                phone: item.phone,
                position: item.position,
                avatarUrl: item.avatar_url,
                isActive: item.is_active,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
        }
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
            const { data, error } = await supabase
                .from('employees')
                .insert({
                    company_id: employee.companyId,
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    position: employee.position,
                    avatar_url: employee.avatarUrl
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
            const { data, error } = await supabase
                .from('employees')
                .update({
                    name: updates.name,
                    email: updates.email,
                    phone: updates.phone,
                    position: updates.position,
                    avatar_url: updates.avatarUrl,
                    is_active: updates.isActive,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
}

export function useCreateCompanyAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password, companyId }: { email: string; password: string; companyId: string }) => {
            const { data, error } = await supabase.rpc('create_company_admin', {
                p_email: email,
                p_password: password,
                p_company_id: companyId
            });

            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['company-admins', variables.companyId] });
        }
    });
}

export function useCompanyAdmins(companyId: string) {
    return useQuery({
        queryKey: ['company-admins', companyId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('company_admins')
                .select('*')
                .eq('company_id', companyId);

            if (error) throw error;
            return data;
        },
        enabled: !!companyId
    });
}
