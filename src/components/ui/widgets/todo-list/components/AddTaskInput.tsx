'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus,
  Flag,
  CalendarDays,
  FolderPlus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { format } from 'date-fns';
import type { TodoPriority } from '../types';
import { priorityColors, DEFAULT_PRIORITY } from '../constants';

interface AddTaskInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (title: string, priority?: TodoPriority, dueDate?: Date) => void;
  onCancel?: () => void;
  priority?: TodoPriority;
  onPriorityChange?: (priority: TodoPriority) => void;
  dueDate?: Date;
  onDueDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  isSection?: boolean;
}

export function AddTaskInput({
  value = '',
  onChange,
  onSubmit,
  onCancel,
  priority = DEFAULT_PRIORITY,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  placeholder = getWidgetText.todoList.placeholder('ko'),
  autoFocus = true,
  className,
  isSection = false
}: AddTaskInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [localPriority, setLocalPriority] = useState<TodoPriority>(priority);
  const [localDueDate, setLocalDueDate] = useState<Date | undefined>(dueDate);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setLocalPriority(priority);
  }, [priority]);

  useEffect(() => {
    setLocalDueDate(dueDate);
  }, [dueDate]);

  const handleValueChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handlePriorityChange = (newPriority: TodoPriority) => {
    setLocalPriority(newPriority);
    onPriorityChange?.(newPriority);
  };

  const handleDueDateChange = (newDate: Date | undefined) => {
    setLocalDueDate(newDate);
    onDueDateChange?.(newDate);
    setDatePopoverOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && localValue.trim()) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSubmit = () => {
    if (localValue.trim()) {
      onSubmit?.(localValue.trim(), isSection ? undefined : localPriority, localDueDate);
      setLocalValue('');
      setLocalPriority(DEFAULT_PRIORITY);
      setLocalDueDate(undefined);
    }
  };

  const handleCancel = () => {
    setLocalValue('');
    setLocalPriority(DEFAULT_PRIORITY);
    setLocalDueDate(undefined);
    onCancel?.();
  };

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded", className)}>
      {/* 섹션 아이콘 (섹션 추가 모드일 때) */}
      {isSection && (
        <FolderPlus className="h-4 w-4 text-muted-foreground" />
      )}
      
      <Input
        ref={inputRef}
        value={localValue}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 h-7 text-sm"
        autoFocus={autoFocus}
      />
      
      {/* 우선순위 선택 (태스크 모드일 때만, 백업 파일과 동일한 개별 버튼 방식) */}
      {!isSection && (
        <div className="flex gap-0.5">
          {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePriorityChange(p)}
              className={cn(
                "p-1 rounded transition-colors",
                localPriority === p 
                  ? "bg-primary/10" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              )}
              title={getWidgetText.todoList.priorities[p]?.('ko')}
            >
              <Flag className={cn("h-3 w-3", priorityColors[p]?.icon || '')} />
            </button>
          ))}
        </div>
      )}
      
      {/* 날짜 선택 팝오버 (태스크 모드일 때만) */}
      {!isSection && (
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2",
                localDueDate && "text-primary"
              )}
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              {localDueDate ? 
                format(localDueDate, 'M/d') : 
                '날짜'
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localDueDate}
              onSelect={handleDueDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
      
      {/* 추가 버튼 */}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={handleSubmit}
        disabled={!localValue.trim()}
      >
        <Plus className="h-3 w-3" />
      </Button>

      {/* 취소 버튼 */}
      {onCancel && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}