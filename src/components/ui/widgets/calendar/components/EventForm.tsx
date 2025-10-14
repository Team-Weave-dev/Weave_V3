'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import type { CalendarEvent } from '@/types/dashboard';
import { getEventFormText } from '@/config/brand';

interface EventFormProps {
  event?: CalendarEvent | null;
  selectedDate?: Date;
  onSave: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

/**
 * EventForm Component
 * 이벤트 추가/편집을 위한 폼 컴포넌트
 */
const EventForm = React.memo(({
  event,
  selectedDate,
  onSave,
  onCancel,
}: EventFormProps) => {
  const [formData, setFormData] = useState(() => {
    // Initialize with event data if provided, otherwise use defaults
    const defaultDate = selectedDate || new Date();
    if (event) {
      const startDate = event.date ? format(new Date(event.date), 'yyyy-MM-dd') : format(defaultDate, 'yyyy-MM-dd');
      const endDate = event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : startDate;
      return {
        title: event.title || '',
        startDate,
        endDate,
        location: event.location || '',
        description: event.description || '',
        allDay: event.allDay !== undefined ? event.allDay : true,
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        type: (event.type || 'meeting') as CalendarEvent['type'],
      };
    }
    const startDate = format(defaultDate, 'yyyy-MM-dd');
    return {
      title: '',
      startDate,
      endDate: startDate, // 기본값은 시작일과 동일
      location: '',
      description: '',
      allDay: true,
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting' as CalendarEvent['type'],
    };
  });

  useEffect(() => {
    if (event) {
      const defaultDate = selectedDate || new Date();
      const startDate = event.date ? format(new Date(event.date), 'yyyy-MM-dd') : format(defaultDate, 'yyyy-MM-dd');
      const endDate = event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : startDate;
      setFormData({
        title: event.title || '',
        startDate,
        endDate,
        location: event.location || '',
        description: event.description || '',
        allDay: event.allDay !== undefined ? event.allDay : true,
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        type: event.type || 'meeting',
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = () => {
    // 유효성 검사: 종료일이 시작일보다 이전인지 확인
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('종료 날짜는 시작 날짜보다 이전일 수 없습니다.');
      return;
    }

    // 같은 날인 경우, 시간 검증 (종일이 아닐 때)
    if (!formData.allDay && formData.startDate === formData.endDate) {
      if (formData.endTime <= formData.startTime) {
        alert('같은 날인 경우 종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
      }
    }

    const eventData: Partial<CalendarEvent> = {
      title: formData.title || getEventFormText.defaultTitle('ko'),
      date: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      type: formData.type,
      allDay: formData.allDay,
      startTime: !formData.allDay ? formData.startTime : undefined,
      endTime: !formData.allDay ? formData.endTime : undefined,
      location: formData.location || undefined,
      description: formData.description || undefined,
    };

    if (event) {
      eventData.id = event.id;
    }

    onSave(eventData);
  };

  // 엔터키로 저장하는 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && formData.title) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    const startDate = format(selectedDate || new Date(), 'yyyy-MM-dd');
    setFormData({
      title: '',
      startDate,
      endDate: startDate,
      location: '',
      description: '',
      allDay: true,
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
    });
  };

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      <h4 className="font-medium text-sm">
        {event ? getEventFormText.titleEdit('ko') : getEventFormText.titleNew('ko')}
      </h4>

      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="event-title" className="text-xs">{getEventFormText.labelTitle('ko')}</Label>
        <Input
          id="event-title"
          placeholder={getEventFormText.placeholderTitle('ko')}
          className="h-8"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          autoFocus
        />
      </div>

      {/* 일정 타입 */}
      <div className="space-y-2">
        <Label htmlFor="event-type" className="text-xs">{getEventFormText.labelType('ko')}</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as CalendarEvent['type'] })}
        >
          <SelectTrigger id="event-type" className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">{getEventFormText.typeMeeting('ko')}</SelectItem>
            <SelectItem value="task">{getEventFormText.typeTask('ko')}</SelectItem>
            <SelectItem value="reminder">{getEventFormText.typeReminder('ko')}</SelectItem>
            <SelectItem value="deadline">{getEventFormText.typeDeadline('ko')}</SelectItem>
            <SelectItem value="holiday">{getEventFormText.typeHoliday('ko')}</SelectItem>
            <SelectItem value="other">{getEventFormText.typeOther('ko')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 날짜 범위 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="event-start-date" className="text-xs">{getEventFormText.labelStartDate('ko')}</Label>
          <Input
            id="event-start-date"
            type="date"
            className="h-8"
            value={formData.startDate}
            onChange={(e) => {
              const newStartDate = e.target.value;
              setFormData({
                ...formData,
                startDate: newStartDate,
                // 종료일이 시작일보다 이전이면 자동으로 시작일과 같게 설정
                endDate: new Date(formData.endDate) < new Date(newStartDate) ? newStartDate : formData.endDate
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end-date" className="text-xs">{getEventFormText.labelEndDate('ko')}</Label>
          <Input
            id="event-end-date"
            type="date"
            className="h-8"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate} // 시작일 이전 날짜는 선택 불가
          />
        </div>
      </div>

      {/* 종일 일정 토글 */}
      <div className="flex items-center justify-between">
        <Label htmlFor="all-day" className="text-xs">{getEventFormText.labelAllDay('ko')}</Label>
        <Switch
          id="all-day"
          checked={formData.allDay}
          onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
        />
      </div>

      {/* 시간 선택 (종일 아닐 때만) */}
      {!formData.allDay && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="start-time" className="text-xs">{getEventFormText.labelStartTime('ko')}</Label>
            <Input
              id="start-time"
              type="time"
              className="h-8"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time" className="text-xs">{getEventFormText.labelEndTime('ko')}</Label>
            <Input
              id="end-time"
              type="time"
              className="h-8"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* 장소 */}
      <div className="space-y-2">
        <Label htmlFor="event-location" className="text-xs">
          <MapPin className="inline h-3 w-3 mr-1" />
          {getEventFormText.labelLocation('ko')}
        </Label>
        <Input
          id="event-location"
          placeholder={getEventFormText.placeholderLocation('ko')}
          className="h-8"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="event-description" className="text-xs">{getEventFormText.labelDescription('ko')}</Label>
        <Textarea
          id="event-description"
          placeholder={getEventFormText.placeholderDescription('ko')}
          className="min-h-[60px] text-sm resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          onKeyDown={(e) => {
            // Textarea에서는 Shift+Enter로 줄바꿈, Enter만 누르면 저장 방지
            if (e.key === 'Enter' && !e.shiftKey) {
              e.stopPropagation();
            }
          }}
        />
      </div>

      {/* 버튼들 */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleReset();
            onCancel();
          }}
        >
          {getEventFormText.buttonCancel('ko')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!formData.title}
        >
          {event ? getEventFormText.buttonUpdate('ko') : getEventFormText.buttonSave('ko')}
        </Button>
      </div>
    </div>
  );
});

EventForm.displayName = 'EventForm';

export default EventForm;