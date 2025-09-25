'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  Filter,
  FileText,
  DollarSign,
  Building2,
  Receipt,
  Coins,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { TaxDeadlineWidgetProps, TaxDeadline, TaxCategory } from '@/types/dashboard';

// 한국 세무 일정 데이터
const KOREAN_TAX_CALENDAR: TaxDeadline[] = [
  // 매월 반복
  {
    id: 'monthly-withholding',
    title: '원천세 납부',
    category: 'withholding',
    deadlineDay: 10,
    frequency: 'monthly',
    importance: 'high',
    description: '전월분 원천징수세 납부',
    taxPeriod: '전월분'
  },
  // 분기별 - 1월
  {
    id: 'vat-preview-jan',
    title: '부가가치세 예정신고',
    category: 'VAT',
    deadlineDay: 25,
    deadlineMonth: 1,
    frequency: 'quarterly',
    importance: 'critical',
    description: '부가가치세 예정신고 및 납부',
    taxPeriod: '전 분기'
  },
  // 분기별 - 4월
  {
    id: 'vat-final-apr',
    title: '부가가치세 확정신고',
    category: 'VAT',
    deadlineDay: 25,
    deadlineMonth: 4,
    frequency: 'quarterly',
    importance: 'critical',
    description: '부가가치세 확정신고 및 납부',
    taxPeriod: '전 분기'
  },
  // 분기별 - 7월
  {
    id: 'vat-preview-jul',
    title: '부가가치세 예정신고',
    category: 'VAT',
    deadlineDay: 25,
    deadlineMonth: 7,
    frequency: 'quarterly',
    importance: 'critical',
    description: '부가가치세 예정신고 및 납부',
    taxPeriod: '전 분기'
  },
  // 분기별 - 10월
  {
    id: 'vat-final-oct',
    title: '부가가치세 확정신고',
    category: 'VAT',
    deadlineDay: 25,
    deadlineMonth: 10,
    frequency: 'quarterly',
    importance: 'critical',
    description: '부가가치세 확정신고 및 납부',
    taxPeriod: '전 분기'
  },
  // 연간 - 3월
  {
    id: 'yearly-corporate-tax',
    title: '법인세 신고',
    category: 'corporate-tax',
    deadlineDay: 31,
    deadlineMonth: 3,
    frequency: 'yearly',
    importance: 'critical',
    description: '법인세 확정신고 (12월 결산법인)',
    taxPeriod: '전년도'
  },
  // 연간 - 5월
  {
    id: 'yearly-income-tax',
    title: '종합소득세 신고',
    category: 'income-tax',
    deadlineDay: 31,
    deadlineMonth: 5,
    frequency: 'yearly',
    importance: 'critical',
    description: '전년도 종합소득세 확정신고',
    taxPeriod: '전년도'
  },
  {
    id: 'yearly-local-income-tax',
    title: '지방소득세 신고',
    category: 'local-tax',
    deadlineDay: 31,
    deadlineMonth: 5,
    frequency: 'yearly',
    importance: 'high',
    description: '개인지방소득세 신고',
    taxPeriod: '전년도'
  },
  // 연간 - 8월
  {
    id: 'quarterly-corporate-interim',
    title: '법인세 중간예납',
    category: 'corporate-tax',
    deadlineDay: 31,
    deadlineMonth: 8,
    frequency: 'yearly',
    importance: 'high',
    description: '법인세 중간예납 신고 납부'
  },
];

