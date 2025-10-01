'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  FolderPlus,
  GripVertical,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import type { TodoSection as TodoSectionType, TodoTask } from '../types';

interface TodoSectionProps {
  section: TodoSectionType;
  tasks: TodoTask[];
  isExpanded: boolean;
  onToggleExpand: (sectionId: string) => void;
  onAddTask: (sectionId: string) => void;
  onAddSection?: () => void;
  onUpdateSection?: (sectionId: string, name: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent, section: TodoSectionType) => void;
  onDragEnd?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function TodoSection({
  section,
  tasks,
  isExpanded,
  onToggleExpand,
  onAddTask,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  children,
  className
}: TodoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const taskCount = tasks.length;

  const handleUpdateSection = () => {
    if (editValue.trim() && editValue !== section.name) {
      onUpdateSection?.(section.id, editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateSection();
    }
    if (e.key === 'Escape') {
      setEditValue(section.name);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("mb-3", className)}>
      {/* 섹션 헤더 */}
      <div 
        className="group flex items-center gap-1 mb-2"
        draggable
        onDragStart={onDragStart ? (e) => onDragStart(e, section) : undefined}
        onDragEnd={onDragEnd}
      >
        {/* 확장 버튼 */}
        <button
          onClick={() => onToggleExpand(section.id)}
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
        >
          {isExpanded ? 
            <ChevronDown className="h-3 w-3" /> : 
            <ChevronRight className="h-3 w-3" />
          }
        </button>
        
        {/* 섹션 드래그 핸들 */}
        <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0" />
        
        {/* 섹션 이름 */}
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleUpdateSection}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm font-medium flex-1"
            autoFocus
          />
        ) : (
          <div 
            className="flex-1 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none"
            onDoubleClick={() => onUpdateSection && setIsEditing(true)}
          >
            {section.name}
          </div>
        )}
        
        
        {/* 오른쪽 버튼 그룹 */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {/* 태스크 추가 버튼 */}
          <button
            onClick={() => onAddTask(section.id)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            <Plus className="h-3 w-3" />
          </button>
          
          {/* 섹션 삭제 버튼 */}
          {onDeleteSection && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
          )}
        </div>
      </div>
      
      {/* 섹션 내용 */}
      {isExpanded && (
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            "min-h-[40px] relative transition-all",
            taskCount === 0 && "bg-gray-50 dark:bg-gray-900/30 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4"
          )}
        >
          {taskCount === 0 && (
            <button
              onClick={() => onAddTask(section.id)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {getWidgetText.todoList.emptySection('ko')}
            </button>
          )}
          {children}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {onDeleteSection && (
        <DeleteDialog
          open={showDeleteDialog}
          title="섹션 삭제"
          description={getWidgetText.todoList.confirmDeleteSection('ko')}
          confirmLabel="삭제"
          cancelLabel="취소"
          icon={<FolderPlus className="h-6 w-6" />}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => {
            onDeleteSection(section.id);
            setShowDeleteDialog(false);
          }}
        />
      )}
    </div>
  );
}