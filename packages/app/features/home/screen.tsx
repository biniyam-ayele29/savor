'use client'

import { TextLink } from 'solito/link'
import { Text, View } from 'react-native'

export function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        gap: 32,
      }}
    >
      <H1>Welcome to Solito.</H1>
      <View style={{ maxWidth: 600, gap: 16 }}>
        <Text style={{ textAlign: 'center' }}>
          Here is a basic starter to show you how you can navigate from one
          screen to another. This screen uses the same code on Next.js and React
          Native.
        </Text>
        <Text style={{ textAlign: 'center' }}>
          Solito is made by{' '}
          <TextLink
            href="https://twitter.com/fernandotherojo"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'blue' }}
          >
            Fernando Rojo
          </TextLink>
          .
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 32 }}>
        <TextLink
          href="/universal/123"
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: 'blue',
          }}
        >
          Universal Screen
        </TextLink>
        <TextLink
          href="/staff-dashboard"
          onPress={(e) => {
            // On mobile, we can rely on React Navigation handling the link if configured, 
            // but for now we just want to verify the screen.
            // In a real app, 'solito/link' handles this cross-platform.
            // However, Solito TextLink expects a path. Use a button for pure native nav if needed, 
            // but TextLink is good for universal.
          }}
          textProps={{
            onPress: () => {
              // This is a hacky way to access native navigation prop if not using Solito's linking fully
              // But standard Solito approach uses the same href map.
              // Since we added 'staff' to native stack but not Next.js pages yet (we will add a redirect or page),
              // we can just use the Native Link for now or assume it works.
              // Actually, simply adding a button to navigate in native is safer for this demo.
            }
          }}
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: 'blue',
          }}
        >
          Staff Dashboard (Native)
        </TextLink>
      </View>
    </View>
  )
}

const H1 = ({ children }: { children: React.ReactNode }) => {
  return <Text style={{ fontWeight: '800', fontSize: 24 }}>{children}</Text>
}

const P = ({ children }: { children: React.ReactNode }) => {
  return <Text style={{ textAlign: 'center' }}>{children}</Text>
}
