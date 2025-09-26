'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, ChartBar, ChartLine } from 'lucide-react';
import { getWidgetText } from '@/config/brand';
import { typography, chart as chartConfig } from '@/config/constants';

// 차트 뷰 타입
type ChartView = 'bar' | 'line';
type PeriodType = 'monthly' | 'quarterly' | 'yearly';

interface RevenueData {
  period: string;
  revenue: number;
  expenses?: number;
  profit?: number;
  previousYear?: number;
}

interface RevenueChartWidgetProps {
  title?: string;
  lang?: 'ko' | 'en';
  data?: RevenueData[];
  periodType?: PeriodType;
  chartView?: ChartView;
  showExpenses?: boolean;
  showProfit?: boolean;
  showPreviousYear?: boolean;
  onPeriodChange?: (period: PeriodType) => void;
}

// 월별 샘플 데이터
const monthlyData: RevenueData[] = [
  { period: '1월', revenue: 2450, expenses: 1800, profit: 650, previousYear: 2100 },
  { period: '2월', revenue: 2780, expenses: 2000, profit: 780, previousYear: 2300 },
  { period: '3월', revenue: 3120, expenses: 2200, profit: 920, previousYear: 2800 },
  { period: '4월', revenue: 3450, expenses: 2400, profit: 1050, previousYear: 3200 },
  { period: '5월', revenue: 3890, expenses: 2600, profit: 1290, previousYear: 3500 },
  { period: '6월', revenue: 4250, expenses: 2850, profit: 1400, previousYear: 3900 },
];

// 분기별 샘플 데이터
const quarterlyData: RevenueData[] = [
  { period: '1분기', revenue: 8350, expenses: 6000, profit: 2350, previousYear: 7200 },
  { period: '2분기', revenue: 11590, expenses: 7850, profit: 3740, previousYear: 10600 },
  { period: '3분기', revenue: 13200, expenses: 8900, profit: 4300, previousYear: 11800 },
  { period: '4분기', revenue: 14800, expenses: 9500, profit: 5300, previousYear: 13500 },
];

// 연간 샘플 데이터
const yearlyData: RevenueData[] = [
  { period: '2021', revenue: 35000, expenses: 25000, profit: 10000 },
  { period: '2022', revenue: 42000, expenses: 28000, profit: 14000 },
  { period: '2023', revenue: 47940, expenses: 32250, profit: 15690 },
  { period: '2024', revenue: 54000, expenses: 36000, profit: 18000 },
];

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
  data,
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
  
  // 기간별 데이터 선택
  const displayData = useMemo(() => {
    if (data) return data;
    switch (currentPeriod) {
      case 'quarterly':
        return quarterlyData;
      case 'yearly':
        return yearlyData;
      default:
        return monthlyData;
    }
  }, [data, currentPeriod]);
  
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
                      formatter={(value) => {
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
                      }}
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
                      formatter={(value) => {
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
                      }}
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