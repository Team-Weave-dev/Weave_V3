'use client';

import React from 'react';
import { ViewMode } from '@/components/ui/view-mode-switch';
import Typography from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { getProjectPageText } from '@/config/brand';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import RevenueStatCard from './RevenueStatCard';
import CombinedStatsCard from './CombinedStatsCard';
import DeadlineStatsCard from './DeadlineStatsCard';

interface ProjectHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateProject?: () => void;
  stats: {
    totalCount: number;
    planning: number;
    review: number;
    inProgress: number;
    onHold: number;
    cancelled: number;
    completed: number;
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
  // viewMode and onViewModeChange currently unused - kept for future use
  viewMode: _viewMode,
  onViewModeChange: _onViewModeChange,
  onCreateProject,
  stats,
  projects,
  loading: _loading = false
}: ProjectHeaderProps) {
  return (
    <div className="mb-6">
      {/* Title and Actions Row */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
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
            <span className="hidden md:inline">{getProjectPageText.newProject('ko')}</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards - 3 columns layout with new combined cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Combined Stats Card (replacing 4 old cards) */}
        <CombinedStatsCard stats={stats} lang="ko" />

        {/* Deadline Stats Card (new) */}
        <DeadlineStatsCard projects={projects} lang="ko" />

        {/* Monthly Revenue Card */}
        <RevenueStatCard projects={projects} lang="ko" />
      </div>
    </div>
  );
}
