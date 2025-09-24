'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  Users, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Target,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectReview } from '@/types/dashboard';
import { uiText, getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';

interface ProjectSummaryWidgetProps {
  projects: ProjectReview[];
  title?: string;
  lang?: 'ko' | 'en';
  onProjectClick?: (project: ProjectReview) => void;
  maxProjects?: number;
}

export function ProjectSummaryWidget({ 
  projects, 
  title,
  lang = 'ko',
  onProjectClick,
  maxProjects = 3
}: ProjectSummaryWidgetProps) {
  const texts = uiText.projectWidget;
  const displayTitle = title || texts.title[lang];
  
  // 상위 프로젝트만 표시 (우선순위: critical > warning > normal > completed)
  const sortedProjects = [...projects]
    .sort((a, b) => {
      const statusPriority = { 'critical': 4, 'warning': 3, 'normal': 2, 'completed': 1 };
      return statusPriority[b.status] - statusPriority[a.status];
    })
    .slice(0, maxProjects);

  if (sortedProjects.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
          <CardDescription>{getWidgetText.projectSummary.noProjects(lang)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p className={typography.text.small}>{getWidgetText.projectSummary.addProject(lang)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={typography.widget.title}>
            {displayTitle}
          </CardTitle>
          <Badge variant="secondary" className={typography.widget.badge}>
            {sortedProjects.length}{getWidgetText.projectSummary.projectsInProgress(lang)}
          </Badge>
        </div>
        <CardDescription className={typography.text.description}>
          {getWidgetText.projectSummary.viewProgress(lang)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <div className="flex flex-col h-full">
          <div className="mb-2 px-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className={typography.text.xs}>전체</TabsTrigger>
                <TabsTrigger value="active" className={typography.text.xs}>진행중</TabsTrigger>
                <TabsTrigger value="urgent" className={typography.text.xs}>긴급</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1 mt-2">
                <div className="space-y-2 px-3">
                  <TabsContent value="all" className="space-y-2 mt-0">
                    {sortedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="active" className="space-y-2 mt-0">
                    {sortedProjects.filter(p => p.status === 'normal' || p.status === 'warning').map((project) => (
                      <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="urgent" className="space-y-2 mt-0">
                    {sortedProjects.filter(p => p.status === 'critical').map((project) => (
                      <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
                    ))}
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
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

  const getStatusVariant = (status: ProjectReview['status']): 'error' | 'warning' | 'secondary' | 'success' => {
    switch (status) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'normal': return 'secondary';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const getProgressColor = (status: ProjectReview['status'], progress: number) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'critical') return 'bg-red-500';
    if (status === 'warning') return 'bg-yellow-500';
    if (progress >= 75) return 'bg-primary';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-muted-foreground/40';
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
      {/* Header Section */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
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
          <h4 className={typography.widget.heading}>{project.projectName}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className={`${typography.widget.caption} flex items-center gap-1`}>
              <Users className="h-3 w-3" />
              {project.client}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`${typography.widget.caption} cursor-help`}>
                    {project.pm}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className={typography.text.xs}>프로젝트 매니저</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {/* Arrow button intentionally omitted */}
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-help">
                    <Target className="h-3 w-3" />
                    <span className="font-medium">{project.progress}%</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className={typography.text.xs}>프로젝트 진행률: {project.progress}% 완료</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={typography.text.description}>
                {new Date(project.deadline).toLocaleDateString('ko-KR', { 
                  month: 'short', 
                  day: 'numeric' 
                })}까지
              </span>
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground cursor-help">
                  {formatCurrency(project.budget.spent, project.budget.currency)} / 
                  {formatCurrency(project.budget.total, project.budget.currency)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className={typography.text.xs}>예산 사용 현황</p>
                  <p className={`${typography.text.xs} font-medium`}>
                    {Math.round((project.budget.spent / project.budget.total) * 100)}% 소진
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
          <div 
            className={cn(
              "h-full transition-all duration-500 ease-out",
              getProgressColor(project.status, project.progress)
            )}
            style={{ width: `${project.progress}%` }}
          />
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

      {/* Top Right Indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {project.issues && project.issues.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <span className={`${typography.text.xs} font-medium text-destructive`}>
                    {project.issues.length}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className={`${typography.text.xs} font-semibold`}>이슈 목록:</p>
                  {project.issues.map((issue, index) => (
                    <p key={index} className={typography.text.xs}>• {issue}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
