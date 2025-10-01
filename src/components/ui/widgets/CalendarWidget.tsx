'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
} from 'lucide-react';
import type { CalendarWidgetProps, CalendarEvent } from '@/types/dashboard';
import { format, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import { useIntegratedCalendar } from '@/hooks/useIntegratedCalendar';
import { integratedCalendarManager } from '@/lib/calendar-integration';
import type { CalendarItemSource, UnifiedCalendarItem } from '@/types/integrated-calendar';
import { cn } from '@/lib/utils';

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
  // States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [currentView, setCurrentView] = useState<ViewMode>(view);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  
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
  } = useCalendarEvents(propEvents);

  const {
    settings,
    saveSettings,
  } = useCalendarSettings();

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

  // Convert UnifiedCalendarItem to CalendarEvent
  const convertToCalendarEvents = (items: UnifiedCalendarItem[]): CalendarEvent[] => {
    return items.map(item => {
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

    // Apply search filter
    if (!searchQuery) return uniqueEvents;
    return uniqueEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, integratedItems, searchQuery, convertToCalendarEvents]);

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

  const handleEventSave = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      // Update existing event
      const updatedEvent = { ...editingEvent, ...eventData } as CalendarEvent;
      updateEvent(updatedEvent);
    } else {
      // Create new event
      const newEvent = {
        id: `event-${Date.now()}`,
        ...eventData,
      } as CalendarEvent;
      addEvent(newEvent);
      onEventAdd?.(newEvent.date, newEvent);
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
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
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
    }
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
              >
                <Settings className="h-4 w-4" />
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
                const count = sourceStats.bySource[source] || 0;

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
        <CardContent className="flex-1 overflow-hidden px-1 pb-2" ref={contentRef}>
          <div className="flex flex-col h-full">
            {/* Navigation bar */}
            <div className="calendar-nav mb-2 px-3">
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
            
            {/* View content */}
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
    </>
  );
}