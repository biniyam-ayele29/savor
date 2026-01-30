import { Text } from 'react-native';

export function DisplayText({ text }: { text: string }) {
    return (
        <Text className="text-xl font-bold text-red-600">
            Native: {text}
        </Text>
    );
}
