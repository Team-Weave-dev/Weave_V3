'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImprovedDashboard } from '@/components/dashboard/ImprovedDashboard'
import { getDashboardText, getLoadingText } from '@/config/brand'
import { Button } from '@/components/ui/button'
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import Typography from '@/components/ui/typography'
import { Settings, Save, Layers, Grid3x3, LayoutDashboard, PanelRightOpen, ArrowUp, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useImprovedDashboardStore, selectIsEditMode, initializeDashboardStore, setupDashboardAutoSave } from '@/lib/stores/useImprovedDashboardStore'
import { WidgetSelectorModal } from '@/components/dashboard/WidgetSelectorModal'
import { WidgetSidebar } from '@/components/dashboard/WidgetSidebar'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { getDefaultWidgetSize } from '@/lib/dashboard/widget-defaults'
import { ConfirmDialog } from '@/components/ui/dialogConfirm'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isCompact, setIsCompact] = useState(true)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [widgetSidebarOpen, setWidgetSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  
  // 초기 위젯 설정 (9x9 그리드 기준)
  const initialWidgets = [
    {
      id: 'calendar_widget_1',
      type: 'calendar' as const,
      title: getDashboardText.widgets.calendar('ko'),
      position: { x: 0, y: 0, w: 5, h: 4 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'project_summary_widget_1',
      type: 'projectSummary' as const,
      title: getDashboardText.widgets.projectSummary('ko'),
      position: { x: 5, y: 0, w: 4, h: 4 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'kpi_metrics_widget_1',
      type: 'kpiMetrics' as const,
      title: getDashboardText.widgets.kpiMetrics('ko'),
      position: { x: 0, y: 4, w: 5, h: 2 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'tax_deadline_widget_1',
      type: 'taxDeadline' as const,
      title: getDashboardText.widgets.taxDeadline('ko'),
      position: { x: 0, y: 6, w: 5, h: 2 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'todo_list_widget_1',
      type: 'todoList' as const,
      title: getDashboardText.widgets.todoList('ko'),
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
  const resetStore = useImprovedDashboardStore(state => state.resetStore)

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

  const handleResetLayout = () => {
    setResetConfirmOpen(true)
  }

  const confirmResetLayout = () => {
    // 스토어 초기화
    resetStore()

    // 기본 위젯 5개 추가
    initialWidgets.forEach((widget) => {
      addWidget(widget as ImprovedWidget)
    })
  }

  const handleSelectWidget = (type: ImprovedWidget['type']) => {
    const defaultSize = getDefaultWidgetSize(type)
    const emptySpace = findSpaceForWidget(defaultSize.width, defaultSize.height)

    if (!emptySpace) {
      alert(getDashboardText.noSpaceAlert('ko'))
      return
    }

    // 위젯 타입별 기본 제목 설정
    const widgetTitles: Record<ImprovedWidget['type'], string> = {
      calendar: getDashboardText.widgets.calendar('ko'),
      todoList: getDashboardText.widgets.todoList('ko'),
      projectSummary: getDashboardText.widgets.projectSummary('ko'),
      kpiMetrics: getDashboardText.widgets.kpiMetrics('ko'),
      taxDeadline: getDashboardText.widgets.taxDeadline('ko'),
      revenueChart: getDashboardText.widgets.revenueChart('ko'),
      taxCalculator: getDashboardText.widgets.taxCalculator('ko'),
      recentActivity: getDashboardText.widgets.recentActivity('ko'),
      weather: getDashboardText.widgets.weather('ko'),
      custom: getDashboardText.widgets.custom('ko')
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

  // 스토어 초기화 및 자동 저장 설정
  useEffect(() => {
    // localStorage에서 대시보드 레이아웃 로드
    initializeDashboardStore()

    // 자동 저장 구독 설정
    const cleanup = setupDashboardAutoSave()

    return cleanup
  }, [])

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
              {/* 위젯 추가/닫기 토글 버튼 */}
              <Button
                size="sm"
                variant={widgetSidebarOpen ? "default" : "outline"}
                onClick={() => setWidgetSidebarOpen(!widgetSidebarOpen)}
              >
                <PanelRightOpen className="h-4 w-4 mr-2" />
                {widgetSidebarOpen ? getDashboardText.closeWidget('ko') : getDashboardText.addWidget('ko')}
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
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetLayout}
                title={getDashboardText.resetLayoutTooltip('ko')}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {getDashboardText.resetLayout('ko')}
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

      {/* 초기화 확인 모달 */}
      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        onConfirm={confirmResetLayout}
        title={getDashboardText.resetModal.title('ko')}
        description={getDashboardText.resetModal.description('ko')}
        confirmLabel={getDashboardText.resetModal.confirmButton('ko')}
        cancelLabel={getDashboardText.resetModal.cancelButton('ko')}
        icon={<RotateCcw className="h-8 w-8 text-primary" />}
      />
    </div>
  )
}