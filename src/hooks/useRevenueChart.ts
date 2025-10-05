/**
 * useRevenueChart Hook
 *
 * ProjectService에서 프로젝트 데이터를 집계하여
 * 월별/분기별/연간 매출 차트 데이터를 계산하고 RevenueChartWidget에서 사용
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { projectService } from '@/lib/storage';
import type { Project } from '@/lib/storage/types/entities/project';

export interface RevenueData {
  period: string;
  revenue: number;
  expenses?: number;
  profit?: number;
  previousYear?: number;
}

interface UseRevenueChartReturn {
  monthlyData: RevenueData[];
  quarterlyData: RevenueData[];
  yearlyData: RevenueData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * 프로젝트 데이터를 기반으로 월별 매출 집계
 */
function calculateMonthlyRevenue(projects: Project[]): RevenueData[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 현재 연도의 프로젝트만 필터링
  const yearlyProjects = projects.filter((p) => {
    const projectDate = new Date(p.registrationDate);
    return projectDate.getFullYear() === currentYear;
  });

  // 월별로 매출 집계
  const monthlyMap = new Map<number, number>();

  yearlyProjects.forEach((p) => {
    const projectDate = new Date(p.registrationDate);
    const month = projectDate.getMonth(); // 0-11
    const revenue = p.totalAmount || p.budget || 0;

    monthlyMap.set(month, (monthlyMap.get(month) || 0) + revenue);
  });

  // 1월부터 현재 월까지 데이터 생성
  const currentMonth = now.getMonth();
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const result: RevenueData[] = [];
  for (let i = 0; i <= currentMonth; i++) {
    result.push({
      period: monthNames[i],
      revenue: Math.round((monthlyMap.get(i) || 0) / 10000), // 만원 단위
    });
  }

  return result;
}

/**
 * 프로젝트 데이터를 기반으로 분기별 매출 집계
 */
function calculateQuarterlyRevenue(projects: Project[]): RevenueData[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 현재 연도의 프로젝트만 필터링
  const yearlyProjects = projects.filter((p) => {
    const projectDate = new Date(p.registrationDate);
    return projectDate.getFullYear() === currentYear;
  });

  // 분기별로 매출 집계 (1분기: 0-2월, 2분기: 3-5월, 3분기: 6-8월, 4분기: 9-11월)
  const quarterlyMap = new Map<number, number>();

  yearlyProjects.forEach((p) => {
    const projectDate = new Date(p.registrationDate);
    const month = projectDate.getMonth();
    const quarter = Math.floor(month / 3); // 0, 1, 2, 3
    const revenue = p.totalAmount || p.budget || 0;

    quarterlyMap.set(quarter, (quarterlyMap.get(quarter) || 0) + revenue);
  });

  // 현재까지의 분기 데이터 생성
  const currentMonth = now.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);
  const quarterNames = ['1분기', '2분기', '3분기', '4분기'];

  const result: RevenueData[] = [];
  for (let i = 0; i <= currentQuarter; i++) {
    result.push({
      period: quarterNames[i],
      revenue: Math.round((quarterlyMap.get(i) || 0) / 10000), // 만원 단위
    });
  }

  return result;
}

/**
 * 프로젝트 데이터를 기반으로 연간 매출 집계
 */
function calculateYearlyRevenue(projects: Project[]): RevenueData[] {
  const currentYear = new Date().getFullYear();

  // 최근 4년간의 매출 집계
  const yearlyMap = new Map<number, number>();

  projects.forEach((p) => {
    const projectDate = new Date(p.registrationDate);
    const year = projectDate.getFullYear();

    // 최근 4년 데이터만 포함
    if (year >= currentYear - 3 && year <= currentYear) {
      const revenue = p.totalAmount || p.budget || 0;
      yearlyMap.set(year, (yearlyMap.get(year) || 0) + revenue);
    }
  });

  // 최근 4년 데이터 생성
  const result: RevenueData[] = [];
  for (let i = currentYear - 3; i <= currentYear; i++) {
    result.push({
      period: i.toString(),
      revenue: Math.round((yearlyMap.get(i) || 0) / 10000), // 만원 단위
    });
  }

  return result;
}

/**
 * useRevenueChart Hook
 *
 * @returns 월별/분기별/연간 매출 데이터, 로딩 상태, 에러, 새로고침 함수
 */
export function useRevenueChart(): UseRevenueChartReturn {
  const [monthlyData, setMonthlyData] = useState<RevenueData[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<RevenueData[]>([]);
  const [yearlyData, setYearlyData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ProjectService에서 모든 프로젝트 조회
      const allProjects = await projectService.getAll();

      // 월별/분기별/연간 매출 계산
      const monthly = calculateMonthlyRevenue(allProjects);
      const quarterly = calculateQuarterlyRevenue(allProjects);
      const yearly = calculateYearlyRevenue(allProjects);

      setMonthlyData(monthly);
      setQuarterlyData(quarterly);
      setYearlyData(yearly);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenueData();

    // Storage 구독 (프로젝트 변경 시 자동 리로드)
    const unsubscribe = projectService['storage'].subscribe(
      'projects',
      loadRevenueData
    );

    return () => {
      unsubscribe();
    };
  }, [loadRevenueData]);

  return {
    monthlyData,
    quarterlyData,
    yearlyData,
    loading,
    error,
    refresh: loadRevenueData,
  };
}
