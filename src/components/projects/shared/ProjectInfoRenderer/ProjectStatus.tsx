'use client';

import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjectStatusText } from '@/config/brand';
import type { ProjectStatus as ProjectStatusType, ProjectTableRow } from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';

interface ProjectStatusProps {
  project: ProjectTableRow;
  mode: 'table' | 'card' | 'detail';
  isEditing?: boolean;
  onValueChange?: (value: ProjectStatusType) => void;
  className?: string;
  lang?: 'ko' | 'en';
}

/**
 * 공통 프로젝트 상태 컴포넌트
 * 모든 뷰모드에서 일관된 프로젝트 상태 표시
 */
export function ProjectStatus({
  project,
  mode,
  isEditing = false,
  onValueChange,
  className,
  lang = 'ko'
}: ProjectStatusProps) {
  const status = project.status;

  // 모드별 스타일링
  const modeStyles = {
    table: 'text-xs',
    card: 'text-xs',
    detail: 'text-xs'
  };

  // 상태별 배지 색상 매핑
  const statusVariantMap: Record<ProjectStatusType, BadgeProps['variant']> = {
    planning: 'status-soft-planning',
    in_progress: 'status-soft-inprogress',
    review: 'status-soft-review',
    completed: 'status-soft-completed',
    on_hold: 'status-soft-onhold',
    cancelled: 'status-soft-cancelled'
  };

  // 편집 모드일 때 Select 컴포넌트 표시
  if (isEditing && onValueChange) {
    return (
      <Select
        value={status}
        onValueChange={onValueChange}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="planning">
            {getProjectStatusText('planning', lang)}
          </SelectItem>
          <SelectItem value="in_progress">
            {getProjectStatusText('in_progress', lang)}
          </SelectItem>
          <SelectItem value="review">
            {getProjectStatusText('review', lang)}
          </SelectItem>
          <SelectItem value="completed">
            {getProjectStatusText('completed', lang)}
          </SelectItem>
          <SelectItem value="on_hold">
            {getProjectStatusText('on_hold', lang)}
          </SelectItem>
          <SelectItem value="cancelled">
            {getProjectStatusText('cancelled', lang)}
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // 읽기 전용 모드일 때 Badge 컴포넌트 표시
  return (
    <Badge
      variant={statusVariantMap[status]}
      className={cn(modeStyles[mode], className)}
    >
      {getProjectStatusText(status, lang)}
    </Badge>
  );
}

export default ProjectStatus;