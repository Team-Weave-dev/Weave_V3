'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Filter,
  Grid3x3,
  CalendarDays,
  Calendar as CalendarIconOutline,
  List,
  Maximize,
} from 'lucide-react';
import type { CalendarWidgetProps, CalendarEvent } from '@/types/dashboard';
import { format, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import { useIntegratedCalendar } from '@/hooks/useIntegratedCalendar';
import { integratedCalendarManager } from '@/lib/calendar-integration';
import type { CalendarItemSource, UnifiedCalendarItem } from '@/types/integrated-calendar';
import { addCalendarDataChangedListener, notifyCalendarDataChanged } from '@/lib/calendar-integration/events';
import { cn } from '@/lib/utils';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { taskService } from '@/lib/storage';

// Import refactored components
import {
  MonthView,
  WeekView,
  DayView,
  AgendaView,
  EventDetailModal,
  EventForm,
  CalendarSettingsModal,
  useCalendarEvents,
  useCalendarSettings,
  viewModes,
  type ViewMode,
} from './calendar';
import FullScreenCalendarModal from './calendar/components/FullScreenCalendarModal';

// View mode icons mapping
const viewModeIcons = {
  Grid3x3,
  CalendarDays,
  CalendarIconOutline,
  List,
};

/**
 * CalendarWidget Component - Refactored Version
 * 리팩토링된 캘린더 위젯 - 컴포넌트 분리 및 성능 최적화
 */
export function CalendarWidget({
  title,
  selectedDate: initialDate,
  events: propEvents,
  onDateSelect,
  onEventClick,
  onEventAdd,
  onViewChange,
  showWeekNumbers = false,
  showToday = true,
  view = 'month',
  lang = 'ko',
  gridSize,
  defaultSize = { w: 5, h: 4 }
}: CalendarWidgetProps & { gridSize?: { w: number; h: number }; defaultSize?: { w: number; h: number } }) {
  // Custom hooks - 설정을 먼저 로드
  const {
    settings,
    saveSettings,
  } = useCalendarSettings();

  // States - 설정이 로드된 후 defaultView 적용
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [currentView, setCurrentView] = useState<ViewMode>(settings.defaultView || view);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Custom hooks
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  } = useCalendarEvents(propEvents);

  // Integrated calendar hook for multi-source data
  const {
    filteredItems: integratedItems,
    filters: sourceFilters,
    updateFilters: updateSourceFilters,
    stats: sourceStats,
    refresh: refreshIntegratedItems,
  } = useIntegratedCalendar({
    fetchOnMount: true,
    autoRefresh: false,
  });

  // Effective values
  const effectiveGridSize = gridSize || defaultSize;
  const displayTitle = title || getWidgetText.calendar.title('ko');

  // 설정이 변경되면 currentView 업데이트 (초기 로드 및 설정 저장 시)
  useEffect(() => {
    if (settings.defaultView && settings.defaultView !== currentView) {
      setCurrentView(settings.defaultView);
    }
  }, [settings.defaultView]);

  // Convert UnifiedCalendarItem to CalendarEvent
  const convertToCalendarEvents = (items: UnifiedCalendarItem[]): CalendarEvent[] => {
    console.log('[CalendarWidget] Converting integrated items:', items.length, items);

    // Filter out calendar source to prevent duplicates
    // Calendar events are already in the local `events` state
    const filteredItems = items.filter(item => item.source !== 'calendar');
    console.log('[CalendarWidget] Filtered items (excluding calendar):', filteredItems.length, filteredItems);

    return filteredItems.map(item => {
      // Map CalendarItemType to CalendarEvent type
      let eventType: CalendarEvent['type'] = 'other';
      if (item.type === 'event') eventType = 'other';
      else if (item.type === 'deadline') eventType = 'deadline';
      else if (item.type === 'task') eventType = 'task';

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        allDay: item.allDay,
        type: eventType,
        isReadOnly: item.isReadOnly, // 읽기 전용 플래그 전달
      };
    });
  };

  // Container size detection with optimization
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && contentRef.current) {
        const cardRect = containerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const navBar = contentRef.current.querySelector('.calendar-nav');
        const navHeight = navBar ? navBar.getBoundingClientRect().height : 32;

        const horizontalPadding = 8;
        const verticalPadding = 12;

        const availableWidth = contentRect.width - horizontalPadding;
        const availableHeight = Math.max(100, contentRect.height - navHeight - verticalPadding);

        setContainerSize({
          width: availableWidth,
          height: availableHeight
        });
      }
    };

    updateSize();
    const timeoutId = setTimeout(updateSize, 100);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateSize);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [currentView]);

  // 실시간 동기화: 모달에서 발생한 변경사항을 감지하여 이벤트 새로고침
  useEffect(() => {
    const unsubscribe = addCalendarDataChangedListener((event) => {
      console.log('[CalendarWidget] Received calendarDataChanged event:', event.detail);

      // 캘린더 소스의 변경 처리
      if (event.detail.source === 'calendar') {
        refreshEvents();
      }

      // 투두 소스의 변경 처리 - 통합 아이템 새로고침
      if (event.detail.source === 'todo') {
        console.log('[CalendarWidget] Refreshing integrated items due to todo change');
        refreshIntegratedItems();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshEvents, refreshIntegratedItems]);

  // Merged and filtered events with memoization
  const filteredEvents = useMemo(() => {
    // Convert integrated items to CalendarEvent format (todo, tax)
    const integratedEvents = convertToCalendarEvents(integratedItems);

    // Merge local calendar events with integrated events
    // Local events are from CalendarWidget's own storage
    // Integrated events are from other widgets (TodoList, TaxDeadline)
    const allEvents = [...events, ...integratedEvents];

    // Remove duplicates by ID (in case of overlap)
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );

    // Apply source filter first
    let filtered = uniqueEvents;
    if (sourceFilters.sources && sourceFilters.sources.length > 0) {
      filtered = uniqueEvents.filter(event => {
        // Determine event source based on ID prefix
        if (event.id.startsWith('todo-')) return sourceFilters.sources?.includes('todo');
        if (event.id.startsWith('tax-')) return sourceFilters.sources?.includes('tax');
        if (event.id.startsWith('calendar-event-')) return sourceFilters.sources?.includes('calendar');
        // Default to calendar source for events without prefix
        return sourceFilters.sources?.includes('calendar');
      });
    }

    // Apply search filter
    if (!searchQuery) return filtered;
    return filtered.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, integratedItems, searchQuery, sourceFilters]);

  // Calculate accurate source counts including local calendar events
  const sourceCountStats = useMemo(() => {
    // Convert integrated items to CalendarEvent format (todo, tax)
    const integratedEvents = convertToCalendarEvents(integratedItems);

    // Merge local calendar events with integrated events
    const allEvents = [...events, ...integratedEvents];

    // Remove duplicates by ID
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );

    // Count events by source
    const counts = {
      calendar: 0,
      todo: 0,
      tax: 0,
    };

    uniqueEvents.forEach(event => {
      if (event.id.startsWith('todo-')) {
        counts.todo++;
      } else if (event.id.startsWith('tax-')) {
        counts.tax++;
      } else if (event.id.startsWith('calendar-event-')) {
        counts.calendar++;
      } else {
        // Default to calendar source
        counts.calendar++;
      }
    });

    return counts;
  }, [events, integratedItems]);

  // Source filter toggle handler
  const toggleSourceFilter = (source: CalendarItemSource) => {
    const currentSources = sourceFilters.sources || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];

    updateSourceFilters({ sources: newSources.length > 0 ? newSources : undefined });
  };

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleViewChange = (newView: string) => {
    setCurrentView(newView as ViewMode);
    onViewChange?.(newView as ViewMode);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
    onEventClick?.(event);
  };

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

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
  };

  /**
   * 투두 아이템 날짜 업데이트 핸들러 (Storage API 사용)
   * @param taskId - 작업 ID
   * @param newDate - 새로운 날짜 (Date 객체)
   */
  const handleTaskDateUpdate = useCallback(async (taskId: string, newDate: Date) => {
    try {
      console.log('[CalendarWidget] Updating task date via Storage API:', taskId, newDate);

      // TaskService를 통해 dueDate 업데이트
      // updatedAt은 BaseService가 자동으로 설정하므로 전달하지 않음
      await taskService.update(taskId, {
        dueDate: newDate.toISOString()
      });

      // Storage API의 구독 시스템이 자동으로 모든 위젯에 변경 알림
      console.log('[CalendarWidget] Task date updated successfully via Storage API');

      // 통합 캘린더 데이터 새로고침
      refreshIntegratedItems();
    } catch (error) {
      console.error('[CalendarWidget] Failed to update task date:', error);
    }
  }, [refreshIntegratedItems]);

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    // 투두 아이템인지 확인
    const isTodoItem = editingEvent?.id?.startsWith('todo-');

    if (isTodoItem && editingEvent) {
      // 투두 아이템 업데이트 (Storage API 사용)
      const todoId = editingEvent.id.replace('todo-', '');

      try {
        const updates: any = {};
        // updatedAt은 BaseService가 자동으로 설정하므로 전달하지 않음

        // 날짜 업데이트
        if (eventData.date) {
          updates.dueDate = eventData.date instanceof Date
            ? eventData.date.toISOString()
            : new Date(eventData.date).toISOString();
        }

        // 제목 업데이트 (필요한 경우)
        if (eventData.title && eventData.title !== editingEvent.title) {
          updates.title = eventData.title;
        }

        // TaskService를 통해 업데이트
        await taskService.update(todoId, updates);

        console.log('[CalendarWidget] Todo item updated via Storage API');

        // Storage API가 자동으로 변경 알림 - CustomEvent 불필요
        // 통합 캘린더 새로고침
        refreshIntegratedItems();

        // 모달 닫기
        setShowEventPopover(false);
        setShowEventDetail(false);
        setEditingEvent(null);

        return;
      } catch (error) {
        console.error('[CalendarWidget] Failed to update todo item:', error);
        return;
      }
    }

    // 일반 캘린더 이벤트 처리
    if (editingEvent && editingEvent.id) {
      // 일반 캘린더 이벤트 업데이트
      const updatedEvent = { ...editingEvent, ...eventData } as CalendarEvent;
      updateEvent(updatedEvent);
    } else {
      // 새 이벤트 생성
      const newEvent = {
        id: `event-${Date.now()}`,
        ...eventData,
      } as CalendarEvent;
      addEvent(newEvent);
      // Note: addEvent already saves to localStorage and notifies other widgets
      // No need to call onEventAdd separately
    }

    setShowEventPopover(false);
    setEditingEvent(null);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventDetail(false);
    setSelectedEvent(null);
    setShowEventPopover(true);
  };

  const handleEventDelete = async (event: CalendarEvent) => {
    // Check if event is integrated (from other widgets) by ID pattern
    const isIntegratedItem =
      event.id.startsWith('todo-') ||
      event.id.startsWith('tax-') ||
      (event.id.startsWith('calendar-event-') && !events.some(e => e.id === event.id));

    if (isIntegratedItem) {
      try {
        // Delete from source widget's localStorage
        await integratedCalendarManager.deleteItem(event.id);

        // Refresh integrated items
        await refreshIntegratedItems();
      } catch (error) {
        console.error('Failed to delete integrated item:', error);
      }
    } else {
      // Delete local calendar event
      deleteEvent(event.id);
    }

    setShowEventDetail(false);
    setSelectedEvent(null);
  };

  // Handle double click to add event
  const handleDateDoubleClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    // Clear editing event to create new one with the selected date
    setEditingEvent(null);
    // Open the popover which will use selectedDate
    setShowEventPopover(true);

    // If time is specified, we need to pre-populate it
    if (time) {
      const prefilledEvent: CalendarEvent = {
        id: '',
        title: '',
        date: date,
        startTime: time,
        endTime: `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
        allDay: false,
      };
      setEditingEvent(prefilledEvent);
    }
  };

  // Handle drag end for event rescheduling
  const handleDragEnd = (result: DropResult) => {
    console.log('[CalendarWidget] handleDragEnd called:', result);

    if (!result.destination) {
      console.log('[CalendarWidget] No destination, returning');
      return;
    }

    // Extract event ID from draggableId (format: "event-{id}")
    const eventId = result.draggableId.replace('event-', '');
    console.log('[CalendarWidget] Event ID:', eventId);

    const event = filteredEvents.find(e => e.id === eventId);
    if (!event) {
      console.log('[CalendarWidget] Event not found:', eventId);
      return;
    }
    console.log('[CalendarWidget] Found event:', event);

    // Check if event is from integrated calendar (other widgets)
    const isIntegratedItem =
      event.id.startsWith('todo-') ||
      event.id.startsWith('tax-') ||
      (event.id.startsWith('calendar-event-') && !events.some(e => e.id === event.id));

    console.log('[CalendarWidget] Is integrated item:', isIntegratedItem);

    // Parse new date from droppableId
    // Format: "date-YYYY-MM-DD" or "date-YYYY-MM-DD-HH:MM"
    const droppableId = result.destination.droppableId;
    console.log('[CalendarWidget] Destination droppableId:', droppableId);

    const parts = droppableId.split('-');
    console.log('[CalendarWidget] Parsed parts:', parts);

    if (parts[0] === 'date' && parts.length >= 4) {
      const year = parseInt(parts[1]);
      const month = parseInt(parts[2]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[3]);
      const newDate = new Date(year, month, day);
      console.log('[CalendarWidget] New date:', newDate, format(newDate, 'yyyy-MM-dd'));

      if (isIntegratedItem) {
        // Handle integrated items (todo, tax, etc.)
        if (event.id.startsWith('todo-')) {
          // Update todo item's due date through Storage API
          const todoId = event.id.replace('todo-', '');
          console.log('[CalendarWidget] Updating todo via Storage API:', todoId, 'to', format(newDate, 'yyyy-MM-dd'));

          // Use handleTaskDateUpdate for consistency
          handleTaskDateUpdate(todoId, newDate).catch(error => {
            console.error('[CalendarWidget] Failed to update todo date:', error);
          });

          // Emit event with correct source for FullScreenCalendarModal real-time sync
          notifyCalendarDataChanged({
            source: 'todo',
            changeType: 'update',
            itemId: event.id,
            timestamp: Date.now(),
          });

          console.log('[CalendarWidget] Todo date update initiated via drag:', todoId, 'to', format(newDate, 'yyyy-MM-dd'));
          return; // Exit after handling todo items
        }

        // 세금 이벤트는 드래그 불가능하므로 여기에 오지 않아야 함
        if (event.id.startsWith('tax-')) {
          console.warn('Tax events should not be draggable');
          return;
        }

        // calendar-event- 로 시작하는 이벤트는 일반 캘린더 이벤트처럼 처리
        if (!event.id.startsWith('calendar-event-')) {
          return; // Unknown integrated item type
        }
      }

      // For local calendar events, update directly
      // Storage의 CalendarEvent 타입은 startDate/endDate를 사용함
      // IMPORTANT: startDate/endDate는 아래에서 새로 계산하므로 여기서 제외
      const {startDate: _, endDate: __, ...eventWithoutDates} = event as any;
      const updatedEvent: CalendarEvent = {
        ...eventWithoutDates,
        date: newDate,  // 위젯 내부에서는 date 사용
      };

      // Calculate startDate and endDate based on time information
      let startDate: Date;
      let endDate: Date;

      // If time is included in droppableId (WeekView, DayView)
      if (parts.length >= 6) {
        const hour = parseInt(parts[4]);
        const minute = parseInt(parts[5]);

        // Calculate duration from original event
        let duration = 60; // default 1 hour
        if (event.startTime && event.endTime) {
          const [startHour, startMin] = event.startTime.split(':').map(Number);
          const [endHour, endMin] = event.endTime.split(':').map(Number);
          duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        }

        // Set new start time
        updatedEvent.startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Calculate new end time
        const endMinutes = hour * 60 + minute + duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        updatedEvent.endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

        // Create startDate and endDate with time (UTC 기준)
        startDate = new Date(Date.UTC(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
          hour, minute, 0, 0
        ));

        endDate = new Date(Date.UTC(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
          endHour, endMin, 0, 0
        ));
      } else {
        // No specific time in droppableId - check event type
        // Priority: allDay flag > existing time
        if (event.allDay) {
          // AllDay event - preserve multi-day duration
          // Calculate original duration in days
          const originalStart = new Date(event.date);
          const originalEnd = event.endDate ? new Date(event.endDate) : originalStart;
          const durationDays = Math.ceil((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24));

          startDate = new Date(Date.UTC(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            0, 0, 0, 0
          ));

          // Multi-day event: preserve duration
          // Same-day event: endDate = startDate 23:59:59 (inclusive end)
          if (durationDays > 0) {
            // Multi-day: add duration to new start date
            endDate = new Date(Date.UTC(
              newDate.getFullYear(),
              newDate.getMonth(),
              newDate.getDate() + durationDays,
              23, 59, 59, 999
            ));
          } else {
            // Same-day: end at 23:59:59 of start date
            endDate = new Date(Date.UTC(
              newDate.getFullYear(),
              newDate.getMonth(),
              newDate.getDate(),
              23, 59, 59, 999
            ));
          }
        } else if (event.startTime && event.endTime) {
          // Preserve existing time for timed events (UTC 기준)
          const [startHour, startMin] = event.startTime.split(':').map(Number);
          const [endHour, endMin] = event.endTime.split(':').map(Number);

          startDate = new Date(Date.UTC(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            startHour, startMin, 0, 0
          ));

          endDate = new Date(Date.UTC(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            endHour, endMin, 0, 0
          ));
        } else {
          // No time info and not allDay - default to allDay behavior
          startDate = new Date(Date.UTC(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            0, 0, 0, 0
          ));

          endDate = new Date(Date.UTC(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate() + 1,
            0, 0, 0, 0
          ));
        }
      }

      // Add Storage-required fields (startDate/endDate as ISO strings)
      (updatedEvent as any).startDate = startDate.toISOString();
      (updatedEvent as any).endDate = endDate.toISOString();

      console.log('[CalendarWidget] Updating calendar event:', updatedEvent);
      console.log('[CalendarWidget] startDate:', (updatedEvent as any).startDate);
      console.log('[CalendarWidget] endDate:', (updatedEvent as any).endDate);
      updateEvent(updatedEvent);
    }
  };

  // View title generation
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
              {/* Search */}
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
              
              {/* View mode selector */}
              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          {(() => {
                            const currentMode = viewModes.find(v => v.value === currentView);
                            const Icon = currentMode ? viewModeIcons[currentMode.icon as keyof typeof viewModeIcons] : Grid3x3;
                            return <Icon className="h-4 w-4" />;
                          })()}
                        </Button>
                      </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>보기 모드</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {viewModes.map((mode) => {
                        const Icon = viewModeIcons[mode.icon as keyof typeof viewModeIcons];
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
                  <TooltipContent>
                    <p>{viewModes.find(v => v.value === currentView)?.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Source Filter */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowSourceFilter(!showSourceFilter)}
              >
                <Filter className={cn(
                  "h-4 w-4",
                  (sourceFilters.sources && sourceFilters.sources.length < 3) && "text-primary"
                )} />
              </Button>

              {/* Settings - Now Active! */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowSettingsModal(true)}
                aria-label={getWidgetText.calendar.title('ko')}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Maximize */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowFullScreen(true)}
                aria-label={getWidgetText.calendar.maximize('ko')}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Source filter UI */}
          {showSourceFilter && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">소스:</span>
              {(['calendar', 'todo', 'tax'] as CalendarItemSource[]).map((source) => {
                const activeSources = sourceFilters.sources || ['calendar', 'todo', 'tax'];
                const isActive = activeSources.includes(source);
                const count = sourceCountStats[source] || 0;

                const sourceColors = {
                  calendar: 'bg-blue-100 text-blue-700 border-blue-200',
                  todo: 'bg-green-100 text-green-700 border-green-200',
                  tax: 'bg-red-100 text-red-700 border-red-200',
                };

                return (
                  <Badge
                    key={source}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer text-xs",
                      isActive && sourceColors[source]
                    )}
                    onClick={() => toggleSourceFilter(source)}
                  >
                    {source === 'calendar' && '캘린더'}
                    {source === 'todo' && '할일'}
                    {source === 'tax' && '세무'}
                    <span className="ml-1">({count})</span>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-2 pb-2" ref={contentRef}>
          <div className="flex flex-col h-full">
            {/* Navigation bar */}
            <div className="calendar-nav mb-2 px-2">
              <div className="flex items-center justify-between">
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
                
                {/* Add event button */}
                <Popover 
                  open={showEventPopover} 
                  onOpenChange={(open) => {
                    setShowEventPopover(open);
                    if (!open) {
                      setEditingEvent(null);
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button size="sm" className="h-7 px-2">
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="text-xs">일정</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="end">
                    <EventForm
                      event={editingEvent}
                      selectedDate={selectedDate}
                      onSave={handleEventSave}
                      onCancel={() => {
                        setShowEventPopover(false);
                        setEditingEvent(null);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* View content with DragDropContext */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex-1 overflow-hidden">
                {currentView === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateSelect={handleDateSelect}
                  onEventClick={handleEventClick}
                  onDateDoubleClick={handleDateDoubleClick}
                  selectedDate={selectedDate}
                  containerHeight={containerSize.height}
                  containerWidth={containerSize.width}
                  gridSize={effectiveGridSize}
                  weekStartsOn={settings.weekStartsOn}
                  showWeekNumbers={settings.showWeekNumbers}
                  onTaskDateUpdate={handleTaskDateUpdate}
                />
              )}
              
              {currentView === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDateSelect={handleDateSelect}
                  onEventClick={handleEventClick}
                  onDateDoubleClick={handleDateDoubleClick}
                  containerHeight={containerSize.height}
                  weekStartsOn={settings.weekStartsOn}
                />
              )}
              
              {currentView === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onDateDoubleClick={handleDateDoubleClick}
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
              </div>
            </DragDropContext>
          </div>
        </CardContent>
      </Card>
      
      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => {
          setShowEventDetail(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEventEdit}
        onDelete={handleEventDelete}
      />
      
      {/* Settings Modal - New! */}
      <CalendarSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSave={saveSettings}
      />

      {/* Full Screen Modal */}
      <FullScreenCalendarModal
        isOpen={showFullScreen}
        onClose={() => setShowFullScreen(false)}
        initialDate={selectedDate}
        initialEvents={filteredEvents} // 투두와 세금 이벤트를 포함한 모든 이벤트 전달
        onEventUpdate={(updatedEvents) => {
          // Sync events back to the widget if needed
          // Only update local calendar events, not integrated items
          const localEvents = updatedEvents.filter(e =>
            !e.id.startsWith('todo-') &&
            !e.id.startsWith('tax-') &&
            !e.id.startsWith('calendar-event-')
          );
          if (localEvents.length > 0) {
            // Update local events if needed
          }
        }}
      />
    </>
  );
}