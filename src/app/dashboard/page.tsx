'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImprovedDashboard } from '@/components/dashboard/ImprovedDashboard'
import { layout, typography } from '@/config/constants'
import { getDashboardText } from '@/config/brand'
import { Button } from '@/components/ui/button'
import Typography from '@/components/ui/typography'
import { Settings, Save, Plus, Layers, Grid3x3, LayoutDashboard } from 'lucide-react'
import { useImprovedDashboardStore, selectIsEditMode } from '@/lib/stores/useImprovedDashboardStore'
import { WidgetSelectorModal } from '@/components/dashboard/WidgetSelectorModal'
import { ImprovedWidget } from '@/types/improved-dashboard'
import { getDefaultWidgetSize } from '@/lib/dashboard/widget-defaults'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCompact, setIsCompact] = useState(true)
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  
  // 초기 위젯 설정 (9x8 그리드 기준)
  const initialWidgets = [
    { id: 'widget_calendar_1', type: 'calendar' as const, title: '캘린더' },
    { id: 'widget_project_1', type: 'projectSummary' as const, title: '프로젝트 현황' },
    { id: 'widget_kpi_1', type: 'kpiMetrics' as const, title: '핵심 성과 지표' },
    { id: 'widget_tax_1', type: 'taxDeadline' as const, title: '세무 일정' },
    { id: 'widget_todo_1', type: 'todoList' as const, title: '할 일 목록' },
  ]
  
  const isEditMode = useImprovedDashboardStore(selectIsEditMode)
  const widgets = useImprovedDashboardStore(state => state.widgets)
  const enterEditMode = useImprovedDashboardStore(state => state.enterEditMode)
  const exitEditMode = useImprovedDashboardStore(state => state.exitEditMode)
  const compactWidgets = useImprovedDashboardStore(state => state.compactWidgets)
  const findSpaceForWidget = useImprovedDashboardStore(state => state.findSpaceForWidget)
  const addWidget = useImprovedDashboardStore(state => state.addWidget)
  
  const handleAddWidget = () => {
    setWidgetModalOpen(true)
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

  useEffect(() => {
    const checkUser = async () => {
      // 테스트 사용자 체크
      const testUser = localStorage.getItem('testUser')
      if (testUser) {
        const userData = JSON.parse(testUser)
        setUser(userData)
        setLoading(false)
        return
      }

      // 실제 Supabase 사용자 체크
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
        } else {
          setUser(user)
        }
      } catch (err) {
        // Supabase 설정 오류 시 로그인 페이지로
        router.push('/login')
      }
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
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
                <Plus className="h-4 w-4 mr-2" />
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
                <Grid3x3 className="h-4 w-4 mr-2" />
                {getDashboardText.manualAlign('ko')}
              </Button>
              <div className="h-6 w-px bg-border mx-1" />
              <Button 
                size="sm"
                variant="default"
                onClick={exitEditMode}
              >
                <Save className="h-4 w-4 mr-2" />
                {getDashboardText.complete('ko')}
              </Button>
            </>
          )}
          </div>
        </div>
      </div>
      
      {/* 위젯 선택 모달 */}
      <WidgetSelectorModal
        open={widgetModalOpen}
        onOpenChange={setWidgetModalOpen}
        onSelectWidget={handleSelectWidget}
        existingWidgets={widgets}
      />
      
      {/* 대시보드 위젯 */}
      <ImprovedDashboard 
        isCompactControlled={isCompact} 
        hideToolbar 
        initialWidgets={[
          {
            id: 'calendar_widget_1',
            type: 'calendar' as const,
            title: '캘린더',
            position: { x: 0, y: 0, w: 5, h: 4 },
            minW: 2,
            minH: 2,
            // data를 제거하거나 undefined로 설정하면 컴포넌트 내부 목데이터 사용
          },
          {
            id: 'project_summary_widget_1',
            type: 'projectSummary' as const,
            title: '프로젝트 현황',
            position: { x: 5, y: 0, w: 4, h: 4 },
            minW: 2,
            minH: 2,
            // data를 제거하거나 undefined로 설정하면 컴포넌트 내부 목데이터 사용
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
            // data를 제거하거나 undefined로 설정하면 컴포넌트 내부 목데이터 사용
          },
        ]}
      />
    </div>
  )
}
