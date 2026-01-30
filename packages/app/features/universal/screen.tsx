import { View, Text } from 'react-native';
import { createParam } from 'solito';
import { TextLink } from 'solito/link';
import { DisplayText } from './display-text';
import { Button } from '@my-app/ui';

const { useParam } = createParam();

export function UniversalScreen() {
    const [id] = useParam('id');

    return (
        <View className="flex-1 items-center justify-center p-4 bg-background">
            <Text className="text-2xl font-bold mb-4 text-foreground">Universal Screen</Text>

            <DisplayText text={`Param ID: ${id || 'None'}`} />

            <View className="h-4" />

            <Button onPress={() => alert('Pressed!')}>
                Click Me
            </Button>

            <View className="h-8" />

            <TextLink href="/">
                <Text className="text-blue-500 hover:underline">Go Home</Text>
            </TextLink>
        </View>
    );
}
