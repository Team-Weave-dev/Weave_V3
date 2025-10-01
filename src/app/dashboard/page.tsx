'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImprovedDashboard } from '@/components/dashboard/ImprovedDashboard'
import { getDashboardText, getLoadingText } from '@/config/brand'
import { Button } from '@/components/ui/button'
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import Typography from '@/components/ui/typography'
import { Settings, Save, Layers, Grid3x3, LayoutDashboard, PanelRightOpen, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useImprovedDashboardStore, selectIsEditMode } from '@/lib/stores/useImprovedDashboardStore'
import { WidgetSelectorModal } from '@/components/dashboard/WidgetSelectorModal'
import { WidgetSidebar } from '@/components/dashboard/WidgetSidebar'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { getDefaultWidgetSize } from '@/lib/dashboard/widget-defaults'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isCompact, setIsCompact] = useState(true)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [widgetSidebarOpen, setWidgetSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // 초기 위젯 설정 (9x9 그리드 기준)
  const initialWidgets = [
    {
      id: 'calendar_widget_1',
      type: 'calendar' as const,
      title: '캘린더',
      position: { x: 0, y: 0, w: 5, h: 4 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'project_summary_widget_1',
      type: 'projectSummary' as const,
      title: '프로젝트 현황',
      position: { x: 5, y: 0, w: 4, h: 4 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'kpi_metrics_widget_1',
      type: 'kpiMetrics' as const,
      title: '핵심 성과 지표',
      position: { x: 0, y: 4, w: 5, h: 2 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'tax_deadline_widget_1',
      type: 'taxDeadline' as const,
      title: '세무 일정',
      position: { x: 0, y: 6, w: 5, h: 2 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'todo_list_widget_1',
      type: 'todoList' as const,
      title: '할 일 목록',
      position: { x: 5, y: 4, w: 4, h: 4 },
      minW: 2,
      minH: 2,
    },
  ]
  
  const isEditMode = useImprovedDashboardStore(selectIsEditMode)
  const widgets = useImprovedDashboardStore(state => state.widgets)
  const enterEditMode = useImprovedDashboardStore(state => state.enterEditMode)
  const exitEditMode = useImprovedDashboardStore(state => state.exitEditMode)
  const compactWidgets = useImprovedDashboardStore(state => state.compactWidgets)
  const optimizeWidgetLayout = useImprovedDashboardStore(state => state.optimizeWidgetLayout)
  const findSpaceForWidget = useImprovedDashboardStore(state => state.findSpaceForWidget)
  const addWidget = useImprovedDashboardStore(state => state.addWidget)

  // ESC 키로 편집 모드와 사이드바 동시에 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditMode) {
          exitEditMode()
        }
        if (widgetSidebarOpen) {
          setWidgetSidebarOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditMode, widgetSidebarOpen, exitEditMode])
  
  const handleAddWidget = () => {
    // 사이드바 방식으로 변경
    setWidgetSidebarOpen(true)
    setWidgetModalOpen(false)
  }

  const handleSelectWidget = (type: ImprovedWidget['type']) => {
    const defaultSize = getDefaultWidgetSize(type)
    const emptySpace = findSpaceForWidget(defaultSize.width, defaultSize.height)
    
    if (!emptySpace) {
      alert('위젯을 추가할 공간이 없습니다. 기존 위젯을 조정해주세요.')
      return
    }

    // 위젯 타입별 기본 제목 설정
    const widgetTitles: Record<ImprovedWidget['type'], string> = {
      calendar: '캘린더',
      todoList: '할 일 목록',
      projectSummary: '프로젝트 현황',
      kpiMetrics: '핵심 성과 지표',
      taxDeadline: '세무 일정',
      revenueChart: '매출 차트',
      taxCalculator: '세금 계산기',
      recentActivity: '최근 활동',
      weather: '날씨',
      custom: '새 위젯'
    }

    const newWidget: ImprovedWidget = {
      id: `widget_${type}_${Date.now()}`,
      type,
      title: widgetTitles[type],
      position: emptySpace,
      minW: defaultSize.minWidth || 2,
      minH: defaultSize.minHeight || 2,
      maxW: defaultSize.maxWidth,
      maxH: defaultSize.maxHeight,
    }
    
    addWidget(newWidget)
  }

  // 화면 크기 감지 및 반응형 처리
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 1024)
      // 작은 화면에서 사이드바가 열려있고 확장된 상태면 자동으로 축소
      if (width < 768 && widgetSidebarOpen && !isCollapsed) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [widgetSidebarOpen, isCollapsed])

  useEffect(() => {
    const checkUser = async () => {
      // 테스트 사용자 체크
      const testUser = localStorage.getItem('testUser')
      if (testUser) {
        setLoading(false)
        return
      }

      // 실제 Supabase 사용자 체크
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
        }
      } catch {
        // Supabase 설정 오류 시 로그인 페이지로
        router.push('/login')
      }
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return <FullPageLoadingSpinner text={getLoadingText.data('ko')} />
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* 메인 콘텐츠 영역 - 데스크톱에서만 사이드바가 열리면 옆으로 밀림 */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        // 모바일에서는 사이드바가 오버레이 방식으로 동작
        !isMobile && widgetSidebarOpen && !isCollapsed ? "lg:mr-80" : 
        !isMobile && widgetSidebarOpen && isCollapsed ? "lg:mr-16" : 
        "mr-0"
      )}>
        <div className="container mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <Typography variant="h2" className="text-2xl text-foreground mb-1">
                {getDashboardText.title('ko')}
              </Typography>
              <Typography variant="body1" className="text-muted-foreground">
                {getDashboardText.subtitle('ko')}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
          {!isEditMode ? (
            <Button
              size="sm"
              variant="outline"
              onClick={enterEditMode}
            >
              <Settings className="h-4 w-4 mr-2" />
              {getDashboardText.editMode('ko')}
            </Button>
          ) : (
            // 편집 모드 툴바
            <>
              <Button size="sm" variant="outline" onClick={handleAddWidget}>
                <PanelRightOpen className="h-4 w-4 mr-2" />
                {getDashboardText.addWidget('ko')}
              </Button>
              <Button
                size="sm"
                variant={isCompact ? "default" : "outline"}
                onClick={() => setIsCompact(!isCompact)}
              >
                <Layers className="h-4 w-4 mr-2" />
                {getDashboardText.autoLayout('ko')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => compactWidgets('vertical')}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                {getDashboardText.verticalAlign('ko')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => optimizeWidgetLayout()}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                {getDashboardText.optimizeLayout('ko')}
              </Button>
              <div className="h-6 w-px bg-border mx-1" />
              <Button 
                size="sm"
                variant="default"
                onClick={() => {
                  exitEditMode()
                  setWidgetSidebarOpen(false)  // 사이드바 닫기
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {getDashboardText.complete('ko')}
              </Button>
            </>
          )}
          </div>
        </div>
      </div>
      
      {/* 대시보드 위젯 */}
      <ImprovedDashboard 
        isCompactControlled={isCompact} 
        hideToolbar 
        initialWidgets={initialWidgets}
      />
      </div>
      </div>
      
      {/* 모바일에서 오버레이 백드롭 */}
      {isMobile && widgetSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setWidgetSidebarOpen(false)}
        />
      )}
      
      {/* 위젯 사이드바 (새로운 방식) */}
      <WidgetSidebar
        isOpen={widgetSidebarOpen}
        onClose={() => setWidgetSidebarOpen(false)}
        onCollapseChange={setIsCollapsed}
        className={isMobile ? "shadow-2xl" : ""}
      />
      
      {/* 위젯 선택 모달 (기존 방식 - 백업용) */}
      <WidgetSelectorModal
        open={widgetModalOpen}
        onOpenChange={setWidgetModalOpen}
        onSelectWidget={handleSelectWidget}
        existingWidgets={widgets}
      />
    </div>
  )
}