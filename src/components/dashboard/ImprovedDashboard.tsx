'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// Animation removed - framer-motion no longer needed
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getDashboardText } from '@/config/brand';
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
import { ProjectSummaryWidget } from '@/components/ui/widgets/ProjectSummaryWidget';
import { TodoListWidget } from '@/components/ui/widgets/TodoListWidget';
import { CalendarWidget } from '@/components/ui/widgets/CalendarWidget';
import { TaxDeadlineWidget } from '@/components/ui/widgets/TaxDeadlineWidget';
import { TaxCalculatorWidget } from '@/components/ui/widgets/TaxCalculatorWidget';
import { KPIWidget } from '@/components/ui/widgets/KPIWidget';
import { RevenueChartWidget } from '@/components/ui/widgets/RevenueChartWidget';
import { RecentActivityWidget } from '@/components/ui/widgets/RecentActivityWidget';
import { useResponsiveCols } from '@/components/ui/use-responsive-cols';
import { getDefaultWidgetSize } from '@/lib/dashboard/widget-defaults';

interface ImprovedDashboardProps {
  initialWidgets?: ImprovedWidget[];
  callbacks?: WidgetCallbacks;
  className?: string;
  hideToolbar?: boolean;
  isCompactControlled?: boolean;
}

// 테스트 데이터


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
  {
    id: 'proj_4',
    projectId: 'W-104',
    projectName: 'ERP 시스템 통합',
    client: 'TechFlow',
    pm: '최기획',
    status: 'normal',
    statusLabel: '정상',
    progress: 45,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    daysRemaining: 25,
    budget: { total: 120000000, spent: 48000000, currency: 'KRW' },
    currentStatus: 'API 연동 테스트 진행 중',
  },
  {
    id: 'proj_5',
    projectId: 'W-105',
    projectName: 'AI 챗봇 개발',
    client: 'Smart Solutions',
    pm: '정리드',
    status: 'normal',
    statusLabel: '정상',
    progress: 90,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    daysRemaining: 7,
    budget: { total: 55000000, spent: 48000000, currency: 'KRW' },
    currentStatus: '최종 QA 테스트 및 문서화 작업',
  },
];

// 캘린더 이벤트는 CalendarWidget에서 자체적으로 로컴스토리지에서 로드
const mockCalendarEvents = undefined; // CalendarWidget이 자체적으로 로컴스토리지에서 로드

// 레거시 코드 (삭제 예정)
/*
const OLD_mockCalendarEvents = [
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
  },
  {
    id: 'event-6',
    title: '클라이언트 데모',
    description: 'Acme Corp 프로젝트 시연',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    startTime: '15:00',
    endTime: '16:30',
    type: 'meeting' as const
  },
  {
    id: 'event-7',
    title: '스프린트 회고',
    description: '2주차 스프린트 회고 미팅',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    startTime: '11:00',
    endTime: '12:00',
    type: 'meeting' as const
  },
  {
    id: 'event-8',
    title: '보안 감사',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
    allDay: true,
    type: 'deadline' as const
  },
  {
    id: 'event-9',
    title: '기술 세미나',
    description: 'React 19 새로운 기능',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
    startTime: '16:00',
    endTime: '18:00',
    type: 'other' as const
  },
  {
    id: 'event-10',
    title: '월간 성과 리뷰',
    description: '팀 성과 및 KPI 검토',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    startTime: '09:00',
    endTime: '10:30',
    type: 'meeting' as const
  }
];
*/

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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
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
  },
  {
    id: 'todo-6',
    title: 'API 문서 업데이트',
    completed: true,
    priority: 'p2' as const,
    depth: 0,
    order: 5,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 'todo-7',
    title: '버그 수정: 로그인 이슈',
    completed: false,
    priority: 'p1' as const,
    depth: 0,
    order: 6,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24)
  },
  {
    id: 'todo-8',
    title: '성능 최적화 분석',
    completed: false,
    priority: 'p3' as const,
    depth: 0,
    order: 7,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36)
  },
  {
    id: 'todo-9',
    title: '데이터베이스 백업 스크립트',
    completed: true,
    priority: 'p2' as const,
    depth: 0,
    order: 8,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
  },
  {
    id: 'todo-10',
    title: '릴리즈 노트 작성',
    completed: false,
    priority: 'p4' as const,
    depth: 0,
    order: 9,
    sectionId: 'default',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  }
];

