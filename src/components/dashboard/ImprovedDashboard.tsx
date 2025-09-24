'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings, 
  Save, 
  X,
  Plus,
  Grip,
  Maximize2,
  Grid3x3,
  Layers
} from 'lucide-react';
import { 
  useImprovedDashboardStore,
  selectWidgets,
  selectConfig,
  selectEditState,
  selectIsEditMode,
  shallow
} from '@/lib/stores/useImprovedDashboardStore';
import {
  GridPosition,
  deltaToGrid,
  getOverlapRatio,
  canSwapWidgets,
  getTransformStyle
} from '@/lib/dashboard/grid-utils';
import { ImprovedWidget, WidgetCallbacks } from '@/types/improved-dashboard';
import { StatsWidget } from '@/components/ui/widgets/StatsWidget';
import { ChartWidget } from '@/components/ui/widgets/ChartWidget';
import { QuickActionsWidget } from '@/components/ui/widgets/QuickActionsWidget';
import { ProjectSummaryWidget } from '@/components/ui/widgets/ProjectSummaryWidget';
import { TodoListWidget } from '@/components/ui/widgets/TodoListWidget';
import { CalendarWidget } from '@/components/ui/widgets/CalendarWidget';
import { useResponsiveCols } from '@/components/ui/use-responsive-cols';

interface ImprovedDashboardProps {
  initialWidgets?: ImprovedWidget[];
  callbacks?: WidgetCallbacks;
  className?: string;
}

// 테스트 데이터
const mockStatsData = [
  { label: '매출', value: '₩47,250,000', change: 12.5, changeType: 'increase' as const },
  { label: '고객', value: '3,842', change: -5.4, changeType: 'decrease' as const },
  { label: '주문', value: '1,827', change: 8.2, changeType: 'increase' as const },
  { label: '전환율', value: '3.24%', change: 2.1, changeType: 'increase' as const },
];

const mockChartData = {
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  datasets: [
    {
      label: '매출',
      data: [13, 20, 15, 22, 19, 25, 21],
      color: 'primary'
    },
    {
      label: '비용',
      data: [8, 12, 10, 13, 10, 14, 12],
      color: 'secondary'
    }
  ]
};

// 프로젝트 요약 위젯 목업 데이터
const mockProjects = [
  {
    id: 'proj_1',
    projectId: 'W-101',
    projectName: '모바일 앱 리뉴얼',
    client: 'Acme Corp',
    pm: '김프로',
    status: 'warning',
    statusLabel: '주의',
    progress: 62,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    daysRemaining: 10,
    budget: { total: 80000000, spent: 42000000, currency: 'KRW' },
    currentStatus: '핵심 모듈 통합 테스트 진행 중',
    issues: ['푸시 알림 간헐적 실패', 'iOS 빌드 스크립트 수정 필요'],
  },
  {
    id: 'proj_2',
    projectId: 'W-102',
    projectName: '데이터 대시보드 고도화',
    client: 'Globex',
    pm: '이매니저',
    status: 'normal',
    statusLabel: '정상',
    progress: 78,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    daysRemaining: 18,
    budget: { total: 60000000, spent: 35000000, currency: 'KRW' },
    currentStatus: '새 위젯 시스템 성능 개선 확인',
  },
  {
    id: 'proj_3',
    projectId: 'W-103',
    projectName: '파트너 포털 구축',
    client: 'Initech',
    pm: '박리더',
    status: 'critical',
    statusLabel: '긴급',
    progress: 35,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    daysRemaining: 3,
    budget: { total: 90000000, spent: 70000000, currency: 'KRW' },
    currentStatus: '권한 매트릭스 설계 재검토 필요',
    issues: ['인증 전략 충돌', '권한 동기화 지연'],
  },
];

// 테스트용 캘린더 이벤트 데이터
const mockCalendarEvents = [
  {
    id: 'event-1',
    title: '프로젝트 킥오프 미팅',
    description: '새 프로젝트 시작 회의',
    date: new Date(),
    startTime: '10:00',
    endTime: '11:30',
    type: 'meeting' as const
  },
  {
    id: 'event-2',
    title: '디자인 리뷰',
    description: 'UI/UX 디자인 검토',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24),
    startTime: '14:00',
    endTime: '15:00',
    type: 'meeting' as const
  },
  {
    id: 'event-3',
    title: '코드 리뷰 마감',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    allDay: true,
    type: 'deadline' as const
  },
  {
    id: 'event-4',
    title: '주간 보고서 작성',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    startTime: '16:00',
    type: 'task' as const
  },
  {
    id: 'event-5',
    title: '팀 빌딩 행사',
    description: '분기별 팀 빌딩',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    startTime: '18:00',
    endTime: '21:00',
    type: 'other' as const
  }
];

