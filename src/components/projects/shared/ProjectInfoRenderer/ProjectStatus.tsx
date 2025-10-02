'use client';

import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjectStatusText } from '@/config/brand';
import type { ProjectStatus as ProjectStatusType, ProjectTableRow } from '@/lib/types/project-table.types';
import { cn, hasContractDocument } from '@/lib/utils';

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
  // 🎯 프로젝트 상태 자동 결정 로직 (편집 모드가 아닐 때만 적용)
  const displayStatus: ProjectStatusType = (() => {
    // 편집 모드에서는 실제 저장된 status 표시
    if (isEditing) {
      return project.status;
    }

    // 🎯 최우선: 사용자가 수동으로 선택한 최종 상태는 항상 유지
    // (보류, 취소, 완료는 자동 결정 로직을 적용하지 않음)
    if (
      project.status === 'on_hold' ||
      project.status === 'cancelled' ||
      project.status === 'completed'
    ) {
      return project.status;
    }

    // 1. 계약서가 없을 때
    if (!hasContractDocument(project)) {
      // 총 금액이 있으면 → 검토 (review)
      if (project.totalAmount && project.totalAmount > 0) {
        return 'review';
      }
      // 총 금액이 없으면 → 기획 (planning) 유지
      return 'planning';
    }

    // 2. 계약서가 있을 때 (계약서 생성 = 완료로 간주):
    //    - 총 금액 있음 → 진행중 (in_progress)
    //    - 총 금액 없음 → 기획 (planning)
    if (project.totalAmount && project.totalAmount > 0) {
      return 'in_progress';
    }

    return 'planning';
  })();

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
        value={project.status}
        onValueChange={onValueChange}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* 🎯 자동 결정 상태는 드롭다운에서 제거됨:
              - planning: 계약서 없음 + 금액 없음, 또는 계약서 있음 + 금액 없음 → 자동 표시
              - in_progress: 계약서 있음 + 금액 있음 → 자동 표시
              - review: 계약서 없음 + 금액 있음 → 자동 표시
          */}
          {/* 사용자가 수동으로 선택 가능한 상태만 제공 */}
          <SelectItem value="on_hold">
            {getProjectStatusText('on_hold', lang)}
          </SelectItem>
          <SelectItem value="cancelled">
            {getProjectStatusText('cancelled', lang)}
          </SelectItem>
          <SelectItem value="completed">
            {getProjectStatusText('completed', lang)}
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // 읽기 전용 모드일 때 Badge 컴포넌트 표시
  // 계약서가 없으면 자동으로 '검토' 배지 표시
  return (
    <Badge
      variant={statusVariantMap[displayStatus]}
      className={cn(modeStyles[mode], className)}
    >
      {getProjectStatusText(displayStatus, lang)}
    </Badge>
  );
}

export default ProjectStatus;