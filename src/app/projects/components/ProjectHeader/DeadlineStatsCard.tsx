'use client';

import React, { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpIcon } from '@/components/ui/help-icon';
import { BaseStatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { getProjectPageText } from '@/config/brand';
import { Clock, XCircle, AlertTriangle, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProjectTableRow } from '@/lib/types/project-table.types';

interface DeadlineStatsCardProps {
  projects: ProjectTableRow[];
  lang?: 'ko' | 'en';
}

interface DeadlineProject {
  id: string;
  no: string;
  name: string;
  client: string;
  daysRemaining: number;
  deadline: string;
  status: 'critical' | 'warning' | 'normal';
  isOverdue: boolean;  // 마감일 초과 여부
}

/**
 * 마감일 임박 프로젝트 통계 카드 (테이블 레이아웃)
 *
 * 마감일이 임박한 프로젝트들을 표시하고 경고
 * - 7일 미만: 긴급 (빨간색)
 * - 7-14일: 주의 (주황색)
 * - 14일 이상: 여유 (파란색)
 */
export default function DeadlineStatsCard({ projects, lang = 'ko' }: DeadlineStatsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 마감일 임박 프로젝트 계산
  const deadlineProjects = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    console.log('🔍 [DeadlineStatsCard] 전체 프로젝트 수:', projects.length);

    const projectsWithDeadline: DeadlineProject[] = [];
    let filteredByDueDate = 0;
    let filteredByInvalidDate = 0;

    projects.forEach(project => {
      // 마감일이 설정된 모든 프로젝트 체크 (상태 무관)
      if (!project.dueDate) {
        filteredByDueDate++;
        console.log(`⏭️  [필터: 마감일 없음] ${project.name}`);
        return;
      }

      const deadline = new Date(project.dueDate);

      // ⚠️ 날짜 유효성 검증
      if (isNaN(deadline.getTime())) {
        filteredByInvalidDate++;
        console.log(`❌ [필터: 잘못된 날짜 형식] ${project.name} - dueDate: "${project.dueDate}"`);
        return;
      }

      deadline.setHours(0, 0, 0, 0);

      const diffTime = deadline.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // ✅ 모든 마감일 프로젝트 포함 (초과, 당일, 미래 모두)
      let status: 'critical' | 'warning' | 'normal' = 'normal';
      let isOverdue = false;

      // 마감일 초과 (과거) → 긴급
      if (daysRemaining < 0) {
        status = 'critical';
        isOverdue = true;
        console.log(`🚨 [포함: 초과] ${project.name} - 초과 D+${Math.abs(daysRemaining)} (긴급)`);
      }
      // 당일 또는 7일 미만 → 긴급
      else if (daysRemaining < 7) {
        status = 'critical';
        console.log(`✅ [포함: 긴급] ${project.name} - D-${daysRemaining} (긴급)`);
      }
      // 7일 이상 14일 미만 → 주의
      else if (daysRemaining < 14) {
        status = 'warning';
        console.log(`✅ [포함: 주의] ${project.name} - D-${daysRemaining} (주의)`);
      }
      // 14일 이상 → 여유
      else {
        status = 'normal';
        console.log(`✅ [포함: 여유] ${project.name} - D-${daysRemaining} (여유)`);
      }

      projectsWithDeadline.push({
        id: project.id,
        no: project.no,
        name: project.name,
        client: project.client,
        daysRemaining,
        deadline: project.dueDate,
        status,
        isOverdue
      });
    });

    console.log('📊 [필터링 결과]');
    console.log(`  - 마감일 없음: ${filteredByDueDate}건`);
    console.log(`  - 잘못된 날짜 형식: ${filteredByInvalidDate}건`);
    console.log(`  - 포함된 프로젝트: ${projectsWithDeadline.length}건 (모든 상태 포함, 초과 포함)`);

    // 마감일이 가까운 순서로 정렬
    return projectsWithDeadline.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [projects]);

  const criticalCount = deadlineProjects.filter(p => p.status === 'critical').length;
  const warningCount = deadlineProjects.filter(p => p.status === 'warning').length;
  const normalCount = deadlineProjects.filter(p => p.status === 'normal').length;

  console.log('📈 [카운팅 결과]');
  console.log(`  - 긴급: ${criticalCount}건`);
  console.log(`  - 주의: ${warningCount}건`);
  console.log(`  - 여유: ${normalCount}건`);

  // 긴급 프로젝트 필터링
  const allCriticalProjects = deadlineProjects.filter(p => p.status === 'critical');
  const hasMoreProjects = allCriticalProjects.length > 3;
  const displayedCriticalProjects = isExpanded
    ? allCriticalProjects
    : allCriticalProjects.slice(0, 3);

  return (
    <BaseStatCard enableHover className="p-3">
      {/* 헤더 */}
      <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        {getProjectPageText.statsDeadline(lang)}
        <HelpIcon
          title={getProjectPageText.statsDeadlineTooltipTitle(lang)}
          content={getProjectPageText.statsDeadlineTooltipDescription(lang)}
          ariaLabel={getProjectPageText.statsDeadlineTooltipTitle(lang)}
        />
      </div>

      {/* 좌우 분할 레이아웃 */}
      <div className="flex gap-4">
        {/* 좌측: 현황 (3개 배지) */}
        <div className="flex flex-col gap-2 pr-4 border-r border-border min-w-[120px]">
          {/* 긴급 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-error" className="text-xs">
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>긴급</span>
                    </span>
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {criticalCount}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.criticalTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 주의 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-warning" className="text-xs">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>주의</span>
                    </span>
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {warningCount}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.warningTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 여유 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-info" className="text-xs">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" />
                      <span>여유</span>
                    </span>
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {normalCount}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.normalTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* 우측: 긴급 프로젝트 목록 */}
        <div className="flex-1 flex flex-col">
          {displayedCriticalProjects.length > 0 ? (
            <>
              <div className="space-y-1.5 flex-1">
                {displayedCriticalProjects.map((project, index) => (
                  <div key={project.id} className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-600">{index + 1}.</span>
                    <Badge variant="status-soft-error" className="text-[10px] px-1.5 py-0">
                      <span className="flex items-center gap-0.5">
                        <XCircle className="h-3 w-3" />
                        <span>긴급</span>
                      </span>
                    </Badge>
                    <span className="text-gray-700 font-medium truncate flex-1">
                      {project.name}
                    </span>
                    <span className="text-red-600 font-semibold whitespace-nowrap">
                      {project.isOverdue
                        ? `(초과 D+${Math.abs(project.daysRemaining)})`
                        : `(D-${project.daysRemaining})`}
                    </span>
                  </div>
                ))}
              </div>

              {/* 더보기 버튼 */}
              {hasMoreProjects && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-center gap-1 mt-2 py-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <span>{isExpanded ? '접기' : `더보기 (${allCriticalProjects.length - 3}건)`}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500">
              긴급 프로젝트 없음
            </div>
          )}
        </div>
      </div>
    </BaseStatCard>
  );
}
