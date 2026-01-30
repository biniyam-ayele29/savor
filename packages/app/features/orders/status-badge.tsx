import { View, Text } from 'react-native';
import { OrderStatus } from '@my-app/api';

const STATUS_COLORS: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    delivering: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
    const colorClass = STATUS_COLORS[status];

    return (
        <View className={`px-2 py-1 rounded-full ${colorClass.split(' ')[0]}`}>
            <Text className={`text-xs font-bold uppercase ${colorClass.split(' ')[1]}`}>
                {status}
            </Text>
        </View>
    );
}
