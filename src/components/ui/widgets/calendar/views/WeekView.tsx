'use client';

import React from 'react';
import {
  format,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import MiniEvent from '../components/MiniEvent';
import type { CalendarViewProps } from '../types';

/**
 * WeekView Component
 * 주간 캘린더 뷰 - 시간대별 그리드 표시
 */
const WeekView = React.memo(({ 
  currentDate, 
  events, 
  onDateSelect,
  onEventClick,
  containerHeight
}: CalendarViewProps) => {
  const weekStart = startOfWeek(currentDate, { locale: ko });
  const weekEnd = endOfWeek(currentDate, { locale: ko });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // 시간대 생성 (0시 ~ 23시)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // 동적 높이 계산
  const headerHeight = 60;
  const scrollAreaHeight = Math.max(300, containerHeight - headerHeight);
  
  return (
    <div className="flex flex-col h-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-8 border-b flex-shrink-0" style={{ height: `${headerHeight}px` }}>
        <div className="text-xs p-2 text-muted-foreground">시간</div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "text-center p-2 border-l cursor-pointer hover:bg-accent",
              isToday(day) && "bg-primary/10"
            )}
            onClick={() => onDateSelect?.(day)}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, 'EEE', { locale: ko })}
            </div>
            <div className={cn(
              "text-sm font-medium",
              isToday(day) && "text-primary"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* 시간대별 그리드 */}
      <ScrollArea className="flex-1" style={{ height: `${scrollAreaHeight}px` }}>
        <div className="min-h-[600px]">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b h-12">
              <div className="text-xs p-1 text-muted-foreground">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
              {weekDays.map((day) => {
                const dayEvents = events.filter(event => {
                  if (!isSameDay(new Date(event.date), day)) return false;
                  if (event.allDay) return false;
                  if (!event.startTime) return false;
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  return eventHour === hour;
                });
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border-l p-0.5 hover:bg-accent/50 cursor-pointer"
                    onClick={() => onDateSelect?.(day)}
                  >
                    {dayEvents.map((event) => (
                      <MiniEvent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

WeekView.displayName = 'WeekView';

export default WeekView;