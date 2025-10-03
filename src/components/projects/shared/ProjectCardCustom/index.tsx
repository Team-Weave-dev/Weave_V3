'use client';

import React from 'react';
import ProjectProgress from '@/components/ui/project-progress';
import type { ProjectTableRow, WBSTask } from '@/lib/types/project-table.types';
import { calculateProjectProgress } from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';
import { Building2, CreditCardIcon, ClockIcon, FileTextIcon } from 'lucide-react';
import { ProjectStatus } from '@/components/projects/shared/ProjectInfoRenderer/ProjectStatus';
import { PaymentStatus } from '@/components/projects/shared/ProjectInfoRenderer/PaymentStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getWBSStatusText } from '@/config/brand';
import { typography } from '@/config/constants';

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
 * - 작업 정보 (작업명 상태 (순서/총개수))
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

  // WBS 기반 진행률 계산 (단일 진실 공급원)
  const progressValue = calculateProjectProgress(project.wbsTasks || []);

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

      {/* 작업 정보 */}
      <div className="mb-2">
        {(() => {
          const tasks = project.wbsTasks || [];
          if (tasks.length === 0) {
            return (
              <div className={typography.detail.taskInfoEmpty}>
                -
              </div>
            );
          }

          const completedTasks = tasks.filter(t => t.status === 'completed');
          const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
          const pendingTasks = tasks.filter(t => t.status === 'pending');
          const completedCount = completedTasks.length;
          const totalCount = tasks.length;

          let displayTask: WBSTask | null = null;
          let taskIndex = 0;
          let statusText = '';

          // 우선순위 1: 진행중 작업 중 완료된 다음 순차 작업
          if (inProgressTasks.length > 0) {
            let foundNextInProgress = false;
            for (let i = 0; i < tasks.length; i++) {
              const task = tasks[i];
              if (task.status === 'in_progress' && (i === 0 || tasks.slice(0, i).every(t => t.status === 'completed'))) {
                displayTask = task;
                taskIndex = completedCount + 1;
                statusText = getWBSStatusText('in_progress', lang);
                foundNextInProgress = true;
                break;
              }
            }
            if (!foundNextInProgress) {
              displayTask = inProgressTasks[0];
              taskIndex = completedCount + 1;
              statusText = getWBSStatusText('in_progress', lang);
            }
          }
          // 우선순위 2: 마지막 완료 작업
          else if (completedTasks.length > 0) {
            displayTask = completedTasks[completedTasks.length - 1];
            taskIndex = completedCount;
            statusText = getWBSStatusText('completed', lang);
          }
          // 우선순위 3: 첫 번째 대기 작업
          else if (pendingTasks.length > 0) {
            displayTask = pendingTasks[0];
            taskIndex = 0;
            statusText = getWBSStatusText('pending', lang);
          }

          if (!displayTask) {
            return (
              <div className={typography.detail.taskInfoEmpty}>
                -
              </div>
            );
          }

          const taskName = displayTask.name || `작업 ${tasks.indexOf(displayTask) + 1}`;
          const displayText = `${taskName} ${statusText} (${taskIndex}/${totalCount})`;

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={typography.detail.taskInfo}>
                    {displayText}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{taskName} {statusText} ({taskIndex}/{totalCount})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })()}
      </div>

      {/* 총 금액 */}
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formatAmount(project.totalAmount)}</span>
        </div>
      </div>

      {/* 진행률 - WBS 기반 자동 계산 */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{progressValue}%</span>
        </div>
        <ProjectProgress
          value={progressValue}
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