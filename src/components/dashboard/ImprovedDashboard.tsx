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
  Layers,
  ArrowUp,
  RotateCcw
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
import WeatherWidget from '@/components/ui/widgets/WeatherWidget';
import { useResponsiveCols } from '@/components/ui/use-responsive-cols';
import { getDefaultWidgetSize } from '@/lib/dashboard/widget-defaults';
import { createDefaultWidgets } from './utils/defaultWidgets';

interface ImprovedDashboardProps {
  initialWidgets?: ImprovedWidget[];
  callbacks?: WidgetCallbacks;
  className?: string;
  hideToolbar?: boolean;
  isCompactControlled?: boolean;
}

export function ImprovedDashboard({
  initialWidgets = [],
  callbacks,
  className,
  hideToolbar = false,
  isCompactControlled
}: ImprovedDashboardProps) {
  // 스토어 구독
  const isInitialized = useImprovedDashboardStore((state) => state.isInitialized);
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
    optimizeWidgetLayout,
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
    resetStore,
  } = useImprovedDashboardStore();
  
  // 로컬 상태
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ width: 120, height: 120 });
  const [isCompact, setIsCompact] = useState(isCompactControlled ?? true);
  
  // 초기화
  useEffect(() => {
    // 스토어 초기화가 완료되지 않았으면 대기
    if (!isInitialized) {
      return;
    }

    // 이미 위젯이 있으면 초기화하지 않음 (Supabase/LocalStorage에서 로드됨)
    if (widgets.length > 0) {
      return;
    }

    // 신규 사용자의 기본 위젯 배열 생성
    const defaultWidgets = createDefaultWidgets();

    // 위젯 추가
    defaultWidgets.forEach((w) => addWidget(w));
  }, [isInitialized, widgets.length, initialWidgets, addWidget]);

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
  }, [widgets.length, setWidgets]);

  // 반응형 그리드 계산
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const calculateGrid = () => {
      if (!containerRef.current) return;

      const currentConfig = configRef.current;

      // 모바일에서는 viewport width 기준, 데스크톱에서는 container width 기준
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      const containerWidth = containerRef.current.clientWidth;

      // 모바일(768px 미만)에서는 viewport 기준 + 패딩 제외 (좌우 24px)
      // 데스크톱에서는 container 기준
      const availableWidth = viewportWidth < 768
        ? viewportWidth - 48  // 모바일: viewport - 좌우 패딩(24px * 2)
        : containerWidth;

      const cellWidth = Math.floor(
        (availableWidth - (currentConfig.cols - 1) * currentConfig.gap) / currentConfig.cols
      );

      // 화면 크기에 따라 최소 셀 크기 동적 조정
      // 모바일 (480px 미만): 40px, 데스크톱 (480px 이상): 60px
      const minCellSize = viewportWidth < 480 ? 40 : 60;
      const maxCellSize = 200;

      const finalCellWidth = Math.max(minCellSize, Math.min(maxCellSize, cellWidth));

      setCellSize(prev => {
        const newSize = {
          width: finalCellWidth,
          height: currentConfig.rowHeight
        };

        // 값이 변경되지 않았으면 이전 상태 유지하여 무한 루프 방지
        if (prev.width === newSize.width && prev.height === newSize.height) {
          return prev;
        }

        return newSize;
      });
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  // ESC 키 처리는 대시보드 페이지에서 통합 관리
  // (편집 모드와 사이드바를 동시에 닫기 위해)

  // Compact 레이아웃 적용 (세로 무한 확장 모드에서는 비활성화)
  useEffect(() => {
    const compact = isCompactControlled ?? isCompact;
    // maxRows가 정의되지 않았으면 무한 확장 모드이므로 자동 압축 비활성화
    const shouldCompact = compact && config.compactType && config.maxRows !== undefined;
    if (shouldCompact && config.compactType) {
      compactWidgets(config.compactType as 'vertical' | 'horizontal');
    }
  }, [isCompactControlled, isCompact, config.compactType, config.maxRows, compactWidgets]);

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

      // 세로 무한 확장 모드에서는 자동 압축 비활성화
      // (자동 압축이 위젯을 위로 밀어내는 것을 방지)
      const compact = isCompactControlled ?? isCompact;
      const shouldCompact = compact && config.compactType && config.maxRows !== undefined;
      if (shouldCompact && config.compactType) {
        compactWidgets(config.compactType as 'vertical' | 'horizontal');
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
        w: Math.max(1, Math.min(config.cols - startPosition.x, startPosition.w + dx)),
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

      // 세로 무한 확장 모드에서는 자동 압축 비활성화
      // (자동 압축이 위젯을 위로 밀어내는 것을 방지)
      const compact = isCompactControlled ?? isCompact;
      const shouldCompact = compact && config.compactType && config.maxRows !== undefined;
      if (shouldCompact && config.compactType) {
        compactWidgets(config.compactType as 'vertical' | 'horizontal');
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

  // 레이아웃 초기화 (위젯 종류와 위치를 디폴트값으로 리셋)
  const handleResetLayout = useCallback(async () => {
    // 확인 다이얼로그
    if (!confirm('위젯 배치를 초기 상태로 되돌리시겠습니까?\n(위젯 내부 데이터는 유지됩니다)')) {
      return;
    }

    // 기존 위젯 백업 (롤백용)
    const previousWidgets = widgets;

    // 1. 기본 위젯 생성 (새로운 6개 위젯)
    const defaultWidgets = createDefaultWidgets();

    // 2. 모바일 최적화: 저장 전에 레이아웃 최적화 적용
    const { optimizeLayout } = await import('@/lib/dashboard/grid-utils');
    const positions = defaultWidgets.map(w => w.position);
    const optimizedPositions = optimizeLayout(positions, config);

    // 최적화된 위치로 위젯 업데이트
    const optimizedWidgets = defaultWidgets.map((widget, index) => ({
      ...widget,
      position: optimizedPositions[index],
    }));

    console.log('🎯 위젯 최적화 완료:', {
      before: defaultWidgets.map(w => `${w.type}(w:${w.position.w})`),
      after: optimizedWidgets.map(w => `${w.type}(w:${w.position.w})`)
    });

    // 3. Zustand 스토어에 최적화된 위젯 반영 (UI 즉시 업데이트)
    setWidgets(optimizedWidgets);

    // 4. Storage에 최적화된 위젯 저장 (LocalStorage + Supabase)
    try {
      const { dashboardService } = await import('@/lib/storage');

      // Legacy Zustand persist 키 강제 삭제 (오래된 데이터 방지)
      if (typeof window !== 'undefined' && window.localStorage) {
        const legacyKey = 'weave-dashboard-layout';
        const hadLegacy = window.localStorage.getItem(legacyKey) !== null;
        window.localStorage.removeItem(legacyKey);
        if (hadLegacy) {
          console.log('🗑️ Legacy dashboard key removed:', legacyKey);
        }
      }

      // 현재 config를 유지하면서 최적화된 위젯 저장
      await dashboardService.save(optimizedWidgets, config);

      console.log('✅ 위젯 초기화 완료: 최적화된 6개 위젯 저장됨', {
        widgets: optimizedWidgets.map(w => `${w.type}(w:${w.position.w})`)
      });

      alert('위젯 배치가 초기 상태로 되돌려졌습니다.');
    } catch (error) {
      console.error('❌ 위젯 초기화 실패:', error);

      // 실패 시 이전 상태로 롤백
      setWidgets(previousWidgets);

      alert(
        '위젯 초기화 중 문제가 발생했습니다.\n' +
        (error instanceof Error ? error.message : '알 수 없는 오류') +
        '\n\n다시 시도해주세요.'
      );
    }
  }, [widgets, setWidgets, config]);

  // 드래그 오버 핸들러 (사이드바에서 대시보드로)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    // 위젯 타입이 있는지 확인 (사이드바에서 드래그 중)
    if (e.dataTransfer.types.includes('widgetType')) {
      e.dataTransfer.dropEffect = 'copy';

      // 드롭 위치 미리보기 (선택사항)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 그리드 좌표로 변환
        const gridX = Math.floor(x / (cellSize.width + config.gap));
        const gridY = Math.floor(y / (cellSize.height + config.gap));

        // TODO: 드롭 위치 미리보기 UI 추가 가능
      }
    }
  }, [cellSize, config.gap]);

  // 드롭 핸들러 (사이드바에서 대시보드로)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    const widgetType = e.dataTransfer.getData('widgetType') as ImprovedWidget['type'];
    if (!widgetType) return;

    // 위젯 타입별 기본 크기 가져오기
    const defaultSize = getDefaultWidgetSize(widgetType);

    // 드롭 위치 계산
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 그리드 좌표로 변환
      const gridX = Math.floor(x / (cellSize.width + config.gap));
      const gridY = Math.floor(y / (cellSize.height + config.gap));

      // 드롭 위치에서 시작하여 빈 공간 찾기
      let position: GridPosition | null = null;

      // 먼저 드롭 위치에 배치 시도
      const dropPosition = {
        x: Math.max(0, Math.min(config.cols - defaultSize.width, gridX)),
        y: Math.max(0, gridY),
        w: defaultSize.width,
        h: defaultSize.height
      };

      // 충돌 검사
      const hasCollision = widgets.some(w =>
        !(dropPosition.x + dropPosition.w <= w.position.x ||
          dropPosition.x >= w.position.x + w.position.w ||
          dropPosition.y + dropPosition.h <= w.position.y ||
          dropPosition.y >= w.position.y + w.position.h)
      );

      if (!hasCollision) {
        position = dropPosition;
      } else {
        // 충돌이 있으면 가장 가까운 빈 공간 찾기
        position = findSpaceForWidget(defaultSize.width, defaultSize.height);
      }

      if (!position) {
        alert('위젯을 추가할 공간이 없습니다.');
        return;
      }

      // 위젯 타입별 제목 설정
      const widgetTitles: Record<ImprovedWidget['type'], string> = {
        calendar: '캘린더',
        todoList: '할 일 목록',
        projectSummary: '프로젝트 현황',
        kpiMetrics: '핵심 성과 지표',
        taxDeadline: '세무 일정',
        revenueChart: '매출 차트',
        taxCalculator: '세금 계산기',
        recentActivity: '최근 활동',
        weather: '날씨 정보',
        custom: '새 위젯'
      };

      // 새 위젯 생성
      const newWidget: ImprovedWidget = {
        id: `widget_${widgetType}_${Date.now()}`,
        type: widgetType,
        title: widgetTitles[widgetType],
        position,
        minW: defaultSize.minWidth || 2,
        minH: defaultSize.minHeight || 2,
        maxW: defaultSize.maxWidth,
        maxH: defaultSize.maxHeight,
      };

      // 위젯 추가
      addWidget(newWidget);

      // 콜백 호출 - onWidgetAdd가 없으므로 제거
      // callbacks?.onWidgetAdd?.(newWidget);
    }
  }, [widgets, cellSize, config.cols, config.gap, findSpaceForWidget, addWidget, callbacks]);

  // 위젯 렌더링
  const renderWidget = useCallback((widget: ImprovedWidget) => {
    switch (widget.type) {
      case 'projectSummary':
        return <ProjectSummaryWidget
          title={widget.title}
          lang="ko"
          // projects prop 제거 - useProjectSummary 훅으로 자체 데이터 로드
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
          events={widget.data} // undefined일 경우 자체적으로 로컬스토리지에서 로드
          showToday={true}
          gridSize={{ w: widget.position.w, h: widget.position.h }}
        />;
      case 'kpiMetrics':
        return <KPIWidget
          title={widget.title}
          lang="ko"
          variant={widget.position.w <= 3 ? 'compact' : 'detailed'}
          // metrics prop 제거 - useKPIMetrics 훅으로 자체 데이터 로드
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
          // RevenueChartWidget uses useRevenueChart hook for self-loading
        />;
      case 'recentActivity':
        return <RecentActivityWidget
          title={widget.title}
          lang="ko"
          maxItems={10}
          showFilter={true}
          // RecentActivityWidget uses useRecentActivity hook for self-loading
        />;
      case 'weather':
        return <WeatherWidget
          title={widget.title}
          location={widget.data?.location || '서울'}
          units="celsius"
          showForecast={true}
          maxForecastDays={5}
          updateInterval={30}
          useRealData={false}
          lang="ko"
          gridSize={{ w: widget.position.w, h: widget.position.h }}
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
  // cols 변경 시 자동으로 위젯 위치 최적화
  const colsRef = useRef(config.cols);
  useEffect(() => {
    colsRef.current = config.cols;
  }, [config.cols]);

  const handleColsChange = useCallback((newCols: number) => {
    const oldCols = colsRef.current;
    setColumns(newCols);

    // cols가 실제로 변경되었고 위젯이 있을 때만 최적화 수행
    if (oldCols !== newCols && widgets.length > 0) {
      // 약간의 지연을 두어 setColumns가 먼저 적용되도록 함
      setTimeout(() => {
        optimizeWidgetLayout();
      }, 100);
    }
  }, [setColumns, optimizeWidgetLayout, widgets.length]);

  useResponsiveCols(containerRef as React.RefObject<HTMLElement>, {
    onChange: handleColsChange,
    initialCols: config.cols
  });

  // 컨테이너 최소 높이 동적 계산 (세로 무한 확장 지원)
  const containerMinHeight = useMemo(() => {
    if (widgets.length === 0) {
      // 위젯이 없을 때는 최소 3행 높이 제공
      return 3 * (config.rowHeight + config.gap);
    }

    // 모든 위젯의 최대 Y + H 위치 계산
    const maxY = Math.max(...widgets.map(w => w.position.y + w.position.h));

    // 최대 위치 + 여유 공간 3행
    return (maxY + 3) * (config.rowHeight + config.gap);
  }, [widgets, config.rowHeight, config.gap]);

  return (
    <div className={cn("w-full", className)}>
      {/* 툴바 - hideToolbar가 false이고 편집 모드일 때만 표시 */}
      {!hideToolbar && isEditMode && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-4">
          <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleAddWidget} className="w-full md:flex-none md:min-w-[140px]">
              <Plus className="h-4 w-4 mr-2" />
              {getDashboardText.addWidget('ko')}
            </Button>
            <Button
              size="sm"
              variant={isCompact ? "default" : "outline"}
              onClick={() => setIsCompact(!isCompact)}
              className="w-full md:flex-none md:min-w-[140px]"
            >
              <Layers className="h-4 w-4 mr-2" />
              {getDashboardText.autoLayout('ko')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => compactWidgets('vertical')}
              title="위젯들을 상단으로 정렬합니다"
              className="w-full md:flex-none md:min-w-[140px]"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              {getDashboardText.verticalAlign('ko')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => optimizeWidgetLayout()}
              title="빈 공간을 최소화하여 위젯을 최적 배치합니다"
              className="w-full md:flex-none md:min-w-[140px]"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              {getDashboardText.optimizeLayout('ko')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetLayout}
              title="위젯 배치를 초기 상태로 되돌립니다"
              className="w-full md:flex-none md:min-w-[140px]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {getDashboardText.resetLayout('ko')}
            </Button>
          </div>

          <Button
            size="sm"
            variant="default"
            onClick={async () => {
              // 편집 완료 시 명시적으로 저장 후 편집 모드 종료
              try {
                const { dashboardService } = await import('@/lib/storage');
                const currentState = useImprovedDashboardStore.getState();
                await dashboardService.save(currentState.widgets, currentState.config);
                console.log('✅ Dashboard saved successfully');

                // 저장 성공 후 편집 모드 종료
                exitEditMode();
              } catch (error) {
                console.error('❌ Failed to save dashboard:', error);
                alert('대시보드 저장에 실패했습니다.\n' + (error instanceof Error ? error.message : '알 수 없는 오류'));
                // 저장 실패 시 편집 모드를 유지하여 사용자가 재시도할 수 있도록 함
              }
            }}
            className="w-full md:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {getDashboardText.complete('ko')}
          </Button>
        </div>
      )}

      {/* 그리드 컨테이너 - 드롭 존으로 사용 */}
      <div
        ref={containerRef}
        className="relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          // 동적 최소 높이 - 위젯 배치에 따라 자동 확장
          minHeight: `${containerMinHeight}px`,
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
                {/* 편집 컨트롤 - 가장 먼저 렌더링하여 최상위 레이어 */}
                {isEditMode && !widget.static && (
                  <div className="absolute -inset-2 z-50 pointer-events-none">
                    {/* 삭제 버튼 */}
                    <button
                      data-delete-button
                      className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-auto hover:bg-red-600 hover:scale-110 active:scale-90 transition-transform"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeWidget(widget.id);
                        callbacks?.onWidgetRemove?.(widget.id);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* 크기 조절 핸들 */}
                    {(widget.isResizable !== false) && (
                      <button
                        data-resize-handle
                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg pointer-events-auto cursor-se-resize hover:bg-primary/90 hover:scale-110 transition-transform"
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
                    "h-full transition-all duration-200 relative",
                    isEditMode && !widget.static && "scale-95",
                    editState.draggedWidget?.id === widget.id && "opacity-80 cursor-grabbing"
                  )}
                  onClick={(e) => !isEditMode && callbacks?.onWidgetClick?.(widget, e.nativeEvent)}
                >
                  {/* 편집 모드일 때 위젯 전체 드래그 가능 오버레이 */}
                  {isEditMode && !widget.static && widget.isDraggable !== false && (
                    <div
                      data-drag-handle
                      className="absolute inset-0 z-20 cursor-move"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => {
                        // 리사이즈 핸들이나 삭제 버튼이 아닌 경우에만 드래그 시작
                        const target = e.target as HTMLElement;
                        const isResizeHandle = target.closest('[data-resize-handle]');
                        const isDeleteButton = target.closest('[data-delete-button]');
                        const isRemoveHandle = target.closest('[data-remove-handle]');

                        if (!isResizeHandle && !isDeleteButton && !isRemoveHandle) {
                          handleDragStart(e, widget);
                        }
                      }}
                    />
                  )}

                  {/* 편집 모드 상단 헤더 - 아이콘과 제거 핸들만 */}
                  {isEditMode && !widget.static && widget.isDraggable !== false && (
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100/50 to-transparent dark:from-gray-800/50 z-30 flex items-center justify-between px-2 pointer-events-none">
                      {/* 이동 아이콘 (시각적 힌트) */}
                      <div className="flex-1 h-full flex items-center justify-center">
                        <Grip className="h-4 w-4 text-gray-400" />
                      </div>

                      {/* 제거 핸들 (오른쪽) - HTML5 드래그 */}
                      <div
                        data-remove-handle
                        className="h-6 w-6 cursor-grab hover:bg-red-100 rounded flex items-center justify-center transition-colors pointer-events-auto"
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation(); // 이동 핸들과 충돌 방지
                          // HTML5 드래그 시작 (사이드바로 제거용)
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('widgetId', widget.id);
                          e.dataTransfer.setData('widgetType', widget.type);

                          // 드래그 이미지 설정
                          const dragImage = document.createElement('div');
                          dragImage.className = 'p-3 rounded-lg shadow-lg bg-white border-2 border-dashed border-red-400';
                          dragImage.innerHTML = `<div class="flex items-center gap-2"><span>🗑️ ${widget.title}</span></div>`;
                          dragImage.style.position = 'fixed';
                          dragImage.style.top = '-1000px';
                          dragImage.style.left = '-1000px';
                          document.body.appendChild(dragImage);
                          e.dataTransfer.setDragImage(dragImage, 50, 20);
                          setTimeout(() => document.body.removeChild(dragImage), 0);
                        }}
                        onDragEnd={() => {
                          // 드래그 종료 시 정리
                        }}
                        title="사이드바로 드래그하여 제거"
                      >
                        <span className="text-xs">🗑️</span>
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
