"use client"

import { useMemo, useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { uiText } from '@/config/brand'
import { plans } from '@/config/constants'
import type { Usage, PlanType } from '@/lib/types/settings.types'
import { projectService, dashboardService, userService } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'

/**
 * 사용량 탭 컴포넌트
 * 현재 사용 중인 리소스 현황 표시
 */
export default function UsageTab() {
  const lang = 'ko' as const
  const [projectCount, setProjectCount] = useState(0)
  const [widgetCount, setWidgetCount] = useState(0)
  const [_loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')

  const planLimits = useMemo(() => plans[currentPlan].limits, [currentPlan])

  // 실제 프로젝트 수, 위젯 수, 사용자 요금제 가져오기
  useEffect(() => {
    async function fetchUsageData() {
      try {
        setLoading(true)

        // 인증된 사용자 정보 가져오기
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          // 사용자 요금제 가져오기
          const userPlan = await userService.getPlan(authUser.id)
          setCurrentPlan(userPlan || 'free')
        }

        // 프로젝트 수 카운트
        const projects = await projectService.getAll()
        setProjectCount(projects.length)

        // 위젯 수 카운트
        const dashboardData = await dashboardService.load()
        if (dashboardData) {
          setWidgetCount(dashboardData.widgets.length)
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error)
        // 스토리지가 초기화되지 않았거나 인증이 필요한 경우 기본값 사용
        setProjectCount(0)
        setWidgetCount(0)
        setCurrentPlan('free')
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [])

  const usage: Usage = useMemo(() => ({
    projects: {
      current: projectCount,
      limit: planLimits.projects
    },
    widgets: {
      current: widgetCount,
      limit: planLimits.widgets
    },
    storage: {
      used: 0, // 준비중
      total: planLimits.storage,
      percentage: 0
    },
    aiService: {
      available: planLimits.aiService
    }
  }), [projectCount, widgetCount, planLimits])

  const formatLimit = useCallback((limit: number) => {
    return limit === -1 ? uiText.settings.usage.unlimited[lang] : limit.toString()
  }, [lang])

  const _formatStorage = useCallback((mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)}GB`
    }
    return `${mb}MB`
  }, [])

  return (
    <div className="space-y-6">
      {/* 현재 요금제 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.currentPlan[lang]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold capitalize">{currentPlan}</span>
            <Badge variant="default">
              {uiText.settings.usage.active[lang]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 프로젝트 사용량 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.projects.title[lang]}</CardTitle>
          <CardDescription>
            {usage.projects.current} / {formatLimit(usage.projects.limit)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usage.projects.limit === -1 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                {uiText.settings.usage.projects.unlimited[lang]}
              </p>
            </div>
          ) : (
            <Progress
              value={(usage.projects.current / usage.projects.limit) * 100}
              className="h-2"
            />
          )}
        </CardContent>
      </Card>

      {/* 위젯 사용량 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.widgets.title[lang]}</CardTitle>
          <CardDescription>
            {usage.widgets.current} / {formatLimit(usage.widgets.limit)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usage.widgets.limit === -1 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                {uiText.settings.usage.widgets.unlimited[lang]}
              </p>
            </div>
          ) : (
            <Progress
              value={(usage.widgets.current / usage.widgets.limit) * 100}
              className="h-2"
            />
          )}
        </CardContent>
      </Card>

      {/* 스토리지 사용량 - 준비중 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.storage.title[lang]}</CardTitle>
          <CardDescription>
            {uiText.settings.usage.storage.pending[lang]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              {uiText.settings.usage.storage.pendingBadge[lang]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {uiText.settings.usage.storage.pendingMessage[lang]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI 서비스 - 준비중 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.aiService.title[lang]}</CardTitle>
          <CardDescription>
            {uiText.settings.usage.aiService.pending[lang]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              {uiText.settings.usage.aiService.pendingBadge[lang]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {uiText.settings.usage.aiService.pendingMessage[lang]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
