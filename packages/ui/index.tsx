// Export your UI components here
import { View, Text, Pressable } from 'react-native';
import './global.css';

export function Button({ onPress, children }: { onPress?: () => void; children: React.ReactNode }) {
    return (
        <Pressable className="bg-primary px-4 py-2 rounded-md" onPress={onPress}>
            <Text className="text-primary-foreground">{children}</Text>
        </Pressable>
    );
}
