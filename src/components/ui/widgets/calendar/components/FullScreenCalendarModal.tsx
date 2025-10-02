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
} from '../index';

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
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendarEvents(initialEvents);

  const {
    settings,
    saveSettings,
  } = useCalendarSettings();

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
    if (editingEvent && editingEvent.id) {
      // Update existing event (only if it has an ID)
      const updatedEvent = { ...editingEvent, ...eventData } as CalendarEvent;
      updateEvent(updatedEvent);
    } else {
      // Create new event
      const newEvent = {
        id: `event-${Date.now()}`,
        ...eventData,
      } as CalendarEvent;
      addEvent(newEvent);
      // Note: addEvent already saves to localStorage and notifies other widgets
    }

    setShowEventPopover(false);
    setEditingEvent(null);

    // Notify parent of event changes (if provided)
    if (onEventUpdate) {
      // Wait for state to update
      setTimeout(() => onEventUpdate(events), 0);
    }
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventDetail(false);
    setSelectedEvent(null);
    setShowEventPopover(true);
  };

  const handleEventDelete = (event: CalendarEvent) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      deleteEvent(event.id);
      setShowEventDetail(false);
      setSelectedEvent(null);
      onEventUpdate?.(events);
    }
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

  // Handle drag end for event rescheduling
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Extract event ID from draggableId (format: "event-{id}")
    const eventId = result.draggableId.replace('event-', '');
    const event = filteredEvents.find(e => e.id === eventId);
    if (!event) return;

    // Check if event is from integrated calendar (other widgets)
    // Integrated items cannot be rescheduled from calendar widget
    const isIntegratedItem =
      event.id.startsWith('todo-') ||
      event.id.startsWith('tax-') ||
      event.id.startsWith('calendar-event-');

    if (isIntegratedItem) {
      console.warn('Integrated calendar items cannot be rescheduled from calendar widget');
      return;
    }

    // Parse new date from droppableId
    // Format: "date-YYYY-MM-DD" or "date-YYYY-MM-DD-HH:MM"
    const droppableId = result.destination.droppableId;
    const parts = droppableId.split('-');

    if (parts[0] === 'date' && parts.length >= 4) {
      const year = parseInt(parts[1]);
      const month = parseInt(parts[2]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[3]);
      const newDate = new Date(year, month, day);

      // For local calendar events, update directly
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

      updateEvent(updatedEvent);
    }
  };

  // Filtered events
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

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
