'use client';

import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateGroup, TodoTask } from '../types';

interface TodoDateGroupProps {
  group: DateGroup;
  tasks: TodoTask[];
  isExpanded: boolean;
  onToggleExpand: (groupId: string) => void;
  onAddTask: (groupId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function TodoDateGroup({
  group,
  tasks,
  isExpanded,
  onToggleExpand,
  onAddTask,
  onDragOver,
  onDrop,
  children,
  className
}: TodoDateGroupProps) {
  const taskCount = tasks.length;

  return (
    <div className={cn("mb-8", className)}>
      {/* 날짜 그룹 헤더 */}
      <div className="group flex items-center gap-2 mb-2">
        {/* 확장 버튼 */}
        <button
          onClick={() => onToggleExpand(group.id)}
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
        >
          {isExpanded ? 
            <ChevronDown className="h-3 w-3" /> : 
            <ChevronRight className="h-3 w-3" />
          }
        </button>
        
        {/* 그룹 정보 */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm">{group.emoji}</span>
          <span className={cn(
            "text-sm font-medium",
            group.isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
          )}>
            {group.name}
          </span>
        </div>
        
        {/* 태스크 추가 버튼 */}
        <button
          onClick={() => onAddTask(group.id)}
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      
      {/* 그룹 내용 */}
      {isExpanded && (
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, group.id)}
          className={cn(
            "min-h-[40px] relative transition-all",
            taskCount === 0 && "bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg p-4"
          )}
        >
          {taskCount === 0 && (
            <button
              onClick={() => onAddTask(group.id)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {group.isOverdue ? '지난 작업이 없습니다' : '작업을 추가하려면 클릭하세요'}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}