import { StylesProvider } from './styles-provider'
import { APIProvider } from '@my-app/api'
import { NavBar } from './navbar'
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
          <StylesProvider>
            <NavBar />
            {children}
          </StylesProvider>
        </APIProvider>
      </body>
    </html>
  )
}
