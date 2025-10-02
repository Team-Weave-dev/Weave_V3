'use client';

import { WBSTask } from '@/lib/types/project-table.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { getWBSStatusText } from '@/config/brand';
import { cn } from '@/lib/utils';

interface WBSTaskItemProps {
  task: WBSTask;
  isEditMode?: boolean;
  onStatusChange?: (taskId: string, newStatus: WBSTask['status']) => void;
  onDelete?: (taskId: string) => void;
}

/**
 * WBS 작업 아이템 컴포넌트
 *
 * @description
 * - 읽기 모드: 상태 배지만 표시
 * - 편집 모드: 체크박스로 상태 변경 + 삭제 버튼
 */
export function WBSTaskItem({
  task,
  isEditMode = false,
  onStatusChange,
  onDelete
}: WBSTaskItemProps) {
  // 상태 변경 핸들러
  const handleStatusChange = (checked: boolean) => {
    if (!onStatusChange) return;

    // 체크박스 토글로 pending ↔ completed 전환
    const newStatus = checked ? 'completed' : 'pending';
    onStatusChange(task.id, newStatus);
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(task.id);
  };

  // 상태별 배지 스타일
  const getStatusBadgeVariant = () => {
    switch (task.status) {
      case 'completed':
        return 'default'; // 완료: 기본 스타일 (primary)
      case 'in_progress':
        return 'secondary'; // 진행중: 보조 스타일
      case 'pending':
      default:
        return 'outline'; // 대기: 아웃라인
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        isEditMode && "hover:bg-accent/50",
        task.status === 'completed' && "bg-muted/30"
      )}
    >
      {/* 편집 모드: 체크박스 | 읽기 모드: 상태 배지 */}
      {isEditMode ? (
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleStatusChange}
          aria-label={`${task.name} 작업 완료 상태 토글`}
        />
      ) : (
        <Badge variant={getStatusBadgeVariant()}>
          {getWBSStatusText(task.status, 'ko')}
        </Badge>
      )}

      {/* 작업명 */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            task.status === 'completed' && "line-through text-muted-foreground"
          )}
          title={task.name}
        >
          {task.name}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-1" title={task.description}>
            {task.description}
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
  );
}
