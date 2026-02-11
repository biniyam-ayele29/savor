import { StylesProvider } from './styles-provider'
import { APIProvider } from '@my-app/api'
import { NavBar } from './navbar'
import { AuthGuard } from 'app/features/auth/auth-guard'
import { ThemeProvider } from 'app/features/theme/theme-context'
import { ToastProvider, ToastContainer } from 'app/features/notifications'
import { NotificationProvider } from 'app/features/notifications/notification-store'
import { NotificationStoreInitializer } from 'app/features/notifications/notification-store-initializer'
import './globals.css'

export const metadata = {
  title: 'Savor - Order from your desk',
  description: 'Fresh coffee & snacks delivered to your office',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <APIProvider>
          <ThemeProvider>
            <NotificationProvider>
              <ToastProvider>
                <StylesProvider>
                  <AuthGuard>
                    <NotificationStoreInitializer />
                    <NavBar />
                    {children}
                    <ToastContainer />
                  </AuthGuard>
                </StylesProvider>
              </ToastProvider>
            </NotificationProvider>
          </ThemeProvider>
        </APIProvider>
      </body>
    </html>
  )
}
