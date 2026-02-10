import { StylesProvider } from './styles-provider'
import { APIProvider } from '@my-app/api'
import { NavBar } from './navbar'
import { AuthGuard } from 'app/features/auth/auth-guard'
import { ThemeProvider } from 'app/features/theme/theme-context'
import { ToastProvider, ToastContainer } from 'app/features/notifications'
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
            <ToastProvider>
              <StylesProvider>
                <AuthGuard>
                  <NavBar />
                  {children}
                  <ToastContainer />
                </AuthGuard>
              </StylesProvider>
            </ToastProvider>
          </ThemeProvider>
        </APIProvider>
      </body>
    </html>
  )
}
