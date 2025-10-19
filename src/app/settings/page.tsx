"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSettingsText } from '@/config/brand'
import { layout } from '@/config/constants'
import { cn } from '@/lib/utils'
import { Settings } from 'lucide-react'
import ProfileTab from './components/ProfileTab'
import BillingTab from './components/BillingTab'
import UsageTab from './components/UsageTab'
import PlanTab from './components/PlanTab'

/**
 * 설정 페이지
 * 프로필, 결제, 사용량, 요금제 관리
 */
export default function SettingsPage() {
  const lang = 'ko' as const
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tabFromUrl = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(tabFromUrl)

  // URL 파라미터 변경 감지 (뒤로가기/앞으로가기)
  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile'
    setActiveTab(tab)
  }, [searchParams])

  // 탭 변경 시 URL 업데이트 (양방향 동기화)
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    router.push(`${pathname}?tab=${value}`, { scroll: false })
  }, [router, pathname])

  return (
    <main
      className={cn(
        layout.page.container,
        "px-4 sm:px-6 lg:px-12",
        "pt-4 pb-20"
      )}
    >
      <div className={layout.page.section.stack}>
        {/* 페이지 헤더 */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{getSettingsText.pageTitle(lang)}</h1>
          </div>
          <p className="text-muted-foreground">
            {getSettingsText.pageDescription(lang)}
          </p>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">{getSettingsText.tabProfile(lang)}</TabsTrigger>
            <TabsTrigger value="billing">{getSettingsText.tabBilling(lang)}</TabsTrigger>
            <TabsTrigger value="usage">{getSettingsText.tabUsage(lang)}</TabsTrigger>
            <TabsTrigger value="plan">{getSettingsText.tabPlan(lang)}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingTab />
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <UsageTab />
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <PlanTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
