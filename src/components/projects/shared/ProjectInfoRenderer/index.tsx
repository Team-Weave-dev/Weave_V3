'use client';

import React from 'react';
import { PaymentStatus } from './PaymentStatus';
import { ProjectStatus } from './ProjectStatus';
import { ProjectName } from './ProjectName';
import { ProjectMeta } from './ProjectMeta';
import ProjectProgress from '@/components/ui/project-progress';
import type {
  ProjectTableRow,
  PaymentStatus as PaymentStatusType,
  ProjectStatus as ProjectStatusType
} from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';

export interface ProjectInfoRendererProps {
  project: ProjectTableRow;
  mode: 'table' | 'card' | 'detail';
  fields: ProjectInfoField[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  isEditing?: boolean;
  onFieldChange?: (field: string, value: string | number) => void;
  onProjectClick?: (project: ProjectTableRow) => void;
  className?: string;
  lang?: 'ko' | 'en';
}

export type ProjectInfoField =
  | 'name'
  | 'status'
  | 'paymentStatus'
  | 'progress'
  | 'client'
  | 'registrationDate'
  | 'dueDate'
  | 'modifiedDate'
  | 'projectNo'
  | 'meta'; // meta는 여러 필드를 조합

interface EditableFieldHandlers {
  onNameChange?: (value: string) => void;
  onStatusChange?: (value: ProjectStatusType) => void;
  onPaymentStatusChange?: (value: PaymentStatusType) => void;
  onClientChange?: (value: string) => void;
  onDueDateChange?: (value: string) => void;
}

/**
 * 통합 프로젝트 정보 렌더러
 *
 * 모든 뷰모드(ListView, DetailView, ProjectDetail)에서
 * 일관된 프로젝트 정보 표시를 위한 통합 컴포넌트
 *
 * @example
 * // ListView 테이블 셀에서
 * <ProjectInfoRenderer
 *   project={project}
 *   mode="table"
 *   fields={['name', 'status', 'paymentStatus']}
 *   layout="horizontal"
 * />
 *
 * // DetailView 카드에서
 * <ProjectInfoRenderer
 *   project={project}
 *   mode="card"
 *   fields={['name', 'status', 'paymentStatus', 'meta']}
 *   layout="vertical"
 * />
 *
 * // ProjectDetail 상세에서
 * <ProjectInfoRenderer
 *   project={project}
 *   mode="detail"
 *   fields={['name', 'status', 'paymentStatus', 'progress', 'meta']}
 *   layout="grid"
 *   isEditing={true}
 * />
 */
export function ProjectInfoRenderer({
  project,
  mode,
  fields,
  layout = 'vertical',
  isEditing = false,
  onFieldChange,
  onProjectClick,
  className,
  lang = 'ko'
}: ProjectInfoRendererProps) {

  // 편집 핸들러 생성
  const handlers: EditableFieldHandlers = {
    onNameChange: (value: string) => onFieldChange?.('name', value),
    onStatusChange: (value: ProjectStatusType) => onFieldChange?.('status', value),
    onPaymentStatusChange: (value: PaymentStatusType) => onFieldChange?.('paymentStatus', value),
    onClientChange: (value: string) => onFieldChange?.('client', value),
    onDueDateChange: (value: string) => onFieldChange?.('dueDate', value),
  };

  // 레이아웃별 스타일
  const layoutStyles = {
    horizontal: 'flex items-center gap-3 flex-wrap',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
  };

  // 모드별 컨테이너 스타일
  const modeContainerStyles = {
    table: 'p-2',
    card: 'p-4',
    detail: 'p-6'
  };

  // 메타 필드 정의
  const getMetaFields = (): ('client' | 'registrationDate' | 'dueDate' | 'modifiedDate' | 'projectNo')[] => {
    switch (mode) {
      case 'table':
        return ['client', 'dueDate'];
      case 'card':
        return ['client', 'registrationDate', 'modifiedDate'];
      case 'detail':
        return ['client', 'projectNo', 'registrationDate', 'dueDate', 'modifiedDate'];
      default:
        return ['client'];
    }
  };

  // 필드 렌더링
  const renderField = (field: ProjectInfoField) => {
    switch (field) {
      case 'name':
        return (
          <ProjectName
            key="name"
            project={project}
            mode={mode}
            isEditing={isEditing}
            onValueChange={handlers.onNameChange}
            onClick={() => onProjectClick?.(project)}
          />
        );

      case 'status':
        return (
          <ProjectStatus
            key="status"
            project={project}
            mode={mode}
            isEditing={isEditing}
            onValueChange={handlers.onStatusChange}
            lang={lang}
          />
        );

      case 'paymentStatus':
        return (
          <PaymentStatus
            key="paymentStatus"
            project={project}
            mode={mode}
            isEditing={isEditing}
            onValueChange={handlers.onPaymentStatusChange}
            lang={lang}
          />
        );

      case 'progress':
        return (
          <div key="progress" className="w-full">
            <ProjectProgress
              value={project.progress}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              진행률: {project.progress}%
            </div>
          </div>
        );

      case 'meta':
        return (
          <ProjectMeta
            key="meta"
            project={project}
            mode={mode}
            fields={getMetaFields()}
            isEditing={isEditing}
            onValueChange={(field, value) => onFieldChange?.(field, value)}
            lang={lang}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "project-info-renderer",
      modeContainerStyles[mode],
      layoutStyles[layout],
      className
    )}>
      {fields.map(renderField)}
    </div>
  );
}

// 개별 컴포넌트들을 함께 export
export { PaymentStatus, ProjectStatus, ProjectName, ProjectMeta };
export default ProjectInfoRenderer;