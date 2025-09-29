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
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import MiniEvent from '../components/MiniEvent';
import type { CalendarViewProps } from '../types';
import type { CalendarEvent } from '@/types/dashboard';

interface MonthViewProps extends CalendarViewProps {
  defaultSize?: { w: number; h: number };
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
  selectedDate,
  containerHeight,
  containerWidth,
  gridSize,
  defaultSize = { w: 5, h: 4 }
}: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ko });
  const calendarEnd = endOfWeek(monthEnd, { locale: ko });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // 그리드 크기가 없으면 기본값 사용
  const effectiveGridSize = gridSize || defaultSize;
  
  // 요일 배열
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
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
      <div className="grid grid-cols-7 border-b flex-shrink-0" style={{ height: `${headerHeight}px` }}>
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
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-0 flex-1">
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
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-r last:border-0 cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden flex flex-col p-1",
                    !isCurrentMonth && "bg-muted/30",
                    isToday(day) && "bg-primary/10",
                    isSelected && "ring-2 ring-primary"
                  )}
                  style={{ minHeight: `${cellHeight}px`, maxHeight: `${cellHeight}px` }}
                  onClick={() => onDateSelect?.(day)}
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
                  
                  {/* 이벤트 목록 - 높이별 레이아웃 */}
                  <div className={cn(
                    "flex-1 overflow-hidden",
                    displayMode === 'compact' ? "space-y-[1px]" :
                    "space-y-0.5"
                  )}>
                    {dayEvents.slice(0, maxEventsToShow).map((event) => (
                      <MiniEvent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                        displayMode={displayMode as 'compact' | 'bar' | 'full'}
                      />
                    ))}
                    {dayEvents.length > maxEventsToShow && (
                      <div className={cn(
                        displayMode === 'compact' ? "text-[9px]" : "text-[10px]",
                        "text-muted-foreground px-0.5"
                      )}>
                        +{dayEvents.length - maxEventsToShow}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

MonthView.displayName = 'MonthView';

export default MonthView;