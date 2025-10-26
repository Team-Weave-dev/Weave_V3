/**
 * Plan Limits Utility Functions
 *
 * 요금제 제한 사항을 체크하는 유틸리티 함수들
 */

import type { PlanType } from '../types/entities/plan';
import { plans } from '@/config/constants';

/**
 * 무제한 여부 체크
 * @param limit - 제한 값 (-1 = 무제한)
 * @returns 무제한이면 true
 */
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

/**
 * 프로젝트 제한 체크
 * @param planType - 요금제 타입
 * @param currentCount - 현재 프로젝트 수
 * @returns { allowed: boolean, limit: number, current: number }
 */
export function checkProjectLimit(
  planType: PlanType,
  currentCount: number
): { allowed: boolean; limit: number; current: number } {
  const plan = plans[planType];
  const limit = plan.limits.projects;

  return {
    allowed: isUnlimited(limit) || currentCount < limit,
    limit,
    current: currentCount
  };
}

/**
 * 위젯 제한 체크
 * @param planType - 요금제 타입
 * @param currentCount - 현재 위젯 수
 * @returns { allowed: boolean, limit: number, current: number }
 */
export function checkWidgetLimit(
  planType: PlanType,
  currentCount: number
): { allowed: boolean; limit: number; current: number } {
  const plan = plans[planType];
  const limit = plan.limits.widgets;

  return {
    allowed: isUnlimited(limit) || currentCount < limit,
    limit,
    current: currentCount
  };
}

/**
 * 스토리지 제한 체크
 * @param planType - 요금제 타입
 * @param usedStorage - 사용 중인 스토리지 (MB)
 * @returns { allowed: boolean, limit: number, used: number }
 */
export function checkStorageLimit(
  planType: PlanType,
  usedStorage: number
): { allowed: boolean; limit: number; used: number } {
  const plan = plans[planType];
  const limit = plan.limits.storage;

  return {
    allowed: usedStorage < limit,
    limit,
    used: usedStorage
  };
}

/**
 * AI 서비스 사용 가능 여부 체크
 * @param planType - 요금제 타입
 * @returns AI 서비스 사용 가능 여부
 */
export function checkAIServiceAvailable(planType: PlanType): boolean {
  const plan = plans[planType];
  return plan.limits.aiService;
}

/**
 * 요금제 제한 정보 조회
 * @param planType - 요금제 타입
 * @returns 요금제의 모든 제한 정보
 */
export function getPlanLimits(planType: PlanType) {
  const plan = plans[planType];
  return {
    projects: plan.limits.projects,
    widgets: plan.limits.widgets,
    storage: plan.limits.storage,
    aiService: plan.limits.aiService
  };
}

/**
 * 제한 초과 여부를 확인하고 메시지 반환
 * @param planType - 요금제 타입
 * @param resourceType - 리소스 타입 ('projects' | 'widgets' | 'storage')
 * @param currentValue - 현재 사용량
 * @returns { exceeded: boolean, message?: string }
 */
export function checkLimitExceeded(
  planType: PlanType,
  resourceType: 'projects' | 'widgets' | 'storage',
  currentValue: number
): { exceeded: boolean; message?: string } {
  const plan = plans[planType];

  let limit: number;
  let resourceName: string;

  switch (resourceType) {
    case 'projects':
      limit = plan.limits.projects;
      resourceName = '프로젝트';
      break;
    case 'widgets':
      limit = plan.limits.widgets;
      resourceName = '위젯';
      break;
    case 'storage':
      limit = plan.limits.storage;
      resourceName = '스토리지';
      break;
  }

  if (isUnlimited(limit)) {
    return { exceeded: false };
  }

  const exceeded = currentValue >= limit;

  if (exceeded) {
    return {
      exceeded: true,
      message: `${resourceName} 제한에 도달했습니다. (${currentValue}/${limit}) 더 많은 ${resourceName}을(를) 사용하려면 요금제를 업그레이드하세요.`
    };
  }

  return { exceeded: false };
}
