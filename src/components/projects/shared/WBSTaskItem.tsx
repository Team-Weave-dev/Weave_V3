'use client';

import { WBSTask } from '@/lib/types/project-table.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Circle, Clock, CheckCircle } from 'lucide-react';
import { getWBSStatusText } from '@/config/brand';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';

interface WBSTaskItemProps {
  task: WBSTask;
  index: number; // Draggable을 위한 index
  isEditMode?: boolean;
  onStatusChange?: (taskId: string, newStatus: WBSTask['status']) => void;
  onDelete?: (taskId: string) => void;
  onNameChange?: (taskId: string, newName: string) => void;
  onDescriptionChange?: (taskId: string, newDescription: string) => void;
}

/**
 * WBS 작업 아이템 컴포넌트
 *
 * @description
 * - 읽기 모드: 상태 배지만 표시
 * - 편집 모드: Select 드롭다운으로 3단계 상태 변경 (대기/진행중/완료) + 삭제 버튼 + 드래그 핸들
 * - Phase 2.3: 드래그 앤 드롭으로 순서 변경
 */
export function WBSTaskItem({
  task,
  index,
  isEditMode = false,
  onStatusChange,
  onDelete,
  onNameChange,
  onDescriptionChange
}: WBSTaskItemProps) {
  // 상태 변경 핸들러
  const handleStatusChange = (newStatus: WBSTask['status']) => {
    if (!onStatusChange) return;
    onStatusChange(task.id, newStatus);
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(task.id);
  };

  // 이름 변경 핸들러
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onNameChange) return;
    onNameChange(task.id, e.target.value);
  };

  // 설명 변경 핸들러
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onDescriptionChange) return;
    onDescriptionChange(task.id, e.target.value);
  };

  // 상태별 배지 스타일 (프로젝트 상태 배지와 동일)
  const getStatusBadgeVariant = () => {
    switch (task.status) {
      case 'completed':
        return 'status-soft-completed'; // 완료: 초록색 (프로젝트 완료와 동일)
      case 'in_progress':
        return 'status-soft-inprogress'; // 진행중: 파란색 (프로젝트 진행중과 동일)
      case 'pending':
      default:
        return 'status-soft-planning'; // 대기: 회색 (프로젝트 기획과 동일)
    }
  };

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={!isEditMode}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
            isEditMode && "hover:bg-accent/50",
            task.status === 'completed' && "bg-muted/30",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/20"
          )}
        >
          {/* 드래그 핸들 (편집 모드에서만 표시) */}
          {isEditMode && (
            <div
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              aria-label="작업 순서 변경"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          {/* 편집 모드: Select 드롭다운 (3단계 상태) | 읽기 모드: 상태 배지 */}
          {isEditMode ? (
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{getWBSStatusText('pending', 'ko')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-yellow-600" />
                    <span>{getWBSStatusText('in_progress', 'ko')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    <span>{getWBSStatusText('completed', 'ko')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={getStatusBadgeVariant()}>
              {getWBSStatusText(task.status, 'ko')}
            </Badge>
          )}

          {/* 작업명 및 설명 */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* 작업명 */}
            {isEditMode && onNameChange ? (
              <Input
                value={task.name}
                onChange={handleNameChange}
                className={cn(
                  "h-8 text-sm font-medium",
                  task.status === 'completed' && "line-through text-muted-foreground"
                )}
                placeholder="작업명을 입력하세요"
                aria-label={`${task.name || `작업 ${index + 1}`} 작업명 편집`}
              />
            ) : (
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  task.status === 'completed' && "line-through text-muted-foreground",
                  !task.name && "text-muted-foreground"
                )}
                title={task.name || `작업 ${index + 1}`}
              >
                {task.name || `작업 ${index + 1}`}
              </p>
            )}

            {/* 작업 설명 */}
            {isEditMode && onDescriptionChange ? (
              <Input
                value={task.description || ''}
                onChange={handleDescriptionChange}
                className="h-7 text-xs text-muted-foreground"
                placeholder="작업에 대한 설명을 입력하세요"
                aria-label={`${task.name || `작업 ${index + 1}`} 작업 설명 편집`}
              />
            ) : (
              <p className={cn(
                "text-xs text-muted-foreground truncate",
                !task.description && "text-muted-foreground/60"
              )} title={task.description || '작업 설명'}>
                {task.description || '작업 설명'}
              </p>
            )}
          </div>

          {/* 편집 모드: 삭제 버튼 */}
          {isEditMode && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label={`${task.name} 작업 삭제`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Draggable>
  );
}
