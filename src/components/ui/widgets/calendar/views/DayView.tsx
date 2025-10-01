'use client';

import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import MiniEvent from '../components/MiniEvent';
import type { CalendarViewProps } from '../types';

/**
 * DayView Component
 * 일간 캘린더 뷰 - 하루 일정을 시간대별로 표시
 */
const DayView = React.memo(({ 
  currentDate, 
  events, 
  onEventClick,
  onDateDoubleClick,
  containerHeight
}: CalendarViewProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(event =>
    isSameDay(new Date(event.date), currentDate)
  );

  // 종일 이벤트 필터링
  const allDayEvents = dayEvents.filter(e => e.allDay);
  const hasAllDayEvents = allDayEvents.length > 0;

  // 동적 높이 계산 (종일 이벤트 영역 포함)
  const headerHeight = 60;
  const allDayHeight = hasAllDayEvents ? 80 : 0;
  const totalHeaderHeight = headerHeight + allDayHeight;
  const scrollAreaHeight = Math.max(300, containerHeight - totalHeaderHeight);

  return (
    <div className="flex flex-col h-full">
      {/* 날짜 헤더 */}
      <div className="p-4 border-b flex-shrink-0" style={{ height: `${headerHeight}px` }}>
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
        </h3>
      </div>

      {/* 종일 이벤트 영역 - 스크롤 밖에 고정 */}
      {hasAllDayEvents && (
        <div
          className="p-2 border-b bg-muted/30 flex-shrink-0"
          style={{ minHeight: `${allDayHeight}px` }}
          onDoubleClick={() => onDateDoubleClick?.(currentDate)}
        >
          <div className="text-xs text-muted-foreground mb-1">종일</div>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <MiniEvent
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 시간대별 이벤트 - 스크롤 영역 */}
      <ScrollArea className="flex-1" style={{ height: `${scrollAreaHeight}px` }}>
        <div className="min-h-[800px]">
          {/* 시간대별 이벤트 */}
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => {
              if (event.allDay) return false;
              if (!event.startTime) return false;
              const eventHour = parseInt(event.startTime.split(':')[0]);
              return eventHour === hour;
            });
            
            return (
              <div key={hour} className="flex border-b min-h-[60px]">
                <div className="w-16 p-2 text-xs text-muted-foreground">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                <div 
                  className="flex-1 p-1 border-l cursor-pointer hover:bg-accent/20"
                  onDoubleClick={() => onDateDoubleClick?.(currentDate, `${hour.toString().padStart(2, '0')}:00`)}
                >
                  {hourEvents.map((event) => (
                    <MiniEvent
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick?.(event)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

DayView.displayName = 'DayView';

export default DayView;