import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { brand } from '@/config/brand'
import { RouteChangeProgressBar } from '@/components/ui/route-progress-bar'
import { StorageInitializer } from '@/components/StorageInitializer'

const GA_TRACKING_ID = 'G-YRSGHEHGNF'

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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <StorageInitializer />
        <RouteChangeProgressBar />
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  )
}