// 테스트용 Todo 데이터
const mockTodoData = [
  {
    id: 'todo-1',
    title: '프로젝트 제안서 작성',
    completed: false,
    priority: 'p1' as const,
    depth: 0,
    order: 0,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 'todo-2',
    title: '클라이언트 미팅 준비',
    completed: false,
    priority: 'p2' as const,
    depth: 0,
    order: 1,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: 'todo-3',
    title: '디자인 시안 검토',
    completed: true,
    priority: 'p3' as const,
    depth: 0,
    order: 2,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: 'todo-4',
    title: '개발 환경 설정',
    completed: false,
    priority: 'p3' as const,
    depth: 0,
    order: 3,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    id: 'todo-5',
    title: '테스트 케이스 작성',
    completed: false,
    priority: 'p4' as const,
    depth: 0,
    order: 4,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }
];

export function ImprovedDashboard({
  initialWidgets = [],
  callbacks,
  className
}: ImprovedDashboardProps) {
  // 스토어 구독
  const widgets = useImprovedDashboardStore(selectWidgets);
  const config = useImprovedDashboardStore(selectConfig);
  const editState = useImprovedDashboardStore(selectEditState);
  const isEditMode = useImprovedDashboardStore(selectIsEditMode);
  
  // 스토어 액션
  const {
    setWidgets,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    moveWidgetWithPush,
    resizeWidget,
    resizeWidgetWithPush,
    resizeWidgetWithShrink,
    resizeWidgetSmart,
    swapWidgets,
    compactWidgets,
    findSpaceForWidget,
    checkCollision,
    setColumns,
    enterEditMode,
    exitEditMode,
    startDragging,
    updateDragging,
    stopDragging,
    startResizing,
    updateResizing,
    stopResizing,
    selectWidget,
    setHoveredPosition,
    setDragOverWidget,
  } = useImprovedDashboardStore();
  
  // 로컬 상태
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 120, height: 120 });
  const [isCompact, setIsCompact] = useState(true);
  
  // 초기화
  useEffect(() => {
    if (initialWidgets.length > 0 && widgets.length === 0) {
      // 시작 레이아웃: 타입별 1개만 유지하고 기본 포지션에 배치
      const defaultPos: Record<ImprovedWidget['type'], GridPosition> = {
        // 9x9 그리드 기준 배치
        projectSummary: { x: 0, y: 0, w: 5, h: 3 },
        stats: { x: 5, y: 0, w: 4, h: 2 },
        todoList: { x: 5, y: 2, w: 4, h: 3 },
        chart: { x: 0, y: 3, w: 5, h: 2 },
        calendar: { x: 0, y: 5, w: 5, h: 3 },
        quickActions: { x: 5, y: 5, w: 4, h: 1 },
        custom: { x: 5, y: 6, w: 4, h: 2 },
      };
      const seen = new Set<ImprovedWidget['type']>();
      const selected: ImprovedWidget[] = [];

      for (const w of initialWidgets) {
        if (seen.has(w.type)) continue;
        seen.add(w.type);
        const normalized: ImprovedWidget = {
          ...w,
          position: defaultPos[w.type] ?? w.position ?? { x: 0, y: 0, w: 4, h: 2 },
          data:
            w.type === 'projectSummary' ? (w.data ?? mockProjects) :
            w.type === 'stats' ? (w.data ?? mockStatsData) :
            w.type === 'chart' ? (w.data ?? mockChartData) :
            w.data,
        };
        selected.push(normalized);
      }

      // 누락된 타입은 기본 위젯으로 보충하여 한 타입당 1개 보장
      const ensure = (type: ImprovedWidget['type'], widget: ImprovedWidget) => {
        if (!seen.has(type)) {
          selected.push(widget);
          seen.add(type);
        }
      };
      ensure('projectSummary', {
        id: 'widget_project_1',
        type: 'projectSummary',
        title: '프로젝트 현황',
        position: defaultPos.projectSummary,
        data: mockProjects,
        minW: 3,
        minH: 2,
      });
      ensure('stats', {
        id: 'widget_stats_1',
        type: 'stats',
        title: '통계 대시보드',
        position: defaultPos.stats,
        data: mockStatsData,
        minW: 2,
        minH: 1,
        maxW: 9,
      });
      ensure('todoList', {
        id: 'widget_todo_1',
        type: 'todoList',
        title: '할 일 목록',
        position: defaultPos.todoList,
        data: mockTodoData,
        minW: 2,
        minH: 2,
        maxW: 5,
      });
      ensure('chart', {
        id: 'widget_chart_1',
        type: 'chart',
        title: '주간 트렌드',
        position: defaultPos.chart,
        data: mockChartData,
        minW: 3,
        minH: 2,
      });
      ensure('calendar', {
        id: 'widget_calendar_1',
        type: 'calendar',
        title: '캘린더',
        position: defaultPos.calendar,
        data: mockCalendarEvents,
        minW: 3,
        minH: 2,
        maxW: 6,
        maxH: 4,
      });
      ensure('quickActions', {
        id: 'widget_actions_1',
        type: 'quickActions',
        title: '빠른 작업',
        position: defaultPos.quickActions,
        minW: 2,
        minH: 1,
      });

      selected.forEach((w) => addWidget(w));
    } else if (widgets.length === 0) {
      // 테스트 위젯 생성
      const testWidgets: ImprovedWidget[] = [
        {
          id: 'widget_project_1',
          type: 'projectSummary',
          title: '프로젝트 현황',
          position: { x: 0, y: 0, w: 5, h: 3 },
          data: mockProjects,
          minW: 3,
          minH: 2,
        },
        {
          id: 'widget_stats_1',
          type: 'stats',
          title: '통계 대시보드',
          position: { x: 5, y: 0, w: 4, h: 2 },
          data: mockStatsData,
          minW: 2,
          minH: 1,
          maxW: 9,
        },
        {
          id: 'widget_todo_1',
          type: 'todoList',
          title: '할 일 목록',
          position: { x: 5, y: 2, w: 4, h: 3 },
          data: mockTodoData,
          minW: 2,
          minH: 2,
          maxW: 5,
        },
        {
          id: 'widget_chart_1',
          type: 'chart',
          title: '주간 트렌드',
          position: { x: 0, y: 3, w: 5, h: 2 },
          data: mockChartData,
          minW: 3,
          minH: 2,
        },
        {
          id: 'widget_calendar_1',
          type: 'calendar',
          title: '캘린더',
          position: { x: 0, y: 5, w: 5, h: 3 },
          data: mockCalendarEvents,
          minW: 3,
          minH: 2,
          maxW: 6,
          maxH: 4,
        },
        {
          id: 'widget_actions_1',
          type: 'quickActions',
          title: '빠른 작업',
          position: { x: 5, y: 5, w: 4, h: 1 },
          minW: 2,
          minH: 1,
        },
      ];
      testWidgets.forEach((w) => addWidget(w));
    }
  }, [initialWidgets, widgets.length, addWidget]);

  // 중복 ID 위젯 정리 (개발/StrictMode에서 이중 마운트 대비)
  useEffect(() => {
    if (widgets.length <= 1) return;
    const seen = new Set<string>();
    const dedup: typeof widgets = [];
    let hasDup = false;
    for (const w of widgets) {
      if (seen.has(w.id)) {
        hasDup = true;
        continue;
      }
      seen.add(w.id);
      dedup.push(w);
    }
    if (hasDup) {
      setWidgets(dedup);
    }
  }, [widgets, setWidgets]);
  
  // 반응형 그리드 계산
  useEffect(() => {
    const calculateGrid = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const availableWidth = containerWidth;
      
      const cellWidth = Math.floor(
        (availableWidth - (config.cols - 1) * config.gap) / config.cols
      );
      
      setCellSize({
        width: Math.max(80, Math.min(200, cellWidth)),
        height: config.rowHeight
      });
    };
    
    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, [config.cols, config.gap, config.rowHeight]);
  
  // ESC 키로 편집 모드 종료
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditMode) {
        exitEditMode();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditMode, exitEditMode]);
  
  // Compact 레이아웃 적용
  useEffect(() => {
    if (isCompact && config.compactType) {
      compactWidgets(config.compactType);
    }
  }, [isCompact, config.compactType, compactWidgets]);
  
  // 드래그 핸들러
  const handleDragStart = useCallback((e: React.MouseEvent, widget: ImprovedWidget) => {
    // 편집 모드가 아니면 드래그 불가
    if (!isEditMode) return;
    // static 위젯은 드래그 불가
    if (widget.static) return;
    // isDraggable이 명시적으로 false인 경우만 드래그 불가
    if (widget.isDraggable === false) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    // 현재 위젯의 실제 위치를 시작점으로 사용
    const startPosition = { ...widget.position };
    
    // 드래그 시작 상태 설정
    startDragging(widget.id, startPosition);
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // 픽셀을 그리드 단위로 변환 (그리드 스냅 없이 부드럽게)
      const gridCellWidth = cellSize.width + config.gap;
      const gridCellHeight = cellSize.height + config.gap;
      
      const dx = Math.round(deltaX / gridCellWidth);
      const dy = Math.round(deltaY / gridCellHeight);
      
      const newPosition: GridPosition = {
        x: Math.max(0, Math.min(config.cols - startPosition.w, startPosition.x + dx)),
        y: Math.max(0, startPosition.y + dy),
        w: startPosition.w,
        h: startPosition.h,
      };
      
      // 실시간으로 위치 업데이트 (시각적 피드백)
      updateDragging(newPosition);

      // 충돌 체크 및 스왑/플레이스홀더 갱신
      if (config.preventCollision) {
        const targetWidget = widgets.find(w => {
          if (w.id === widget.id) return false;
          const overlapRatio = getOverlapRatio(newPosition, w.position);
          return overlapRatio > 0.3; // 30% 이상 겹치면 스왑 후보
        });

        if (targetWidget) {
          setDragOverWidget(targetWidget.id);
          if (canSwapWidgets(newPosition, targetWidget.position, config)) {
            setHoveredPosition(targetWidget.position);
          }
        } else {
          setDragOverWidget(null);
          // 겹치지 않을 때만 플레이스홀더 표시
          if (!checkCollision(widget.id, newPosition)) {
            setHoveredPosition(newPosition);
          } else {
            setHoveredPosition(null);
          }
        }
      }
      callbacks?.onDrag?.(widget, newPosition, e);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // 최신 드래그 위치를 스토어에서 직접 조회 (클로저 스냅샷 문제 회피)
      const finalPosition = useImprovedDashboardStore.getState().editState.draggedWidget?.currentPosition;
      
      if (finalPosition) {
        // 스왑 처리 시 충돌 해소 포함
        if (editState.dragOverWidgetId) {
          const targetWidget = widgets.find(w => w.id === editState.dragOverWidgetId);
          if (targetWidget && canSwapWidgets(finalPosition, targetWidget.position, config)) {
            swapWidgets(widget.id, targetWidget.id);
          } else {
            // 스왑 불가 시 push 전략으로 이동
            moveWidgetWithPush(widget.id, finalPosition);
          }
        } else {
          // 일반 이동은 push 전략 사용 (충돌 시 자동 해소)
          moveWidgetWithPush(widget.id, finalPosition);
        }

        callbacks?.onDragStop?.(widget, finalPosition, e);
      }
      
      // 자동 정렬 옵션이 켜져 있으면 압축 실행
      if (isCompact && config.compactType) {
        compactWidgets(config.compactType);
      }

      stopDragging();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      callbacks?.onLayoutChange?.(widgets);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    callbacks?.onDragStart?.(widget, e.nativeEvent);
  }, [isEditMode, widgets, cellSize, config, editState, startDragging, updateDragging, stopDragging, moveWidgetWithPush, swapWidgets, checkCollision, setDragOverWidget, setHoveredPosition, callbacks, isCompact, compactWidgets]);
  
  // 리사이즈 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent, widget: ImprovedWidget) => {
    // 편집 모드가 아니면 리사이즈 불가
    if (!isEditMode) return;
    // static 위젯은 리사이즈 불가
    if (widget.static) return;
    // isResizable이 명시적으로 false인 경우만 리사이즈 불가
    if (widget.isResizable === false) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...widget.position };
    
    startResizing(widget.id, startPosition);
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // 픽셀을 그리드 단위로 변환
      const gridCellWidth = cellSize.width + config.gap;
      const gridCellHeight = cellSize.height + config.gap;
      
      const dx = Math.round(deltaX / gridCellWidth);
      const dy = Math.round(deltaY / gridCellHeight);
      
      const newPosition: GridPosition = {
        x: startPosition.x,
        y: startPosition.y,
        w: Math.max(1, startPosition.w + dx),
        h: Math.max(1, startPosition.h + dy),
      };
      
      updateResizing(newPosition);
      callbacks?.onResize?.(widget, newPosition, e);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // 최신 리사이즈 위치를 스토어에서 직접 조회
      const finalPosition = useImprovedDashboardStore.getState().editState.resizingWidget?.currentPosition;
      
      if (finalPosition) {
        // 스마트 리사이즈 사용 - 자동으로 최적의 전략 선택
        resizeWidgetSmart(widget.id, finalPosition);
        
        callbacks?.onResizeStop?.(widget, finalPosition, e);
      }
      
      // 자동 정렬 옵션이 켜져 있으면 압축 실행
      if (isCompact && config.compactType) {
        compactWidgets(config.compactType);
      }

      stopResizing();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      callbacks?.onLayoutChange?.(widgets);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    callbacks?.onResizeStart?.(widget, e.nativeEvent);
  }, [isEditMode, widgets, cellSize, config, editState, startResizing, updateResizing, stopResizing, resizeWidgetSmart, callbacks, isCompact, compactWidgets]);
  
  
  // 위젯 추가
  const handleAddWidget = useCallback(() => {
    const emptySpace = findSpaceForWidget(2, 2);
    if (!emptySpace) {
      alert('위젯을 추가할 공간이 없습니다.');
      return;
    }
    
    const newWidget: ImprovedWidget = {
      id: `widget_${Date.now()}`,
      type: 'stats',
      title: '새 위젯',
      position: emptySpace,
      data: mockStatsData,
      minW: 2,
      minH: 1,
    };
    
    addWidget(newWidget);
  }, [findSpaceForWidget, addWidget]);
  
  // 위젯 렌더링
  const renderWidget = useCallback((widget: ImprovedWidget) => {
    switch (widget.type) {
      case 'stats':
        return <StatsWidget title={widget.title} stats={widget.data || mockStatsData} />;
      case 'chart':
        return <ChartWidget title={widget.title} data={widget.data || mockChartData} />;
      case 'quickActions':
        return <QuickActionsWidget title={widget.title} />;
      case 'projectSummary':
        return <ProjectSummaryWidget 
          title={widget.title} 
          projects={widget.data || []}
          lang="ko"
        />;
      case 'todoList':
        return <TodoListWidget 
          title={widget.title} 
          tasks={widget.data || mockTodoData}
        />;
      case 'calendar':
        return <CalendarWidget
          title={widget.title}
          events={widget.data || mockCalendarEvents}
          showToday={true}
        />;
      default:
        return (
          <Card className="h-full p-4">
            <p className="text-muted-foreground">위젯 타입: {widget.type}</p>
          </Card>
        );
    }
  }, []);
  
  // 위젯 스타일 계산
  const getWidgetStyle = useCallback((widget: ImprovedWidget): React.CSSProperties => {
    const isDragging = editState.draggedWidget?.id === widget.id;
    const isResizing = editState.resizingWidget?.id === widget.id;
    
    // 드래그 중이면 draggedWidget의 currentPosition 사용, 아니면 위젯의 실제 position 사용
    const position = isDragging && editState.draggedWidget?.currentPosition 
      ? editState.draggedWidget.currentPosition 
      : isResizing && editState.resizingWidget?.currentPosition
      ? editState.resizingWidget.currentPosition
      : widget.position;
    
    const baseStyle = getTransformStyle(
      position,
      cellSize.width,
      cellSize.height,
      config.gap,
      config.useCSSTransforms,
      isDragging || isResizing // 드래그나 리사이즈 중이면 transition 스킵
    );
    
    // 드래그나 리사이즈 중에는 z-index 높이기
    if (isDragging || isResizing) {
      return {
        ...baseStyle,
        zIndex: 50
      };
    }
    
    return baseStyle;
  }, [cellSize, config.gap, config.useCSSTransforms, editState]);
  
  // 반응형 컬럼 규칙(components 라이브러리의 훅 사용)
  useResponsiveCols(containerRef as React.RefObject<HTMLElement>, { onChange: setColumns, initialCols: config.cols });

  return (
    <div className={cn("w-full", className)}>
      {/* 툴바 */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isCompact ? "default" : "outline"}
              onClick={() => setIsCompact(!isCompact)}
            >
              <Layers className="h-4 w-4 mr-2" />
              자동 정렬
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => compactWidgets('vertical')}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              압축
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <Button size="sm" variant="outline" onClick={handleAddWidget}>
                <Plus className="h-4 w-4 mr-2" />
                위젯 추가
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
            </>
          )}
          
          <Button 
            size="sm"
            variant={isEditMode ? "default" : "outline"}
            onClick={() => isEditMode ? exitEditMode() : enterEditMode()}
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                완료
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                편집
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* 그리드 컨테이너 */}
      <div 
        ref={containerRef}
        className="relative"
        style={{ 
          minHeight: '600px',
          background: isEditMode 
            ? `repeating-linear-gradient(
                0deg,
                transparent,
                transparent ${cellSize.height + config.gap - 1}px,
                var(--border) ${cellSize.height + config.gap - 1}px,
                var(--border) ${cellSize.height + config.gap}px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent ${cellSize.width + config.gap - 1}px,
                var(--border) ${cellSize.width + config.gap - 1}px,
                var(--border) ${cellSize.width + config.gap}px
              )`
            : undefined,
        }}
      >
        <AnimatePresence>
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              className={cn(
                "absolute",
                // 드래그나 리사이즈 중이 아닐 때만 transition 적용
                editState.draggedWidget?.id !== widget.id && 
                editState.resizingWidget?.id !== widget.id && 
                "transition-all duration-200",
                // 드래그 중일 때 스타일 (z-index는 getWidgetStyle에서 처리)
                editState.draggedWidget?.id === widget.id && "cursor-grabbing opacity-90 scale-105",
                // 리사이즈 중일 때 스타일
                editState.resizingWidget?.id === widget.id && "opacity-90",
                // 드래그 오버 표시
                editState.dragOverWidgetId === widget.id && "ring-2 ring-primary/50",
                // static 위젯
                widget.static && "opacity-80"
              )}
              style={getWidgetStyle(widget)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-full overflow-hidden">
                {/* 편집 컨트롤 */}
                {isEditMode && !widget.static && (
                  <div className="absolute -inset-2 z-30 pointer-events-none">
                    {/* 삭제 버튼 */}
                    <motion.button
                      className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-auto hover:bg-red-600 z-20"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        removeWidget(widget.id);
                        callbacks?.onWidgetRemove?.(widget.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                    
                    {/* 크기 조절 핸들 */}
                    {(widget.isResizable !== false) && (
                      <motion.button
                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg pointer-events-auto cursor-se-resize hover:bg-primary/90 z-20"
                        whileHover={{ scale: 1.1 }}
                        onMouseDown={(e) => handleResizeStart(e, widget)}
                      >
                        <Maximize2 className="h-3 w-3" />
                      </motion.button>
                    )}
                  </div>
                )}
                
                {/* 위젯 콘텐츠 */}
                <div
                  className={cn(
                    "h-full transition-all duration-200",
                    isEditMode && !widget.static && "scale-95",
                    editState.draggedWidget?.id === widget.id && "opacity-80 cursor-grabbing"
                  )}
                  onClick={(e) => !isEditMode && callbacks?.onWidgetClick?.(widget, e.nativeEvent)}
                >
                  {/* 편집 모드 드래그 핸들 */}
                  {isEditMode && !widget.static && widget.isDraggable !== false && widget.type !== 'todoList' && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100/50 to-transparent dark:from-gray-800/50 cursor-move z-10"
                      onMouseDown={(e) => handleDragStart(e, widget)}
                    >
                      <div className="flex items-center justify-center h-full">
                        <Grip className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                  {/* TodoList 위젯은 전체 헤더 영역을 드래그 핸들로 사용 */}
                  {isEditMode && !widget.static && widget.isDraggable !== false && widget.type === 'todoList' && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-12 cursor-move z-10"
                      onMouseDown={(e) => handleDragStart(e, widget)}
                    />
                  )}
                  {renderWidget(widget)}
                </div>
                
                {/* 크기 정보 표시 */}
                {editState.resizingWidget?.id === widget.id && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap z-50">
                    {widget.position.w} × {widget.position.h}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 드래그 플레이스홀더 */}
        {editState.hoveredPosition && !editState.dragOverWidgetId && (
          <div
            className="absolute border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 pointer-events-none animate-pulse"
            style={getTransformStyle(
              editState.hoveredPosition,
              cellSize.width,
              cellSize.height,
              config.gap,
              config.useCSSTransforms,
              true // 플레이스홀더는 transition 불필요
            )}
          />
        )}
      </div>
    </div>
  );
}
