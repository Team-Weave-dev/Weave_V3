'use client';

import React from 'react';
import { ViewMode } from '@/components/ui/view-mode-switch';
import Typography from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { SimpleStatCard } from '@/components/ui/stat-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Briefcase, Plus, Play, Eye, CheckCircle } from 'lucide-react';
import { getProjectPageText } from '@/config/brand';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import RevenueStatCard from './RevenueStatCard';

interface ProjectHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateProject?: () => void;
  stats: {
    totalCount: number;
    inProgress: number;
    completed: number;
    review: number;
  };
  projects: ProjectTableRow[];  // 매출 계산용 프로젝트 데이터
  loading?: boolean;
}

/**
 * ProjectHeader Component
 *
 * Responsible for:
 * - Displaying project management title and description
 * - View mode switcher (List/Detail)
 * - Action buttons (Create new project, etc.)
 * - Summary statistics cards
 *
 * This component is separated from the main view logic for better maintainability
 */
export default function ProjectHeader({
  viewMode,
  onViewModeChange,
  onCreateProject,
  stats,
  projects,
  loading = false
}: ProjectHeaderProps) {
  return (
    <div className="mb-6">
      {/* Title and Actions Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1">
              <Typography variant="h2" className="text-2xl text-foreground">
                {getProjectPageText.headerTitle('ko')}
              </Typography>
            </div>
            <Typography variant="body1" className="text-muted-foreground">
              {getProjectPageText.headerDescription('ko')}
            </Typography>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="default"
            onClick={onCreateProject}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {getProjectPageText.newProject('ko')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Projects */}
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div>
                <SimpleStatCard
                  value={stats.totalCount}
                  label={getProjectPageText.statsTotal('ko')}
                  icon={<Briefcase className="w-5 h-5 text-blue-500" />}
                  bgColor="bg-blue-50"
                  enableHover
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getProjectPageText.statsTotalTooltip('ko')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* In Progress */}
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div>
                <SimpleStatCard
                  value={stats.inProgress}
                  label={getProjectPageText.statsInProgress('ko')}
                  icon={<Play className="w-5 h-5 text-purple-500" />}
                  bgColor="bg-purple-50"
                  valueColor="text-purple-600"
                  enableHover
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getProjectPageText.statsInProgressTooltip('ko')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Review */}
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div>
                <SimpleStatCard
                  value={stats.review}
                  label={getProjectPageText.statsReview('ko')}
                  icon={<Eye className="w-5 h-5 text-orange-500" />}
                  bgColor="bg-orange-50"
                  valueColor="text-orange-600"
                  enableHover
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getProjectPageText.statsReviewTooltip('ko')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Completed */}
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div>
                <SimpleStatCard
                  value={stats.completed}
                  label={getProjectPageText.statsCompleted('ko')}
                  icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                  bgColor="bg-green-50"
                  valueColor="text-green-600"
                  enableHover
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getProjectPageText.statsCompletedTooltip('ko')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Monthly Revenue */}
        <RevenueStatCard projects={projects} lang="ko" />
      </div>
    </div>
  );
}
