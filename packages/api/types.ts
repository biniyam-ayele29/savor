export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered';

export type MenuCategory = 'drinks' | 'food' | 'snacks';

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: MenuCategory;
    available: boolean;
    image?: string;
}

export interface OrderItem {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    items: OrderItem[];
    totalPrice: number;
    floorNumber: number;
    status: OrderStatus;
    statusDescription?: string;
    createdAt: string; // ISO string
    companyId?: string;
    employeeId?: string;
    employeeName?: string;
    waiterName?: string;
    waiterPhone?: string;
    waiterAvatarUrl?: string;
}

export interface Company {
    id: string;
    name: string;
    floorNumber: number;
    contactEmail?: string;
    contactPhone?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    id: string;
    companyId: string;
    name: string;
    email: string;
    phone?: string;
    position?: string;
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
