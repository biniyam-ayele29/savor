import { View, Text, Pressable } from 'react-native';
import { MenuItem } from '@my-app/api';

interface MenuListProps {
    items: MenuItem[];
    onItemPress: (item: MenuItem) => void;
    renderAction?: (item: MenuItem) => React.ReactNode;
}

const categoryIcons: Record<string, string> = {
    drinks: '☕',
    food: '🥐',
    snacks: '🍪'
};

const categoryGradients: Record<string, string[]> = {
    drinks: ['#ea580c', '#fb923c'],
    food: ['#f43f5e', '#fb7185'],
    snacks: ['#3b82f6', '#60a5fa']
};

export function MenuList({ items, onItemPress, renderAction }: MenuListProps) {
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <View style={{ flex: 1, width: '100%' }}>
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
                const colors = categoryGradients[category] || ['#6b7280', '#9ca3af'];

                return (
                    <View key={category} style={{ marginBottom: 48 }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 24,
                            borderBottomWidth: 3,
                            borderBottomColor: colors[0],
                            paddingBottom: 12,
                            alignSelf: 'flex-start'
                        }}>
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: colors[0],
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 16
                            }}>
                                <Text style={{ fontSize: 24 }}>{categoryIcons[category] || '🍽️'}</Text>
                            </View>
                            <Text style={{
                                fontSize: 28,
                                fontWeight: '900',
                                color: '#111827',
                                textTransform: 'uppercase',
                                letterSpacing: -0.5
                            }}>{category}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                            {categoryItems.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => item.available && onItemPress(item)}
                                    style={({ pressed }) => ({
                                        backgroundColor: 'white',
                                        borderRadius: 24,
                                        padding: 0,
                                        borderWidth: 1,
                                        borderColor: item.available ? '#f3f4f6' : '#e5e7eb',
                                        width: 300,
                                        overflow: 'hidden',
                                        opacity: item.available ? 1 : 0.6,
                                        transform: [{ scale: pressed ? 0.98 : 1 }],
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.04,
                                        shadowRadius: 16,
                                    })}
                                >
                                    <View style={{ padding: 24 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 }}>{item.name}</Text>
                                                <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>{item.available ? 'Prepared Fresh Today' : 'Unavailable'}</Text>
                                            </View>
                                            <Text style={{ fontSize: 22, fontWeight: '900', color: colors[0] }}>{item.price} <Text style={{ fontSize: 12, color: '#9ca3af' }}>ETB</Text></Text>
                                        </View>

                                        {renderAction ? (
                                            renderAction(item)
                                        ) : (
                                            <View style={{
                                                borderRadius: 14,
                                                paddingVertical: 14,
                                                paddingHorizontal: 16,
                                                backgroundColor: item.available ? '#111827' : '#f3f4f6',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8
                                            }}>
                                                <Text style={{ color: item.available ? 'white' : '#9ca3af', fontWeight: '800', fontSize: 15 }}>
                                                    {item.available ? 'Add to Cart +' : 'Sold Out'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
