import { SafeArea } from 'app/provider/safe-area'
import { APIProvider } from '@my-app/api'
import { NavigationProvider } from './navigation'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea>
      <APIProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </APIProvider>
    </SafeArea>
  )
}
