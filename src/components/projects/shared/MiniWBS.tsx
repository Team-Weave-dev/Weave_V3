'use client';

import { useState } from 'react';
import { WBSTask, WBSTemplateType } from '@/lib/types/project-table.types';
import { getWBSTaskCounts } from '@/lib/types/project-table.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Zap } from 'lucide-react';
import { getProjectPageText } from '@/config/brand';
import { WBSTaskItem } from './WBSTaskItem';
import { WBSTemplateSelectDialog } from './WBSTemplateSelectDialog';
import { cn } from '@/lib/utils';

interface MiniWBSProps {
  tasks: WBSTask[];
  isEditMode?: boolean;
  onStatusChange?: (taskId: string, newStatus: WBSTask['status']) => void;
  onDelete?: (taskId: string) => void;
  onAddTask?: () => void;
  onAddFromTemplate?: (template: WBSTemplateType) => void;
  className?: string;
}

/**
 * 미니 WBS (Work Breakdown Structure) 컴포넌트
 *
 * @description
 * - 프로젝트 작업 목록 표시
 * - 접기/펼치기 기능
 * - 편집 모드에서 작업 추가/삭제/상태 변경
 * - 템플릿으로 빠르게 작업 추가 (Phase 2.2)
 * - 읽기 모드에서 상태만 표시
 */
export function MiniWBS({
  tasks,
  isEditMode = false,
  onStatusChange,
  onDelete,
  onAddTask,
  onAddFromTemplate,
  className
}: MiniWBSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 작업 통계 계산
  const counts = getWBSTaskCounts(tasks);
  const hasTasks = tasks.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Collapsible 헤더 */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  !isOpen && "-rotate-90"
                )}
              />
              <span className="text-sm font-semibold">
                {getProjectPageText.wbsSectionTitle('ko')}
              </span>
              <span className="text-xs text-muted-foreground">
                ({counts.completed}/{counts.total})
              </span>
            </Button>
          </CollapsibleTrigger>

          {/* 편집 모드: 작업 추가 버튼 */}
          {isEditMode && (
            <div className="flex gap-2">
              {/* 템플릿으로 추가 버튼 (Phase 2.2) */}
              {onAddFromTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="h-8 gap-1"
                >
                  <Zap className="h-3 w-3" />
                  {getProjectPageText.wbsQuickAddButton('ko')}
                </Button>
              )}

              {/* 개별 작업 추가 버튼 */}
              {onAddTask && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddTask}
                  className="h-8 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {getProjectPageText.wbsAddTask('ko')}
                </Button>
              )}
            </div>
          )}
        </div>

        <CollapsibleContent className="mt-3">
          {hasTasks ? (
            <div className="space-y-2">
              {tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <WBSTaskItem
                    key={task.id}
                    task={task}
                    isEditMode={isEditMode}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
              <p>{getProjectPageText.wbsEmptyState('ko')}</p>
              <p className="text-xs mt-1">
                {getProjectPageText.wbsEmptyStateDescription('ko')}
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* 템플릿 선택 다이얼로그 (Phase 2.2) */}
      {isEditMode && onAddFromTemplate && (
        <WBSTemplateSelectDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={onAddFromTemplate}
        />
      )}
    </div>
  );
}
