'use client'

import React from 'react'
import { HeaderNavigation } from '@/components/ui/header-navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <HeaderNavigation />
      
      {/* Main Content with Top Padding for Fixed Header */}
      <main className="pt-14 sm:pt-16 min-h-screen">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}