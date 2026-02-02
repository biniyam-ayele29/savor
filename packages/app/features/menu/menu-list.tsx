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

const categoryColors: Record<string, { primary: string; bg: string; gradient: string; btnGradient: string }> = {
    drinks: {
        primary: '#b45309',
        bg: '#fff7ed',
        gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        btnGradient: 'linear-gradient(135deg, #ea580c 0%, #b45309 50%, #92400e 100%)',
    },
    food: {
        primary: '#be123c',
        bg: '#fff1f2',
        gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        btnGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%)',
    },
    snacks: {
        primary: '#1d4ed8',
        bg: '#eff6ff',
        gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        btnGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
    },
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
                const theme = categoryColors[category] || {
                    primary: '#57534e',
                    bg: '#f5f5f4',
                    gradient: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                    btnGradient: 'linear-gradient(135deg, #1c1917 0%, #44403c 100%)',
                };

                return (
                    <View key={category} style={{ marginBottom: 40 }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 20,
                            gap: 14,
                        }}>
                            <View style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                backgroundImage: theme.gradient,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#e7e5e4',
                            }}>
                                <Text style={{ fontSize: 22 }}>{categoryIcons[category] || '🍽️'}</Text>
                            </View>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '800',
                                color: '#1c1917',
                                textTransform: 'capitalize',
                                letterSpacing: -0.3,
                            }}>{category}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                            {categoryItems.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => item.available && onItemPress(item)}
                                    style={({ pressed }) => ({
                                        backgroundColor: '#ffffff',
                                        borderRadius: 16,
                                        padding: 0,
                                        borderWidth: 1,
                                        borderColor: item.available ? '#e7e5e4' : '#e7e5e4',
                                        width: 280,
                                        overflow: 'hidden',
                                        opacity: item.available ? 1 : 0.6,
                                        transform: [{ scale: pressed ? 0.98 : 1 }],
                                        shadowColor: theme.primary,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: item.available ? 0.08 : 0.04,
                                        shadowRadius: 12,
                                        elevation: 2,
                                    })}
                                >
                                    <View style={{ padding: 20 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text style={{
                                                    fontSize: 17,
                                                    fontWeight: '700',
                                                    color: '#1c1917',
                                                    marginBottom: 4,
                                                    letterSpacing: -0.2,
                                                }}>{item.name}</Text>
                                                <Text style={{
                                                    fontSize: 12,
                                                    color: item.available ? '#78716c' : '#a8a29e',
                                                    fontWeight: '500',
                                                }}>{item.available ? 'Add to order' : 'Unavailable'}</Text>
                                            </View>
                                            <Text style={{
                                                fontSize: 18,
                                                fontWeight: '800',
                                                color: theme.primary,
                                                fontVariant: ['tabular-nums'],
                                            }}>
                                                {item.price}{' '}
                                                <Text style={{ fontSize: 11, color: '#a8a29e', fontWeight: '600' }}>ETB</Text>
                                            </Text>
                                        </View>

                                        {renderAction ? (
                                            renderAction(item)
                                        ) : (
                                            <View style={{
                                                borderRadius: 10,
                                                paddingVertical: 12,
                                                paddingHorizontal: 14,
                                                backgroundImage: item.available ? theme.btnGradient : 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                shadowColor: item.available ? theme.primary : 'transparent',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: item.available ? 0.2 : 0,
                                                shadowRadius: 6,
                                            }}>
                                                <Text style={{
                                                    color: item.available ? '#ffffff' : '#a8a29e',
                                                    fontWeight: '700',
                                                    fontSize: 14,
                                                }}>
                                                    {item.available ? '+ Add to Cart' : 'Sold Out'}
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
