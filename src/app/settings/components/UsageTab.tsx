"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { uiText } from '@/config/brand'
import { plans } from '@/config/constants'
import type { Usage, PlanType } from '@/lib/types/settings.types'

/**
 * 사용량 탭 컴포넌트
 * 현재 사용 중인 리소스 현황 표시
 */
export default function UsageTab() {
  const lang = 'ko' as const

  // Mock 데이터 (실제로는 API에서 가져옴)
  const currentPlan: PlanType = 'pro'
  const planLimits = plans[currentPlan].limits

  const usage: Usage = {
    projects: {
      current: 5,
      limit: planLimits.projects
    },
    widgets: {
      current: 12,
      limit: planLimits.widgets
    },
    storage: {
      used: 768, // MB
      total: planLimits.storage,
      percentage: 75
    },
    aiService: {
      available: planLimits.aiService
    }
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? uiText.settings.usage.unlimited[lang] : limit.toString()
  }

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)}GB`
    }
    return `${mb}MB`
  }

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

      {/* 스토리지 사용량 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.storage.title[lang]}</CardTitle>
          <CardDescription>
            {formatStorage(usage.storage.used)} / {formatStorage(usage.storage.total)} ({usage.storage.percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress
            value={usage.storage.percentage}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* AI 서비스 */}
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.usage.aiService.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {uiText.settings.usage.aiService.status[lang]}
            </span>
            <Badge variant={usage.aiService.available ? "default" : "secondary"}>
              {usage.aiService.available
                ? uiText.settings.usage.aiService.available[lang]
                : uiText.settings.usage.aiService.unavailable[lang]
              }
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
