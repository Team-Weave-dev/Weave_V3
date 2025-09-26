'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Calendar,
  ListTodo,
  Receipt,
  TrendingUp,
  Briefcase,
  Check,
  BarChart3,
  Calculator,
  Activity
} from 'lucide-react'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { getDashboardText } from '@/config/brand'

interface WidgetOption {
  type: ImprovedWidget['type']
  title: string
  description: string
  icon: React.ElementType
  available: boolean
}

interface WidgetSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectWidget: (type: ImprovedWidget['type']) => void
  existingWidgets: ImprovedWidget[]
}

export function WidgetSelectorModal({
  open,
  onOpenChange,
  onSelectWidget,
  existingWidgets
}: WidgetSelectorModalProps) {
  // 위젯 옵션 정의
  const widgetOptions: WidgetOption[] = [
    {
      type: 'calendar',
      title: '캘린더',
      description: '월간 캘린더 및 일정 관리',
      icon: Calendar,
      available: true
    },
    {
      type: 'todoList',
      title: '할 일 목록',
      description: '작업 관리 및 우선순위 설정',
      icon: ListTodo,
      available: true
    },
    {
      type: 'projectSummary',
      title: '프로젝트 현황',
      description: '진행 중인 프로젝트 요약',
      icon: Briefcase,
      available: true
    },
    {
      type: 'kpiMetrics',
      title: '핵심 성과 지표',
      description: '주요 비즈니스 메트릭',
      icon: TrendingUp,
      available: true
    },
    {
      type: 'taxDeadline',
      title: '세무 일정',
      description: '세무 신고 및 납부 일정',
      icon: Receipt,
      available: true
    },
    {
      type: 'revenueChart',
      title: '매출 차트',
      description: '월별/분기별 수익을 차트로 표시',
      icon: BarChart3,
      available: true
    },
    {
      type: 'taxCalculator',
      title: '세금 계산기',
      description: '부가세, 원천세를 간편하게 계산',
      icon: Calculator,
      available: true
    },
    {
      type: 'recentActivity',
      title: '최근 활동',
      description: '최근 작업 및 변경사항 확인',
      icon: Activity,
      available: true
    }
  ]

  // 이미 추가된 위젯 타입 확인
  const existingTypes = new Set(existingWidgets.map(w => w.type))

  const handleSelectWidget = (type: ImprovedWidget['type']) => {
    onSelectWidget(type)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getDashboardText.selectWidget('ko')}</DialogTitle>
          <DialogDescription>
            대시보드에 추가할 위젯을 선택하세요. 동일한 위젯을 여러 개 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {widgetOptions.map((option) => {
            const Icon = option.icon
            const isAdded = existingTypes.has(option.type)
            
            return (
              <button
                key={option.type}
                onClick={() => handleSelectWidget(option.type)}
                disabled={!option.available}
                className={cn(
                  "relative p-4 rounded-lg border-2 text-left transition-all",
                  "hover:border-primary hover:shadow-md",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isAdded 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-border bg-background"
                )}
              >
                {/* 이미 추가됨 표시 */}
                {isAdded && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}