// KPI 메트릭 목 데이터
const mockKPIMetrics = [
  {
    id: 'kpi-1',
    title: '월간 매출',
    value: 285000000,
    unit: 'KRW',
    change: 12.5,
    changeType: 'increase' as const,
    period: '전월 대비',
    icon: 'TrendingUp',
    color: 'success' as const,
  },
  {
    id: 'kpi-2',
    title: '진행중 프로젝트',
    value: 8,
    unit: '개',
    change: 2,
    changeType: 'increase' as const,
    period: '지난주 대비',
    icon: 'Briefcase',
    color: 'primary' as const,
  },
  {
    id: 'kpi-3',
    title: '팀 효율성',
    value: 94,
    unit: '%',
    change: 3.2,
    changeType: 'increase' as const,
    period: '전주 대비',
    icon: 'TrendingUp',
    color: 'success' as const,
  },
  {
    id: 'kpi-4',
    title: '고객 만족도',
    value: 4.8,
    unit: '/ 5.0',
    change: 0.3,
    changeType: 'increase' as const,
    period: '전분기 대비',
    icon: 'Star',
    color: 'warning' as const,
  },
];

// 세무 일정 목 데이터 (TaxDeadlineWidget 내부에 하드코딩되어 있어 별도 데이터 불필요)

