'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectReview } from '@/types/dashboard';
import { getWidgetText, getLoadingText } from '@/config/brand';
import { typography } from '@/config/constants';
import { useProjectSummary } from '@/hooks/useProjectSummary';

interface ProjectSummaryWidgetProps {
  title?: string;
  lang?: 'ko' | 'en';
  onProjectClick?: (project: ProjectReview) => void;
  maxProjects?: number;
  defaultSize?: { w: number; h: number };
}

export function ProjectSummaryWidget({
  title,
  lang = 'ko',
  onProjectClick,
  maxProjects = 3,
  defaultSize = { w: 4, h: 4 }
}: ProjectSummaryWidgetProps) {
  const { projects, loading, error } = useProjectSummary();
  const widgetText = getWidgetText.projectSummary;
  const displayTitle = title ?? widgetText.title(lang);
  
  // 상위 프로젝트만 표시 (우선순위: critical > warning > normal > completed)
  const sortedProjects = [...projects]
    .sort((a, b) => {
      const statusPriority = { 'critical': 4, 'warning': 3, 'normal': 2, 'completed': 1 };
      return statusPriority[b.status] - statusPriority[a.status];
    })
    .slice(0, maxProjects);
  
  // 상태별 카운트
  const statusCounts = {
    normal: projects.filter(p => p.status === 'normal').length,
    warning: projects.filter(p => p.status === 'warning').length,
    critical: projects.filter(p => p.status === 'critical').length,
  };

  // 로딩 상태
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="md" text={getLoadingText.data('ko')} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <XCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className={typography.text.small}>프로젝트 데이터를 불러오는 중 오류가 발생했습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 빈 상태
  if (sortedProjects.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p className={typography.text.small}>{widgetText.addProject(lang)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className={typography.widget.title}>
            {displayTitle}
          </CardTitle>
          <Badge variant="secondary" className={typography.widget.badge}>
            {projects.length}{widgetText.projectsInProgress(lang)}
          </Badge>
        </div>
        
        {/* 상태별 카운트 표시 및 더보기 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-blue-700" />
              <span className={`${typography.text.xs} text-blue-700`}>
                정상 {statusCounts.normal}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-700" />
              <span className={`${typography.text.xs} text-yellow-700`}>
                주의 {statusCounts.warning}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-red-700" />
              <span className={`${typography.text.xs} text-red-700`}>
                긴급 {statusCounts.critical}
              </span>
            </div>
          </div>
          
          <Link href="/projects" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
            >
              더보기
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <ScrollArea className="h-full">
          <div className="space-y-2 px-3">
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// 개별 프로젝트 카드 컴포넌트
function ProjectCard({ 
  project, 
  lang, 
  onProjectClick 
}: { 
  project: ProjectReview; 
  lang: 'ko' | 'en';
  onProjectClick?: (project: ProjectReview) => void;
}) {
  const getStatusIcon = (status: ProjectReview['status']) => {
    switch (status) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'normal':
        return <Activity className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: ProjectReview['status']) => {
    switch (status) {
      case 'critical': return 'status-soft-error' as const;
      case 'warning': return 'status-soft-warning' as const;
      case 'normal': return 'status-soft-inprogress' as const;
      case 'completed': return 'status-soft-completed' as const;
      default: return 'status-soft-inprogress' as const;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemainingDisplay = (days: number) => {
    if (days < 0) return `D+${Math.abs(days)}`;
    return `D-${days}`;
  };
  
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card p-3 transition-all duration-200",
        "hover:shadow-sm hover:border-primary/20",
        onProjectClick && "cursor-pointer"
      )}
      onClick={() => onProjectClick?.(project)}
    >
      {/* First Row: Status Badge + D-day + Deadline */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={getStatusVariant(project.status)} className="h-5 px-2 text-xs cursor-help">
                  <span className="flex items-center gap-1">
                    {getStatusIcon(project.status)}
                    <span className="font-medium">{project.statusLabel}</span>
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className={typography.text.xs}>
                  {project.status === 'critical' && '즉시 조치가 필요한 긴급 상태입니다'}
                  {project.status === 'warning' && '주의가 필요한 상태입니다'}
                  {project.status === 'normal' && '정상적으로 진행 중입니다'}
                  {project.status === 'completed' && '프로젝트가 완료되었습니다'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className={typography.widget.caption}>
            {getDaysRemainingDisplay(project.daysRemaining)}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(project.deadline).toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric' 
          })}까지
        </span>
      </div>

      {/* Second Row: Project Name - Company + Contract Amount */}
      <div className="flex items-center justify-between mb-2">
        <h4 className={`${typography.widget.heading} flex items-center gap-1.5`}>
          <span>{project.projectName}</span>
          <span className="text-muted-foreground">-</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            {project.client}
          </span>
        </h4>
        <span className="text-xs font-medium text-muted-foreground">
          {formatCurrency(project.budget.total, project.budget.currency).replace('$', '')}
        </span>
      </div>

      {/* Third Row: Progress % + Progress Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground min-w-[35px]">
          {project.progress}%
        </span>
        {/* Progress Bar using ProjectProgress component style */}
        <div className="flex-1 relative">
          <div className="relative h-2 w-full overflow-hidden rounded-md border border-border bg-white">
            <div 
              className={cn(
                "h-full transition-all duration-500 ease-out",
                project.progress >= 80 ? 'bg-primary' :
                project.progress >= 60 ? 'bg-primary/80' :
                project.progress >= 40 ? 'bg-primary/60' :
                project.progress >= 20 ? 'bg-primary/40' :
                'bg-destructive'
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Section */}
      {project.currentStatus && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className={`${typography.widget.caption} line-clamp-1`}>
            {project.currentStatus}
          </p>
        </div>
      )}
    </div>
  );
}
