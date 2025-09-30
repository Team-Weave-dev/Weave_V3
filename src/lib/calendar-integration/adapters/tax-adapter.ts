// Tax Data Adapter
// TaxDeadline을 UnifiedCalendarItem으로 변환

import type { TaxDeadline, TaxCategory } from '@/types/dashboard';
import type {
  UnifiedCalendarItem,
  IDataAdapter,
  Priority,
  ItemStatus,
} from '@/types/integrated-calendar';

/**
 * D-day 계산 함수
 * TaxDeadlineWidget의 calculateDday 함수와 동일한 로직
 */
function calculateDday(deadlineDay: number, deadlineMonth?: number): number {
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
    if (
      currentMonth > deadlineMonth ||
      (currentMonth === deadlineMonth && currentDay > deadlineDay)
    ) {
      targetYear = currentYear + 1;
    }
  }

  const deadline = new Date(targetYear, targetMonth - 1, deadlineDay);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * D-day를 기준으로 상태 계산
 */
function calculateStatusFromDday(dday: number, importance: string): ItemStatus {
  if (dday < 0) {
    return 'overdue';
  } else if (dday === 0) {
    return 'in-progress';
  } else if (dday <= 3 && importance === 'critical') {
    return 'in-progress'; // 긴급하고 3일 이내
  } else if (dday <= 7 && (importance === 'critical' || importance === 'high')) {
    return 'in-progress'; // 중요하고 7일 이내
  } else {
    return 'pending';
  }
}

/**
 * TaxCategory를 한글 레이블로 변환
 */
function getCategoryLabel(category: TaxCategory): string {
  const labels: Record<TaxCategory, string> = {
    VAT: '부가세',
    'income-tax': '소득세',
    'corporate-tax': '법인세',
    withholding: '원천세',
    'local-tax': '지방세',
    'property-tax': '재산세',
    customs: '관세',
    other: '기타',
  };
  return labels[category] || category;
}

/**
 * TaxCategory별 색상 매핑
 */
function getCategoryColor(category: TaxCategory): string {
  const colors: Record<TaxCategory, string> = {
    VAT: '#3b82f6', // blue
    'income-tax': '#f59e0b', // amber
    'corporate-tax': '#8b5cf6', // purple
    withholding: '#10b981', // green
    'local-tax': '#06b6d4', // cyan
    'property-tax': '#f97316', // orange
    customs: '#6366f1', // indigo
    other: '#6b7280', // gray
  };
  return colors[category] || '#6b7280';
}

/**
 * TaxCategory별 아이콘 매핑
 */
function getCategoryIcon(category: TaxCategory): string {
  const icons: Record<TaxCategory, string> = {
    VAT: 'Receipt',
    'income-tax': 'DollarSign',
    'corporate-tax': 'Building2',
    withholding: 'Coins',
    'local-tax': 'Home',
    'property-tax': 'Building',
    customs: 'Package',
    other: 'FileText',
  };
  return icons[category] || 'FileText';
}

/**
 * TaxDeadline의 importance를 Priority로 변환
 */
function mapImportanceToPriority(
  importance: 'critical' | 'high' | 'medium' | 'low'
): Priority {
  return importance;
}

/**
 * 다음 마감일 날짜 계산
 */
function calculateNextDeadlineDate(
  deadlineDay: number,
  deadlineMonth?: number
): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  let targetMonth = deadlineMonth || currentMonth;
  let targetYear = currentYear;

  // 월별 반복 일정의 경우
  if (!deadlineMonth) {
    if (currentDay > deadlineDay) {
      targetMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      if (targetMonth === 1) targetYear = currentYear + 1;
    }
  } else {
    // 연간 일정의 경우
    if (
      currentMonth > deadlineMonth ||
      (currentMonth === deadlineMonth && currentDay > deadlineDay)
    ) {
      targetYear = currentYear + 1;
    }
  }

  return new Date(targetYear, targetMonth - 1, deadlineDay);
}

/**
 * TaxDeadline을 UnifiedCalendarItem으로 변환하는 어댑터
 */
export class TaxDataAdapter implements IDataAdapter<TaxDeadline> {
  /**
   * TaxDeadline을 UnifiedCalendarItem으로 변환
   */
  toUnified(deadline: TaxDeadline): UnifiedCalendarItem {
    const dday = calculateDday(deadline.deadlineDay, deadline.deadlineMonth);
    const nextDate = calculateNextDeadlineDate(
      deadline.deadlineDay,
      deadline.deadlineMonth
    );

    return {
      id: `tax-${deadline.id}`,
      source: 'tax',
      type: 'deadline',

      // 공통 필드
      title: deadline.title,
      date: nextDate,
      description: deadline.description || deadline.note,

      // 시간 정보 (세무 일정은 종일 이벤트)
      allDay: true,

      // 우선순위 및 상태
      priority: mapImportanceToPriority(deadline.importance),
      status: calculateStatusFromDday(dday, deadline.importance),

      // 카테고리 및 태그
      category: getCategoryLabel(deadline.category),
      tags: [
        deadline.category,
        deadline.frequency,
        ...(deadline.taxPeriod ? [`period:${deadline.taxPeriod}`] : []),
        `dday:${dday}`,
      ],

      // 원본 데이터
      originalData: deadline,

      // 시각화 속성
      color: getCategoryColor(deadline.category),
      icon: getCategoryIcon(deadline.category),
    };
  }

  /**
   * UnifiedCalendarItem을 TaxDeadline으로 역변환
   */
  fromUnified(item: UnifiedCalendarItem): TaxDeadline {
    if (item.source !== 'tax') {
      throw new Error('Invalid source for TaxDataAdapter');
    }

    // 원본 데이터가 TaxDeadline인지 확인
    const originalData = item.originalData as TaxDeadline;

    return {
      ...originalData,
      id: originalData.id || item.id.replace('tax-', ''),
      title: item.title,
      description: item.description,
      // 나머지 필드는 원본 데이터 유지
    };
  }

  /**
   * 여러 TaxDeadline을 일괄 변환
   */
  toUnifiedBatch(deadlines: TaxDeadline[]): UnifiedCalendarItem[] {
    return deadlines.map(deadline => this.toUnified(deadline));
  }
}

/**
 * 싱글톤 인스턴스
 */
export const taxAdapter = new TaxDataAdapter();