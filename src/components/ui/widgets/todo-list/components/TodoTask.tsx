'use client';

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Flag,
  Plus,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import type { TodoTask as TodoTaskType, TodoPriority, DateFormatType } from '../types';
import { priorityColors, DEFAULT_PRIORITY } from '../constants';
import { formatDateBadge, quickDateOptions } from '../utils/date';
import { AddTaskInput } from './AddTaskInput';

interface TodoTaskProps {
  task: TodoTaskType;
  depth?: number;
  isExpanded?: boolean;
  isDragging?: boolean;
  dateFormat?: DateFormatType;
  onToggleComplete: (taskId: string) => void;
  onToggleExpand: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdateDueDate: (taskId: string, date?: Date) => void;
  onUpdatePriority: (taskId: string, priority: TodoPriority) => void;
  onUpdateTitle?: (taskId: string, title: string) => void;
  onAddSubtask: (parentId: string, title: string, priority?: TodoPriority, dueDate?: Date) => void;
  onDragStart?: (e: React.DragEvent, task: TodoTaskType) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  showAddSubtask?: boolean;
  renderSubtasks?: (task: TodoTaskType) => React.ReactNode;
}

export function TodoTask({
  task,
  depth = 0,
  isExpanded = false,
  isDragging = false,
  dateFormat = 'dday',
  onToggleComplete,
  onToggleExpand,
  onDelete,
  onUpdateDueDate,
  onUpdatePriority,
  onUpdateTitle,
  onAddSubtask,
  onDragStart,
  onDragEnd,
  onDrop,
  showAddSubtask = false,
  renderSubtasks
}: TodoTaskProps) {
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtaskPriority, setSubtaskPriority] = useState<TodoPriority>(DEFAULT_PRIORITY);
  const [subtaskDueDate, setSubtaskDueDate] = useState<Date | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const hasSubtasks = task.children && task.children.length > 0;
  const dateBadge = task.dueDate ? formatDateBadge(task.dueDate, task.completed, dateFormat) : { text: '미정', variant: 'outline' as const };

  const handleAddSubtask = (title: string, priority?: TodoPriority, dueDate?: Date) => {
    if (title.trim()) {
      // 하위 태스크 추가 시 우선순위와 날짜도 전달
      onAddSubtask(task.id, title.trim(), priority, dueDate);
      setNewSubtaskTitle('');
      setSubtaskPriority(DEFAULT_PRIORITY);
      setSubtaskDueDate(undefined);
      setIsAddingSubtask(false);
    }
  };

  return (
    <div 
      className={cn(
        "group",
        isDragging && "opacity-50",
        depth > 0 && "ml-4"
      )}
    >
      <div 
        className={cn(
          "flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-900/50",
          task.completed && "opacity-50"
        )}
        draggable={depth === 0}
        onDragStart={onDragStart ? (e) => onDragStart(e, task) : undefined}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {/* 드래그 핸들 */}
        {depth === 0 && (
          <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        {/* 확장 버튼 */}
        {hasSubtasks && (
          <button
            onClick={() => onToggleExpand(task.id)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            {isExpanded ? 
              <ChevronDown className="h-3 w-3" /> : 
              <ChevronRight className="h-3 w-3" />
            }
          </button>
        )}
        {!hasSubtasks && depth === 0 && <div className="w-4" />}
        
        {/* 체크박스 */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="h-4 w-4"
        />
        
        {/* 태스크 제목 */}
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              if (editValue.trim() && editValue !== task.title) {
                onUpdateTitle?.(task.id, editValue);
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editValue.trim() && editValue !== task.title) {
                  onUpdateTitle?.(task.id, editValue);
                }
                setIsEditing(false);
              }
              if (e.key === 'Escape') {
                setEditValue(task.title);
                setIsEditing(false);
              }
            }}
            className="flex-1 h-6 text-sm"
            autoFocus
          />
        ) : (
          <span 
            className={cn(
              "flex-1 text-sm cursor-pointer",
              task.completed && "line-through text-gray-400"
            )}
            onDoubleClick={() => onUpdateTitle && setIsEditing(true)}
          >
            {task.title}
          </span>
        )}
        
        {/* 하위 작업 추가 버튼 */}
        {showAddSubtask && depth === 0 && (
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
        
        {/* 삭제 버튼 */}
        <button
          onClick={() => onDelete(task.id)}
          className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </button>
        
        {/* 마감일 배지 - 날짜 미지정 시에도 표시 */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <button className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1">
              <Badge variant={dateBadge?.variant} className="text-xs">
                <CalendarDays className="h-3 w-3 mr-1" />
                {dateBadge?.text}
              </Badge>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 space-y-2">
              <div className="text-sm font-medium">마감일 {task.dueDate ? '변경' : '설정'}</div>
              <div className="flex flex-col gap-1">
                {quickDateOptions.map(option => (
                  <Button
                    key={option.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      onUpdateDueDate(task.id, option.value());
                      setDatePopoverOpen(false);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
                {task.dueDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onUpdateDueDate(task.id, undefined);
                      setDatePopoverOpen(false);
                    }}
                  >
                    날짜 제거
                  </Button>
                )}
              </div>
              <div className="border-t pt-2">
                <Calendar
                  selected={task.dueDate}
                  onSelect={(date) => {
                    onUpdateDueDate(task.id, date);
                    setDatePopoverOpen(false);
                  }}
                  mode="single"
                  className="rounded-md"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* 우선순위 플래그 - 항상 표시, 크기 증가 */}
        <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors">
              <Flag className={cn("h-4 w-4", priorityColors[task.priority].icon)} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40" align="end">
            <div className="space-y-1">
              <div className="text-sm font-medium mb-2">우선순위 설정</div>
              {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map(priority => (
                <button
                  key={priority}
                  onClick={() => {
                    onUpdatePriority(task.id, priority);
                    setPriorityPopoverOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                    task.priority === priority && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Flag className={cn("h-3 w-3", priorityColors[priority].icon)} />
                  <span>{getWidgetText.todoList.priorities[priority]?.('ko')}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 하위 작업 추가 입력 - AddTaskInput 사용 */}
      {isAddingSubtask && (
        <div className="ml-6 mt-1">
          <AddTaskInput
            value={newSubtaskTitle}
            onChange={setNewSubtaskTitle}
            onSubmit={handleAddSubtask}
            onCancel={() => {
              setIsAddingSubtask(false);
              setNewSubtaskTitle('');
              setSubtaskPriority(DEFAULT_PRIORITY);
              setSubtaskDueDate(undefined);
            }}
            priority={subtaskPriority}
            onPriorityChange={setSubtaskPriority}
            dueDate={subtaskDueDate}
            onDueDateChange={setSubtaskDueDate}
            placeholder="하위 작업 추가..."
            autoFocus
          />
        </div>
      )}
      
      {/* 하위 작업들 렌더링 */}
      {hasSubtasks && isExpanded && renderSubtasks && (
        <div className="ml-4">
          {renderSubtasks(task)}
        </div>
      )}
    </div>
  );
}