export function ImprovedDashboard({
  initialWidgets = [],
  callbacks,
  className,
  hideToolbar = false,
  isCompactControlled
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
  const [isCompact, setIsCompact] = useState(isCompactControlled ?? true);
  
  // 초기화
  useEffect(() => {
    // 이미 위젯이 있으면 초기화하지 않음
    if (widgets.length > 0) return;
    
    if (initialWidgets.length > 0) {
      // 시작 레이아웃: 9x8 그리드 기준으로 위치 설정
      const defaultPos: Record<ImprovedWidget['type'], GridPosition> = {
        // 9x8 그리드 기준 배치
        calendar: { 
          x: 0, y: 0, 
          w: 5, 
          h: 4 
        }, // 캘린더 (왼쪽 상단, 5x4)
        projectSummary: { 
          x: 5, y: 0, 
          w: 4, 
          h: 4 
        }, // 프로젝트 현황 (오른쪽 상단, 4x4)
        kpiMetrics: { 
          x: 0, y: 4, 
          w: 5, 
          h: 2 
        }, // 핵심 성과 지표 (왼쪽 중단, 5x2)
        taxDeadline: { 
          x: 0, y: 6, 
          w: 5, 
          h: 2 
        }, // 세무 일정 (왼쪽 하단, 5x2)
        todoList: { 
          x: 5, y: 4, 
          w: 4, 
          h: 4 
        }, // 할 일 목록 (오른쪽 하단, 4x4)
        revenueChart: {
          x: 0, y: 8,
          w: 3,
          h: 2
        }, // 매출 차트 (왼쪽 최하단, 3x2)
        taxCalculator: {
          x: 0, y: 0,
          w: 2,
          h: 2
        }, // 세금 계산기 (기본 2x2)
        recentActivity: {
          x: 3, y: 8,
          w: 3,
          h: 2
        }, // 최근 활동 (중앙 하단, 3x2)
        custom: { 
          x: 6, y: 8, 
          w: 2, 
          h: 2 
        }, // 커스텀 (예비 공간, 2x2)
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
      ensure('calendar', {
        id: 'widget_calendar_1',
        type: 'calendar',
        title: '캘린더',
        position: defaultPos.calendar,
        data: undefined, // CalendarWidget이 자체적으로 로컴스토리지에서 로드
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 4,
      });
      ensure('taxDeadline', {
        id: 'widget_tax_1',
        type: 'taxDeadline',
        title: '세무 일정',
        position: defaultPos.taxDeadline,
        minW: 2,
        minH: 2,
      });
      ensure('kpiMetrics', {
        id: 'widget_kpi_1',
        type: 'kpiMetrics',
        title: '핵심 성과 지표',
        position: defaultPos.kpiMetrics,
        data: mockKPIMetrics,
        minW: 4,
        minH: 2,
        maxW: 9,
      });

      selected.forEach((w) => addWidget(w));
    } else {
      // 테스트 위젯 생성 - 기본 크기 사용
      const testWidgets: ImprovedWidget[] = [
        {
          id: 'widget_calendar_1',
          type: 'calendar',
          title: '캘린더',
          position: { 
            x: 0, y: 0, 
            w: getDefaultWidgetSize('calendar').width,
            h: getDefaultWidgetSize('calendar').height
          },
          data: undefined, // CalendarWidget이 자체적으로 로컴스토리지에서 로드
          minW: getDefaultWidgetSize('calendar').minWidth || 2,
          minH: getDefaultWidgetSize('calendar').minHeight || 2,
          maxW: getDefaultWidgetSize('calendar').maxWidth || 6,
          maxH: getDefaultWidgetSize('calendar').maxHeight || 6,
        },
        {
          id: 'widget_project_1',
          type: 'projectSummary',
          title: '프로젝트 현황',
          position: { 
            x: 3, y: 0, 
            w: getDefaultWidgetSize('projectSummary').width,
            h: getDefaultWidgetSize('projectSummary').height
          },
          data: mockProjects,
          minW: getDefaultWidgetSize('projectSummary').minWidth || 2,
          minH: getDefaultWidgetSize('projectSummary').minHeight || 2,
        },
        {
          id: 'widget_kpi_1',
          type: 'kpiMetrics',
          title: '핵심 성과 지표',
          position: { 
            x: 5, y: 0, 
            w: getDefaultWidgetSize('kpiMetrics').width,
            h: getDefaultWidgetSize('kpiMetrics').height
          },
          data: mockKPIMetrics,
          minW: getDefaultWidgetSize('kpiMetrics').minWidth || 1,
          minH: getDefaultWidgetSize('kpiMetrics').minHeight || 2,
        },
        {
          id: 'widget_tax_1',
          type: 'taxDeadline',
          title: '세무 일정',
          position: { 
            x: 6, y: 0, 
            w: getDefaultWidgetSize('taxDeadline').width,
            h: getDefaultWidgetSize('taxDeadline').height
          },
          minW: getDefaultWidgetSize('taxDeadline').minWidth || 1,
          minH: getDefaultWidgetSize('taxDeadline').minHeight || 2,
        },
        {
          id: 'widget_todo_1',
          type: 'todoList',
          title: '할 일 목록',
          position: { 
            x: 7, y: 0, 
            w: getDefaultWidgetSize('todoList').width,
            h: getDefaultWidgetSize('todoList').height
          },
          data: mockTodoData,
          minW: getDefaultWidgetSize('todoList').minWidth || 2,
          minH: getDefaultWidgetSize('todoList').minHeight || 2,
          maxW: getDefaultWidgetSize('todoList').maxWidth || 4,
        },
      ];
      testWidgets.forEach((w) => addWidget(w));
    }
  }, []); // 빈 의존성 배열로 변경하여 최초 1회만 실행

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
    const compact = isCompactControlled ?? isCompact;
    if (compact && config.compactType) {
      compactWidgets(config.compactType);
    }
  }, [isCompactControlled, isCompact, config.compactType, compactWidgets]);
  
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
      const compact = isCompactControlled ?? isCompact;
      if (compact && config.compactType) {
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
      const compact = isCompactControlled ?? isCompact;
      if (compact && config.compactType) {
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
    const defaultSize = getDefaultWidgetSize('custom');
    const emptySpace = findSpaceForWidget(defaultSize.width, defaultSize.height);
    if (!emptySpace) {
      alert('위젯을 추가할 공간이 없습니다.');
      return;
    }
    
    const newWidget: ImprovedWidget = {
      id: `widget_${Date.now()}`,
      type: 'custom',
      title: '새 위젯',
      position: emptySpace,
      minW: defaultSize.minWidth || 2,
      minH: defaultSize.minHeight || 2,
    };
    
    addWidget(newWidget);
  }, [findSpaceForWidget, addWidget]);
  
  // 위젯 렌더링
  const renderWidget = useCallback((widget: ImprovedWidget) => {
    switch (widget.type) {
      case 'projectSummary':
        return <ProjectSummaryWidget 
          title={widget.title} 
          projects={widget.data || mockProjects}
          lang="ko"
        />;
      case 'todoList':
        return <TodoListWidget 
          title={widget.title} 
          // tasks prop을 전달하지 않아서 위젯 내부의 목데이터를 사용하도록 함
          // tasks={widget.data || mockTodoData}
        />;
      case 'calendar':
        return <CalendarWidget
          title={widget.title}
          events={widget.data} // undefined일 경우 자체적으로 로컴스토리지에서 로드
          showToday={true}
          gridSize={{ w: widget.position.w, h: widget.position.h }}
        />;
      case 'kpiMetrics':
        return <KPIWidget
          title={widget.title}
          metrics={widget.data}
          lang="ko"
          variant={widget.position.w <= 3 ? 'compact' : 'detailed'}
        />;
      case 'taxDeadline':
        return <TaxDeadlineWidget
          title={widget.title}
          showOnlyUpcoming={true}
          maxItems={5}
          highlightDays={7}
          lang="ko"
        />;
      case 'taxCalculator':
        return <TaxCalculatorWidget
          title={widget.title}
          lang="ko"
          showHistory={true}
          maxHistoryItems={5}
        />;
      case 'revenueChart':
        return <RevenueChartWidget
          title={widget.title}
          lang="ko"
          data={widget.data}
          periodType={widget.data?.periodType || 'monthly'}
          chartView={widget.data?.chartView || 'bar'}
        />;
      case 'recentActivity':
        return <RecentActivityWidget
          title={widget.title}
          activities={widget.data}
          lang="ko"
          maxItems={10}
          showFilter={true}
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
      {/* 툴바 - hideToolbar가 false이고 편집 모드일 때만 표시 */}
      {!hideToolbar && isEditMode && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
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
          </div>
          
          <Button 
            size="sm"
            variant="default"
            onClick={exitEditMode}
          >
            <Save className="h-4 w-4 mr-2" />
            {getDashboardText.complete('ko')}
          </Button>
        </div>
      )}
      
      {/* 그리드 컨테이너 */}
      <div 
        ref={containerRef}
        className="relative"
        style={{ 
          // maxRows(9) * (rowHeight(120) + gap(16)) = 9 * 136 = 1224px
          minHeight: `${(config.maxRows || 9) * (config.rowHeight + config.gap)}px`,
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
        {widgets.map((widget) => (
            <div
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
            >
              <div className="relative h-full overflow-hidden">
                {/* 편집 컨트롤 */}
                {isEditMode && !widget.static && (
                  <div className="absolute -inset-2 z-30 pointer-events-none">
                    {/* 삭제 버튼 */}
                    <button
                      className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-auto hover:bg-red-600 hover:scale-110 active:scale-90 transition-transform z-20"
                      onClick={() => {
                        removeWidget(widget.id);
                        callbacks?.onWidgetRemove?.(widget.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    {/* 크기 조절 핸들 */}
                    {(widget.isResizable !== false) && (
                      <button
                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg pointer-events-auto cursor-se-resize hover:bg-primary/90 hover:scale-110 transition-transform z-20"
                        onMouseDown={(e) => handleResizeStart(e, widget)}
                      >
                        <Maximize2 className="h-3 w-3" />
                      </button>
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
                  {/* 편집 모드 드래그 핸들 - 모든 위젯에 동일하게 적용 */}
                  {isEditMode && !widget.static && widget.isDraggable !== false && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100/50 to-transparent dark:from-gray-800/50 cursor-move z-10"
                      onMouseDown={(e) => handleDragStart(e, widget)}
                    >
                      <div className="flex items-center justify-center h-full">
                        <Grip className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
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
            </div>
          ))}
        
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