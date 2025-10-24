'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  ListTodo,
  TrendingUp,
  FileText,
  ChartBar,
  Clock,
  Calculator,
  Activity,
  Cloud,
  X,
  GripVertical,
  Plus,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { useImprovedDashboardStore, selectWidgets } from '@/lib/stores/useImprovedDashboardStore'
import { useShallow } from 'zustand/react/shallow'

// Widget types and their configurations
const widgetConfigs = [
  {
    type: 'calendar' as const,
    title: '캘린더',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    dragColor: 'bg-blue-100',
    description: '일정과 마감일을 한눈에',
    defaultSize: { w: 5, h: 4 }
  },
  {
    type: 'todoList' as const,
    title: '할 일 목록',
    icon: ListTodo,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    dragColor: 'bg-purple-100',
    description: '오늘의 작업 관리',
    defaultSize: { w: 4, h: 4 }
  },
  {
    type: 'projectSummary' as const,
    title: '프로젝트 현황',
    icon: TrendingUp,
    color: 'bg-green-50 text-green-600 border-green-200',
    dragColor: 'bg-green-100',
    description: '진행 중인 프로젝트',
    defaultSize: { w: 4, h: 4 }
  },
  {
    type: 'kpiMetrics' as const,
    title: '핵심 성과 지표',
    icon: ChartBar,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    dragColor: 'bg-orange-100',
    description: 'KPI 대시보드',
    defaultSize: { w: 5, h: 2 }
  },
  {
    type: 'taxDeadline' as const,
    title: '세무 일정',
    icon: FileText,
    color: 'bg-red-50 text-red-600 border-red-200',
    dragColor: 'bg-red-100',
    description: '세무 신고 마감일',
    defaultSize: { w: 5, h: 2 }
  },
  {
    type: 'revenueChart' as const,
    title: '매출 차트',
    icon: ChartBar,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    dragColor: 'bg-indigo-100',
    description: '매출 추이 분석',
    defaultSize: { w: 4, h: 3 }
  },
  {
    type: 'taxCalculator' as const,
    title: '세금 계산기',
    icon: Calculator,
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    dragColor: 'bg-yellow-100',
    description: '간편 세금 계산',
    defaultSize: { w: 3, h: 3 }
  },
  {
    type: 'recentActivity' as const,
    title: '최근 활동',
    icon: Activity,
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    dragColor: 'bg-gray-100',
    description: '최근 업무 내역',
    defaultSize: { w: 4, h: 3 }
  },
  {
    type: 'weather' as const,
    title: '날씨',
    icon: Cloud,
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    dragColor: 'bg-sky-100',
    description: '현재 날씨와 예보',
    defaultSize: { w: 2, h: 1 }
  }
]

interface WidgetSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCollapseChange?: (collapsed: boolean) => void
  className?: string
}

