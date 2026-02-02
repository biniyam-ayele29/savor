import { View, Text } from 'react-native';
import { OrderStatus } from '@my-app/api';

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    pending: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    preparing: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    delivering: { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
    delivered: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
    const config = STATUS_CONFIG[status];

    return (
        <View style={{
            backgroundImage: `linear-gradient(135deg, ${config.bg} 0%, ${config.border} 100%)`,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: config.border,
        }}>
            <Text style={{ color: config.text, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                {status}
            </Text>
        </View>
    );
}
