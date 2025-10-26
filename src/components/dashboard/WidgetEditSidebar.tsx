'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Maximize2,
  Layers,
  Settings
} from 'lucide-react'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { getDashboardText } from '@/config/brand'

interface WidgetEditSidebarProps {
  isOpen: boolean
  onClose: () => void
  widgets: ImprovedWidget[]
  onReorder: (id: string, direction: 'up' | 'down') => void
  onResize: (id: string, width: number, height: number) => void
  onRemove: (id: string) => void
  autoCompact: boolean
  onAutoCompactChange: (value: boolean) => void
  className?: string
}

interface WidgetEditCardProps {
  widget: ImprovedWidget
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onResize: (width: number, height: number) => void
  onRemove: () => void
}

function WidgetEditCard({
  widget,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onResize,
  onRemove
}: WidgetEditCardProps) {
  const [width, setWidth] = useState(widget.position.w)
  const [height, setHeight] = useState(widget.position.h)

  const handleWidthChange = (value: number[]) => {
    const newWidth = value[0]
    setWidth(newWidth)
    onResize(newWidth, height)
  }

  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0]
    setHeight(newHeight)
    onResize(width, newHeight)
  }

  // 위젯 타입별 아이콘/배경색
  const getWidgetStyle = (type: string) => {
    const styles: Record<string, { icon: string; bg: string }> = {
      calendar: { icon: '📅', bg: 'bg-blue-50 dark:bg-blue-950' },
      todoList: { icon: '✓', bg: 'bg-green-50 dark:bg-green-950' },
      projectSummary: { icon: '📊', bg: 'bg-purple-50 dark:bg-purple-950' },
      kpiMetrics: { icon: '📈', bg: 'bg-orange-50 dark:bg-orange-950' },
      taxDeadline: { icon: '📋', bg: 'bg-red-50 dark:bg-red-950' },
      revenueChart: { icon: '💰', bg: 'bg-emerald-50 dark:bg-emerald-950' },
      taxCalculator: { icon: '🧮', bg: 'bg-yellow-50 dark:bg-yellow-950' },
      recentActivity: { icon: '🔔', bg: 'bg-indigo-50 dark:bg-indigo-950' },
      weather: { icon: '🌤️', bg: 'bg-cyan-50 dark:bg-cyan-950' },
      custom: { icon: '⭐', bg: 'bg-gray-50 dark:bg-gray-950' }
    }
    return styles[type] || styles.custom
  }

  const style = getWidgetStyle(widget.type)

  return (
    <Card className="p-4 space-y-3 touch-manipulation">
      {/* 헤더: 아이콘 + 제목 + 순서 변경 버튼 */}
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0", style.bg)}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{widget.title}</h3>
          <p className="text-xs text-muted-foreground">
            {widget.position.w} × {widget.position.h} 그리드
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-7 w-7 p-0 touch-manipulation"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="h-7 w-7 p-0 touch-manipulation"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 크기 조절 */}
      <div className="space-y-3 pt-2 border-t">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">너비</Label>
            <span className="text-xs font-medium">{width}</span>
          </div>
          <Slider
            value={[width]}
            onValueChange={handleWidthChange}
            min={widget.minW || 2}
            max={widget.maxW || 9}
            step={1}
            className="touch-manipulation"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">높이</Label>
            <span className="text-xs font-medium">{height}</span>
          </div>
          <Slider
            value={[height]}
            onValueChange={handleHeightChange}
            min={widget.minH || 2}
            max={widget.maxH || 12}
            step={1}
            className="touch-manipulation"
          />
        </div>
      </div>

      {/* 삭제 버튼 */}
      <Button
        size="sm"
        variant="destructive"
        onClick={onRemove}
        className="w-full touch-manipulation"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        위젯 삭제
      </Button>
    </Card>
  )
}

export function WidgetEditSidebar({
  isOpen,
  onClose,
  widgets,
  onReorder,
  onResize,
  onRemove,
  autoCompact,
  onAutoCompactChange,
  className
}: WidgetEditSidebarProps) {
  return (
    <>
      {/* 사이드바 */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-40",
          "transform transition-transform duration-300 ease-in-out overflow-hidden",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* 헤더 */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">위젯 관리</h2>
                <p className="text-xs text-muted-foreground">
                  {widgets.length}개 위젯
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="touch-manipulation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 자동 정렬 토글 */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="auto-compact" className="text-sm cursor-pointer">
                자동 정렬
              </Label>
            </div>
            <Switch
              id="auto-compact"
              checked={autoCompact}
              onCheckedChange={onAutoCompactChange}
              className="touch-manipulation"
            />
          </div>
        </div>

        {/* 위젯 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Maximize2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                위젯이 없습니다
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                위젯 추가 버튼으로 추가해보세요
              </p>
            </div>
          ) : (
            widgets.map((widget, index) => (
              <WidgetEditCard
                key={widget.id}
                widget={widget}
                index={index}
                total={widgets.length}
                onMoveUp={() => onReorder(widget.id, 'up')}
                onMoveDown={() => onReorder(widget.id, 'down')}
                onResize={(w, h) => onResize(widget.id, w, h)}
                onRemove={() => onRemove(widget.id)}
              />
            ))
          )}
        </div>

        {/* 푸터 도움말 */}
        <div className="flex-shrink-0 p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            💡 위/아래 버튼으로 위젯 순서를 변경하고,
            슬라이더로 크기를 조절하세요
          </p>
        </div>
      </div>
    </>
  )
}
