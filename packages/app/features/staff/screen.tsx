import { View, Text, SectionList } from 'react-native';
import { useOrders, useUpdateOrderStatus, Order } from '@my-app/api';
import { OrderCard } from 'app/features/orders/order-card';

export function StaffScreen() {
    const { data: orders = [], isLoading } = useOrders();
    const updateStatus = useUpdateOrderStatus();

    // Group orders by floor
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'pending');

    const sections = activeOrders.reduce((acc, order) => {
        const existingSection = acc.find(s => s.title === `Floor ${order.floorNumber}`);
        if (existingSection) {
            existingSection.data.push(order);
        } else {
            acc.push({ title: `Floor ${order.floorNumber}`, data: [order] });
        }
        return acc;
    }, [] as { title: string; data: Order[] }[]).sort((a, b) => a.title.localeCompare(b.title));

    const handleMarkDelivered = async (orderId: string) => {
        try {
            await updateStatus.mutateAsync({
                orderId,
                status: 'delivered'
            });
        } catch (error) {
            console.error('Error marking order as delivered:', error);
            alert('Failed to update order');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-muted-foreground text-lg">Loading deliveries...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background pt-safe">
            <View className="p-4 border-b border-border">
                <Text className="text-2xl font-bold text-foreground">Staff Delivery Map</Text>
            </View>

            {sections.length === 0 ? (
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-muted-foreground text-center">
                        No active deliveries.
                        (Pending orders must be started by Kitchen)
                    </Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="px-4">
                            <OrderCard
                                order={item}
                                onPress={() => {
                                    if (item.status === 'delivering') {
                                        handleMarkDelivered(item.id);
                                    }
                                }}
                            />
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="bg-muted px-4 py-2 mb-2">
                            <Text className="font-bold text-foreground">{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}
