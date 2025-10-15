'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Grid3x3,
  CalendarDays,
  Calendar as CalendarIconOutline,
  List,
  X,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getWidgetText } from '@/config/brand';
import type { CalendarEvent } from '@/types/dashboard';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { taskService } from '@/lib/storage';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { updateCalendarEvent } from '@/lib/mock/calendar-events';
import {
  MonthView,
  WeekView,
  DayView,
  AgendaView,
  EventDetailModal,
  EventForm,
  CalendarSettingsModal,
  useCalendarSettings,
  viewModes,
  type ViewMode,
} from '../index';
import { useIntegratedCalendar } from '@/hooks/useIntegratedCalendar';
import { notifyCalendarDataChanged, addCalendarDataChangedListener } from '@/lib/calendar-integration/events';

interface FullScreenCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialEvents?: CalendarEvent[];
  onEventUpdate?: (events: CalendarEvent[]) => void;
}

const viewModeIcons = {
  Grid3x3,
  CalendarDays,
  CalendarIconOutline,
  List,
};

/**
 * FullScreenCalendarModal Component
 * 전체 화면 캘린더 모달
 */
export default function FullScreenCalendarModal({
  isOpen,
  onClose,
  initialDate,
  initialEvents,
  onEventUpdate,
}: FullScreenCalendarModalProps) {
  // States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [currentView, setCurrentView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Refs and container size tracking
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  // Custom hooks
  // Calendar events hook (same as CalendarWidget) - for local calendar events
  const {
    events: localCalendarEvents,
    addEvent: addLocalEvent,
    updateEvent: updateLocalEvent,
    deleteEvent: deleteLocalEvent,
    refreshEvents: refreshLocalEvents,
  } = useCalendarEvents();

  // Integrated calendar hook for multi-source data (todo, tax)
  const {
    items: integratedItems,
    refresh: refreshIntegratedItems,
  } = useIntegratedCalendar();

  const {
    settings,
    saveSettings,
  } = useCalendarSettings();

  // Listen to todo/tax changes from widgets and refresh integrated items
  React.useEffect(() => {
    const handleCalendarDataChanged = (event: CustomEvent) => {
      const { source } = event.detail;

      // Refresh when todo or tax data changes (from widgets)
      if (source === 'todo' || source === 'tax') {
        console.log('[FullScreenCalendarModal] Integrated data changed, refreshing:', event.detail);
        refreshIntegratedItems();
      }
    };

    const unsubscribe = addCalendarDataChangedListener(handleCalendarDataChanged);
    return () => unsubscribe();
  }, [refreshIntegratedItems]);

  // Container size detection with ResizeObserver for responsive layout
  React.useEffect(() => {
    const updateSize = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();

        // Calculate available space for calendar views
        const navHeight = 60; // Navigation bar height
        const padding = 32; // Padding (px-6 pb-6 = 24px + margin)

        const availableWidth = Math.max(800, rect.width);
        const availableHeight = Math.max(400, rect.height - navHeight - padding);

        setContainerSize({
          width: availableWidth,
          height: availableHeight
        });
      }
    };

    // Initial size calculation
    updateSize();

    // Create ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateSize);
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen, currentView]); // Re-calculate when modal opens or view changes

  // Convert UnifiedCalendarItem to CalendarEvent
  const convertToCalendarEvents = React.useCallback((items: typeof integratedItems): CalendarEvent[] => {
    // Filter out 'calendar' items to prevent duplicates with localCalendarEvents
    // Only convert 'todo' and 'tax' items from other widgets
    return items
      .filter(item => item.source !== 'calendar')
      .map(item => {
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
  }, []);

  // Handle task date updates via Storage API
  const handleTaskDateUpdate = React.useCallback(async (taskId: string, newDate: Date) => {
    try {
      console.log('[FullScreenCalendarModal] Updating task date via Storage API:', taskId, newDate);

      await taskService.update(taskId, {
        dueDate: newDate.toISOString()
        // updatedAt은 BaseService가 자동으로 설정
      });

      console.log('[FullScreenCalendarModal] Task date updated successfully via Storage API');

      // Refresh integrated calendar data
      refreshIntegratedItems();
    } catch (error) {
      console.error('[FullScreenCalendarModal] Failed to update task date:', error);
    }
  }, [refreshIntegratedItems]);

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleViewChange = (newView: string) => {
    setCurrentView(newView as ViewMode);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
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
    // Save to local calendar events using the same method as CalendarWidget
    if (eventData.id) {
      // Update existing event
      updateLocalEvent(eventData as CalendarEvent);
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: `calendar-event-${Date.now()}`,
        title: eventData.title || '',
        date: eventData.date || selectedDate || new Date(),
        type: eventData.type || 'meeting',
        allDay: eventData.allDay ?? true,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        description: eventData.description,
      };
      addLocalEvent(newEvent);
      refreshLocalEvents();
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

  const handleEventDelete = (event: CalendarEvent) => {
    // Only delete local calendar events (not integrated items from other widgets)
    const isLocalEvent = localCalendarEvents.some(e => e.id === event.id);

    if (isLocalEvent) {
      deleteLocalEvent(event.id);
      refreshLocalEvents();
    } else {
      console.warn('[FullScreenCalendarModal] Can only delete local calendar events, not integrated items');
    }

    setShowEventDetail(false);
    setSelectedEvent(null);
  };

  const handleDateDoubleClick = (date: Date, time?: string) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setShowEventPopover(true);

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

  // Filtered events (must be before handleDragEnd)
  const filteredEvents = React.useMemo(() => {
    // 1. Local calendar events (from useCalendarEvents - same as CalendarWidget)
    const localEvents = localCalendarEvents;

    // 2. Convert integrated items to CalendarEvent format (todo, tax from other widgets)
    const convertedEvents = convertToCalendarEvents(integratedItems);

    // 3. Combine all events
    const allEvents = [...localEvents, ...convertedEvents];

    // 4. Remove duplicates by ID (in case of overlap)
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );

    // 5. Apply search filter
    if (!searchQuery) return uniqueEvents;
    return uniqueEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localCalendarEvents, integratedItems, searchQuery, convertToCalendarEvents]);

  // Handle drag end for event rescheduling
  const handleDragEnd = React.useCallback((result: DropResult) => {
    if (!result.destination) return;

    // Extract event ID from draggableId (format: "event-{id}")
    const eventId = result.draggableId.replace('event-', '');
    const event = filteredEvents.find(e => e.id === eventId);
    if (!event) return;

    // Parse new date from droppableId first (needed for all event types)
    // Format: "date-YYYY-MM-DD" or "date-YYYY-MM-DD-HH:MM"
    const droppableId = result.destination.droppableId;
    const parts = droppableId.split('-');

    if (parts[0] === 'date' && parts.length >= 4) {
      const year = parseInt(parts[1]);
      const month = parseInt(parts[2]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[3]);
      const newDate = new Date(year, month, day);

      // Check if event is from integrated calendar (other widgets)
      const isIntegratedItem =
        event.id.startsWith('todo-') ||
        event.id.startsWith('tax-') ||
        (event.id.startsWith('calendar-event-') && !localCalendarEvents.some(e => e.id === event.id));

      if (isIntegratedItem) {
        // Handle integrated items (todo, tax, etc.)
        if (event.id.startsWith('todo-')) {
          // Update todo item's due date through Storage API
          const todoId = event.id.replace('todo-', '');
          console.log('[FullScreenCalendarModal] Updating todo via Storage API:', todoId, 'to', format(newDate, 'yyyy-MM-dd'));

          // Use handleTaskDateUpdate for consistency
          handleTaskDateUpdate(todoId, newDate).catch(error => {
            console.error('[FullScreenCalendarModal] Failed to update todo date:', error);
          });

          // Emit event with correct source for TodoListWidget real-time sync
          notifyCalendarDataChanged({
            source: 'todo',
            changeType: 'update',
            itemId: event.id,
            timestamp: Date.now(),
          });

          console.log('[FullScreenCalendarModal] Todo date update initiated via drag:', todoId, 'to', format(newDate, 'yyyy-MM-dd'));
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

      // For local calendar events, update directly (same as CalendarWidget)
      const updatedEvent: CalendarEvent = {
        ...event,
        date: newDate,
      };

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
      }

      updateLocalEvent(updatedEvent);
    }
  }, [filteredEvents, localCalendarEvents, handleTaskDateUpdate, updateLocalEvent]);

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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[1600px] h-[90vh] flex flex-col p-0" hideClose>
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {getWidgetText.calendar.fullScreen('ko')}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {/* Search */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <Input
                      placeholder="일정 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9"
                    />
                  </PopoverContent>
                </Popover>

                {/* View mode selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 px-3">
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

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setShowSettingsModal(true)}
                  aria-label={getWidgetText.calendar.title('ko')}
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={onClose}
                  aria-label="닫기"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div ref={contentRef} className="flex-1 flex flex-col px-6 pb-6 min-h-0">
            {/* Navigation bar - Fixed */}
            <div className="calendar-nav mb-4 mt-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="h-9 px-3"
                  >
                    오늘
                  </Button>
                  <div className="flex items-center ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrev}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-lg font-semibold px-3">
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
                    <Button size="sm" className="h-9 px-3">
                      <Plus className="h-4 w-4 mr-2" />
                      일정 추가
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

            {/* View content with DragDropContext - Scrollable */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
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
                    gridSize={{ w: 5, h: 5 }}
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
        </DialogContent>
      </Dialog>

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

      {/* Settings Modal */}
      <CalendarSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </>
  );
}
