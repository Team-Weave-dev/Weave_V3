'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, ChartBar, ChartLine, XCircle } from 'lucide-react';
import { getWidgetText, getLoadingText } from '@/config/brand';
import { typography } from '@/config/constants';
import { useRevenueChart } from '@/hooks/useRevenueChart';

// 차트 뷰 타입
type ChartView = 'bar' | 'line';
type PeriodType = 'monthly' | 'quarterly' | 'yearly';

interface RevenueChartWidgetProps {
  title?: string;
  lang?: 'ko' | 'en';
  periodType?: PeriodType;
  chartView?: ChartView;
  showExpenses?: boolean;
  showProfit?: boolean;
  showPreviousYear?: boolean;
  onPeriodChange?: (period: PeriodType) => void;
}

// 차트 색상 설정
const CHART_COLORS = {
  revenue: 'hsl(var(--chart-1))',  // primary 색상
  expenses: 'hsl(var(--chart-2))',  // secondary 색상
  profit: 'hsl(var(--chart-3))',    // success 색상
  previousYear: 'hsl(var(--chart-4))', // muted 색상
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any) => {
          let labelText = '';
          switch (entry.dataKey) {
            case 'revenue':
              labelText = getWidgetText.revenueChart.revenue('ko');
              break;
            case 'expenses':
              labelText = getWidgetText.revenueChart.expenses('ko');
              break;
            case 'profit':
              labelText = getWidgetText.revenueChart.profit('ko');
              break;
            case 'previousYear':
              labelText = getWidgetText.revenueChart.previousYear('ko');
              break;
            default:
              labelText = entry.dataKey;
          }
          
          return (
            <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{labelText}:</span>
              <span className="font-medium">{entry.value?.toLocaleString()}{getWidgetText.revenueChart.unit('ko')}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// 성장률 계산 함수
const calculateGrowthRate = (current: number, previous?: number) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100);
};

export function RevenueChartWidget({
  title,
  lang = 'ko',
  periodType = 'monthly',
  chartView = 'bar',
  showExpenses = true,
  showProfit = true,
  showPreviousYear = false,
  onPeriodChange
}: RevenueChartWidgetProps) {
  const displayTitle = title || getWidgetText.revenueChart.title(lang);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>(periodType);
  const [currentView, setCurrentView] = useState<ChartView>(chartView);

  // useRevenueChart 훅으로 실제 데이터 로드
  const {
    monthlyData,
    quarterlyData,
    yearlyData,
    loading,
    error,
  } = useRevenueChart();

  // 기간별 데이터 선택
  const displayData = useMemo(() => {
    switch (currentPeriod) {
      case 'quarterly':
        return quarterlyData;
      case 'yearly':
        return yearlyData;
      default:
        return monthlyData;
    }
  }, [currentPeriod, monthlyData, quarterlyData, yearlyData]);
  
  // 총 매출 계산
  const totalRevenue = useMemo(() => {
    return displayData.reduce((sum, item) => sum + item.revenue, 0);
  }, [displayData]);
  
  // 평균 성장률 계산
  const avgGrowthRate = useMemo(() => {
    if (displayData.length <= 1) return '0.0';
    const rates = displayData.slice(1).map((item, index) => 
      calculateGrowthRate(item.revenue, displayData[index].revenue)
    );
    if (rates.length === 0) return '0.0';
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    return avgRate.toFixed(1);
  }, [displayData]);
  
  // 기간 변경 핸들러
  const handlePeriodChange = (value: string) => {
    const period = value as PeriodType;
    setCurrentPeriod(period);
    onPeriodChange?.(period);
  };
  
  // 차트 뷰 변경 핸들러
  const handleViewChange = (value: string) => {
    setCurrentView(value as ChartView);
  };

  // Legend formatter 메모화 (무한 루프 방지)
  const legendFormatter = useCallback((value: string) => {
    switch(value) {
      case 'revenue':
        return getWidgetText.revenueChart.revenue(lang);
      case 'expenses':
        return getWidgetText.revenueChart.expenses(lang);
      case 'profit':
        return getWidgetText.revenueChart.profit(lang);
      case 'previousYear':
        return getWidgetText.revenueChart.previousYear(lang);
      default:
        return value;
    }
  }, [lang]);

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
            <p className={typography.text.small}>매출 데이터를 불러오는 중 오류가 발생했습니다</p>
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
              {getWidgetText.revenueChart.description(lang)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* 차트 타입 선택 */}
            <Select value={currentView} onValueChange={handleViewChange}>
              <SelectTrigger className="w-[90px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center gap-1">
                    <ChartBar className="h-3 w-3" />
                    <span>막대</span>
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center gap-1">
                    <ChartLine className="h-3 w-3" />
                    <span>선형</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* 기간 선택 */}
            <Select value={currentPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{getWidgetText.revenueChart.monthly(lang)}</span>
                  </div>
                </SelectItem>
                <SelectItem value="quarterly">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{getWidgetText.revenueChart.quarterly(lang)}</span>
                  </div>
                </SelectItem>
                <SelectItem value="yearly">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{getWidgetText.revenueChart.yearly(lang)}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 요약 정보 */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">총 매출:</span>
            <span className="text-sm font-semibold">{totalRevenue.toLocaleString()}{getWidgetText.revenueChart.unit(lang)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">평균 성장률:</span>
            <Badge variant={parseFloat(avgGrowthRate) > 0 ? 'default' : 'secondary'} className="h-5">
              {parseFloat(avgGrowthRate) > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {avgGrowthRate}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <div className="h-full flex flex-col">
          <div className="px-3 flex-1 min-h-[150px]">
            {displayData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {currentView === 'bar' ? (
                  <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 11 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={legendFormatter}
                    />
                    <Bar dataKey="revenue" fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
                    {showExpenses && <Bar dataKey="expenses" fill={CHART_COLORS.expenses} radius={[4, 4, 0, 0]} />}
                    {showProfit && <Bar dataKey="profit" fill={CHART_COLORS.profit} radius={[4, 4, 0, 0]} />}
                    {showPreviousYear && <Bar dataKey="previousYear" fill={CHART_COLORS.previousYear} radius={[4, 4, 0, 0]} />}
                  </BarChart>
                ) : (
                  <LineChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 11 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      formatter={legendFormatter}
                    />
                    <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={{ r: 3 }} />
                    {showExpenses && <Line type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} strokeWidth={2} dot={{ r: 3 }} />}
                    {showProfit && <Line type="monotone" dataKey="profit" stroke={CHART_COLORS.profit} strokeWidth={2} dot={{ r: 3 }} />}
                    {showPreviousYear && <Line type="monotone" dataKey="previousYear" stroke={CHART_COLORS.previousYear} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />}
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground">
                <ChartBar className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">{getWidgetText.revenueChart.noData(lang)}</p>
              </div>
            )}
          </div>
          
          {/* 요약 정보 */}
          {displayData.length > 0 && (
            <div className="px-3 pt-2 mt-auto border-t">
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-4">
                  <span className="text-muted-foreground">
                    {getWidgetText.revenueChart.total(lang)}: 
                    <span className="font-semibold ml-1 text-foreground">
                      {totalRevenue.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {getWidgetText.revenueChart.avgGrowth(lang)}: 
                    <span className={`font-semibold ml-1 ${parseFloat(avgGrowthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(avgGrowthRate) > 0 ? '+' : ''}{avgGrowthRate}%
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}