'use client'

import React from 'react'
import { Header } from '@/components/ui/header'
import { NotificationBannerContainer } from '@/components/NotificationBannerContainer'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header Navigation */}
      <Header />

      {/* Notification Banners (below fixed header) */}
      <NotificationBannerContainer />

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
