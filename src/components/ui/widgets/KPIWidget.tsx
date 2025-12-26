'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Calendar,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText, getLoadingText } from '@/config/brand';
import { typography } from '@/config/constants';
import { useKPIMetrics } from '@/hooks/useKPIMetrics';

interface KPIWidgetProps {
  title?: string;
  lang?: 'ko' | 'en';
  variant?: 'compact' | 'detailed';
  periodType?: 'monthly' | 'yearly';
  onPeriodChange?: (period: 'monthly' | 'yearly') => void;
}

// 트렌드 아이콘 컴포넌트
const TrendIcon = ({ trend, className }: { trend?: 'up' | 'down' | 'stable'; className?: string }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className={cn("h-3 w-3 text-green-500", className)} />;
    case 'down':
      return <TrendingDown className={cn("h-3 w-3 text-red-500", className)} />;
    case 'stable':
      return <Minus className={cn("h-3 w-3 text-gray-500", className)} />;
    default:
      return null;
  }
};

// 진행률 색상 매핑 - 중앙화된 색상 시스템 사용
const getProgressColor = (progress?: number) => {
  if (!progress) return 'bg-muted';
  if (progress >= 90) return 'bg-green-500 dark:bg-green-400';
  if (progress >= 70) return 'bg-primary';
  if (progress >= 50) return 'bg-yellow-500 dark:bg-yellow-400';
  return 'bg-destructive';
};

export function KPIWidget({
  title,
  lang = 'ko',
  variant = 'detailed',
  periodType = 'monthly',
  onPeriodChange,
  defaultSize: _defaultSize = { w: 5, h: 2 }
}: KPIWidgetProps & { defaultSize?: { w: number; h: number } }) {
  const displayTitle = title || getWidgetText.kpiMetrics.title(lang);
  const [currentPeriod, setCurrentPeriod] = useState<'monthly' | 'yearly'>(periodType);

  // useKPIMetrics 훅으로 실제 데이터 로드
  const {
    monthlyMetrics,
    yearlyMetrics,
    loading,
    error,
  } = useKPIMetrics();

  // 기간에 따른 메트릭스 선택
  const displayMetrics = currentPeriod === 'monthly' ? monthlyMetrics : yearlyMetrics;
  
  // 기간 변경 핸들러
  const handlePeriodChange = (value: string) => {
    const period = value as 'monthly' | 'yearly';
    setCurrentPeriod(period);
    onPeriodChange?.(period);
  };
  
  // 반응형 그리드 컬럼 계산
  const gridCols = useMemo(() => {
    // 작은 위젯(w<=3): 1열
    // 중간 위젯(w=4-5): 2열
    // 큰 위젯(w>=6): 3열
    return variant === 'compact' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [variant]);

  // 로딩 상태
  if (loading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
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
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <XCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className={typography.text.small}>KPI 데이터를 불러오는 중 오류가 발생했습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 빈 상태
  if (displayMetrics.length === 0) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-30" />
            <p className={typography.text.small}>KPI 데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
            <CardDescription className={typography.text.description}>
              {getWidgetText.kpiMetrics.description(lang)}
            </CardDescription>
          </div>
          <Select value={currentPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>월간</span>
                </div>
              </SelectItem>
              <SelectItem value="yearly">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>연간</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <ScrollArea className="h-full">
          <div className={cn(
            "grid gap-2 px-3",
            gridCols
          )}>
            {displayMetrics.map((metric) => {
              const isHighValue = metric.progress && metric.progress >= 80;
              
              return (
                <div
                  key={metric.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    isHighValue ? "bg-primary/5 border-primary/20" : "hover:bg-accent"
                  )}
                >
                  <div className="space-y-2">
                    {/* 헤더: 아이콘 + 라벨 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground">
                          {metric.icon}
                        </div>
                        <span className="text-sm font-medium">
                          {metric.label}
                        </span>
                      </div>
                      {metric.trend && (
                        <TrendIcon trend={metric.trend} />
                      )}
                    </div>

                    {/* 값 표시 및 트렌드 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          {metric.value}
                        </span>
                        {metric.unit && (
                          <span className="text-sm text-muted-foreground">
                            {metric.unit}
                          </span>
                        )}
                      </div>
                      {metric.trendValue && (
                        <Badge 
                          variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'error' : 'secondary'}
                          className="text-xs h-5 px-1.5"
                        >
                          {metric.trendValue}
                        </Badge>
                      )}
                    </div>

                    {/* 목표 */}
                    {metric.target && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          목표: {metric.target}{metric.unit}
                        </span>
                      </div>
                    )}

                    {/* Progress bar with percentage on left */}
                    {metric.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground min-w-[32px]">
                          {metric.progress}%
                        </span>
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              getProgressColor(metric.progress)
                            )}
                            style={{ width: `${metric.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 빈 상태 */}
          {displayMetrics.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">
                KPI 데이터가 없습니다
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}