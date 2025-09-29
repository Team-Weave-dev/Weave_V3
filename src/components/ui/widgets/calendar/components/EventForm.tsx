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
    if (event) {
      return {
        title: event.title || '',
        date: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : format(selectedDate || new Date(), 'yyyy-MM-dd'),
        location: event.location || '',
        description: event.description || '',
        allDay: event.allDay !== undefined ? event.allDay : true,
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        type: (event.type || 'meeting') as CalendarEvent['type'],
      };
    }
    return {
      title: '',
      date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
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
      setFormData({
        title: event.title || '',
        date: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : format(selectedDate || new Date(), 'yyyy-MM-dd'),
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
    const eventData: Partial<CalendarEvent> = {
      title: formData.title || '제목 없음',
      date: new Date(formData.date),
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

  const handleReset = () => {
    setFormData({
      title: '',
      date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
      location: '',
      description: '',
      allDay: true,
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">
        {event ? '일정 수정' : '새 일정 만들기'}
      </h4>
      
      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="event-title" className="text-xs">제목</Label>
        <Input 
          id="event-title"
          placeholder="일정 제목" 
          className="h-8"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* 일정 타입 */}
      <div className="space-y-2">
        <Label htmlFor="event-type" className="text-xs">유형</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData({ ...formData, type: value as any })}
        >
          <SelectTrigger id="event-type" className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">회의</SelectItem>
            <SelectItem value="task">작업</SelectItem>
            <SelectItem value="reminder">알림</SelectItem>
            <SelectItem value="deadline">마감</SelectItem>
            <SelectItem value="holiday">휴일</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 날짜 */}
      <div className="space-y-2">
        <Label htmlFor="event-date" className="text-xs">날짜</Label>
        <Input 
          id="event-date"
          type="date" 
          className="h-8"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      {/* 종일 일정 토글 */}
      <div className="flex items-center justify-between">
        <Label htmlFor="all-day" className="text-xs">종일 일정</Label>
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
            <Label htmlFor="start-time" className="text-xs">시작 시간</Label>
            <Input
              id="start-time"
              type="time"
              className="h-8"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time" className="text-xs">종료 시간</Label>
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
          장소
        </Label>
        <Input 
          id="event-location"
          placeholder="장소 입력 (선택사항)" 
          className="h-8"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="event-description" className="text-xs">설명</Label>
        <Textarea 
          id="event-description"
          placeholder="설명 입력 (선택사항)"
          className="min-h-[60px] text-sm resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          취소
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!formData.title}
        >
          {event ? '수정' : '저장'}
        </Button>
      </div>
    </div>
  );
});

EventForm.displayName = 'EventForm';

export default EventForm;