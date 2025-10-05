/**
 * useKPIMetrics Hook
 *
 * ProjectService와 TaskService에서 데이터를 집계하여
 * KPI 메트릭을 계산하고 KPIWidget에서 사용
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { projectService } from '@/lib/storage';
import { taskService } from '@/lib/storage';
import type { Project } from '@/lib/storage/types/entities/project';
import type { Task } from '@/lib/storage/types/entities/task';
import {
  DollarSign,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { getWidgetText } from '@/config/brand';

export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  progress?: number;
  icon: React.ReactNode;
  color: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface UseKPIMetricsReturn {
  monthlyMetrics: KPIMetric[];
  yearlyMetrics: KPIMetric[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * 프로젝트 데이터를 기반으로 월간 KPI 메트릭 계산
 */
function calculateMonthlyMetrics(
  projects: Project[],
  tasks: Task[]
): KPIMetric[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 이번 달 프로젝트 필터링
  const monthlyProjects = projects.filter((p) => {
    const projectDate = new Date(p.registrationDate);
    return (
      projectDate.getMonth() === currentMonth &&
      projectDate.getFullYear() === currentYear
    );
  });

  // 월간 매출 (이번 달 등록 프로젝트의 totalAmount 합계)
  const monthlyRevenue = monthlyProjects.reduce((sum, p) => {
    return sum + (p.totalAmount || p.budget || 0);
  }, 0);
  const monthlyRevenueInManWon = Math.round(monthlyRevenue / 10000);

  // 진행 중인 프로젝트 수
  const activeProjects = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'review'
  ).length;

  // 이번 달 완료된 작업 수
  const monthlyTasks = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return (
      completedDate.getMonth() === currentMonth &&
      completedDate.getFullYear() === currentYear
    );
  }).length;

  return [
    {
      id: 'revenue',
      label: getWidgetText.kpiMetrics.monthlyRevenue('ko'),
      value: monthlyRevenueInManWon.toLocaleString(),
      unit: '만원',
      target: '5,000',
      trend: monthlyRevenueInManWon >= 4250 ? 'up' : 'down',
      trendValue: monthlyRevenueInManWon >= 4250 ? '+12%' : '-5%',
      progress: Math.min(Math.round((monthlyRevenueInManWon / 5000) * 100), 100),
      icon: <DollarSign className="h-4 w-4" />,
      color: monthlyRevenueInManWon >= 4250 ? 'success' : 'warning',
    },
    {
      id: 'projects',
      label: getWidgetText.kpiMetrics.activeProjects('ko'),
      value: activeProjects,
      unit: '건',
      target: 10,
      trend: activeProjects >= 7 ? 'stable' : activeProjects > 7 ? 'up' : 'down',
      trendValue: '0%',
      progress: Math.min(Math.round((activeProjects / 10) * 100), 100),
      icon: <Briefcase className="h-4 w-4" />,
      color: 'info',
    },
    {
      id: 'tasks',
      label: getWidgetText.kpiMetrics.completedTasks('ko'),
      value: monthlyTasks,
      unit: '건',
      target: 50,
      trend: monthlyTasks >= 43 ? 'up' : 'down',
      trendValue: monthlyTasks >= 43 ? '+8%' : '-3%',
      progress: Math.min(Math.round((monthlyTasks / 50) * 100), 100),
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: monthlyTasks >= 43 ? 'success' : 'warning',
    },
  ];
}

/**
 * 프로젝트 데이터를 기반으로 연간 KPI 메트릭 계산
 */
function calculateYearlyMetrics(
  projects: Project[],
  tasks: Task[]
): KPIMetric[] {
  const currentYear = new Date().getFullYear();

  // 올해 프로젝트 필터링
  const yearlyProjects = projects.filter((p) => {
    const projectDate = new Date(p.registrationDate);
    return projectDate.getFullYear() === currentYear;
  });

  // 연간 매출 (올해 등록 프로젝트의 totalAmount 합계)
  const yearlyRevenue = yearlyProjects.reduce((sum, p) => {
    return sum + (p.totalAmount || p.budget || 0);
  }, 0);
  const yearlyRevenueInEokWon = (yearlyRevenue / 100000000).toFixed(1);

  // 총 프로젝트 수 (올해)
  const totalProjects = yearlyProjects.length;

  // 올해 완료된 작업 수
  const yearlyTasks = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return completedDate.getFullYear() === currentYear;
  }).length;

  return [
    {
      id: 'revenue',
      label: getWidgetText.kpiMetrics.yearlyRevenue?.('ko') || '연간 매출',
      value: yearlyRevenueInEokWon,
      unit: '억원',
      target: '6',
      trend: parseFloat(yearlyRevenueInEokWon) >= 5.1 ? 'up' : 'down',
      trendValue: parseFloat(yearlyRevenueInEokWon) >= 5.1 ? '+18%' : '-8%',
      progress: Math.min(Math.round((parseFloat(yearlyRevenueInEokWon) / 6) * 100), 100),
      icon: <DollarSign className="h-4 w-4" />,
      color: parseFloat(yearlyRevenueInEokWon) >= 5.1 ? 'success' : 'warning',
    },
    {
      id: 'projects',
      label: getWidgetText.kpiMetrics.totalProjects?.('ko') || '총 프로젝트',
      value: totalProjects,
      unit: '건',
      target: 120,
      trend: totalProjects >= 84 ? 'up' : 'down',
      trendValue: totalProjects >= 84 ? '+15%' : '-5%',
      progress: Math.min(Math.round((totalProjects / 120) * 100), 100),
      icon: <Briefcase className="h-4 w-4" />,
      color: 'info',
    },
    {
      id: 'tasks',
      label: getWidgetText.kpiMetrics.yearlyTasks?.('ko') || '연간 작업',
      value: yearlyTasks,
      unit: '건',
      target: 600,
      trend: yearlyTasks >= 516 ? 'up' : 'down',
      trendValue: yearlyTasks >= 516 ? '+23%' : '-10%',
      progress: Math.min(Math.round((yearlyTasks / 600) * 100), 100),
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: yearlyTasks >= 516 ? 'success' : 'warning',
    },
  ];
}

/**
 * useKPIMetrics Hook
 *
 * @returns 월간/연간 KPI 메트릭, 로딩 상태, 에러, 새로고침 함수
 */
export function useKPIMetrics(): UseKPIMetricsReturn {
  const [monthlyMetrics, setMonthlyMetrics] = useState<KPIMetric[]>([]);
  const [yearlyMetrics, setYearlyMetrics] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ProjectService와 TaskService에서 데이터 조회
      const [allProjects, allTasks] = await Promise.all([
        projectService.getAll(),
        taskService.getAll(),
      ]);

      // 월간/연간 메트릭 계산
      const monthly = calculateMonthlyMetrics(allProjects, allTasks);
      const yearly = calculateYearlyMetrics(allProjects, allTasks);

      setMonthlyMetrics(monthly);
      setYearlyMetrics(yearly);
    } catch (err) {
      console.error('Failed to load KPI metrics:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();

    // Storage 구독 (프로젝트나 작업 변경 시 자동 리로드)
    const unsubscribeProjects = projectService['storage'].subscribe(
      'projects',
      loadMetrics
    );
    const unsubscribeTasks = taskService['storage'].subscribe(
      'tasks',
      loadMetrics
    );

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [loadMetrics]);

  return {
    monthlyMetrics,
    yearlyMetrics,
    loading,
    error,
    refresh: loadMetrics,
  };
}
