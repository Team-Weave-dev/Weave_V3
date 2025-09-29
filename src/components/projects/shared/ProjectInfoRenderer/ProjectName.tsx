'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';

interface ProjectNameProps {
  project: ProjectTableRow;
  mode: 'table' | 'card' | 'detail';
  isEditing?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
  onClick?: () => void;
}

/**
 * 공통 프로젝트명 컴포넌트
 * 모든 뷰모드에서 일관된 프로젝트명 표시
 */
export function ProjectName({
  project,
  mode,
  isEditing = false,
  onValueChange,
  className,
  onClick
}: ProjectNameProps) {
  const projectName = project.name;

  // 모드별 스타일링
  const modeStyles = {
    table: 'text-sm font-medium',
    card: 'text-base font-semibold',
    detail: 'text-lg font-semibold'
  };

  // 편집 모드일 때 Input 컴포넌트 표시
  if (isEditing && onValueChange) {
    return (
      <Input
        value={projectName}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn("font-medium", className)}
        placeholder="프로젝트명을 입력하세요"
      />
    );
  }

  // 읽기 전용 모드일 때 클릭 가능한 텍스트 표시
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          modeStyles[mode],
          "text-left hover:text-primary hover:underline transition-colors cursor-pointer",
          className
        )}
        type="button"
      >
        {projectName}
      </button>
    );
  }

  // 일반 텍스트 표시
  return (
    <div className={cn(modeStyles[mode], className)}>
      {projectName}
    </div>
  );
}

export default ProjectName;