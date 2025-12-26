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
import { useImprovedDashboardStore, selectIsEditMode, selectWidgets, initializeDashboardStore, setupDashboardAutoSave } from '@/lib/stores/useImprovedDashboardStore'
import { useStorageInitStore } from '@/lib/stores/useStorageInitStore'
import { useShallow } from 'zustand/react/shallow'
import { WidgetSelectorModal } from '@/components/dashboard/WidgetSelectorModal'
import { WidgetSidebar } from '@/components/dashboard/WidgetSidebar'
import { WidgetEditSidebar } from '@/components/dashboard/WidgetEditSidebar'
import { PresetManager } from '@/components/dashboard/PresetManager'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { getDefaultWidgetSize } from '@/lib/dashboard/widget-defaults'
import { ConfirmDialog } from '@/components/ui/dialogConfirm'
import { createDefaultWidgets } from '@/components/dashboard/utils/defaultWidgets'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { plan, usage, canAddWidget, refresh: refreshLimits } = usePlanLimits()
  const [loading, setLoading] = useState(true)
  const storageInitialized = useStorageInitStore((state) => state.isInitialized)
  const [isCompact, setIsCompact] = useState(true)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [widgetSidebarOpen, setWidgetSidebarOpen] = useState(false)
  const [widgetEditSidebarOpen, setWidgetEditSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [widgetLimitAlertOpen, setWidgetLimitAlertOpen] = useState(false)
  
  // 초기 위젯 설정 (9컬럼 그리드 기준)
  // 레이아웃:
  // - 상단: 캘린더(좌 5칸) + 할 일 목록(우 4칸)
  // - 중간: 프로젝트 현황(좌 5칸) + 최근 활동(우 4칸)
  // - 하단: 핵심 성과 지표(좌 5칸)
  const initialWidgets = [
    {
      id: 'calendar_widget_1',
      type: 'calendar' as const,
      title: getDashboardText.widgets.calendar('ko'),
      position: { x: 0, y: 0, w: 5, h: 5 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'todo_list_widget_1',
      type: 'todoList' as const,
      title: getDashboardText.widgets.todoList('ko'),
      position: { x: 5, y: 0, w: 4, h: 5 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'project_summary_widget_1',
      type: 'projectSummary' as const,
      title: getDashboardText.widgets.projectSummary('ko'),
      position: { x: 0, y: 5, w: 5, h: 3 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'recent_activity_widget_1',
      type: 'recentActivity' as const,
      title: getDashboardText.widgets.recentActivity('ko'),
      position: { x: 5, y: 5, w: 4, h: 5 },
      minW: 2,
      minH: 2,
    },
    {
      id: 'kpi_metrics_widget_1',
      type: 'kpiMetrics' as const,
      title: getDashboardText.widgets.kpiMetrics('ko'),
      position: { x: 0, y: 8, w: 5, h: 2 },
      minW: 2,
      minH: 2,
    },
  ]
  
  const isEditMode = useImprovedDashboardStore(selectIsEditMode)
  const widgets = useImprovedDashboardStore(useShallow(selectWidgets))
  const autoCompact = useImprovedDashboardStore(state => state.editState.autoCompact)
  const enterEditMode = useImprovedDashboardStore(state => state.enterEditMode)
  const exitEditMode = useImprovedDashboardStore(state => state.exitEditMode)
  const compactWidgets = useImprovedDashboardStore(state => state.compactWidgets)
  const optimizeWidgetLayout = useImprovedDashboardStore(state => state.optimizeWidgetLayout)
  const findSpaceForWidget = useImprovedDashboardStore(state => state.findSpaceForWidget)
  const addWidget = useImprovedDashboardStore(state => state.addWidget)
  const removeWidget = useImprovedDashboardStore(state => state.removeWidget)
  const reorderWidget = useImprovedDashboardStore(state => state.reorderWidget)
  const updateWidget = useImprovedDashboardStore(state => state.updateWidget)
  const setAutoCompact = useImprovedDashboardStore(state => state.setAutoCompact)
  const resetStore = useImprovedDashboardStore(state => state.resetStore)
  const setColumns = useImprovedDashboardStore(state => state.setColumns)

  // ESC 키로 레이어별로 순차적으로 닫기 (Progressive Dismissal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 1. 위젯 추가 사이드바가 열려있으면 이것만 닫기
        if (widgetSidebarOpen) {
          setWidgetSidebarOpen(false)
        }
        // 2. 편집 사이드바가 열려있으면 이것만 닫기
        else if (widgetEditSidebarOpen) {
          setWidgetEditSidebarOpen(false)
        }
        // 3. 편집 모드가 활성화되어 있으면 종료
        else if (isEditMode) {
          exitEditMode()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditMode, widgetSidebarOpen, widgetEditSidebarOpen, exitEditMode])

  // 편집 모드 진입 시 모바일이면 편집 사이드바 자동 열기
  useEffect(() => {
    if (isEditMode && isMobile) {
      setWidgetEditSidebarOpen(true)
      setWidgetSidebarOpen(false) // 위젯 추가 사이드바는 닫기
    }
  }, [isEditMode, isMobile])
  
  const handleAddWidget = () => {
    // 사이드바 방식으로 변경
    setWidgetSidebarOpen(true)
    setWidgetModalOpen(false)
  }

  // 편집 사이드바에서 위젯 추가 사이드바 열기 (모바일 전용)
  // 편집 사이드바는 유지하고 추가 사이드바를 위에 오버레이
  const handleOpenWidgetSelectorFromEdit = () => {
    setWidgetSidebarOpen(true)
    // 편집 사이드바는 닫지 않음 (뒤에 유지)
  }

  // 위젯 순서 변경 핸들러
  const handleWidgetReorder = (id: string, direction: 'up' | 'down') => {
    reorderWidget(id, direction)

    // 자동 정렬이 활성화되어 있으면 정렬 수행
    if (autoCompact) {
      compactWidgets('vertical')
    }
  }

  // 위젯 크기 조절 핸들러
  const handleWidgetResize = (id: string, width: number, height: number) => {
    const widget = widgets?.find(w => w.id === id)
    if (!widget) return

    updateWidget(id, {
      position: {
        ...widget.position,
        w: width,
        h: height
      }
    })

    // 자동 정렬이 활성화되어 있으면 정렬 수행
    if (autoCompact) {
      setTimeout(() => compactWidgets('vertical'), 100)
    }
  }

  // 위젯 삭제 핸들러
  const handleWidgetRemove = (id: string) => {
    removeWidget(id)
    refreshLimits()

    // 자동 정렬이 활성화되어 있으면 정렬 수행
    if (autoCompact) {
      setTimeout(() => compactWidgets('vertical'), 100)
    }
  }

  const handleResetLayout = () => {
    setResetConfirmOpen(true)
  }

  const confirmResetLayout = async () => {
    // 1. 기본 위젯 생성
    const defaultWidgets = createDefaultWidgets()

    // 2. 모바일 최적화: 현재 뷰포트 기반 cols 계산
    const { optimizeLayout } = await import('@/lib/dashboard/grid-utils')
    const { getColsForWidth } = await import('@/components/ui/use-responsive-cols')

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const currentCols = getColsForWidth(viewportWidth)
    const config = useImprovedDashboardStore.getState().config
    const optimizedConfig = { ...config, cols: currentCols }

    console.log('🔧 초기화 최적화 설정:', {
      viewportWidth,
      currentCols,
      configCols: config.cols
    })

    // 3. 레이아웃 최적화 적용
    const positions = defaultWidgets.map(w => w.position)
    const optimizedPositions = optimizeLayout(positions, optimizedConfig)
    const optimizedWidgets = defaultWidgets.map((widget, index) => ({
      ...widget,
      position: optimizedPositions[index]
    }))

    // 4. 스토어 초기화
    resetStore()

    // 5. 올바른 cols 값으로 설정 (resetStore가 기본값 9로 리셋하므로)
    setColumns(currentCols)

    // 6. 최적화된 위젯 추가
    optimizedWidgets.forEach((widget) => {
      addWidget(widget)
    })

    // 7. 초기화 확인 모달 닫기
    setResetConfirmOpen(false)

    console.log('✅ 대시보드 초기화 완료: 6개 위젯으로 재설정 (모바일 최적화 적용)', {
      currentCols,
      widgets: optimizedWidgets.map(w => ({ type: w.type, position: w.position }))
    })
  }

  const handleSelectWidget = (type: ImprovedWidget['type']) => {
    // 무료화: 위젯 제한 제거 - 모든 사용자 무제한
    // 제한 체크 로직은 향후 재활성화를 위해 주석 처리
    // const currentWidgetCount = widgets?.length || 0;
    // const widgetLimit = usage.widgets.limit; // constants.ts의 plans 설정 사용
    // if (widgetLimit !== -1 && currentWidgetCount >= widgetLimit) {
    //   setWidgetLimitAlertOpen(true);
    //   return;
    // }

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
    refreshLimits() // 사용량 새로고침
  }

  // 화면 크기 감지 및 반응형 처리
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)  // 768px 미만을 모바일로 간주
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
          return
        }
      } catch (err) {
        console.error('사용자 인증 확인 중 오류:', err)
        router.push('/login')
        return
      }
      setLoading(false)
    }

    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 스토어 초기화 및 자동 저장 설정
  useEffect(() => {
    // 로딩이 완료되고 Storage 초기화가 완료된 후에만 대시보드 스토어 초기화
    if (loading || !storageInitialized) return

    console.log('📊 Initializing dashboard store after Storage initialization')

    // Supabase에서 대시보드 레이아웃 로드
    initializeDashboardStore()

    // 자동 저장 구독 설정
    const cleanup = setupDashboardAutoSave()

    return cleanup
  }, [loading, storageInitialized])

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-6">
        {/* 헤더 */}
        <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <Typography variant="h2" className="text-2xl text-foreground mb-1 whitespace-nowrap">
                {getDashboardText.title('ko')}
              </Typography>
              <Typography variant="body1" className="text-muted-foreground whitespace-nowrap">
                {getDashboardText.subtitle('ko')}
              </Typography>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 flex-shrink-0">
          {!isEditMode ? (
            <Button
              size="sm"
              variant="outline"
              onClick={enterEditMode}
              className="w-full md:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              {getDashboardText.editMode('ko')}
            </Button>
          ) : (
            // 편집 모드 툴바
            <>
              {/* 모바일 편집 모드: 위젯 편집 사이드바 열기 버튼만 표시 */}
              {isMobile ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setWidgetEditSidebarOpen(true)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  위젯 편집
                </Button>
              ) : (
                // 데스크톱 편집 모드: 전체 툴바
                <>
                  {/* 위젯 추가/닫기 토글 버튼 */}
                  <Button
                    size="sm"
                    variant={widgetSidebarOpen ? "default" : "outline"}
                    onClick={() => setWidgetSidebarOpen(!widgetSidebarOpen)}
                    className="w-full md:w-auto"
                  >
                    <PanelRightOpen className="h-4 w-4 mr-2" />
                    {widgetSidebarOpen ? getDashboardText.closeWidget('ko') : getDashboardText.addWidget('ko')}
                  </Button>
                  <Button
                    size="sm"
                    variant={isCompact ? "default" : "outline"}
                    onClick={() => setIsCompact(!isCompact)}
                    className="w-full md:w-auto"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    {getDashboardText.autoLayout('ko')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => compactWidgets('vertical')}
                    className="w-full md:w-auto"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    {getDashboardText.verticalAlign('ko')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => optimizeWidgetLayout()}
                    className="w-full md:w-auto"
                  >
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    {getDashboardText.optimizeLayout('ko')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetLayout}
                    title={getDashboardText.resetLayoutTooltip('ko')}
                    className="w-full md:w-auto"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {getDashboardText.resetLayout('ko')}
                  </Button>
                  <PresetManager className="w-full md:w-auto" />
                  <div className="hidden md:block h-6 w-px bg-border mx-1" />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      exitEditMode()
                      setWidgetSidebarOpen(false)
                      setWidgetEditSidebarOpen(false)
                    }}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {getDashboardText.complete('ko')}
                  </Button>
                </>
              )}
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
      
      {/* 사이드바 오버레이 백드롭 - 모바일 및 데스크톱 모두 */}
      {(widgetSidebarOpen || widgetEditSidebarOpen) && (
        <div
          className={cn(
            "fixed inset-0 z-30 transition-colors",
            // 모바일: 어두운 배경
            isMobile ? "bg-black/50" :
            // 데스크톱: 투명하지만 클릭 가능
            "bg-transparent"
          )}
          onClick={() => {
            // 추가 사이드바가 열려있으면 추가만 닫기 (편집은 유지)
            if (widgetSidebarOpen) {
              setWidgetSidebarOpen(false)
            } else {
              // 편집 사이드바만 열려있으면 편집 닫기
              setWidgetEditSidebarOpen(false)
            }
          }}
        />
      )}

      {/* 위젯 추가 사이드바 (항상 렌더링, isOpen으로 제어) */}
      <WidgetSidebar
        isOpen={widgetSidebarOpen}
        onClose={() => setWidgetSidebarOpen(false)}
        onCollapseChange={setIsCollapsed}
        className={isMobile ? "shadow-2xl" : ""}
        currentWidgetCount={widgets?.length || 0}
        widgetLimit={-1} // 무료화: 모든 사용자 무제한 (기존: plan === 'free' ? 3 : -1)
        onLimitExceeded={() => setWidgetLimitAlertOpen(true)}
      />

      {/* 위젯 편집 사이드바 (모바일 편집 모드 전용) */}
      {isMobile && isEditMode && (
        <WidgetEditSidebar
          isOpen={widgetEditSidebarOpen}
          onClose={() => setWidgetEditSidebarOpen(false)}
          widgets={widgets || []}
          onReorder={handleWidgetReorder}
          onResize={handleWidgetResize}
          onRemove={handleWidgetRemove}
          autoCompact={autoCompact}
          onAutoCompactChange={setAutoCompact}
          onComplete={() => {
            exitEditMode()
            setWidgetEditSidebarOpen(false)
          }}
          onOpenWidgetSelector={handleOpenWidgetSelectorFromEdit}
          isMobile={isMobile}
          className="shadow-2xl"
        />
      )}
      
      {/* 위젯 선택 모달 (기존 방식 - 백업용) */}
      <WidgetSelectorModal
        open={widgetModalOpen}
        onOpenChange={setWidgetModalOpen}
        onSelectWidget={handleSelectWidget}
        existingWidgets={widgets || []}
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

      {/* 위젯 추가 안내 모달 (무료화로 제한 없음) */}
      <AlertDialog open={widgetLimitAlertOpen} onOpenChange={setWidgetLimitAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>위젯 추가 안내</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>🎉 현재 위브의 모든 기능이 무료로 제공됩니다!</div>
                <div className="font-medium">현재 위젯 수: {widgets?.length || 0}개</div>
                <div className="text-sm text-muted-foreground mt-4">
                  위젯을 무제한으로 추가하실 수 있습니다.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setWidgetLimitAlertOpen(false)}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}