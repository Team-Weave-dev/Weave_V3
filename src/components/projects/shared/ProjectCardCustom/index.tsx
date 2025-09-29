'use client';

import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import type {
  ProjectTableRow,
  PaymentStatus as PaymentStatusType,
  ProjectStatus as ProjectStatusType
} from '@/lib/types/project-table.types';
import { getProjectStatusText, getPaymentStatusText } from '@/config/brand';
import { cn } from '@/lib/utils';
import { Building2, CreditCardIcon, ClockIcon, FileTextIcon } from 'lucide-react';

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
  // 상태별 배지 색상 매핑
  const statusVariantMap: Record<ProjectStatusType, BadgeProps['variant']> = {
    planning: 'status-soft-planning',
    in_progress: 'status-soft-inprogress',
    review: 'status-soft-review',
    completed: 'status-soft-completed',
    on_hold: 'status-soft-onhold',
    cancelled: 'status-soft-cancelled'
  };

  const paymentVariantMap: Record<PaymentStatusType, BadgeProps['variant']> = {
    not_started: 'secondary',
    advance_completed: 'status-soft-inprogress',
    interim_completed: 'status-soft-warning',
    final_completed: 'status-soft-completed'
  };

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
          <Badge
            variant={project.paymentStatus ? paymentVariantMap[project.paymentStatus] : 'secondary'}
            className="text-xs"
          >
            {project.paymentStatus ? getPaymentStatusText[project.paymentStatus](lang) : '미시작'}
          </Badge>
          <Badge
            variant={statusVariantMap[project.status]}
            className="text-xs"
          >
            {getProjectStatusText(project.status, lang)}
          </Badge>
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