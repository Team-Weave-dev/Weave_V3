'use client';

import { useState } from 'react';
import { WBSTask } from '@/lib/types/project-table.types';
import { getWBSTaskCounts } from '@/lib/types/project-table.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { getProjectPageText } from '@/config/brand';
import { WBSTaskItem } from './WBSTaskItem';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import DocumentDeleteDialog from '@/components/projects/DocumentDeleteDialog';

interface MiniWBSProps {
  tasks: WBSTask[];
  isEditMode?: boolean;
  onStatusChange?: (taskId: string, newStatus: WBSTask['status']) => void;
  onDelete?: (taskId: string) => void;
  onAddTask?: () => void;
  onNameChange?: (taskId: string, newName: string) => void;
  onDescriptionChange?: (taskId: string, newDescription: string) => void;
  onReorder?: (tasks: WBSTask[]) => void; // Phase 2.3: 순서 변경 핸들러
  onDeleteAll?: () => void; // 전체 삭제 핸들러
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
 * - 드래그 앤 드롭으로 순서 변경 (Phase 2.3)
 * - 읽기 모드에서 상태만 표시
 */
export function MiniWBS({
  tasks,
  isEditMode = false,
  onStatusChange,
  onDelete,
  onAddTask,
  onNameChange,
  onDescriptionChange,
  onReorder,
  onDeleteAll,
  className
}: MiniWBSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  // 작업 통계 계산
  const counts = getWBSTaskCounts(tasks);
  const hasTasks = tasks.length > 0;

  // 정렬된 작업 목록
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  // 드래그 앤 드롭 핸들러 (Phase 2.3)
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;

    const { source, destination } = result;

    // 같은 위치로 드롭한 경우 무시
    if (source.index === destination.index) return;

    // 배열 재정렬
    const reorderedTasks = Array.from(sortedTasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    // order 필드 업데이트
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      order: index
    }));

    onReorder(updatedTasks);
  };

  // 전체 삭제 확인 핸들러
  const handleDeleteAllConfirm = () => {
    if (onDeleteAll) {
      onDeleteAll();
    }
    setShowDeleteAllDialog(false);
  };

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

          {/* 편집 모드: 전체 삭제 + 작업 추가 버튼 */}
          {isEditMode && (
            <div className="flex items-center gap-2">
              {onDeleteAll && hasTasks && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteAllDialog(true)}
                  className="h-8 gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  {getProjectPageText.wbsDeleteAll('ko')}
                </Button>
              )}
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="wbs-tasks">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-2",
                      snapshot.isDraggingOver && "bg-accent/20 rounded-lg p-2"
                    )}
                  >
                    {sortedTasks.map((task, index) => (
                      <WBSTaskItem
                        key={task.id}
                        task={task}
                        index={index}
                        isEditMode={isEditMode}
                        onStatusChange={onStatusChange}
                        onDelete={onDelete}
                        onNameChange={onNameChange}
                        onDescriptionChange={onDescriptionChange}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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

      {/* 전체 삭제 확인 모달 */}
      <DocumentDeleteDialog
        open={showDeleteAllDialog}
        mode="bulk"
        customTitle={getProjectPageText.wbsConfirmDeleteAll('ko')}
        customDescription={getProjectPageText.wbsDeleteAllDescription('ko')}
        onOpenChange={setShowDeleteAllDialog}
        onConfirm={handleDeleteAllConfirm}
      />
    </div>
  );
}
