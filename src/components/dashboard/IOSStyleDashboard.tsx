'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { IOSStyleWidget } from '@/types/ios-dashboard';
import { 
  useIOSDashboardStore,
  selectWidgets,
  selectEditMode,
  selectWiggling
} from '@/lib/stores/useIOSDashboardStore';
import { shallow } from 'zustand/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings, 
  Grid3x3, 
  Save, 
  X,
  Plus,
  Grip,
  Maximize2
} from 'lucide-react';
import { wiggleAnimation, deleteButtonAnimation, resizeHandleAnimation } from '@/lib/dashboard/ios-animations';
import { StatsWidget } from './widgets/StatsWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ProjectSummaryWidget } from './widgets/ProjectSummaryWidget';
import type { ProjectReview } from '@/types/dashboard';

interface IOSStyleDashboardProps {
  widgets?: IOSStyleWidget[];
  onLayoutChange?: (widgets: IOSStyleWidget[]) => void;
}

// 목 데이터
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

const mockProjectData: ProjectReview[] = [
  {
    id: '1',
    projectId: 'proj-001',
    projectName: '신규 이커머스 플랫폼 구축',
    client: '(주)테크커머스',
    pm: '김프로',
    status: 'critical',
    statusLabel: '긴급',
    progress: 65,
    deadline: new Date('2025-09-30'),
    daysRemaining: 7,
    budget: {
      total: 50000000,
      spent: 42000000,
      currency: 'KRW'
    },
    currentStatus: '결제 모듈 통합 중 이슈 발생',
    issues: ['결제 게이트웨이 API 연동 지연', '성능 최적화 필요'],
    nextActions: ['결제 모듈 대체 솔루션 검토', '성능 프로파일링 실시']
  },
  {
    id: '2',
    projectId: 'proj-002',
    projectName: '모바일 앱 리뉴얼',
    client: '스타트업A',
    pm: '이매니저',
    status: 'warning',
    statusLabel: '주의',
    progress: 45,
    deadline: new Date('2025-10-15'),
    daysRemaining: 22,
    budget: {
      total: 30000000,
      spent: 18000000,
      currency: 'KRW'
    },
    currentStatus: 'UI/UX 디자인 검토 중',
    issues: ['디자인 피드백 반영 지연'],
    nextActions: ['디자인 팀과 미팅 예정']
  },
  {
    id: '3',
    projectId: 'proj-003',
    projectName: 'CRM 시스템 업그레이드',
    client: '글로벌테크',
    pm: '박책임',
    status: 'normal',
    statusLabel: '정상',
    progress: 80,
    deadline: new Date('2025-11-30'),
    daysRemaining: 68,
    budget: {
      total: 25000000,
      spent: 15000000,
      currency: 'KRW'
    },
    currentStatus: '테스트 단계 진행 중',
    nextActions: ['QA 테스트 완료', '사용자 교육 준비']
  }
];

