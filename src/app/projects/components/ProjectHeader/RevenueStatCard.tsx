'use client';

import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BaseStatCard } from '@/components/ui/stat-card';
import { getProjectPageText } from '@/config/brand';
import { formatCurrency } from '@/lib/utils';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import {
  calculateMonthlyRevenue,
  generateMonthOptions,
  getCurrentYearMonth,
  getRevenueCalculationDetails,
  type MonthlyRevenue
} from '@/lib/utils/revenue-calculator';

/**
 * 원화(₩) 아이콘 컴포넌트
 * lucide-react 스타일과 일치하도록 구현
 */
const WonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* W 모양 */}
    <path d="M 4 6 L 8 14 L 12 6 L 16 14 L 20 6" />
    {/* 가로선 2개 (원화 기호의 특징) */}
    <line x1="4" y1="10" x2="20" y2="10" />
    <line x1="4" y1="13" x2="20" y2="13" />
  </svg>
);

interface RevenueStatCardProps {
  projects: ProjectTableRow[];
  lang?: 'ko' | 'en';
}

/**
 * 예상 월 매출 통계 카드
 *
 * 기능:
 * - 드롭다운으로 월 선택 (1년 치 데이터)
 * - 환율 적용한 매출 계산 (USD → KRW)
 * - 호버 시 계산식과 설명 표시
 */
export default function RevenueStatCard({ projects, lang = 'ko' }: RevenueStatCardProps) {
  const currentMonth = getCurrentYearMonth();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // 월 옵션 생성 (현재 연도 기준 12개월)
  const monthOptions = useMemo(() => {
    return generateMonthOptions();
  }, []);

  // 선택된 월의 매출 계산
  const monthlyRevenue: MonthlyRevenue = useMemo(() => {
    return calculateMonthlyRevenue(projects, selectedMonth);
  }, [projects, selectedMonth]);

  // 툴팁 내용 생성
  const calculationDetails = useMemo(() => {
    return getRevenueCalculationDetails(monthlyRevenue);
  }, [monthlyRevenue]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <BaseStatCard enableHover>
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground font-medium mb-1.5 flex items-center gap-2">
                  <WonIcon className="w-4 h-4" />
                  {getProjectPageText.statsMonthlyRevenue(lang)}
                </div>

                {/* 드롭다운 월 선택 */}
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 매출 금액 표시 */}
            <div className="mt-3">
              <div className="text-2xl font-bold text-primary">
                {monthlyRevenue.totalRevenue > 0
                  ? formatCurrency(monthlyRevenue.totalRevenue, 'KRW')
                  : getProjectPageText.statsNoProjects(lang)
                }
              </div>
              {monthlyRevenue.projectCount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {monthlyRevenue.projectCount}{getProjectPageText.statsProjects(lang)}
                </div>
              )}
            </div>
          </BaseStatCard>
        </TooltipTrigger>

        {/* 호버 툴팁: 계산식 + 설명 */}
        <TooltipContent
          side="bottom"
          className="max-w-md p-4"
          sideOffset={5}
        >
          <div className="space-y-3">
            {/* 제목 */}
            <div className="font-semibold text-sm border-b pb-2">
              {getProjectPageText.revenueTooltipTitle(lang)}
            </div>

            {/* 계산식 */}
            {monthlyRevenue.projectCount > 0 ? (
              <>
                <div className="text-xs space-y-1.5 font-mono bg-muted/30 p-2.5 rounded">
                  {calculationDetails.breakdown.split('\n').map((line, index) => (
                    <div key={index} className="leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>

                {/* 합계 */}
                <div className="text-xs font-semibold pt-1.5 border-t flex justify-between items-center">
                  <span>총 합계:</span>
                  <span className="text-primary">
                    {formatCurrency(monthlyRevenue.totalRevenue, 'KRW')}
                  </span>
                </div>

                {/* 설명 */}
                <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
                  <p>{getProjectPageText.revenueTooltipDescription(lang)}</p>
                  {monthlyRevenue.projects.some(p => p.originalCurrency === 'USD') && (
                    <p className="text-orange-600">
                      ⚠️ {getProjectPageText.revenueTooltipExchangeNote(lang)}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">
                {getProjectPageText.revenueTooltipNoProjects(lang)}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
