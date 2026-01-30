import { Text } from 'react-native';

export function DisplayText({ text }: { text: string }) {
    return (
        <Text className="text-xl font-bold text-blue-600">
            Web: {text}
        </Text>
    );
}
