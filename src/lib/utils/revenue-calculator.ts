/**
 * 월별 매출 계산 유틸리티
 *
 * 프로젝트 데이터를 기반으로 월별 예상 매출을 계산합니다.
 */

import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { normalizeToKRW } from '@/lib/mock/exchange-rates';
import { formatCurrency } from '@/lib/utils';

export interface MonthlyRevenue {
  yearMonth: string;        // YYYY-MM 형식
  totalRevenue: number;     // KRW 기준 총 매출
  projectCount: number;     // 해당 월 프로젝트 수
  projects: Array<{
    id: string;
    no: string;
    name: string;
    originalAmount: number;
    originalCurrency: 'KRW' | 'USD';
    convertedAmount: number;
    registrationDate: string;
  }>;
}

export interface RevenueCalculation {
  totalRevenue: number;
  breakdown: string;        // 계산식 설명
  description: string;      // 간략한 설명
}

/**
 * 프로젝트 목록에서 특정 월의 매출을 계산합니다.
 *
 * @param projects - 프로젝트 목록
 * @param yearMonth - 계산할 월 (YYYY-MM 형식)
 * @returns 월별 매출 정보
 *
 * @example
 * ```typescript
 * calculateMonthlyRevenue(projects, '2024-03')
 * // {
 * //   yearMonth: '2024-03',
 * //   totalRevenue: 150000000,
 * //   projectCount: 3,
 * //   projects: [...]
 * // }
 * ```
 */
export function calculateMonthlyRevenue(
  projects: ProjectTableRow[],
  yearMonth: string
): MonthlyRevenue {
  const filteredProjects = projects.filter(project => {
    if (!project.registrationDate || !project.totalAmount) return false;

    const projectYearMonth = project.registrationDate.substring(0, 7);
    return projectYearMonth === yearMonth;
  });

  let totalRevenue = 0;
  const projectDetails = filteredProjects.map(project => {
    const amount = project.totalAmount || 0;
    const currency = project.currency || 'KRW';
    const convertedAmount = normalizeToKRW(amount, currency, project.registrationDate);

    totalRevenue += convertedAmount;

    return {
      id: project.id,
      no: project.no,
      name: project.name,
      originalAmount: amount,
      originalCurrency: currency,
      convertedAmount,
      registrationDate: project.registrationDate
    };
  });

  return {
    yearMonth,
    totalRevenue,
    projectCount: filteredProjects.length,
    projects: projectDetails
  };
}

/**
 * 1년(12개월) 매출 데이터를 생성합니다.
 *
 * @param projects - 프로젝트 목록
 * @param baseYear - 기준 연도 (기본값: 현재 연도)
 * @returns 12개월 매출 데이터 배열
 */
export function calculateYearlyRevenue(
  projects: ProjectTableRow[],
  baseYear?: number
): MonthlyRevenue[] {
  const year = baseYear || new Date().getFullYear();
  const monthlyData: MonthlyRevenue[] = [];

  for (let month = 1; month <= 12; month++) {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    monthlyData.push(calculateMonthlyRevenue(projects, yearMonth));
  }

  return monthlyData;
}

/**
 * 매출 계산 상세 정보를 생성합니다 (툴팁 표시용).
 *
 * @param monthlyRevenue - 월별 매출 데이터
 * @returns 계산식과 설명
 */
export function getRevenueCalculationDetails(
  monthlyRevenue: MonthlyRevenue
): RevenueCalculation {
  const { totalRevenue, projectCount, projects } = monthlyRevenue;

  // 계산식 생성
  const breakdown = projects.length === 0
    ? '해당 월 등록된 프로젝트 없음'
    : projects.map((p, index) => {
        const currencySymbol = p.originalCurrency === 'USD' ? '$' : '₩';
        const originalFormatted = p.originalCurrency === 'USD'
          ? formatCurrency(p.originalAmount, 'USD')
          : formatCurrency(p.originalAmount, 'KRW');

        if (p.originalCurrency === 'USD') {
          return `${index + 1}. ${p.name}: ${originalFormatted} (${currencySymbol}${p.originalAmount.toLocaleString()}) → ₩${p.convertedAmount.toLocaleString()}`;
        }
        return `${index + 1}. ${p.name}: ${originalFormatted}`;
      }).join('\n');

  // 설명 생성
  const description = projects.length === 0
    ? '등록된 프로젝트가 없습니다.'
    : `총 ${projectCount}개 프로젝트의 계약 금액을 합산했습니다. USD 금액은 해당 월의 환율을 적용하여 KRW로 환산되었습니다.`;

  return {
    totalRevenue,
    breakdown,
    description
  };
}

/**
 * 현재 월을 YYYY-MM 형식으로 반환합니다.
 *
 * @returns 현재 월 (YYYY-MM)
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 월 목록을 생성합니다 (드롭다운용).
 *
 * @param baseYear - 기준 연도
 * @returns 월 목록 배열
 */
export function generateMonthOptions(baseYear?: number): Array<{ value: string; label: string }> {
  const year = baseYear || new Date().getFullYear();
  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return months.map((label, index) => {
    const month = String(index + 1).padStart(2, '0');
    return {
      value: `${year}-${month}`,
      label: `${year}년 ${label}`
    };
  });
}
