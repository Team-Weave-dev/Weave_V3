"use client"

import { useMemo, useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { uiText } from '@/config/brand'
import { plans } from '@/config/constants'
import type { Usage, PlanType } from '@/lib/types/settings.types'
import { projectService, dashboardService } from '@/lib/storage'

/**
 * 사용량 탭 컴포넌트
 * 현재 사용 중인 리소스 현황 표시
 */
export default function UsageTab() {
  const lang = 'ko' as const
  const [projectCount, setProjectCount] = useState(0)
  const [widgetCount, setWidgetCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // 현재 요금제 (실제로는 사용자 설정에서 가져와야 함)
  const currentPlan: PlanType = 'pro'
  const planLimits = useMemo(() => plans[currentPlan].limits, [currentPlan])

  // 실제 프로젝트 수와 위젯 수 가져오기
  useEffect(() => {
    async function fetchUsageData() {
      try {
        setLoading(true)

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

  const formatStorage = useCallback((mb: number) => {
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
            스토리지 버킷 연결 대기 중
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              준비중
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              추후 사용량을 확인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI 서비스 - 준비중 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.aiService.title[lang]}</CardTitle>
          <CardDescription>
            AI 서비스 통합 대기 중
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-sm">
              준비중
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              AI 서비스가 통합되면 사용량을 확인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