// 카테고리별 아이콘 매핑
const getCategoryIcon = (category: TaxCategory) => {
  switch (category) {
    case 'VAT':
      return <Receipt className="h-4 w-4" />;
    case 'income-tax':
      return <DollarSign className="h-4 w-4" />;
    case 'corporate-tax':
      return <Building2 className="h-4 w-4" />;
    case 'withholding':
      return <Coins className="h-4 w-4" />;
    case 'local-tax':
      return <Home className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// 카테고리별 Badge variant 매핑
const getCategoryVariant = (category: TaxCategory) => {
  switch (category) {
    case 'VAT':
      return 'status-soft-info' as const;
    case 'income-tax':
      return 'status-soft-warning' as const;
    case 'corporate-tax':
      return 'status-soft-inprogress' as const;
    case 'withholding':
      return 'status-soft-success' as const;
    case 'local-tax':
      return 'status-soft-planning' as const;
    default:
      return 'outline' as const;
  }
};

// 카테고리 라벨 매핑
const getCategoryLabel = (category: TaxCategory, lang: 'ko' | 'en' = 'ko') => {
  const labels = {
    'VAT': { ko: '부가세', en: 'VAT' },
    'income-tax': { ko: '소득세', en: 'Income Tax' },
    'corporate-tax': { ko: '법인세', en: 'Corporate Tax' },
    'withholding': { ko: '원천세', en: 'Withholding' },
    'local-tax': { ko: '지방세', en: 'Local Tax' },
    'property-tax': { ko: '재산세', en: 'Property Tax' },
    'customs': { ko: '관세', en: 'Customs' },
    'other': { ko: '기타', en: 'Other' },
  };
  return labels[category]?.[lang] || category;
};

// 중요도별 색상 매핑 - 중앙화된 Badge variants 사용
const getImportanceColor = (importance: string) => {
  switch (importance) {
    case 'critical':
      return 'status-soft-error' as const;
    case 'high':
      return 'status-soft-warning' as const;
    case 'medium':
      return 'status-soft-info' as const;
    case 'low':
      return 'outline' as const;
    default:
      return 'status-soft-info' as const;
  }
};

// D-day 계산 함수
const calculateDday = (deadlineDay: number, deadlineMonth?: number) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  let targetMonth = deadlineMonth || currentMonth;
  let targetYear = currentYear;

  // 월별 반복 일정의 경우
  if (!deadlineMonth) {
    // 이번 달 마감일이 지났으면 다음 달로
    if (currentDay > deadlineDay) {
      targetMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      if (targetMonth === 1) targetYear = currentYear + 1;
    } else {
      targetMonth = currentMonth;
    }
  } else {
    // 연간 일정의 경우
    if (currentMonth > deadlineMonth || 
        (currentMonth === deadlineMonth && currentDay > deadlineDay)) {
      targetYear = currentYear + 1;
    }
  }

  const deadline = new Date(targetYear, targetMonth - 1, deadlineDay);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

const TaxDeadlineWidget: React.FC<TaxDeadlineWidgetProps & { defaultSize?: { w: number; h: number } }> = ({
  title = '세무 일정',
  selectedMonth,
  showOnlyUpcoming = true,
  maxItems = 5,
  compactMode = false,
  categories,
  highlightDays = 7,
  onDeadlineClick,
  onMonthChange,
  lang = 'ko',
  defaultSize = { w: 5, h: 2 }
}) => {
  const displayTitle = title || getWidgetText.taxDeadline.title('ko');
  const [currentSelectedMonth, setCurrentSelectedMonth] = useState<number | undefined>(selectedMonth);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 월 선택 핸들러
  const handleMonthChange = (value: string) => {
    const month = value === 'all' ? undefined : parseInt(value);
    setCurrentSelectedMonth(month);
    onMonthChange?.(month || 0);
  };

  // 항목 확장/축소 토글
  const toggleItemExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // 필터링된 세무 일정
  const filteredDeadlines = useMemo(() => {
    let filtered = [...KOREAN_TAX_CALENDAR];

    // 카테고리 필터
    if (categories && categories.length > 0) {
      filtered = filtered.filter(d => categories.includes(d.category));
    }

    // 월 필터
    if (currentSelectedMonth) {
      filtered = filtered.filter(d => {
        if (d.frequency === 'monthly') {
          return true; // 매월 반복
        }
        return d.deadlineMonth === currentSelectedMonth;
      });
    }

    // D-day 계산 및 정렬
    const withDday = filtered.map(deadline => ({
      ...deadline,
      dday: calculateDday(deadline.deadlineDay, deadline.deadlineMonth)
    }));

    // 다가오는 일정만 표시
    if (showOnlyUpcoming) {
      withDday.filter(d => d.dday >= 0);
    }

    // D-day 기준으로 정렬
    withDday.sort((a, b) => a.dday - b.dday);

    // 최대 항목 수 제한
    return withDday.slice(0, maxItems);
  }, [currentSelectedMonth, categories, showOnlyUpcoming, maxItems]);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
            <CardDescription className={typography.text.description}>
              {getWidgetText.taxDeadline.description('ko')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Select
              value={currentSelectedMonth?.toString() || 'all'}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1">
            {filteredDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p className="text-sm">일정이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2 px-3">
              {filteredDeadlines.map((deadline) => {
                const isUrgent = deadline.dday <= 3;
                const isHighlighted = deadline.dday <= highlightDays;
                const isExpanded = expandedItems.has(deadline.id);

                return (
                  <div
                    key={deadline.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors cursor-pointer",
                      isUrgent && "bg-destructive/10 border-destructive/30",
                      isHighlighted && !isUrgent && "bg-primary/5 border-primary/20",
                      "hover:bg-accent"
                    )}
                    onClick={() => {
                      toggleItemExpanded(deadline.id);
                      onDeadlineClick?.(deadline);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(deadline.category)}
                          <span className={cn(
                            "font-medium",
                            compactMode && "text-sm"
                          )}>
                            {deadline.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={getCategoryVariant(deadline.category)}
                            className="text-xs"
                          >
                            {getCategoryLabel(deadline.category, lang)}
                          </Badge>
                          <Badge 
                            variant={getImportanceColor(deadline.importance)}
                            className="text-xs"
                          >
                            {deadline.importance === 'critical' ? '긴급' :
                             deadline.importance === 'high' ? '중요' :
                             deadline.importance === 'medium' ? '보통' : '낮음'}
                          </Badge>
                          {deadline.frequency === 'monthly' && (
                            <Badge variant="status-soft-planning" className="text-xs">
                              매월
                            </Badge>
                          )}
                          {deadline.taxPeriod && (
                            <span className="text-xs text-muted-foreground">
                              {deadline.taxPeriod}
                            </span>
                          )}
                        </div>
                        {isExpanded && deadline.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {deadline.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                          "flex items-center gap-1",
                          isUrgent && "text-destructive",
                          isHighlighted && !isUrgent && "text-primary"
                        )}>
                          {deadline.dday === 0 ? (
                            <>
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-bold">오늘</span>
                            </>
                          ) : deadline.dday > 0 ? (
                            <>
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                D-{deadline.dday}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {Math.abs(deadline.dday)}일 전
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {deadline.deadlineMonth ? 
                            `${deadline.deadlineMonth}월 ${deadline.deadlineDay}일` :
                            `매월 ${deadline.deadlineDay}일`
                          }
                        </div>
                        <ChevronRight className={cn(
                          "h-3 w-3 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="px-3 pt-3 mt-auto border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/30 flex-shrink-0" />
              <span className="whitespace-nowrap">긴급 (D-3)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20 flex-shrink-0" />
              <span className="whitespace-nowrap">주의 (D-7)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border flex-shrink-0" />
              <span className="whitespace-nowrap">일반</span>
            </div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxDeadlineWidget;
export { TaxDeadlineWidget };