'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpIcon } from '@/components/ui/help-icon';
import { BaseStatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { getProjectPageText } from '@/config/brand';
import { Briefcase } from 'lucide-react';

interface CombinedStatsCardProps {
  stats: {
    totalCount: number;
    planning: number;
    review: number;
    inProgress: number;
    onHold: number;
    cancelled: number;
    completed: number;
  };
  lang?: 'ko' | 'en';
}

/**
 * 통합 프로젝트 통계 카드
 *
 * 전체 프로젝트와 6가지 상태별 통계를 시각적으로 구분하여 표시
 * - 좌측: 전체 프로젝트 (단독 배치)
 * - 우측: 2열 3행 그리드 (기획/검토/진행중, 보류/취소/완료)
 */
export default function CombinedStatsCard({ stats, lang = 'ko' }: CombinedStatsCardProps) {
  return (
    <BaseStatCard enableHover className="p-3">
      {/* 헤더 */}
      <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
        <Briefcase className="w-3.5 h-3.5" />
        {getProjectPageText.statsOverview(lang)}
        <HelpIcon
          title={getProjectPageText.statsOverviewTooltipTitle(lang)}
          content={getProjectPageText.statsOverviewTooltipDescription(lang)}
          ariaLabel={getProjectPageText.statsOverviewTooltipTitle(lang)}
        />
      </div>

      {/* 좌우 분할 레이아웃 */}
      <div className="flex gap-4">
        {/* 좌측: 전체 프로젝트 */}
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="flex flex-col justify-center cursor-help pr-4 border-r border-border min-w-[100px]">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stats.totalCount}건
                </div>
                <div className="text-xs text-muted-foreground">
                  {getProjectPageText.statsTotal(lang)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{getProjectPageText.statsTotalTooltip(lang)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 우측: 2열 3행 그리드 */}
        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2">
          {/* 1열 1행: 기획 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-planning" className="text-xs">
                    {getProjectPageText.statsPlanning(lang)}
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {stats.planning}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.statsPlanningTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 2열 1행: 보류 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-onhold" className="text-xs">
                    {getProjectPageText.statsOnHold(lang)}
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {stats.onHold}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.statsOnHoldTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 1열 2행: 검토 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-review" className="text-xs">
                    {getProjectPageText.statsReview(lang)}
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {stats.review}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.statsReviewTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 2열 2행: 취소 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-cancelled" className="text-xs">
                    {getProjectPageText.statsCancelled(lang)}
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {stats.cancelled}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.statsCancelledTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 1열 3행: 진행중 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-inprogress" className="text-xs">
                    {getProjectPageText.statsInProgress(lang)}
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {stats.inProgress}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.statsInProgressTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 2열 3행: 완료 */}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between cursor-help">
                  <Badge variant="status-soft-completed" className="text-xs">
                    {getProjectPageText.statsCompleted(lang)}
                  </Badge>
                  <div className="text-sm font-bold text-foreground ml-2">
                    {stats.completed}건
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getProjectPageText.statsCompletedTooltip(lang)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </BaseStatCard>
  );
}