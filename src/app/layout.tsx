import type { Metadata } from 'next'
import './globals.css'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  title: brand.metadata.title.ko,
  description: brand.metadata.description.ko,
  icons: {
    icon: brand.logo.favicon,
    shortcut: brand.logo.favicon,
    apple: brand.logo.favicon,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  )
}