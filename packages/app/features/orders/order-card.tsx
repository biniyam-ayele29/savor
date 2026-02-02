import { View, Text, Pressable } from 'react-native';
import { Order } from '@my-app/api';
import { StatusBadge } from './status-badge';
import { useOrderTimer } from './use-order-timer';

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
            style={({ pressed }) => ({
                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafaf9 100%)',
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#e7e5e4',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                opacity: pressed ? 0.95 : 1,
            })}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View>
                    <Text style={{ fontWeight: '800', fontSize: 17, color: '#1c1917' }}>
                        Floor {order.floorNumber}
                    </Text>
                    <Text style={{ color: '#78716c', fontSize: 13, marginTop: 2 }}>
                        #{order.id.slice(-8)}
                    </Text>
                </View>
                <StatusBadge status={order.status} />
            </View>

            <View style={{ marginBottom: 12 }}>
                {order.items.map((item) => (
                    <Text key={item.itemId} style={{ color: '#44403c', fontSize: 14, marginBottom: 4 }}>
                        {item.quantity}x {item.name}
                    </Text>
                ))}
            </View>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#f5f5f4',
            }}>
                <View style={{
                    backgroundImage: 'linear-gradient(90deg, #b45309, #ea580c)',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                }}>
                    <Text style={{ fontWeight: '800', color: '#ffffff', fontSize: 15, fontVariant: ['tabular-nums'] }}>
                        ETB {order.totalPrice.toFixed(2)}
                    </Text>
                </View>
                {showTimer && order.status !== 'delivered' && (
                    <Text style={{ fontSize: 13, color: '#78716c', fontVariant: ['tabular-nums'] }}>
                        {formatTime}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}
