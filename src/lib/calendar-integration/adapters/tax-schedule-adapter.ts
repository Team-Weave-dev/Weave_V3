// Tax Schedule Adapter
// TaxSchedule을 UnifiedCalendarItem으로 변환

import type { TaxSchedule } from '@/lib/storage/types/entities/tax-schedule';
import type {
  UnifiedCalendarItem,
  IDataAdapter,
  Priority,
  ItemStatus,
} from '@/types/integrated-calendar';
import { SOURCE_COLORS, SOURCE_ICONS } from '@/types/integrated-calendar';
import { getTaxCategoryColor } from '@/lib/storage/types/entities/tax-schedule';

/**
 * TaxSchedule → UnifiedCalendarItem 어댑터
 *
 * Supabase tax_schedules 테이블의 데이터를 통합 캘린더 형식으로 변환
 */
class TaxScheduleAdapter implements IDataAdapter<TaxSchedule> {
  /**
   * TaxSchedule을 UnifiedCalendarItem으로 변환
   */
  toUnified(schedule: TaxSchedule): UnifiedCalendarItem | null {
    // Supabase는 tax_date (스네이크 케이스) 사용
    // TypeScript 타입은 taxDate (카멜 케이스) 사용
    const dateField = (schedule as any).tax_date || schedule.taxDate;
    const taxDate = new Date(dateField);

    // 유효하지 않은 날짜는 null 반환
    if (isNaN(taxDate.getTime())) {
      return null;
    }

    // 중요도 계산: 카테고리 기반
    const priority = this.calculatePriority(schedule);

    // 상태 계산: 날짜 기반
    const status = this.calculateStatus(taxDate);

    return {
      id: `tax-schedule-${schedule.id}`,
      source: 'tax',
      type: 'deadline',

      // 기본 정보
      title: schedule.title,
      date: taxDate,
      description: schedule.description,

      // 시간 정보 (세무 일정은 종일)
      allDay: true,

      // 중요도/상태
      priority,
      status,

      // 카테고리
      category: schedule.category,
      tags: schedule.recurring ? ['recurring', schedule.category] : [schedule.category],

      // 원본 데이터
      originalData: schedule,

      // 시각화
      color: schedule.color || getTaxCategoryColor(schedule.category),
      icon: this.getIconForType(schedule.type),

      // 권한 제어 - 세무 일정은 읽기 전용
      isReadOnly: true,
    };
  }

  /**
   * UnifiedCalendarItem을 TaxSchedule로 역변환
   * (세무 일정은 읽기 전용이므로 실제로 사용되지 않음)
   */
  fromUnified(item: UnifiedCalendarItem): TaxSchedule {
    return item.originalData as TaxSchedule;
  }

  /**
   * 여러 TaxSchedule을 일괄 변환
   */
  toUnifiedBatch(schedules: TaxSchedule[]): UnifiedCalendarItem[] {
    return schedules
      .map((schedule) => this.toUnified(schedule))
      .filter((item): item is UnifiedCalendarItem => item !== null);
  }

  /**
   * 세무 일정의 중요도 계산
   *
   * - vat (부가가치세): high
   * - income_tax (종합소득세): high
   * - corporate_tax (법인세): high
   * - withholding_tax (원천세): medium
   * - year_end_settlement (연말정산): high
   * - other: medium
   */
  private calculatePriority(schedule: TaxSchedule): Priority {
    switch (schedule.category) {
      case 'vat':
      case 'income_tax':
      case 'corporate_tax':
      case 'year_end_settlement':
        return 'high';
      case 'withholding_tax':
      case 'other':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * 날짜 기반 상태 계산
   *
   * - 오늘 이후: pending
   * - 오늘: in-progress
   * - 지난 날짜: overdue (recurring인 경우 completed)
   */
  private calculateStatus(taxDate: Date): ItemStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateOnly = new Date(taxDate);
    dateOnly.setHours(0, 0, 0, 0);

    const diffTime = dateOnly.getTime() - today.getTime();

    if (diffTime > 0) {
      return 'pending';
    } else if (diffTime === 0) {
      return 'in-progress';
    } else {
      // 과거 날짜
      // recurring 일정은 매년 반복되므로 completed로 표시
      return 'overdue';
    }
  }

  /**
   * 세무 일정 타입에 따른 아이콘 반환
   */
  private getIconForType(type: TaxSchedule['type']): string {
    switch (type) {
      case 'filing':
        return 'FileText';
      case 'payment':
        return 'CreditCard';
      case 'report':
        return 'FileCheck';
      case 'other':
      default:
        return 'Receipt';
    }
  }
}

// 싱글톤 인스턴스
export const taxScheduleAdapter = new TaxScheduleAdapter();
