'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  Clock, 
  Users, 
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Target,
  ArrowRight,
  Activity,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectReview } from '@/types/dashboard';
import { uiText } from '@/config/brand';

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

  const getStatusIcon = (status: ProjectReview['status']) => {
    switch (status) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'normal':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: ProjectReview['status']): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'normal': return 'secondary';
      case 'completed': return 'outline';
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
    if (days < 0) {
      return `D+${Math.abs(days)}`;
    }
    return `D-${days}`;
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-600 bg-red-50';
    if (days <= 3) return 'text-red-600 bg-red-50';
    if (days <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (sortedProjects.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{displayTitle}</CardTitle>
          <CardDescription>진행 중인 프로젝트가 없습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">새 프로젝트를 추가해주세요</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {displayTitle}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {sortedProjects.length}개 진행중
          </Badge>
        </div>
        <CardDescription className="text-sm">
          진행 상황과 우선순위를 한눈에 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">진행중</TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs">긴급</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-2 mt-4">
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
            ))}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-2 mt-4">
            {sortedProjects.filter(p => p.status === 'normal' || p.status === 'warning').map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
            ))}
          </TabsContent>
          
          <TabsContent value="urgent" className="space-y-2 mt-4">
            {sortedProjects.filter(p => p.status === 'critical').map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} onProjectClick={onProjectClick} />
            ))}
          </TabsContent>
        </Tabs>
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
  const texts = uiText.projectWidget;
  
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

  const getStatusVariant = (status: ProjectReview['status']): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'normal': return 'secondary';
      case 'completed': return 'outline';
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
                  <p className="text-xs">
                    {project.status === 'critical' && '즉시 조치가 필요한 긴급 상태입니다'}
                    {project.status === 'warning' && '주의가 필요한 상태입니다'}
                    {project.status === 'normal' && '정상적으로 진행 중입니다'}
                    {project.status === 'completed' && '프로젝트가 완료되었습니다'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-muted-foreground">
              {getDaysRemainingDisplay(project.daysRemaining)}
            </span>
          </div>
          <h4 className="font-semibold text-sm text-foreground">{project.projectName}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.client}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground cursor-help">
                    {project.pm}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">프로젝트 매니저</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {/* Arrow button moved to avoid overlap with issues */}
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
                  <p className="text-xs">프로젝트 진행률: {project.progress}% 완료</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="text-muted-foreground">
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
                  <p className="text-xs">예산 사용 현황</p>
                  <p className="text-xs font-medium">
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
          <p className="text-xs text-muted-foreground line-clamp-1">
            {project.currentStatus}
          </p>
        </div>
      )}

      {/* Top Right Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {project.issues && project.issues.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-medium text-destructive">
                    {project.issues.length}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="text-xs font-semibold">이슈 목록:</p>
                  {project.issues.map((issue, index) => (
                    <p key={index} className="text-xs">• {issue}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onProjectClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}