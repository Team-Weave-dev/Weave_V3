'use client';

import React from 'react';
import ProjectProgress from '@/components/ui/project-progress';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';
import { Building2, CreditCardIcon, ClockIcon, FileTextIcon } from 'lucide-react';
import { ProjectStatus } from '@/components/projects/shared/ProjectInfoRenderer/ProjectStatus';
import { PaymentStatus } from '@/components/projects/shared/ProjectInfoRenderer/PaymentStatus';

interface ProjectCardCustomProps {
  project: ProjectTableRow;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  lang?: 'ko' | 'en';
}

/**
 * 커스텀 프로젝트 카드 컴포넌트
 *
 * 새로운 레이아웃:
 * - 프로젝트 번호 (회색 텍스트)
 * - 프로젝트명 + 우측 정렬된 수금상태, 현재단계
 * - 클라이언트
 * - 총 금액
 * - 진행률
 * - 마감일
 */
export function ProjectCardCustom({
  project,
  isSelected = false,
  onClick,
  className,
  lang = 'ko'
}: ProjectCardCustomProps) {
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

  // 금액 포맷팅
  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-md border cursor-pointer transition-all",
        isSelected
          ? 'bg-primary/10 border-primary'
          : 'hover:bg-accent',
        className
      )}
    >
      {/* 프로젝트명 + 우측 상태들 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold truncate flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {project.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {/* 중앙화된 PaymentStatus 컴포넌트 사용 */}
          <PaymentStatus
            project={project}
            mode="card"
            lang={lang}
          />
          {/* 중앙화된 ProjectStatus 컴포넌트 사용 - 계약서 누락 시 자동으로 '검토' 표시 */}
          <ProjectStatus
            project={project}
            mode="card"
            lang={lang}
          />
        </div>
      </div>

      {/* 클라이언트 */}
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{project.client || '-'}</span>
        </div>
      </div>

      {/* 총 금액 */}
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formatAmount(project.totalAmount)}</span>
        </div>
      </div>

      {/* 진행률 */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
        <ProjectProgress
          value={project.progress}
          className="h-2"
        />
      </div>

      {/* 마감일 */}
      <div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formatDate(project.dueDate)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCardCustom;