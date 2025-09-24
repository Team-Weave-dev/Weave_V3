'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CalendarDays,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  AlertCircle,
  CheckCircle2,
  Plus,
  MoreHorizontal,
  Search,
  Settings,
  Grid3x3,
  List,
  Calendar as CalendarIconOutline,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarWidgetProps, CalendarEvent } from '@/types/dashboard';
import { format, isSameDay, startOfDay, isToday, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth, addDays, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';

// 이벤트 타입별 색상 및 아이콘 매핑 (구글 캘린더 스타일)
const eventTypeConfig = {
  meeting: { 
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
    icon: Users,
    label: '회의'
  },
  task: { 
    color: 'bg-green-500',
    lightColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
    icon: CheckCircle2,
    label: '작업'
  },
  reminder: { 
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', 
    icon: AlertCircle,
    label: '알림'
  },
  deadline: { 
    color: 'bg-red-500',
    lightColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
    icon: Clock,
    label: '마감'
  },
  holiday: { 
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', 
    icon: CalendarDays,
    label: '휴일'
  },
  other: { 
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
    icon: CalendarIcon,
    label: '기타'
  }
};

// 뷰 모드 설정
const viewModes = [
  { value: 'month', label: '월', icon: Grid3x3 },
  { value: 'week', label: '주', icon: CalendarDays },
  { value: 'day', label: '일', icon: CalendarIconOutline },
  { value: 'agenda', label: '일정', icon: List }
];

// 미니 이벤트 컴포넌트 (구글 캘린더 스타일 - 반응형)
const MiniEvent = ({ event, onClick, displayMode = 'bar' }: { 
  event: CalendarEvent; 
  onClick?: () => void;
  displayMode?: 'dot' | 'compact' | 'bar' | 'full';
}) => {
  const config = eventTypeConfig[event.type || 'other'];
  
  // 점 표시 모드 (아주 작은 높이)
  if (displayMode === 'dot') {
    return (
      <div 
        className="inline-flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={`${event.startTime || ''} ${event.title}`}
      >
        <div className={cn("w-1 h-1 rounded-full flex-shrink-0", config.color)} />
      </div>
    );
  }
  
  // 컴팩트 모드 (작은 높이)
  if (displayMode === 'compact') {
    return (
      <div
        className={cn(
          "text-[9px] leading-none px-0.5 py-[1px] rounded-sm truncate cursor-pointer hover:opacity-80 transition-opacity",
          config.color,
          "text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={`${event.startTime || ''} ${event.title}`}
      >
        <span className="truncate">{event.title}</span>
      </div>
    );
  }
  
  // 바 모드 (중간 높이 - 기본값)
  if (displayMode === 'bar') {
    return (
      <div
        className={cn(
          "text-[10px] px-0.5 py-[1px] rounded-sm truncate cursor-pointer hover:opacity-80 transition-opacity",
          config.color,
          "text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={`${event.startTime || ''} ${event.title}`}
      >
        {event.startTime && !event.allDay && (
          <span className="font-medium">{event.startTime.slice(0,5)} </span>
        )}
        <span className="truncate">{event.title}</span>
      </div>
    );
  }
  
  // 풀 모드 (큰 높이)
  return (
    <div
      className={cn(
        "text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
        config.color,
        "text-white"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={`${event.startTime || ''} ${event.title}`}
    >
      {event.startTime && !event.allDay && (
        <span className="font-medium">{event.startTime} </span>
      )}
      <span>{event.title}</span>
    </div>
  );
};

// 일정 상세 모달 컴포넌트
const EventDetailModal = ({ 
  event, 
  isOpen, 
  onClose,
  onEdit,
  onDelete 
}: { 
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}) => {
  if (!event) return null;
  
  const config = eventTypeConfig[event.type || 'other'];
  const Icon = config.icon;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", config.lightColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">{event.title}</DialogTitle>
                <Badge variant="outline" className={cn("mt-1", config.lightColor)}>
                  {config.label}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(event)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 날짜 및 시간 */}
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {format(new Date(event.date), 'yyyy년 M월 d일 EEEE', { locale: ko })}
              </p>
              {event.allDay ? (
                <p className="text-sm text-muted-foreground">종일</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {event.startTime}
                  {event.endTime && ` - ${event.endTime}`}
                </p>
              )}
            </div>
          </div>
          
          {/* 설명 */}
          {event.description && (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{event.description}</p>
              </div>
            </div>
          )}
          
          {/* 반복 설정 */}
          {event.recurring && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {event.recurring === 'daily' && '매일 반복'}
                  {event.recurring === 'weekly' && '매주 반복'}
                  {event.recurring === 'monthly' && '매월 반복'}
                  {event.recurring === 'yearly' && '매년 반복'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 주간 뷰 컴포넌트
const WeekView = ({ 
  currentDate, 
  events, 
  onDateSelect,
  onEventClick,
  containerHeight
}: { 
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  containerHeight: number;
}) => {
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
};

// 월간 뷰 컴포넌트 (구글 캘린더 스타일)
const MonthView = ({ 
  currentDate, 
  events, 
  onDateSelect,
  onEventClick,
  selectedDate,
  containerHeight
}: { 
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  selectedDate?: Date;
  containerHeight: number;
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ko });
  const calendarEnd = endOfWeek(monthEnd, { locale: ko });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
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
  const borderHeight = weekCount; // 각 행의 border 1px
  const availableHeight = containerHeight - headerHeight - borderHeight;
  const cellHeight = Math.max(28, Math.floor(availableHeight / weekCount));
  
  // 높이에 따른 표시 모드 결정 (더 세밀한 분류)
  const getDisplayMode = () => {
    if (cellHeight < 40) return 'dot';      // 아주 작은 경우 점으로
    if (cellHeight < 55) return 'compact';  // 작은 경우 컴팩트
    if (cellHeight < 75) return 'bar';      // 중간 경우 바 형태
    return 'full';                          // 큰 경우 전체 표시
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
                displayMode === 'dot' ? 5 :        // 점 모드: 5개까지 점으로
                displayMode === 'compact' ? 2 :    // 컴팩트: 2개까지
                displayMode === 'bar' ? 3 :        // 바 모드: 3개까지
                4;                                  // 풀 모드: 4개까지
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-r last:border-0 cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden flex flex-col",
                    displayMode === 'dot' ? "px-1 py-0.5" : "p-1",
                    !isCurrentMonth && "bg-muted/30",
                    isToday(day) && "bg-primary/10",
                    isSelected && "ring-2 ring-primary"
                  )}
                  style={{ minHeight: `${cellHeight}px`, maxHeight: `${cellHeight}px` }}
                  onClick={() => onDateSelect?.(day)}
                >
                  <div className={cn(
                    displayMode === 'dot' ? "text-[9px] leading-none mb-0.5" : 
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
                    displayMode === 'dot' ? "flex flex-wrap gap-[2px] content-start" :
                    displayMode === 'compact' ? "space-y-[1px]" :
                    "space-y-0.5"
                  )}>
                    {displayMode === 'dot' ? (
                      // 점 모드: 이벤트를 점으로 표시
                      <>
                        {dayEvents.slice(0, maxEventsToShow).map((event) => (
                          <MiniEvent
                            key={event.id}
                            event={event}
                            onClick={() => onEventClick?.(event)}
                            displayMode="dot"
                          />
                        ))}
                        {dayEvents.length > maxEventsToShow && (
                          <span className="text-[9px] text-muted-foreground">
                            +{dayEvents.length - maxEventsToShow}
                          </span>
                        )}
                      </>
                    ) : (
                      // 다른 모드들: 바/컴팩트/풀 형태로 표시
                      <>
                        {dayEvents.slice(0, maxEventsToShow).map((event) => (
                          <MiniEvent
                            key={event.id}
                            event={event}
                            onClick={() => onEventClick?.(event)}
                            displayMode={displayMode}
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
                      </>
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
};

// 일간 뷰 컴포넌트
const DayView = ({ 
  currentDate, 
  events, 
  onEventClick,
  containerHeight
}: { 
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  containerHeight: number;
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.date), currentDate)
  );
  
  // 동적 높이 계산
  const headerHeight = 60;
  const scrollAreaHeight = Math.max(300, containerHeight - headerHeight);
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0" style={{ height: `${headerHeight}px` }}>
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
        </h3>
      </div>
      
      <ScrollArea className="flex-1" style={{ height: `${scrollAreaHeight}px` }}>
        <div className="min-h-[800px]">
          {/* 종일 이벤트 */}
          {dayEvents.filter(e => e.allDay).length > 0 && (
            <div className="p-2 border-b bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">종일</div>
              <div className="space-y-1">
                {dayEvents.filter(e => e.allDay).map((event) => (
                  <MiniEvent
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick?.(event)}
                  />
                ))}
              </div>
            </div>
          )}
          
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
                <div className="flex-1 p-1 border-l">
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
};

// 일정 목록 뷰 (Agenda)
const AgendaView = ({ 
  events, 
  onEventClick,
  containerHeight
}: { 
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  containerHeight: number;
}) => {
  // 날짜별로 이벤트 그룹핑
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  // 날짜 정렬
  const sortedDates = Object.keys(groupedEvents).sort();
  
  return (
    <ScrollArea className="h-full" style={{ height: `${containerHeight}px` }}>
      <div className="p-4 space-y-4">
        {sortedDates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            일정이 없습니다
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
                      <Badge variant="secondary" className="ml-2">오늘</Badge>
                    )}
                  </h3>
                </div>
                <div className="space-y-2">
                  {dateEvents.map((event) => {
                    const config = eventTypeConfig[event.type || 'other'];
                    const Icon = config.icon;
                    
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
                        <Badge variant="outline" className={cn("text-xs", config.lightColor)}>
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
};

export function CalendarWidget({
  title,
  selectedDate: initialDate,
  events = [],
  onDateSelect,
  onEventClick,
  onEventAdd,
  onViewChange,
  showWeekNumbers = false,
  showToday = true,
  view = 'month',
  lang = 'ko'
}: CalendarWidgetProps) {
  const displayTitle = title || getWidgetText.calendar.title('ko');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [currentView, setCurrentView] = useState(view);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 컨테이너 크기 감지 및 반응형 처리
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && contentRef.current) {
        const headerHeight = containerRef.current.querySelector('.calendar-header')?.clientHeight || 0;
        const contentHeight = containerRef.current.clientHeight - headerHeight;
        
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: contentHeight
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 검색된 이벤트 필터링
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // 뷰 변경 핸들러
  const handleViewChange = (newView: string) => {
    setCurrentView(newView as 'month' | 'week' | 'day' | 'agenda');
    onViewChange?.(newView as 'month' | 'week' | 'day' | 'agenda');
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
    onEventClick?.(event);
  };

  // 이전/다음 네비게이션
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  // 오늘 날짜로 이동
  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
  };

  // 현재 뷰의 타이틀 생성
  const getViewTitle = () => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'yyyy년 M월', { locale: ko });
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: ko });
        const weekEnd = endOfWeek(currentDate, { locale: ko });
        if (isSameMonth(weekStart, weekEnd)) {
          return format(weekStart, 'yyyy년 M월', { locale: ko });
        } else {
          return `${format(weekStart, 'M월 d일', { locale: ko })} - ${format(weekEnd, 'M월 d일', { locale: ko })}`;
        }
      case 'day':
        return format(currentDate, 'yyyy년 M월 d일', { locale: ko });
      case 'agenda':
        return '일정 목록';
      default:
        return '';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col" ref={containerRef}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
              <CardDescription className={typography.text.description}>
                {getWidgetText.calendar.description('ko')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {/* 검색 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Search className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <Input
                    placeholder="일정 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                  />
                </PopoverContent>
              </Popover>
              
              {/* 뷰 모드 선택 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    {viewModes.find(v => v.value === currentView)?.label}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>보기 모드</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {viewModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <DropdownMenuItem
                        key={mode.value}
                        onClick={() => handleViewChange(mode.value)}
                        className={currentView === mode.value ? "bg-accent" : ""}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {mode.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 설정 */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-2" ref={contentRef}>
          
          {/* 네비게이션 바 */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-7 px-2 text-xs"
              >
                오늘
              </Button>
              <div className="flex items-center ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm font-medium px-2">
                {getViewTitle()}
              </span>
            </div>
            
            {/* 일정 추가 버튼 */}
            <Popover open={showEventPopover} onOpenChange={setShowEventPopover}>
              <PopoverTrigger asChild>
                <Button size="sm" className="h-7 px-2">
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="text-xs">일정</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">새 일정 만들기</h4>
                  <Input placeholder="일정 제목" className="h-8" />
                  <Input type="datetime-local" className="h-8" />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEventPopover(false)}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // TODO: 일정 추가 로직
                        setShowEventPopover(false);
                      }}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* 뷰별 콘텐츠 렌더링 */}
          {currentView === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              selectedDate={selectedDate}
              containerHeight={containerSize.height}
            />
          )}
          
          {currentView === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              containerHeight={containerSize.height}
            />
          )}
          
          {currentView === 'day' && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              containerHeight={containerSize.height}
            />
          )}
          
          {currentView === 'agenda' && (
            <AgendaView
              events={filteredEvents}
              onEventClick={handleEventClick}
              containerHeight={containerSize.height}
            />
          )}
        </CardContent>
      </Card>
      
      {/* 일정 상세 모달 */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => {
          setShowEventDetail(false);
          setSelectedEvent(null);
        }}
        onEdit={(event) => {
          // TODO: 편집 로직
          console.log('Edit event:', event);
        }}
        onDelete={(event) => {
          // TODO: 삭제 로직
          console.log('Delete event:', event);
          setShowEventDetail(false);
          setSelectedEvent(null);
        }}
      />
    </>
  );
}