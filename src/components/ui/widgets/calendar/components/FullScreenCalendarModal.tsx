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
import { taskService, calendarService } from '@/lib/storage';
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

  // Custom hooks
  const {
    items: integratedItems,
    refresh: refreshIntegratedItems,
  } = useIntegratedCalendar();

  const {
    settings,
    saveSettings,
  } = useCalendarSettings();

  // Convert UnifiedCalendarItem to CalendarEvent
  const convertToCalendarEvents = React.useCallback((items: typeof integratedItems): CalendarEvent[] => {
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
  }, []);

  // Handle task date updates via Storage API
  const handleTaskDateUpdate = React.useCallback(async (taskId: string, newDate: Date) => {
    try {
      console.log('[FullScreenCalendarModal] Updating task date via Storage API:', taskId, newDate);

      await taskService.update(taskId, {
        dueDate: newDate.toISOString(),
        updatedAt: new Date().toISOString()
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
    // FullScreenCalendarModal은 통합 캘린더만 표시하므로
    // 이벤트 추가/수정은 지원하지 않음
    console.warn('[FullScreenCalendarModal] Event save not supported in integrated view');
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
    console.warn('[FullScreenCalendarModal] Event delete not supported in integrated view');
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
    // Convert integrated items to CalendarEvent format
    const convertedEvents = convertToCalendarEvents(integratedItems);

    // Apply search filter
    if (!searchQuery) return convertedEvents;
    return convertedEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [integratedItems, searchQuery, convertToCalendarEvents]);

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
        event.id.startsWith('calendar-event-');

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

          console.log('[FullScreenCalendarModal] Todo date update initiated via drag:', todoId, 'to', format(newDate, 'yyyy-MM-dd'));
          return; // Exit after handling todo items
        }

        if (event.id.startsWith('tax-')) {
          console.warn('Tax events should not be draggable');
          return;
        }

        if (event.id.startsWith('calendar-event-')) {
          // Update calendar event date through Storage API
          const calendarEventId = event.id.replace('calendar-event-', '');
          console.log('[FullScreenCalendarModal] Updating calendar event via Storage API:', calendarEventId, 'to', format(newDate, 'yyyy-MM-dd'));

          // CalendarEvent 엔티티는 startDate와 endDate를 사용
          const isoDate = newDate.toISOString();
          calendarService.update(calendarEventId, {
            startDate: isoDate,
            endDate: isoDate, // 단일 날짜 이벤트는 startDate === endDate
            updatedAt: new Date().toISOString()
          }).then(() => {
            console.log('[FullScreenCalendarModal] Calendar event date updated successfully via Storage API');
            refreshIntegratedItems();
          }).catch((error: Error) => {
            console.error('[FullScreenCalendarModal] Failed to update calendar event date:', error);
          });

          console.log('[FullScreenCalendarModal] Calendar event date update initiated via drag:', calendarEventId, 'to', format(newDate, 'yyyy-MM-dd'));
          return;
        }
      }

      console.warn('[FullScreenCalendarModal] Unknown event type:', event.id);
    }
  }, [filteredEvents, handleTaskDateUpdate, refreshIntegratedItems]);

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
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0" hideClose>
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

          <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col">
            {/* Navigation bar */}
            <div className="calendar-nav mb-4 mt-4">
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
                    containerHeight={800}
                    containerWidth={1200}
                    gridSize={{ w: 5, h: 5 }}
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
                    containerHeight={800}
                  />
                )}

                {currentView === 'day' && (
                  <DayView
                    currentDate={currentDate}
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    onDateDoubleClick={handleDateDoubleClick}
                    containerHeight={800}
                  />
                )}

                {currentView === 'agenda' && (
                  <AgendaView
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    containerHeight={800}
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