export function WidgetSidebar({ isOpen, onClose, onCollapseChange, className }: WidgetSidebarProps) {
  const widgets = useImprovedDashboardStore(useShallow(selectWidgets)) || []
  const addWidget = useImprovedDashboardStore(state => state.addWidget)
  const removeWidget = useImprovedDashboardStore(state => state.removeWidget)
  const findSpaceForWidget = useImprovedDashboardStore(state => state.findSpaceForWidget)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)
  const [isDragOverRemoveZone, setIsDragOverRemoveZone] = useState(false)
  const dragImageRef = useRef<HTMLDivElement>(null)

  // ESC 키 처리는 대시보드 페이지에서 통합 관리
  // (편집 모드와 사이드바를 동시에 닫기 위해)

  // Collapse 상태 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

  // Check if widget type is already added
  const isWidgetAdded = (type: string) => {
    return widgets.some(w => w.type === type)
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: ImprovedWidget['type']) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('widgetType', type)
    setDraggedWidget(type)

    // Create custom drag image
    const config = widgetConfigs.find(c => c.type === type)
    if (config && dragImageRef.current) {
      const dragElement = document.createElement('div')
      dragElement.className = `p-4 rounded-lg shadow-lg ${config.dragColor} border-2 border-dashed opacity-80`
      dragElement.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-lg">${config.title}</span>
        </div>
      `
      dragElement.style.position = 'fixed'
      dragElement.style.top = '-1000px'
      dragElement.style.left = '-1000px'
      dragElement.style.width = '200px'
      document.body.appendChild(dragElement)
      
      e.dataTransfer.setDragImage(dragElement, 100, 20)
      
      setTimeout(() => {
        document.body.removeChild(dragElement)
      }, 0)
    }
  }

  const handleDragEnd = () => {
    setDraggedWidget(null)
  }

  // Handle widget from dashboard being dragged to sidebar for removal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const widgetId = e.dataTransfer.types.includes('widgetId')
    if (widgetId) {
      e.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const widgetId = e.dataTransfer.getData('widgetId')
    if (widgetId) {
      // Remove widget from dashboard
      removeWidget(widgetId)
    }
  }

  // Quick add widget (without drag)
  const handleQuickAdd = (type: ImprovedWidget['type']) => {
    const config = widgetConfigs.find(c => c.type === type)
    if (!config) return

    const emptySpace = findSpaceForWidget(config.defaultSize.w, config.defaultSize.h)
    if (!emptySpace) {
      alert('대시보드에 위젯을 추가할 공간이 없습니다.')
      return
    }

    const newWidget: ImprovedWidget = {
      id: `widget_${type}_${Date.now()}`,
      type,
      title: config.title,
      position: emptySpace,
      minW: 2,
      minH: 2,
      maxW: 9,
      maxH: 9
    }

    addWidget(newWidget)
  }

  return (
    <>
      {/* Sidebar Container - 페이지를 밀어내는 방식 */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-40 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-[280px] sm:w-80',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Sidebar Content */}
        <div className="h-full bg-background border-l flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1">
                <h3 className="font-semibold text-lg">위젯 라이브러리</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  드래그하여 대시보드에 추가
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8"
              >
                {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Widget List */}
          <ScrollArea className="flex-1 p-4">
            {isCollapsed ? (
              // Collapsed View - Icons only
              <div className="space-y-2">
                {widgetConfigs.map(config => {
                  const Icon = config.icon
                  const added = isWidgetAdded(config.type)
                  return (
                    <div
                      key={config.type}
                      className={cn(
                        'relative p-3 rounded-lg cursor-move border transition-all',
                        added 
                          ? 'bg-muted opacity-50 cursor-not-allowed' 
                          : config.color,
                        draggedWidget === config.type && 'scale-105 ring-2 ring-primary'
                      )}
                      draggable={!added}
                      onDragStart={e => !added && handleDragStart(e, config.type)}
                      onDragEnd={handleDragEnd}
                      onDoubleClick={() => !added && handleQuickAdd(config.type)}
                      title={config.title}
                    >
                      <Icon className="h-5 w-5" />
                      {added && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              // Expanded View - Full cards
              <div className="space-y-2">
                {widgetConfigs.map(config => {
                  const Icon = config.icon
                  const added = isWidgetAdded(config.type)
                  return (
                    <div
                      key={config.type}
                      className={cn(
                        'relative p-3 rounded-lg cursor-move border-2 transition-all duration-200 group transform',
                        added 
                          ? 'bg-muted/50 opacity-50 cursor-not-allowed border-muted' 
                          : config.color,
                        draggedWidget === config.type && 'scale-105 ring-2 ring-primary shadow-lg animate-pulse',
                        hoveredWidget === config.type && !added && 'shadow-md scale-[1.02] -translate-y-0.5'
                      )}
                      draggable={!added}
                      onDragStart={e => !added && handleDragStart(e, config.type)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => setHoveredWidget(config.type)}
                      onMouseLeave={() => setHoveredWidget(null)}
                      onDoubleClick={() => !added && handleQuickAdd(config.type)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        {!added && (
                          <GripVertical className="h-4 w-4 opacity-40 group-hover:opacity-70 flex-shrink-0" />
                        )}
                        
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{config.title}</h4>
                            {added && (
                              <Check className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs opacity-75 mt-0.5">
                            {config.description}
                          </p>
                        </div>

                        {/* Quick Add Button */}
                        {!added && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickAdd(config.type)
                            }}
                            title="빠른 추가"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {added && (
                        <div className="absolute inset-0 rounded-lg bg-background/60 flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">이미 추가됨</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer - Drop zone indicator */}
          {!isCollapsed && (
            <div 
              className="p-4 border-t bg-muted/30"
              onDragOver={(e) => {
                e.preventDefault()
                if (e.dataTransfer.types.includes('widgetId')) {
                  setIsDragOverRemoveZone(true)
                }
              }}
              onDragLeave={() => setIsDragOverRemoveZone(false)}
              onDrop={(e) => {
                e.preventDefault()
                const widgetId = e.dataTransfer.getData('widgetId')
                if (widgetId) {
                  removeWidget(widgetId)
                  setIsDragOverRemoveZone(false)
                }
              }}
            >
              <div className={cn(
                "text-center p-4 border-2 border-dashed rounded-lg transition-all duration-200",
                isDragOverRemoveZone 
                  ? "border-destructive bg-destructive/10 scale-105 animate-pulse" 
                  : "border-muted-foreground/30 hover:border-destructive/50 hover:bg-destructive/5"
              )}>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <span className={cn("text-lg", isDragOverRemoveZone && "animate-bounce")}>🗑️</span>
                  <span>위젯을 여기로 드래그하여 제거</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop 제거 - 페이지를 밀어내는 방식에서는 필요없음 */}

      {/* Hidden drag image container */}
      <div ref={dragImageRef} className="hidden" />
    </>
  )
}