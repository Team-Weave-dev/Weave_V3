'use client';

import React from 'react';
import {
  format,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  getDay,
  getWeek,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import MiniEvent from '../components/MiniEvent';
import type { CalendarViewProps } from '../types';
import type { CalendarEvent } from '@/types/dashboard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface MonthViewProps extends CalendarViewProps {
  defaultSize?: { w: number; h: number };
  showWeekNumbers?: boolean;
}

/**
 * MonthView Component
 * 월간 캘린더 뷰 - Google Calendar 스타일
 */
const MonthView = React.memo(({
  currentDate,
  events,
  onDateSelect,
  onEventClick,
  onDateDoubleClick,
  selectedDate,
  containerHeight,
  containerWidth,
  gridSize,
  defaultSize = { w: 5, h: 4 },
  weekStartsOn = 0,
  showWeekNumbers = false
}: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn, locale: ko });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn, locale: ko });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // HTML5 드래그 오버 상태 추적
  const [dragOverDate, setDragOverDate] = React.useState<Date | null>(null);
  
  // 그리드 크기가 없으면 기본값 사용
  const effectiveGridSize = gridSize || defaultSize;

  // 요일 배열 (주 시작일에 따라 동적 생성)
  const allWeekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekDays = weekStartsOn === 1
    ? [...allWeekDays.slice(1), allWeekDays[0]] // 월요일 시작: ['월', '화', '수', '목', '금', '토', '일']
    : allWeekDays; // 일요일 시작: ['일', '월', '화', '수', '목', '금', '토']
  
  // 주 단위로 날짜 그룹핑
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  // 동적 높이 계산 - 반응형 (더 정밀한 계산)
  const headerHeight = 24; // 헤더 높이 축소
  const weekCount = weeks.length;
  const borderHeight = weekCount + 1; // 각 행의 border 1px + 헤더 border
  const availableHeight = Math.max(200, containerHeight - headerHeight - borderHeight - 8); // 최소 높이 보장
  const cellHeight = Math.max(24, Math.floor(availableHeight / weekCount));
  
  // 개선된 반응형 표시 모드 결정 - 점 모드 제거, 최소 2열 지원
  const getDisplayMode = () => {
    // 1. 컨테이너 실제 너비 기반 우선 판단
    const actualWidth = containerWidth || (containerHeight * (effectiveGridSize.w || 4) / (effectiveGridSize.h || 3));
    const estimatedCellWidth = actualWidth / 7; // 7일 기준
    
    // 2. 그리드 크기와 픽셀 크기를 종합적으로 고려
    if (effectiveGridSize) {
      // 작은 그리드 (2열) - 최소 크기
      if (effectiveGridSize.w === 2) {
        // 높이에 따라 compact 또는 bar 모드
        if (cellHeight < 55 || effectiveGridSize.h <= 2) return 'compact';
        if (cellHeight < 70 || estimatedCellWidth < 70) return 'bar';
        return 'full';
      }
      
      // 중간 그리드 (3열)
      if (effectiveGridSize.w === 3) {
        // 셀 높이에 따라 세밀하게 조정
        if (cellHeight < 50 || effectiveGridSize.h <= 2) return 'compact';
        if (cellHeight < 75) return 'bar';
        return 'full';
      }
      
      // 큰 그리드 (4열 이상)
      if (effectiveGridSize.w >= 4) {
        // 충분한 공간이 있을 때만 full 모드
        if (cellHeight < 55) return 'compact';
        if (cellHeight < 70) return 'bar';
        return 'full';
      }
    }
    
    // 3. 그리드 정보가 없을 때 순수 높이 기반 (폴백) - 점 모드 제외
    if (cellHeight < 55) return 'compact';
    if (cellHeight < 75) return 'bar';
    return 'full';
  };
  
  const displayMode = getDisplayMode();
  
  return (
    <div className="flex flex-col h-full">
      {/* 요일 헤더 - 컴팩트 */}
      <div className={cn("grid border-b flex-shrink-0", showWeekNumbers ? "grid-cols-8" : "grid-cols-7")} style={{ height: `${headerHeight}px` }}>
        {showWeekNumbers && (
          <div className="flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            #
          </div>
        )}
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "flex items-center justify-center text-[10px] font-medium text-muted-foreground",
              index === 0 && "text-red-500",
              index === 6 && "text-blue-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 - 정확한 높이 할당 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {weeks.map((week, weekIndex) => {
          // 주 번호 계산 (첫 번째 날짜 기준)
          const weekNumber = getWeek(week[0], { weekStartsOn, locale: ko });

          return (
          <div key={weekIndex} className={cn("grid border-b last:border-0 flex-1", showWeekNumbers ? "grid-cols-8" : "grid-cols-7")}>
            {showWeekNumbers && (
              <div className="border-r flex items-center justify-center text-[10px] font-medium text-muted-foreground bg-muted/30">
                {weekNumber}
              </div>
            )}
            {week.map((day) => {
              const dayEvents = events.filter(event => 
                isSameDay(new Date(event.date), day)
              );
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dayOfWeek = getDay(day);
              
              // 높이에 따른 최대 표시 이벤트 수 및 표시 방법 조정
              const maxEventsToShow = 
                displayMode === 'compact' ? 2 :    // 컴팩트: 2개까지
                displayMode === 'bar' ? 3 :        // 바 모드: 3개까지
                4;                                  // 풀 모드: 4개까지
              
              const droppableId = `date-${format(day, 'yyyy-MM-dd')}`;

              return (
                <Droppable key={day.toISOString()} droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "border-r last:border-0 cursor-pointer hover:bg-accent/50 transition-colors flex flex-col relative",
                        displayMode === 'compact' ? "p-0.5" : "p-1",
                        !isCurrentMonth && "bg-muted/30",
                        isToday(day) && "bg-primary/10",
                        isSelected && "ring-2 ring-inset ring-primary",
                        snapshot.isDraggingOver && "bg-primary/20 ring-2 ring-primary",
                        dragOverDate && isSameDay(dragOverDate, day) && "bg-primary/20 ring-2 ring-primary"
                      )}
                      style={{ minHeight: `${cellHeight}px`, maxHeight: `${cellHeight}px` }}
                      onClick={() => onDateSelect?.(day)}
                      onDoubleClick={() => onDateDoubleClick?.(day)}
                      // HTML5 Drag and Drop API for cross-widget dragging (TodoListWidget → CalendarWidget)
                      onDragEnter={(e) => {
                        e.preventDefault();
                        // dataTransfer에서 타입 확인
                        const types = e.dataTransfer.types;
                        if (types.includes('application/json')) {
                          setDragOverDate(day);
                        }
                      }}
                      onDragLeave={(e) => {
                        // 자식 요소로 이동하는 경우 무시
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX;
                        const y = e.clientY;

                        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                          if (dragOverDate && isSameDay(dragOverDate, day)) {
                            setDragOverDate(null);
                          }
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        try {
                          const dataJson = e.dataTransfer.getData('application/json');
                          if (dataJson) {
                            const data = JSON.parse(dataJson);

                            // TodoListWidget에서 드래그된 투두 아이템인지 확인
                            if (data.type === 'todo-task' && data.task) {
                              const todoTask = data.task;
                              const targetDate = day;

                              console.log('[CalendarWidget] Todo task dropped on date:', format(targetDate, 'yyyy-MM-dd'), todoTask);

                              // localStorage에서 투두 데이터 업데이트
                              const todosStr = localStorage.getItem('weave_dashboard_todo_tasks');
                              if (todosStr) {
                                const todos = JSON.parse(todosStr);

                                // 재귀적으로 투두 찾기 및 업데이트
                                const updateTodoDate = (todoList: any[]): boolean => {
                                  for (let todo of todoList) {
                                    if (todo.id === todoTask.id) {
                                      todo.dueDate = targetDate.toISOString();
                                      return true;
                                    }
                                    if (todo.children && todo.children.length > 0) {
                                      if (updateTodoDate(todo.children)) {
                                        return true;
                                      }
                                    }
                                  }
                                  return false;
                                };

                                if (updateTodoDate(todos)) {
                                  // localStorage에 저장
                                  localStorage.setItem('weave_dashboard_todo_tasks', JSON.stringify(todos));

                                  // 다른 위젯에 변경 사항 알림
                                  const event = new CustomEvent('calendarDataChanged', {
                                    detail: {
                                      source: 'todo',  // 'calendar'가 아닌 'todo'로 변경
                                      changeType: 'todo-date-update',
                                      itemId: todoTask.id,
                                      newDate: targetDate.toISOString(),
                                      timestamp: Date.now()
                                    }
                                  });
                                  window.dispatchEvent(event);

                                  console.log('[CalendarWidget] Todo date updated successfully');
                                }
                              }
                            }
                          }
                        } catch (error) {
                          console.error('[CalendarWidget] Error processing drop:', error);
                        } finally {
                          // 드래그 오버 상태 초기화
                          setDragOverDate(null);
                        }
                      }}
                    >
                      <div className={cn(
                        displayMode === 'compact' ? "text-[10px] leading-none mb-0.5" :
                        displayMode === 'bar' ? "text-[11px] mb-0.5" :
                        "text-sm mb-1",
                        "font-medium flex-shrink-0",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday(day) && "text-primary font-bold",
                        dayOfWeek === 0 && "text-red-500",
                        dayOfWeek === 6 && "text-blue-500"
                      )}>
                        {format(day, 'd')}
                      </div>

                      {/* 이벤트 목록 - 높이별 레이아웃 with Draggable */}
                      <div className={cn(
                        "flex-1 overflow-hidden",
                        displayMode === 'compact' ? "space-y-[1px]" :
                        "space-y-0.5"
                      )}>
                        {dayEvents.slice(0, maxEventsToShow).map((event, index) => {
                          // Check if event is from integrated calendar
                          // 투두와 캘린더 이벤트는 드래그 가능, 세금만 드래그 불가
                          const isIntegrated =
                            event.id.startsWith('todo-') ||
                            event.id.startsWith('tax-') ||
                            event.id.startsWith('calendar-event-');

                          // 세금 이벤트만 드래그 비활성화
                          const isDragDisabled = event.id.startsWith('tax-');

                          return (
                            <Draggable
                              key={event.id}
                              draggableId={`event-${event.id}`}
                              index={index}
                              isDragDisabled={isDragDisabled}
                            >
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                    }}
                                    className={cn(
                                      snapshot.isDragging && "opacity-90 shadow-lg z-[9999]",
                                      !snapshot.isDragging && "opacity-100",
                                      isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                                    )}
                                  >
                                    <MiniEvent
                                      event={event}
                                      onClick={() => onEventClick?.(event)}
                                      displayMode={displayMode as 'compact' | 'bar' | 'full'}
                                    />
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {dayEvents.length > maxEventsToShow && (
                          <div className={cn(
                            displayMode === 'compact' ? "text-[9px]" : "text-[10px]",
                            "text-muted-foreground px-0.5"
                          )}>
                            +{dayEvents.length - maxEventsToShow}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
          );
        })}
      </div>
    </div>
  );
});

MonthView.displayName = 'MonthView';

export default MonthView;