export function IOSStyleDashboard({
  widgets: initialWidgets = [],
  onLayoutChange,
}: IOSStyleDashboardProps) {
  const isInitializedRef = useRef(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // 스토어 구독
  const widgets = useIOSDashboardStore(selectWidgets);
  const isEditMode = useIOSDashboardStore(selectEditMode);
  const isWiggling = useIOSDashboardStore(selectWiggling);
  
  // 스토어 액션들
  const setWidgets = useIOSDashboardStore(state => state.setWidgets);
  const updateWidget = useIOSDashboardStore(state => state.updateWidget);
  const removeWidget = useIOSDashboardStore(state => state.removeWidget);
  const addWidget = useIOSDashboardStore(state => state.addWidget);
  const enterEditMode = useIOSDashboardStore(state => state.enterEditMode);
  const exitEditMode = useIOSDashboardStore(state => state.exitEditMode);
  const moveWidget = useIOSDashboardStore(state => state.moveWidget);
  const selectWidget = useIOSDashboardStore(state => state.selectWidget);
  
  // 로컬 상태
  const [columns, setColumns] = useState(5);
  const [cellSize, setCellSize] = useState(120);
  const [gridGap, setGridGap] = useState(16); // 그리드 간격 상태 추가
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [currentResizeSize, setCurrentResizeSize] = useState<{ width: number; height: number } | null>(null);
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, col: 0, row: 0 });
  const [hoveredPosition, setHoveredPosition] = useState<{ col: number; row: number } | null>(null);
  const [draggedOverWidget, setDraggedOverWidget] = useState<string | null>(null);
  
  // 위치/크기 정보를 일관되게 동기화하는 헬퍼 함수
  const createConsistentPosition = useCallback((
    col: number,
    row: number,
    width: number,
    height: number
  ) => {
    return {
      gridColumnStart: col,
      gridColumnEnd: col + width,
      gridRowStart: row,
      gridRowEnd: row + height,
      gridColumn: `${col} / ${col + width}`,
      gridRow: `${row} / ${row + height}`,
      width: width,
      height: height,
    };
  }, []);

  // 위젯의 실제 경계를 계산하는 헬퍼 함수
  const getWidgetBounds = useCallback((widget: IOSStyleWidget) => {
    const width = widget.size?.width || widget.position.width || 2;
    const height = widget.size?.height || widget.position.height || 2;
    return {
      left: widget.position.gridColumnStart,
      right: widget.position.gridColumnStart + width,
      top: widget.position.gridRowStart,
      bottom: widget.position.gridRowStart + height,
      width,
      height,
    };
  }, []);

  // 빈 공간 찾기 함수
  const findEmptySpace = useCallback((width: number = 2, height: number = 1): { col: number; row: number } | null => {
    // 그리드의 모든 셀을 확인하여 빈 공간 찾기
    const maxRows = 10; // 최대 행 수
    
    for (let row = 1; row <= maxRows; row++) {
      for (let col = 1; col <= columns - width + 1; col++) {
        let isEmpty = true;
        
        // 해당 위치에 위젯이 있는지 확인
        for (const widget of widgets) {
          const bounds = getWidgetBounds(widget);
          
          const testLeft = col;
          const testRight = col + width;
          const testTop = row;
          const testBottom = row + height;
          
          // 두 영역이 겹치는지 확인
          if (!(testRight <= bounds.left || testLeft >= bounds.right || 
                testBottom <= bounds.top || testTop >= bounds.bottom)) {
            isEmpty = false;
            break;
          }
        }
        
        if (isEmpty) {
          return { col, row };
        }
      }
    }
    return null;
  }, [columns, widgets, getWidgetBounds]);
  
  // 반응형 그리드 계산
  useEffect(() => {
    const calculateGrid = () => {
      const width = window.innerWidth;
      const padding = 80; // 좌우 패딩 증가 (40 -> 80)
      const gap = 20; // 위젯 간격 증가 (16 -> 20)
      
      let newColumns = 5;
      if (width < 640) {
        newColumns = 2; // 모바일
      } else if (width < 768) {
        newColumns = 3; // 태블릿
      } else if (width < 1024) {
        newColumns = 4; // 중간
      } else if (width < 1280) {
        newColumns = 5; // 데스크톱
      } else {
        newColumns = 6; // 와이드
      }
      
      const availableWidth = Math.min(width - padding, 1400); // 최대 너비 제한
      const newCellSize = Math.floor((availableWidth - (newColumns - 1) * gap) / newColumns);
      
      setColumns(newColumns);
      setCellSize(Math.min(Math.max(newCellSize, 100), 200));
    };
    
    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);
  
  // 초기 위젯 설정
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    if (initialWidgets.length > 0) {
      setWidgets(initialWidgets);
    } else if (widgets.length === 0) {
      // 테스트 위젯 생성 - 초기 위치를 정확히 설정
      const testWidgets: IOSStyleWidget[] = [
        {
          id: 'widget_stats_1',
          type: 'stats',
          title: '통계 대시보드',
          position: {
            ...createConsistentPosition(1, 1, 2, 2),
          },
          size: { width: 2, height: 2 },
          data: mockStatsData,
        },
        {
          id: 'widget_chart_1',
          type: 'chart',
          title: '주간 트렌드 차트',
          position: {
            ...createConsistentPosition(3, 1, 3, 2),
          },
          size: { width: 3, height: 2 },
          data: mockChartData,
        },
        {
          id: 'widget_project_1',
          type: 'projectSummary',
          title: '프로젝트 요약',
          position: {
            ...createConsistentPosition(1, 3, 3, 2),
          },
          size: { width: 3, height: 2 },
          data: mockProjectData,
        },
        {
          id: 'widget_actions_1',
          type: 'quickActions',
          title: '빠른 작업',
          position: {
            ...createConsistentPosition(4, 3, 2, 1),
          },
          size: { width: 2, height: 1 },
        },
      ];
      
      setWidgets(testWidgets);
    }
    
    isInitializedRef.current = true;
    setIsMounted(true);
  }, [createConsistentPosition, setWidgets, widgets.length, initialWidgets]);

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

  
  // Long Press 감지 (편집 모드 진입)
  const handleLongPressStart = useCallback((e: React.MouseEvent | React.TouchEvent, widgetId: string) => {
    e.preventDefault();
    
    longPressTimerRef.current = setTimeout(() => {
      selectWidget(widgetId);
      enterEditMode();
      
      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 700); // 700ms Long Press
  }, [selectWidget, enterEditMode]);
  
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);
  
  // 위젯 충돌 검사 - 개선된 버전
  const checkCollision = useCallback((
    widget: IOSStyleWidget, 
    newCol: number, 
    newRow: number, 
    newWidth?: number, 
    newHeight?: number
  ): boolean => {
    const width = newWidth !== undefined ? newWidth : (widget.size?.width || widget.position.width || 2);
    const height = newHeight !== undefined ? newHeight : (widget.size?.height || widget.position.height || 2);
    
    // 그리드 경계 체크 - 더 정확한 계산
    if (newCol < 1 || newCol + width > columns + 1) return true;
    if (newRow < 1 || newRow > 20) return true; // 최대 20줄
    
    const newLeft = newCol;
    const newRight = newCol + width;
    const newTop = newRow;
    const newBottom = newRow + height;
    
    return widgets.some(w => {
      // 자기 자신은 제외
      if (w.id === widget.id) return false;
      
      const bounds = getWidgetBounds(w);
      
      // 겹침 체크 - 두 사각형이 겹치지 않는 조건 확인
      const noOverlap = newRight <= bounds.left || newLeft >= bounds.right || 
                        newBottom <= bounds.top || newTop >= bounds.bottom;
      
      return !noOverlap; // 겹치면 true 반환
    });
  }, [widgets, columns, getWidgetBounds]);

  // 위젯과 위젯 스왑 - 개선된 버전
  const swapWidgets = useCallback((widgetA: IOSStyleWidget, widgetB: IOSStyleWidget) => {
    // 스왑 전에 애니메이션을 위한 약간의 지연
    requestAnimationFrame(() => {
      const boundsA = getWidgetBounds(widgetA);
      const boundsB = getWidgetBounds(widgetB);
      
      // 각 위젯이 서로의 자리에 들어갈 수 있는지 확인
      const aCanFitInB = (boundsB.left + boundsA.width <= columns + 1);
      const bCanFitInA = (boundsA.left + boundsB.width <= columns + 1);
      
      // 두 위젯 모두 교환 가능한 경우에만 스왑
      if (!aCanFitInB || !bCanFitInA) {
        return; // 스왑 불가
      }

      // A를 B 자리로
      updateWidget(widgetA.id, {
        position: {
          ...widgetA.position,
          ...createConsistentPosition(
            boundsB.left,
            boundsB.top,
            boundsA.width,
            boundsA.height
          ),
        },
        size: { width: boundsA.width, height: boundsA.height },
      });

      // B를 A 자리로
      updateWidget(widgetB.id, {
        position: {
          ...widgetB.position,
          ...createConsistentPosition(
            boundsA.left,
            boundsA.top,
            boundsB.width,
            boundsB.height
          ),
        },
        size: { width: boundsB.width, height: boundsB.height },
      });
    });
  }, [updateWidget, columns, getWidgetBounds, createConsistentPosition]);

  // 위젯 드래그 핸들러 (위젯 전체 또는 드래그 버튼에서 사용)
  const handleDragStart = useCallback((e: React.MouseEvent, widget: IOSStyleWidget, isFromHandle: boolean = false) => {
    // 편집 모드가 아니면 무시
    if (!isEditMode && !isFromHandle) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const bounds = getWidgetBounds(widget);
    const startCol = bounds.left;
    const startRow = bounds.top;
    const originalPosition = { ...widget.position };
    const originalSize = { width: bounds.width, height: bounds.height };
    
    setDraggingWidget(widget.id);
    setDragStart({ x: startX, y: startY, col: startCol, row: startRow });
    
    // 드래그 중에 임시 위치 저장
    let lastValidPosition = { col: startCol, row: startRow };
    let currentTargetWidgetId: string | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // 그리드 셀 크기 기준으로 이동 거리 계산
      const colDelta = deltaX / cellSize;
      const rowDelta = deltaY / cellSize;
      
      // 스냅 임계값 조정 (0.5 = 절반 이상 움직여야 다음 셀로 이동)
      const snappedCol = Math.round(startCol + colDelta);
      const snappedRow = Math.round(startRow + rowDelta);
      
      // 경계 체크 - 위젯이 그리드를 벗어나지 않도록 제한
      const maxCol = columns - bounds.width + 1;
      const desiredCol = Math.max(1, Math.min(maxCol, snappedCol));
      const desiredRow = Math.max(1, snappedRow);
      
      setHoveredPosition({ col: desiredCol, row: desiredRow });
      
      // 다른 위젯과의 겹침 확인
      const targetWidget = widgets.find(w => {
        if (w.id === widget.id) return false;
        
        const wBounds = getWidgetBounds(w);
        
        const dragLeft = desiredCol;
        const dragRight = desiredCol + bounds.width;
        const dragTop = desiredRow;
        const dragBottom = desiredRow + bounds.height;
        
        // 두 영역이 겹치는지 확인
        const horizontalOverlap = Math.max(0, Math.min(dragRight, wBounds.right) - Math.max(dragLeft, wBounds.left));
        const verticalOverlap = Math.max(0, Math.min(dragBottom, wBounds.bottom) - Math.max(dragTop, wBounds.top));
        
        if (horizontalOverlap === 0 || verticalOverlap === 0) return false;
        
        const overlapArea = horizontalOverlap * verticalOverlap;
        const draggedArea = bounds.width * bounds.height;
        const targetArea = wBounds.width * wBounds.height;
        
        // 드래그 중인 위젯의 30% 이상이 타겟과 겹치거나
        // 타겟 위젯의 30% 이상이 드래그 중인 위젯과 겹칠 때
        return (overlapArea >= draggedArea * 0.3) || (overlapArea >= targetArea * 0.3);
      });
      
      if (targetWidget) {
        currentTargetWidgetId = targetWidget.id;
        setDraggedOverWidget(targetWidget.id);
      } else {
        currentTargetWidgetId = null;
        setDraggedOverWidget(null);
      }
      
      // 위치 업데이트 (시각적 피드백용)
      if (desiredCol !== widget.position.gridColumnStart || desiredRow !== widget.position.gridRowStart) {
        // 그리드 범위 내에서만 업데이트
        if (desiredCol > 0 && desiredCol <= maxCol && desiredRow > 0) {
          updateWidget(widget.id, {
            position: {
              ...widget.position,
              ...createConsistentPosition(desiredCol, desiredRow, bounds.width, bounds.height),
            },
            size: { width: bounds.width, height: bounds.height },
          });
          lastValidPosition = { col: desiredCol, row: desiredRow };
        }
      }
    };
    
    const handleMouseUp = () => {
      // 현재 타겟 위젯 찾기
      const targetWidget = widgets.find(w => w.id === currentTargetWidgetId);
      
      if (targetWidget && currentTargetWidgetId) {
        // 스왑 애니메이션과 함께 위치 교환
        swapWidgets(widget, targetWidget);
      } else {
        // 빈 공간으로 이동 - 충돌 체크
        const finalCol = lastValidPosition.col;
        const finalRow = lastValidPosition.row;
        
        if (checkCollision(widget, finalCol, finalRow, bounds.width, bounds.height)) {
          // 충돌 시 원위치로 복귀
          updateWidget(widget.id, {
            position: originalPosition,
            size: originalSize,
          });
        } else {
          // 최종 위치 확정 시 그리드 범위 재확인
          const maxColForWidget = columns - bounds.width + 1;
          
          if (finalCol > maxColForWidget) {
            // 그리드를 벗어난 경우 조정
            updateWidget(widget.id, {
              position: {
                ...widget.position,
                ...createConsistentPosition(maxColForWidget, finalRow, bounds.width, bounds.height),
              },
              size: { width: bounds.width, height: bounds.height },
            });
          } else {
            // 정상 위치 업데이트
            updateWidget(widget.id, {
              position: {
                ...widget.position,
                ...createConsistentPosition(finalCol, finalRow, bounds.width, bounds.height),
              },
              size: { width: bounds.width, height: bounds.height },
            });
          }
        }
      }
      
      setDraggingWidget(null);
      setHoveredPosition(null);
      setDraggedOverWidget(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (onLayoutChange) {
        onLayoutChange(widgets);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [cellSize, columns, updateWidget, widgets, onLayoutChange, checkCollision, isEditMode, swapWidgets, getWidgetBounds, createConsistentPosition]);
  
  // 위젯 크기 조정 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent, widget: IOSStyleWidget) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const bounds = getWidgetBounds(widget);
    const startWidth = bounds.width;
    const startHeight = bounds.height;
    
    setResizingWidget(widget.id);
    setResizeStart({
      x: startX,
      y: startY,
      width: startWidth,
      height: startHeight,
    });
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // 드래그 거리를 그리드 셀 단위로 변환
      const colDelta = Math.round(deltaX / cellSize);
      const rowDelta = Math.round(deltaY / cellSize);
      
      // 새로운 크기 계산 (최소 1x1, 최대는 그리드 경계까지)
      const desiredWidth = startWidth + colDelta;
      const desiredHeight = startHeight + rowDelta;
      
      // 그리드 경계 내로 자동 제한
      const maxWidth = columns - bounds.left + 1;
      const maxHeight = 10; // 최대 10줄로 제한
      
      // 최소 1, 최대는 그리드 경계까지로 제한
      const newWidth = Math.max(1, Math.min(maxWidth, desiredWidth));
      const newHeight = Math.max(1, Math.min(maxHeight, desiredHeight));
      
      // 그리드 경계 재확인
      if (bounds.left + newWidth > columns + 1) return;
      
      // 크기가 변경되면서 다른 위젯과 겹치는지 확인
      const hasCollision = checkCollision(widget, bounds.left, bounds.top, newWidth, newHeight);
      
      // 현재 크기 정보 업데이트 (시각적 피드백용)
      setCurrentResizeSize({ width: newWidth, height: newHeight });
      
      if (!hasCollision && 
          (bounds.width !== newWidth || bounds.height !== newHeight)) {
        updateWidget(widget.id, {
          size: { width: newWidth, height: newHeight },
          position: {
            ...widget.position,
            ...createConsistentPosition(bounds.left, bounds.top, newWidth, newHeight),
          },
        });
      }
    };
    
    const handleMouseUp = () => {
      // 최종 크기 확정
      const updatedWidget = widgets.find(w => w.id === widget.id);
      if (updatedWidget) {
        const finalBounds = getWidgetBounds(updatedWidget);
        updateWidget(widget.id, {
          size: { width: finalBounds.width, height: finalBounds.height },
          position: {
            ...updatedWidget.position,
            ...createConsistentPosition(finalBounds.left, finalBounds.top, finalBounds.width, finalBounds.height),
          },
        });
      }
      
      setResizingWidget(null);
      setCurrentResizeSize(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (onLayoutChange) {
        onLayoutChange(widgets);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [cellSize, columns, updateWidget, widgets, onLayoutChange, checkCollision, getWidgetBounds, createConsistentPosition]);
  
  // 위젯 추가 핸들러
  const handleAddWidget = useCallback(() => {
    const emptySpace = findEmptySpace(2, 2);
    if (!emptySpace) {
      alert('위젯을 추가할 공간이 없습니다.');
      return;
    }
    
    const newWidget: IOSStyleWidget = {
      id: `widget_new_${Date.now()}`,
      type: 'stats',
      title: '새 위젯',
      position: {
        ...createConsistentPosition(emptySpace.col, emptySpace.row, 2, 2),
      },
      size: { width: 2, height: 2 },
      data: mockStatsData,
    };
    
    addWidget(newWidget);
  }, [addWidget, findEmptySpace, createConsistentPosition]);
  
  // 위젯 렌더링
  const renderWidget = (widget: IOSStyleWidget) => {
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
          projects={widget.data || mockProjectData}
          lang="ko"
          onProjectClick={(project) => console.log('Project clicked:', project)}
        />;
      default:
        return (
          <Card className="h-full p-4">
            <p className="text-muted-foreground">위젯: {widget.type}</p>
          </Card>
        );
    }
  };
  
  if (!isMounted) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  return (
    <div className="w-full">
      {/* 툴바 */}
      <div className="flex items-center justify-between px-6 sm:px-8 lg:px-12 py-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">대시보드</h2>
          <p className="text-muted-foreground hidden sm:block">
            프로젝트와 비즈니스를 한눈에 확인하세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button variant="outline" size="sm" onClick={handleAddWidget}>
              <Plus className="h-4 w-4 mr-2" />
              위젯 추가
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            템플릿
          </Button>
          <Button 
            variant={isEditMode ? "default" : "outline"} 
            size="sm"
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
      
      {/* 위젯 그리드 */}
      <div className="px-6 sm:px-8 lg:px-12 pb-12">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridAutoRows: `${cellSize}px`,
            gap: `${gridGap}px`,
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                "relative group",
                draggingWidget === widget.id && "z-50 transition-none",
                draggingWidget !== widget.id && draggingWidget && "transition-all duration-300 ease-in-out",
                !draggingWidget && "transition-all duration-200 ease-out",
                resizingWidget === widget.id && "z-50",
                draggedOverWidget === widget.id && "scale-95 ring-2 ring-primary/50 bg-primary/5"
              )}
              style={{
                gridColumnStart: widget.position.gridColumnStart,
                gridColumnEnd: widget.position.gridColumnEnd || (widget.position.gridColumnStart + (widget.position.width || widget.size?.width || 2)),
                gridRowStart: widget.position.gridRowStart,
                gridRowEnd: widget.position.gridRowEnd || (widget.position.gridRowStart + (widget.position.height || widget.size?.height || 2)),
              }}
            >
                      <div className="relative">
                        {/* 편집 컨트롤 (위글 애니메이션 제외) */}
                        {isEditMode && (
                          <div className="absolute -inset-2 z-10 pointer-events-none">
                            {/* 삭제 버튼 */}
                            <motion.button
                              className="absolute -top-1 -left-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-auto"
                              variants={deleteButtonAnimation}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => removeWidget(widget.id)}
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                            
                            {/* 드래그 핸들 */}
                            <Button
                              size="icon"
                              variant="secondary"
                              className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-lg pointer-events-auto cursor-grab active:cursor-grabbing"
                              onMouseDown={(e) => handleDragStart(e, widget, true)}
                            >
                              <Grip className="h-3 w-3" />
                            </Button>
                            
                            {/* 크기 조절 핸들 */}
                            <motion.button
                              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg pointer-events-auto cursor-se-resize"
                              variants={resizeHandleAnimation}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              onMouseDown={(e) => handleResizeStart(e, widget)}
                            >
                              <Maximize2 className="h-3 w-3" />
                            </motion.button>
                          </div>
                        )}
                        
                        {/* 위젯 콘텐츠 (위글 애니메이션 적용) */}
                        <motion.div
                          variants={wiggleAnimation}
                          animate={isWiggling && isEditMode ? "wiggle" : "initial"}
                          onMouseDown={(e) => {
                            if (isEditMode) {
                              // 편집 모드에서는 위젯 전체를 드래그 가능
                              handleDragStart(e, widget, false);
                            } else {
                              // 일반 모드에서는 길게 눌러서 편집 모드 진입
                              handleLongPressStart(e, widget.id);
                            }
                          }}
                          onMouseUp={handleLongPressEnd}
                          onMouseLeave={handleLongPressEnd}
                          onTouchStart={(e) => !isEditMode && handleLongPressStart(e, widget.id)}
                          onTouchEnd={handleLongPressEnd}
                          className={cn(
                            isEditMode && "cursor-move",
                            draggingWidget === widget.id && "cursor-grabbing"
                          )}
                        >
                          <div className={cn(
                            "h-full transition-all duration-200",
                            isEditMode && "scale-95",
                            draggingWidget === widget.id && "shadow-2xl opacity-80 scale-105"
                          )}>
                            {renderWidget(widget)}
                          </div>
                        </motion.div>
                        
                        {/* 크기 조절 중 크기 정보 표시 */}
                        {resizingWidget === widget.id && currentResizeSize && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap z-50">
                            {currentResizeSize.width} × {currentResizeSize.height}
                          </div>
                        )}
                      </div>
                    </div>
          ))}
          
          {/* 드래그 중 플레이스홀더 표시 - 개선된 버전 */}
          {draggingWidget && hoveredPosition && (() => {
            const draggedWidget = widgets.find(w => w.id === draggingWidget);
            if (!draggedWidget) return null;
            
            // 드래그 중인 위젯이 이미 hoveredPosition에 있으면 플레이스홀더 표시 안함
            if (draggedWidget.position.gridColumnStart === hoveredPosition.col && 
                draggedWidget.position.gridRowStart === hoveredPosition.row) {
              return null;
            }
            
            // 타겟 위젯과 겹치는 경우 플레이스홀더 대신 스왑 인디케이터 표시
            if (draggedOverWidget) {
              return null;
            }
            
            return (
              <div
                className="border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 pointer-events-none animate-pulse"
                style={{
                  gridColumnStart: hoveredPosition.col,
                  gridColumnEnd: hoveredPosition.col + (draggedWidget.size?.width || 2),
                  gridRowStart: hoveredPosition.row,
                  gridRowEnd: hoveredPosition.row + (draggedWidget.size?.height || 2),
                }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}