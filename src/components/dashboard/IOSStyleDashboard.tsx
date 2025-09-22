'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { IOSStyleWidget } from '@/types/ios-dashboard';
import { 
  useIOSDashboardStore,
  selectWidgets,
  selectEditMode,
  selectWiggling,
  shallow
} from '@/lib/stores/useIOSDashboardStore';
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
  Grip
} from 'lucide-react';
import { wiggleAnimation, deleteButtonAnimation } from '@/lib/dashboard/ios-animations';
import { StatsWidget } from './widgets/StatsWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';

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
  const enterEditMode = useIOSDashboardStore(state => state.enterEditMode);
  const exitEditMode = useIOSDashboardStore(state => state.exitEditMode);
  const moveWidget = useIOSDashboardStore(state => state.moveWidget);
  const selectWidget = useIOSDashboardStore(state => state.selectWidget);
  
  // 로컬 상태
  const [columns, setColumns] = useState(5);
  const [cellSize, setCellSize] = useState(120);
  
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
      // 테스트 위젯 생성
      const testWidgets: IOSStyleWidget[] = [
        {
          id: 'widget_stats_1',
          type: 'stats',
          title: '통계 대시보드',
          position: {
            gridColumn: '1 / span 2',
            gridRow: '1 / span 2',
            gridColumnStart: 1,
            gridColumnEnd: 3,
            gridRowStart: 1,
            gridRowEnd: 3,
            width: 2,
            height: 2,
          },
          size: { width: 2, height: 2 },
          data: mockStatsData,
        },
        {
          id: 'widget_chart_1',
          type: 'chart',
          title: '주간 트렌드 차트',
          position: {
            gridColumn: '3 / span 3',
            gridRow: '1 / span 2',
            gridColumnStart: 3,
            gridColumnEnd: 6,
            gridRowStart: 1,
            gridRowEnd: 3,
            width: 3,
            height: 2,
          },
          size: { width: 3, height: 2 },
          data: mockChartData,
        },
        {
          id: 'widget_actions_1',
          type: 'quickActions',
          title: '빠른 작업',
          position: {
            gridColumn: '1 / span 2',
            gridRow: '3 / span 1',
            gridColumnStart: 1,
            gridColumnEnd: 3,
            gridRowStart: 3,
            gridRowEnd: 4,
            width: 2,
            height: 1,
          },
          size: { width: 2, height: 1 },
        },
      ];
      
      setWidgets(testWidgets);
    }
    
    isInitializedRef.current = true;
    setIsMounted(true);
  }, []);
  
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
  
  // 드래그 앤 드롭 핸들러
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex !== destIndex) {
      const draggedWidgetId = widgets[sourceIndex].id;
      moveWidget(draggedWidgetId, destIndex);
      
      if (onLayoutChange) {
        onLayoutChange(widgets);
      }
    }
  }, [widgets, moveWidget, onLayoutChange]);
  
  // 위젯 렌더링
  const renderWidget = (widget: IOSStyleWidget) => {
    switch (widget.type) {
      case 'stats':
        return <StatsWidget title={widget.title} stats={widget.data || mockStatsData} />;
      case 'chart':
        return <ChartWidget title={widget.title} data={widget.data || mockChartData} />;
      case 'quickActions':
        return <QuickActionsWidget title={widget.title} />;
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
            위젯 시스템
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-grid">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="relative"
              >
              {widgets.map((widget, index) => (
                <Draggable 
                  key={widget.id} 
                  draggableId={widget.id} 
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                      className={cn(
                        "relative group transition-all p-2",
                        snapshot.isDragging && "z-50 opacity-80",
                        isEditMode && "cursor-move"
                      )}
                    >
                      <motion.div
                        variants={wiggleAnimation}
                        animate={isWiggling && isEditMode ? "wiggle" : "initial"}
                        onMouseDown={(e) => !isEditMode && handleLongPressStart(e, widget.id)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={(e) => !isEditMode && handleLongPressStart(e, widget.id)}
                        onTouchEnd={handleLongPressEnd}
                      >
                        {/* 드래그 핸들 (편집 모드에서만 표시) */}
                        {isEditMode && (
                          <>
                            <div className="absolute -top-2 -left-2 z-10">
                            <motion.button
                              variants={deleteButtonAnimation}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => removeWidget(widget.id)}
                              className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </div>
                          <div className="absolute -top-2 -right-2 z-10">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-7 w-7 rounded-full shadow-lg"
                            >
                              <Grip className="h-3 w-3" />
                            </Button>
                          </div>
                          </>
                        )}
                        
                        {/* 위젯 콘텐츠 */}
                        <div className={cn(
                          "h-full transition-transform",
                          isEditMode && "scale-95"
                        )}>
                          {renderWidget(widget)}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* 위젯 추가 버튼 (편집 모드에서만 표시) */}
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center min-h-[150px] hover:border-primary/50 transition-colors cursor-pointer"
                  style={{
                    gridColumn: 'span 2',
                    gridRow: 'span 1',
                  }}
                >
                  <Button variant="ghost" size="lg">
                    <Plus className="h-8 w-8 mr-2" />
                    위젯 추가
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    </div>
  );
}