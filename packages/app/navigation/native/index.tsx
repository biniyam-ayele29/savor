import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'

import { UniversalScreen } from 'app/features/universal/screen'
import { StaffScreen } from 'app/features/staff/screen'

const Stack = createNativeStackNavigator<{
  home: undefined
  'user-detail': {
    id: string
  }
  universal: {
    id?: string
  }
  staff: undefined
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{
          title: 'User',
        }}
      />
      <Stack.Screen
        name="universal"
        component={UniversalScreen}
        options={{
          title: 'Universal',
        }}
      />
      <Stack.Screen
        name="staff"
        component={StaffScreen}
        options={{
          title: 'Staff Dashboard',
        }}
      />
    </Stack.Navigator>
  )
}
