'use client';

import React from 'react';
import { format, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarDays,
  CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { eventTypeConfig } from '../types';
import type { CalendarEvent } from '@/types/dashboard';
import { getAgendaViewText } from '@/config/brand';

const iconMap = {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarDays,
  CalendarIcon,
};

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  containerHeight?: number; // Optional - CSS height 사용 시 불필요
}

/**
 * AgendaView Component
 * 일정 목록 뷰 - 날짜별로 그룹화된 이벤트 목록
 */
const AgendaView = React.memo(({
  events,
  onEventClick,
  containerHeight
}: AgendaViewProps) => {
  // 안전한 날짜 파싱 헬퍼
  const parseEventDate = (date: Date | string): Date | null => {
    try {
      const parsed = date instanceof Date ? date : new Date(date);
      // Invalid Date 체크
      if (isNaN(parsed.getTime())) {
        console.warn('[AgendaView] Invalid date:', date);
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('[AgendaView] Date parsing error:', error, date);
      return null;
    }
  };

  // 유효한 이벤트만 필터링
  const validEvents = events.filter(event => {
    const parsedDate = parseEventDate(event.date);
    return parsedDate !== null;
  });

  // 날짜별로 이벤트 그룹핑
  const groupedEvents = validEvents.reduce((acc, event) => {
    const parsedDate = parseEventDate(event.date)!; // 이미 필터링했으므로 null 아님
    const dateKey = format(parsedDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  // 날짜 정렬
  const sortedDates = Object.keys(groupedEvents).sort();
  
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {sortedDates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {getAgendaViewText.noEvents('ko')}
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const date = new Date(dateKey);
            const dateEvents = groupedEvents[dateKey];
            
            return (
              <div key={dateKey}>
                <div className="sticky top-0 bg-background pb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {format(date, 'M월 d일 EEEE', { locale: ko })}
                    {isToday(date) && (
                      <Badge variant="status-soft-info" className="ml-2 text-xs">{getAgendaViewText.today('ko')}</Badge>
                    )}
                  </h3>
                </div>
                <div className="space-y-2">
                  {dateEvents.map((event) => {
                    const config = eventTypeConfig[event.type || 'other'];
                    const Icon = iconMap[config.icon as keyof typeof iconMap];
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className={cn("p-2 rounded", config.lightColor)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          {event.startTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.allDay ? '종일' : event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={config.badgeVariant} className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
});

AgendaView.displayName = 'AgendaView';

export default AgendaView;