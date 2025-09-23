'use client';

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatsWidget } from '@/components/ui/widgets/StatsWidget';
import { ChartWidget } from '@/components/ui/widgets/ChartWidget';
import { QuickActionsWidget } from '@/components/ui/widgets/QuickActionsWidget';
import { Grid3x3, Settings, Plus, Save, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Widget, DashboardLayout } from '@/types/dashboard';

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

const defaultWidgets: Widget[] = [
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

interface DashboardContainerProps {
  initialWidgets?: Widget[];
}

export function DashboardContainer({ initialWidgets = defaultWidgets }: DashboardContainerProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [columns, setColumns] = useState(5);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  }, [widgets]);

  const renderWidget = (widget: Widget) => {
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
            <p className="text-muted-foreground">위젯 타입: {widget.type}</p>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">대시보드</h2>
          <p className="text-muted-foreground">프로젝트와 비즈니스 현황을 한눈에 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            템플릿
          </Button>
          <Button variant="outline" size="sm">
            <Grid3x3 className="h-4 w-4 mr-2" />
            {columns}x{columns}
          </Button>
          <Button 
            variant={isEditMode ? "default" : "outline"} 
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? '편집 완료' : '대시보드 편집'}
          </Button>
        </div>
      </div>

      {/* 위젯 그리드 */}
      {isEditMode ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-grid" direction="vertical">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cn(
                  "grid gap-4",
                  `grid-cols-${columns}`
                )}
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {widgets.map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "transition-all",
                          snapshot.isDragging && "opacity-50 rotate-2 scale-105"
                        )}
                        style={{
                          ...provided.draggableProps.style,
                          gridColumn: widget.position.gridColumn,
                          gridRow: widget.position.gridRow,
                        }}
                      >
                        <div className="relative h-full">
                          {isEditMode && (
                            <div className="absolute top-2 right-2 z-10 flex gap-1">
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {renderWidget(widget)}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                gridColumn: widget.position.gridColumn,
                gridRow: widget.position.gridRow,
              }}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div className="text-xs text-muted-foreground mt-4">
        <p>Columns: {columns} | Widgets: {widgets.length} | Edit Mode: {isEditMode ? 'ON' : 'OFF'}</p>
      </div>
    </div>
  );
}
