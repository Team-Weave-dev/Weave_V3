'use client';

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Grid3x3, Settings, Plus, Save, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Widget, DashboardLayout } from '@/types/dashboard';

// 빈 위젯 배열 (이전에 사용하던 위젯들이 삭제됨)
const defaultWidgets: Widget[] = [];

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
    // 현재 사용 가능한 위젯이 없으므로 기본 카드만 렌더링
    return (
      <Card className="h-full p-4">
        <p className="text-muted-foreground">위젯 타입: {widget.type}</p>
      </Card>
    );
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
