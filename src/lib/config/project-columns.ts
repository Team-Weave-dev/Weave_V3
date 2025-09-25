/**
 * 프로젝트 테이블 중앙화된 칼럼 설정
 * 리스트뷰와 개요 탭 간 데이터 일관성을 위한 통합 칼럼 메타데이터
 */

import type { ProjectTableColumn } from '@/lib/types/project-table.types';

// 개요 탭 표시를 위한 확장 인터페이스
export interface EnhancedProjectTableColumn extends ProjectTableColumn {
  overviewConfig?: {
    showInOverview: boolean;
    section: 'basic' | 'schedule' | 'progress' | 'metadata';
    displayFormat: 'card' | 'detail' | 'chart';
    priority: number; // 표시 우선순위 (낮을수록 먼저)
    icon?: string; // 개요에서 사용할 아이콘
  };
}

/**
 * 프로젝트 테이블 칼럼 메타데이터
 * 리스트뷰와 개요 탭에서 공통으로 사용하는 칼럼 정의
 */
export const PROJECT_COLUMNS: EnhancedProjectTableColumn[] = [
  {
    id: 'no',
    key: 'no',
    label: '프로젝트 번호',
    sortable: true,
    filterable: true,
    width: 140,
    visible: true,
    order: 0,
    type: 'text',
    overviewConfig: {
      showInOverview: true,
      section: 'basic',
      displayFormat: 'detail',
      priority: 1,
      icon: 'Hash'
    }
  },
  {
    id: 'name',
    key: 'name',
    label: '프로젝트명',
    sortable: true,
    filterable: true,
    width: 200,
    visible: true,
    order: 1,
    type: 'text',
    overviewConfig: {
      showInOverview: true,
      section: 'basic',
      displayFormat: 'detail',
      priority: 2,
      icon: 'FileText'
    }
  },
  {
    id: 'client',
    key: 'client',
    label: '클라이언트',
    sortable: true,
    filterable: true,
    width: 120,
    visible: true,
    order: 2,
    type: 'text',
    overviewConfig: {
      showInOverview: true,
      section: 'basic',
      displayFormat: 'detail',
      priority: 3,
      icon: 'Building'
    }
  },
  {
    id: 'registrationDate',
    key: 'registrationDate',
    label: '등록일',
    sortable: true,
    filterable: false,
    width: 120,
    visible: true,
    order: 3,
    type: 'date',
    overviewConfig: {
      showInOverview: true,
      section: 'schedule',
      displayFormat: 'detail',
      priority: 4,
      icon: 'Calendar'
    }
  },
  {
    id: 'progress',
    key: 'progress',
    label: '진행률',
    sortable: true,
    filterable: false,
    width: 100,
    visible: true,
    order: 4,
    type: 'progress',
    overviewConfig: {
      showInOverview: true,
      section: 'progress',
      displayFormat: 'chart',
      priority: 1,
      icon: 'TrendingUp'
    }
  },
  {
    id: 'dueDate',
    key: 'dueDate',
    label: '마감일',
    sortable: true,
    filterable: false,
    width: 120,
    visible: true,
    order: 5,
    type: 'date',
    overviewConfig: {
      showInOverview: true,
      section: 'schedule',
      displayFormat: 'detail',
      priority: 5,
      icon: 'Clock'
    }
  },
  {
    id: 'paymentProgress',
    key: 'paymentProgress',
    label: '수금상태',
    sortable: true,
    filterable: false,
    width: 110,
    visible: true,
    order: 6,
    type: 'payment_progress',
    overviewConfig: {
      showInOverview: true,
      section: 'progress',
      displayFormat: 'chart',
      priority: 2,
      icon: 'DollarSign'
    }
  },
  {
    id: 'status',
    key: 'status',
    label: '상태',
    sortable: true,
    filterable: true,
    width: 100,
    visible: true,
    order: 7,
    type: 'status',
    overviewConfig: {
      showInOverview: true,
      section: 'basic',
      displayFormat: 'detail',
      priority: 4,
      icon: 'Activity'
    }
  },
  {
    id: 'modifiedDate',
    key: 'modifiedDate',
    label: '수정일',
    sortable: true,
    filterable: false,
    width: 120,
    visible: true,
    order: 8,
    type: 'date',
    overviewConfig: {
      showInOverview: true,
      section: 'schedule',
      displayFormat: 'detail',
      priority: 6,
      icon: 'Edit'
    }
  }
];

/**
 * 섹션별 칼럼 그룹핑
 */
export const OVERVIEW_SECTIONS = {
  basic: PROJECT_COLUMNS.filter(col => col.overviewConfig?.section === 'basic'),
  schedule: PROJECT_COLUMNS.filter(col => col.overviewConfig?.section === 'schedule'),
  progress: PROJECT_COLUMNS.filter(col => col.overviewConfig?.section === 'progress'),
  metadata: PROJECT_COLUMNS.filter(col => col.overviewConfig?.section === 'metadata')
};

/**
 * 개요에 표시할 칼럼 필터링
 */
export const OVERVIEW_COLUMNS = PROJECT_COLUMNS
  .filter(col => col.overviewConfig?.showInOverview)
  .sort((a, b) => (a.overviewConfig?.priority || 999) - (b.overviewConfig?.priority || 999));

/**
 * 칼럼 메타데이터 조회 함수
 */
export function getColumnConfig(columnId: string): EnhancedProjectTableColumn | undefined {
  return PROJECT_COLUMNS.find(col => col.id === columnId);
}

/**
 * 섹션별 칼럼 조회 함수
 */
export function getColumnsBySection(section: 'basic' | 'schedule' | 'progress' | 'metadata'): EnhancedProjectTableColumn[] {
  return PROJECT_COLUMNS
    .filter(col => col.overviewConfig?.section === section && col.overviewConfig?.showInOverview)
    .sort((a, b) => (a.overviewConfig?.priority || 999) - (b.overviewConfig?.priority || 999));
}

/**
 * 개요 표시용 칼럼 데이터 생성
 */
export function createOverviewData<T extends Record<string, any>>(
  data: T,
  columns: EnhancedProjectTableColumn[]
) {
  return columns.map(col => ({
    column: col,
    value: data[col.key],
    formattedValue: formatColumnValue(data[col.key], col.type)
  }));
}

/**
 * 칼럼 값 포맷팅 함수
 */
export function formatColumnValue(value: any, type: string): string {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'date':
      if (typeof value === 'string') {
        return new Date(value).toLocaleDateString('ko-KR');
      }
      return '-';

    case 'progress':
    case 'payment_progress':
      if (typeof value === 'number') {
        return `${value}%`;
      }
      return '0%';

    case 'currency':
      if (typeof value === 'number') {
        return new Intl.NumberFormat('ko-KR', {
          style: 'currency',
          currency: 'KRW'
        }).format(value);
      }
      return '₩0';

    case 'status':
      const statusLabels: Record<string, string> = {
        planning: '기획',
        in_progress: '진행중',
        review: '검토',
        completed: '완료',
        on_hold: '보류',
        cancelled: '취소'
      };
      return statusLabels[value as string] || value?.toString() || '-';

    case 'number':
      if (typeof value === 'number') {
        return new Intl.NumberFormat('ko-KR').format(value);
      }
      return value?.toString() || '-';

    case 'text':
    default:
      return value?.toString() || '-';
  }
}