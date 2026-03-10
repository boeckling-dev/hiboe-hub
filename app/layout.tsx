import type { Metadata, Viewport } from 'next'
import { Inter, Quicksand } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
})

export const metadata: Metadata = {
  title: 'Family Hub',
  description: 'Familienalltag organisieren',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="de" suppressHydrationWarning>
        <body className={`${inter.className} ${quicksand.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
