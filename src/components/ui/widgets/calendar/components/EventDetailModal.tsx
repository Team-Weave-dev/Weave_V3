'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarIcon,
  Clock,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { eventTypeConfig, type EventDetailModalProps } from '../types';
import { getEventDetailText } from '@/config/brand';

const iconMap = {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarDays,
  CalendarIcon,
};

/**
 * EventDetailModal Component
 * 이벤트의 상세 정보를 표시하는 모달
 */
const EventDetailModal = React.memo(({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: EventDetailModalProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!event) return null;

  const config = eventTypeConfig[event.type || 'other'];
  const Icon = iconMap[config.icon as keyof typeof iconMap];
  
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
                <Badge variant={config.badgeVariant} className="mt-1 text-xs">
                  {config.label}
                </Badge>
              </div>
            </div>
            {/* 읽기 전용 이벤트는 수정/삭제 버튼 표시하지 않음 */}
            {!event.isReadOnly && (
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
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
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
                <p className="text-sm text-muted-foreground">{getEventDetailText.allDay('ko')}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {event.startTime}
                  {event.endTime && ` - ${event.endTime}`}
                </p>
              )}
            </div>
          </div>
          
          {/* 장소 */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{event.location}</p>
              </div>
            </div>
          )}
          
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
            {getEventDetailText.buttonClose('ko')}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 삭제 확인 다이얼로그 */}
      {onDelete && (
        <DeleteDialog
          open={showDeleteDialog}
          title={getEventDetailText.deleteTitle('ko')}
          description={getEventDetailText.deleteConfirm('ko')}
          confirmLabel={getEventDetailText.buttonDelete('ko')}
          cancelLabel={getEventDetailText.buttonCancel('ko')}
          icon={<CalendarIcon className="h-6 w-6" />}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => {
            onDelete(event);
            setShowDeleteDialog(false);
          }}
        />
      )}
    </Dialog>
  );
});

EventDetailModal.displayName = 'EventDetailModal';

export default EventDetailModal;