import { View, Text, Pressable } from 'react-native';
import { Order } from '@my-app/api';
import { StatusBadge } from './status-badge';
import { useOrderTimer } from './use-order-timer';
import { formatLocation } from '../location/validator';

interface OrderCardProps {
    order: Order;
    onPress?: (order: Order) => void;
    showTimer?: boolean;
}

export function OrderCard({ order, onPress, showTimer }: OrderCardProps) {
    const { formatTime } = useOrderTimer(order.createdAt);

    return (
        <Pressable
            onPress={() => onPress?.(order)}
            className="bg-card p-4 rounded-lg border border-border mb-3 active:opacity-70"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="font-bold text-lg text-foreground">
                        {formatLocation(order.floorNumber, order.suiteNumber)}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                        #{order.id.slice(-4)}
                    </Text>
                </View>
                <StatusBadge status={order.status} />
            </View>

            <View className="mb-3">
                {order.items.map((item) => (
                    <Text key={item.itemId} className="text-foreground">
                        {item.quantity}x {item.name}
                    </Text>
                ))}
            </View>

            <View className="flex-row justify-between items-center mt-2 border-t border-border pt-2">
                <Text className="font-bold text-foreground">
                    ${order.totalPrice.toFixed(2)}
                </Text>
                {showTimer && order.status !== 'delivered' && (
                    <Text className="text-sm font-mono text-muted-foreground">
                        {formatTime}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}
