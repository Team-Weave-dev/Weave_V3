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
  Layers,
  Move
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
import { StatsWidget } from './widgets/StatsWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { ProjectSummaryWidget } from './widgets/ProjectSummaryWidget';

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
    resizeWidget,
    swapWidgets,
    compactWidgets,
    findSpaceForWidget,
    checkCollision,
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
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 초기화
  useEffect(() => {
    if (initialWidgets.length > 0 && widgets.length === 0) {
      setWidgets(initialWidgets);
    } else if (widgets.length === 0) {
      // 테스트 위젯 생성
      const testWidgets: ImprovedWidget[] = [
        {
          id: 'widget_stats_1',
          type: 'stats',
          title: '통계 대시보드',
          position: { x: 0, y: 0, w: 4, h: 2 },
          data: mockStatsData,
          minW: 2,
          minH: 1,
          maxW: 6,
        },
        {
          id: 'widget_chart_1',
          type: 'chart',
          title: '주간 트렌드',
          position: { x: 4, y: 0, w: 4, h: 2 },
          data: mockChartData,
          minW: 3,
          minH: 2,
        },
        {
          id: 'widget_project_1',
          type: 'projectSummary',
          title: '프로젝트 현황',
          position: { x: 8, y: 0, w: 4, h: 3 },
          minW: 3,
          minH: 2,
        },
        {
          id: 'widget_actions_1',
          type: 'quickActions',
          title: '빠른 작업',
          position: { x: 0, y: 2, w: 4, h: 1 },
          minW: 2,
          minH: 1,
        },
      ];
      setWidgets(testWidgets);
    }
  }, [initialWidgets, widgets.length, setWidgets]);
  
  // 반응형 그리드 계산
  useEffect(() => {
    const calculateGrid = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const padding = config.gap * 2;
      const availableWidth = containerWidth - padding;
      
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
    const startPosition = { ...widget.position };
    
    startDragging(widget.id, startPosition);
    console.log('🎯 드래그 시작:', widget.id, startPosition);
    
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
      
      console.log('📍 드래그 중:', { 
        deltaX, 
        deltaY, 
        dx, 
        dy, 
        newPosition,
        cellSize,
        gap: config.gap,
        gridCellWidth,
        gridCellHeight
      });
      
      // 실시간으로 위치 업데이트 (시각적 피드백)
      updateDragging(newPosition);
      
      // 충돌 체크 및 스왑 감지
      if (config.preventCollision) {
        const targetWidget = widgets.find(w => {
          if (w.id === widget.id) return false;
          const overlapRatio = getOverlapRatio(newPosition, w.position);
          return overlapRatio > 0.3; // 30% 이상 겹치면 스왑 대상
        });
        
        if (targetWidget) {
          setDragOverWidget(targetWidget.id);
          // 스왑 가능 여부 체크
          if (canSwapWidgets(newPosition, targetWidget.position, config)) {
            // 시각적 피드백
            setHoveredPosition(targetWidget.position);
          }
        } else {
          setDragOverWidget(null);
          setHoveredPosition(null);
        }
      }
      callbacks?.onDrag?.(widget, newPosition, e);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      const finalPosition = editState.draggedWidget?.currentPosition;
      console.log('🏁 드래그 종료:', finalPosition);
      
      if (finalPosition) {
        // 스왑 처리
        if (editState.dragOverWidgetId) {
          const targetWidget = widgets.find(w => w.id === editState.dragOverWidgetId);
          if (targetWidget && canSwapWidgets(finalPosition, targetWidget.position, config)) {
            swapWidgets(widget.id, targetWidget.id);
          } else {
            // 스왑 불가능하면 최종 위치로 이동 (충돌 체크)
            if (!checkCollision(widget.id, finalPosition)) {
              moveWidget(widget.id, finalPosition);
            }
          }
        } else if (!checkCollision(widget.id, finalPosition)) {
          // 충돌 없으면 이동
          moveWidget(widget.id, finalPosition);
        }
        // 충돌하면 이미 updateDragging으로 위치가 업데이트되어 있으므로 추가 작업 불필요
        
        callbacks?.onDragStop?.(widget, finalPosition, e);
      }
      
      stopDragging();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      callbacks?.onLayoutChange?.(widgets);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    callbacks?.onDragStart?.(widget, e);
  }, [isEditMode, widgets, cellSize, config, editState, startDragging, updateDragging, stopDragging, moveWidget, swapWidgets, checkCollision, setDragOverWidget, setHoveredPosition, callbacks]);
  
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
      const finalPosition = editState.resizingWidget?.currentPosition;
      
      if (finalPosition) {
        if (!checkCollision(widget.id, finalPosition)) {
          resizeWidget(widget.id, finalPosition);
        } else {
          // 충돌하면 원래 크기로
          resizeWidget(widget.id, startPosition);
        }
        
        callbacks?.onResizeStop?.(widget, finalPosition, e);
      }
      
      stopResizing();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      callbacks?.onLayoutChange?.(widgets);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    callbacks?.onResizeStart?.(widget, e);
  }, [isEditMode, widgets, cellSize, config, editState, startResizing, updateResizing, stopResizing, resizeWidget, checkCollision, callbacks]);
  
  // Long Press 감지
  const handleLongPressStart = useCallback((e: React.MouseEvent | React.TouchEvent, widgetId: string) => {
    if (isEditMode) return;
    
    e.preventDefault();
    
    longPressTimerRef.current = setTimeout(() => {
      selectWidget(widgetId);
      enterEditMode();
      
      // 햅틱 피드백
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 700);
  }, [isEditMode, selectWidget, enterEditMode]);
  
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);
  
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
    const baseStyle = getTransformStyle(
      widget.position,
      cellSize.width,
      cellSize.height,
      config.gap,
      config.useCSSTransforms
    );
    
    // 드래그나 리사이즈 중에는 transition 제거
    if (isDragging || isResizing) {
      return {
        ...baseStyle,
        transition: 'none'
      };
    }
    
    return baseStyle;
  }, [cellSize, config.gap, config.useCSSTransforms, editState.draggedWidget?.id, editState.resizingWidget?.id]);
  
  return (
    <div className={cn("w-full", className)}>
      {/* 툴바 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">대시보드</h2>
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
        className="relative p-6"
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
                editState.draggedWidget?.id === widget.id && "z-50 cursor-grabbing",
                editState.resizingWidget?.id === widget.id && "z-50",
                editState.dragOverWidgetId === widget.id && "ring-2 ring-primary/50",
                widget.static && "opacity-80"
              )}
              style={getWidgetStyle(widget)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: editState.draggedWidget?.id === widget.id ? 1.05 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-full">
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
                    isEditMode && !widget.static && widget.isDraggable !== false && "cursor-move",
                    editState.draggedWidget?.id === widget.id && "opacity-80 cursor-grabbing"
                  )}
                  onMouseDown={(e) => {
                    if (isEditMode && !widget.static && widget.isDraggable !== false) {
                      handleDragStart(e, widget);
                    } else if (!isEditMode) {
                      handleLongPressStart(e, widget.id);
                    }
                  }}
                  onMouseUp={!isEditMode ? handleLongPressEnd : undefined}
                  onMouseLeave={!isEditMode ? handleLongPressEnd : undefined}
                  onTouchStart={(e) => !isEditMode && handleLongPressStart(e, widget.id)}
                  onTouchEnd={handleLongPressEnd}
                  onClick={(e) => !isEditMode && callbacks?.onWidgetClick?.(widget, e)}
                >
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
              config.useCSSTransforms
            )}
          />
        )}
      </div>
    </div>
  );
}