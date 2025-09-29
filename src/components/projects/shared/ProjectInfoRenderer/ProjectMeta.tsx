'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { CalendarIcon, UserIcon, ClockIcon } from 'lucide-react';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';

interface ProjectMetaProps {
  project: ProjectTableRow;
  mode: 'table' | 'card' | 'detail';
  fields: ('client' | 'registrationDate' | 'dueDate' | 'modifiedDate' | 'projectNo')[];
  isEditing?: boolean;
  onValueChange?: (field: string, value: string) => void;
  className?: string;
  lang?: 'ko' | 'en';
}

/**
 * 공통 프로젝트 메타정보 컴포넌트
 * 클라이언트, 날짜 등의 부가 정보 표시
 */
export function ProjectMeta({
  project,
  mode,
  fields,
  isEditing = false,
  onValueChange,
  className,
  lang = 'ko'
}: ProjectMetaProps) {
  // 모드별 스타일링
  const modeStyles = {
    table: 'text-xs text-muted-foreground',
    card: 'text-sm text-muted-foreground',
    detail: 'text-sm text-muted-foreground'
  };

  const iconSize = mode === 'detail' ? 14 : 12;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (lang === 'ko') {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US');
  };

  return (
    <div className={cn("space-y-1", className)}>
      {fields.map((field) => {
        const value = project[field as keyof ProjectTableRow] as string;

        // 편집 모드
        if (isEditing && onValueChange && ['client', 'dueDate'].includes(field)) {
          return (
            <div key={field} className="flex items-center space-x-2">
              {field === 'client' && <UserIcon size={iconSize} className="text-muted-foreground" />}
              {field === 'dueDate' && <CalendarIcon size={iconSize} className="text-muted-foreground" />}
              <Input
                value={value || ''}
                onChange={(e) => onValueChange(field, e.target.value)}
                placeholder={field === 'client' ? '클라이언트명' : 'YYYY-MM-DD'}
                className="text-xs h-8"
                type={field === 'dueDate' ? 'date' : 'text'}
              />
            </div>
          );
        }

        // 읽기 전용 모드
        let displayValue = value;
        let icon = null;

        switch (field) {
          case 'client':
            icon = <UserIcon size={iconSize} className="text-muted-foreground flex-shrink-0" />;
            displayValue = value || '-';
            break;
          case 'registrationDate':
          case 'dueDate':
          case 'modifiedDate':
            icon = <CalendarIcon size={iconSize} className="text-muted-foreground flex-shrink-0" />;
            displayValue = formatDate(value);
            break;
          case 'projectNo':
            icon = <ClockIcon size={iconSize} className="text-muted-foreground flex-shrink-0" />;
            displayValue = value || '-';
            break;
          default:
            displayValue = value || '-';
        }

        return (
          <div key={field} className="flex items-center space-x-2">
            {icon}
            <span className={modeStyles[mode]}>
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ProjectMeta;