'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImprovedDashboard } from '@/components/dashboard/ImprovedDashboard'
import { layout, typography } from '@/config/constants'
import { getDashboardText } from '@/config/brand'
import { Button } from '@/components/ui/button'
import { Settings, Save, Plus, Layers, Grid3x3 } from 'lucide-react'
import { useImprovedDashboardStore, selectIsEditMode } from '@/lib/stores/useImprovedDashboardStore'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCompact, setIsCompact] = useState(true)
  
  // 초기 위젯 설정 (9x8 그리드 기준)
  const initialWidgets = [
    { id: 'widget_calendar_1', type: 'calendar' as const, title: '캘린더' },
    { id: 'widget_project_1', type: 'projectSummary' as const, title: '프로젝트 현황' },
    { id: 'widget_kpi_1', type: 'kpiMetrics' as const, title: '핵심 성과 지표' },
    { id: 'widget_tax_1', type: 'taxDeadline' as const, title: '세무 일정' },
    { id: 'widget_todo_1', type: 'todoList' as const, title: '할 일 목록' },
  ]
  
  const isEditMode = useImprovedDashboardStore(selectIsEditMode)
  const enterEditMode = useImprovedDashboardStore(state => state.enterEditMode)
  const exitEditMode = useImprovedDashboardStore(state => state.exitEditMode)
  const compactWidgets = useImprovedDashboardStore(state => state.compactWidgets)
  const findSpaceForWidget = useImprovedDashboardStore(state => state.findSpaceForWidget)
  const addWidget = useImprovedDashboardStore(state => state.addWidget)
  
  const handleAddWidget = () => {
    const emptySpace = findSpaceForWidget(2, 2)
    if (!emptySpace) {
      alert('위젯을 추가할 공간이 없습니다.')
      return
    }
    
    const newWidget = {
      id: `widget_${Date.now()}`,
      type: 'custom' as const,
      title: '새 위젯',
      position: emptySpace,
      minW: 2,
      minH: 2,
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
    <div className={`max-w-[1300px] mx-auto ${layout.spacing.page.paddingX} ${layout.spacing.page.paddingY} ${layout.spacing.page.contentGap}`}>
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className={typography.title.page}>{getDashboardText.title('ko')}</h1>
          <p className={typography.text.subtitle}>
            {getDashboardText.subtitle('ko')}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            data: [],  // 초기 데이터는 컴포넌트 내부에서 설정됨
          },
          {
            id: 'project_summary_widget_1',
            type: 'projectSummary' as const,
            title: '프로젝트 현황',
            position: { x: 5, y: 0, w: 4, h: 4 },
            minW: 2,
            minH: 2,
            data: [],  // 초기 데이터는 컴포넌트 내부에서 설정됨
          },
          {
            id: 'kpi_metrics_widget_1',
            type: 'kpiMetrics' as const,
            title: '핵심 성과 지표',
            position: { x: 0, y: 4, w: 5, h: 2 },
            minW: 2,
            minH: 2,
            data: undefined,  // KPI는 데이터 없이도 작동
          },
          {
            id: 'tax_deadline_widget_1',
            type: 'taxDeadline' as const,
            title: '세무 일정',
            position: { x: 0, y: 6, w: 5, h: 2 },
            minW: 2,
            minH: 2,
            data: undefined,  // 세무 일정은 내부 데이터 사용
          },
          {
            id: 'todo_list_widget_1',
            type: 'todoList' as const,
            title: '할 일 목록',
            position: { x: 5, y: 4, w: 4, h: 4 },
            minW: 2,
            minH: 2,
            data: [],  // 초기 데이터는 컴포넌트 내부에서 설정됨
          },
        ]}
      />
    </div>
  )
}
