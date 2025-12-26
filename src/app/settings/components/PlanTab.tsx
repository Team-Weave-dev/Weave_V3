"use client"

import { useMemo, useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { uiText } from '@/config/brand'
import { plans } from '@/config/constants'
import { cn } from '@/lib/utils'
import type { PlanType } from '@/lib/types/settings.types'
import { userService } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

/**
 * 요금제 탭 컴포넌트
 * 요금제 비교 및 변경
 */
export default function PlanTab() {
  const lang = 'ko' as const
  const { toast } = useToast()
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [loading, setLoading] = useState(true)
  const [changingPlan, setChangingPlan] = useState(false)

  const planOrder: PlanType[] = useMemo(() => ['free', 'basic', 'pro'], [])

  // 사용자 현재 요금제 가져오기
  useEffect(() => {
    async function fetchCurrentPlan() {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const userPlan = await userService.getPlan(authUser.id)
          setCurrentPlan(userPlan || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch current plan:', error)
        setCurrentPlan('free')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentPlan()
  }, [])

  // 요금제 변경 핸들러
  const handleChangePlan = useCallback(async (newPlan: PlanType) => {
    if (changingPlan) return

    try {
      setChangingPlan(true)
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        toast({
          title: '오류',
          description: '로그인이 필요합니다.',
          variant: 'destructive'
        })
        return
      }

      // 요금제 변경 (실제로는 결제 프로세스가 필요하지만, 일단 바로 변경)
      await userService.updatePlan(authUser.id, newPlan)
      setCurrentPlan(newPlan)

      toast({
        title: '요금제 변경 완료',
        description: `${plans[newPlan].name} 요금제로 변경되었습니다.`
      })
    } catch (error) {
      console.error('Failed to change plan:', error)
      toast({
        title: '요금제 변경 실패',
        description: '요금제 변경 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setChangingPlan(false)
    }
  }, [changingPlan, toast])

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
    // 무료화: 모든 요금제가 무료이므로 현재 요금제만 표시
    if (planId === currentPlan) {
      return (
        <Button variant="outline" className="w-full" disabled>
          {uiText.settings.plan.actions.current[lang]}
        </Button>
      )
    }

    // 무료화: 업그레이드/다운그레이드 버튼 대신 "무료 사용 중" 표시
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleChangePlan(planId)}
        disabled={changingPlan}
      >
        {changingPlan ? '변경 중...' : '무료 전환'}
      </Button>
    )
  }, [currentPlan, lang, handleChangePlan, changingPlan])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{uiText.settings.plan.title[lang]}</h2>
        <p className="text-muted-foreground mt-2">
          {uiText.settings.plan.description[lang]}
        </p>
        {/* 무료화 안내 배너 */}
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            🎉 현재 위브의 모든 기능을 무료로 이용하실 수 있습니다!
          </p>
          <p className="text-green-600 dark:text-green-400 text-sm mt-1">
            프로젝트, 위젯, 스토리지 모두 무제한으로 제공됩니다.
          </p>
        </div>
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

      {/* 무료화 참고사항 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>무료 이용 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>현재 모든 기능이 무료로 제공됩니다.</li>
            <li>프로젝트와 위젯 개수에 제한이 없습니다.</li>
            <li>10GB의 넉넉한 스토리지가 제공됩니다.</li>
            <li>AI 서비스를 포함한 모든 프리미엄 기능을 이용하실 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
