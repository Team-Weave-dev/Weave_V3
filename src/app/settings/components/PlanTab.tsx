"use client"

import { useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { uiText } from '@/config/brand'
import { plans } from '@/config/constants'
import { cn } from '@/lib/utils'
import type { PlanType } from '@/lib/types/settings.types'

/**
 * 요금제 탭 컴포넌트
 * 요금제 비교 및 변경
 */
export default function PlanTab() {
  const lang = 'ko' as const

  // Mock 데이터 (실제로는 API에서 가져옴)
  const currentPlan: PlanType = 'free'

  const planOrder: PlanType[] = useMemo(() => ['free', 'basic', 'pro'], [])

  const formatPrice = useCallback((price: number) => {
    if (price === 0) {
      return { amount: uiText.settings.plan.free.price[lang], unit: '' }
    }
    return {
      amount: `${price.toLocaleString()}원`,
      unit: '/월'
    }
  }, [lang])

  const formatLimit = useCallback((limit: number, unit: string) => {
    return limit === -1 ? uiText.settings.plan.unlimited[lang] : `${limit}${unit}`
  }, [lang])

  const getFeatureText = useCallback((feature: string) => {
    const featureKey = feature as keyof typeof uiText.settings.plan.features
    return uiText.settings.plan.features[featureKey]?.[lang] || feature
  }, [lang])

  const getPlanAction = useCallback((planId: PlanType) => {
    if (planId === currentPlan) {
      return (
        <Button variant="outline" className="w-full" disabled>
          {uiText.settings.plan.actions.current[lang]}
        </Button>
      )
    }

    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(planId)

    if (targetIndex > currentIndex) {
      return (
        <Button className="w-full">
          {uiText.settings.plan.actions.upgrade[lang]}
        </Button>
      )
    }

    return (
      <Button variant="outline" className="w-full">
        {uiText.settings.plan.actions.downgrade[lang]}
      </Button>
    )
  }, [currentPlan, planOrder, lang])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{uiText.settings.plan.title[lang]}</h2>
        <p className="text-muted-foreground mt-2">
          {uiText.settings.plan.description[lang]}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {planOrder.map((planId) => {
          const plan = plans[planId]
          const isCurrentPlan = planId === currentPlan

          return (
            <Card key={planId} className={cn(
              "flex flex-col h-full",
              isCurrentPlan ? "border-primary" : ""
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge variant="default">
                      {uiText.settings.plan.current[lang]}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-3xl font-bold mt-4">
                  {formatPrice(plan.price).amount}
                  {formatPrice(plan.price).unit && (
                    <span className="text-base font-normal text-muted-foreground">
                      {formatPrice(plan.price).unit}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* 제한사항 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {uiText.settings.plan.limits.projects[lang]}
                    </span>
                    <span className="font-medium">
                      {formatLimit(plan.limits.projects, uiText.settings.plan.limits.unit[lang])}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {uiText.settings.plan.limits.widgets[lang]}
                    </span>
                    <span className="font-medium">
                      {formatLimit(plan.limits.widgets, uiText.settings.plan.limits.unit[lang])}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {uiText.settings.plan.limits.storage[lang]}
                    </span>
                    <span className="font-medium">
                      {plan.limits.storage >= 1024
                        ? `${(plan.limits.storage / 1024).toFixed(1)}GB`
                        : `${plan.limits.storage}MB`
                      }
                    </span>
                  </div>
                </div>

                {/* 기능 목록 */}
                <div className="border-t pt-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{getFeatureText(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                {getPlanAction(planId)}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* 참고사항 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{uiText.settings.plan.note.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>{uiText.settings.plan.note.billing[lang]}</li>
            <li>{uiText.settings.plan.note.upgrade[lang]}</li>
            <li>{uiText.settings.plan.note.downgrade[lang]}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
