import { create } from 'zustand';
import { Order, OrderStatus, MenuItem } from './types';

// Mock Data
export const MOCK_MENU: MenuItem[] = [
    { id: '1', name: 'Latte', price: 4.5, category: 'drinks', available: true },
    { id: '2', name: 'Cappuccino', price: 4.0, category: 'drinks', available: true },
    { id: '3', name: 'Espresso', price: 3.0, category: 'drinks', available: true },
    { id: '4', name: 'Croissant', price: 3.5, category: 'food', available: true },
    { id: '5', name: 'Bagel', price: 2.5, category: 'food', available: true },
    { id: '6', name: 'Chips', price: 1.5, category: 'snacks', available: true },
];

interface AppState {
    // State
    orders: Order[];
    menu: MenuItem[];

    // Actions
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    toggleMenuItemAvailability: (itemId: string) => void;

    // Selectors/Helpers (derived state usually done in hooks but simple logic here)
    getOrdersByFloor: (floor: number) => Order[];
}

export const useStore = create<AppState>((set, get) => ({
    orders: [],
    menu: MOCK_MENU,

    addOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
    })),

    updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
        ),
    })),

    toggleMenuItemAvailability: (itemId) => set((state) => ({
        menu: state.menu.map((item) =>
            item.id === itemId ? { ...item, available: !item.available } : item
        ),
    })),

    getOrdersByFloor: (floor) => {
        return get().orders.filter((o) => o.floorNumber === floor);
    },
}));
