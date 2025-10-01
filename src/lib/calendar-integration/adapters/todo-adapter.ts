// Todo Data Adapter
// TodoTask를 UnifiedCalendarItem으로 변환

import type { TodoTask, TodoPriority } from '@/types/dashboard';
import type {
  UnifiedCalendarItem,
  IDataAdapter,
  Priority,
  ItemStatus,
} from '@/types/integrated-calendar';

/**
 * TodoPriority를 Priority로 변환
 */
function mapTodoPriorityToPriority(todoPriority: TodoPriority): Priority {
  const mapping: Record<TodoPriority, Priority> = {
    p1: 'critical',
    p2: 'high',
    p3: 'medium',
    p4: 'low',
  };
  return mapping[todoPriority];
}

/**
 * Priority를 TodoPriority로 역변환
 */
function mapPriorityToTodoPriority(priority: Priority): TodoPriority {
  const mapping: Record<Priority, TodoPriority> = {
    critical: 'p1',
    high: 'p2',
    medium: 'p3',
    low: 'p4',
  };
  return mapping[priority];
}

/**
 * TodoTask의 상태 계산
 */
function calculateTodoStatus(task: TodoTask): ItemStatus {
  if (task.completed) {
    return 'completed';
  }

  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);

    // 날짜만 비교 (시간 무시)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    if (taskDueDay < today) {
      return 'overdue';
    } else if (taskDueDay.getTime() === today.getTime()) {
      return 'in-progress';
    }
  }

  return 'pending';
}

/**
 * TodoPriority별 색상 매핑
 */
function getPriorityColor(priority: TodoPriority): string {
  const colors: Record<TodoPriority, string> = {
    p1: '#dc2626', // red-600
    p2: '#f59e0b', // amber-500
    p3: '#3b82f6', // blue-500
    p4: '#6b7280', // gray-500
  };
  return colors[priority];
}

/**
 * TodoPriority별 레이블 매핑 (향후 사용 예정)
 */
// function getPriorityLabel(priority: TodoPriority): string {
//   const labels: Record<TodoPriority, string> = {
//     p1: '최우선',
//     p2: '높음',
//     p3: '보통',
//     p4: '낮음',
//   };
//   return labels[priority];
// }

/**
 * 섹션 ID를 카테고리 이름으로 변환
 * 실제 구현에서는 섹션 정보를 조회하여 이름을 가져올 수 있음
 */
function getSectionCategoryName(sectionId?: string): string | undefined {
  if (!sectionId) return undefined;

  // 기본 섹션 매핑 (실제로는 섹션 정보를 조회해야 함)
  const defaultSections: Record<string, string> = {
    inbox: '받은 편지함',
    today: '오늘',
    upcoming: '예정됨',
    someday: '언젠가',
  };

  return defaultSections[sectionId] || sectionId;
}

/**
 * TodoTask를 UnifiedCalendarItem으로 변환하는 어댑터
 */
export class TodoDataAdapter implements IDataAdapter<TodoTask> {
  /**
   * TodoTask를 UnifiedCalendarItem으로 변환
   * 날짜가 없는 항목은 null을 반환하여 캘린더에 표시하지 않음
   */
  toUnified(task: TodoTask): UnifiedCalendarItem | null {
    // dueDate가 없으면 캘린더에 표시하지 않음
    if (!task.dueDate) {
      return null;
    }

    const status = calculateTodoStatus(task);
    const date = new Date(task.dueDate);

    return {
      id: `todo-${task.id}`,
      source: 'todo',
      type: 'task',

      // 공통 필드
      title: task.title,
      date: date,
      description: undefined, // TodoTask는 description 필드가 없음

      // 시간 정보 (할 일은 기본적으로 종일)
      allDay: true,

      // 우선순위 및 상태
      priority: mapTodoPriorityToPriority(task.priority),
      status: status,

      // 카테고리 및 태그
      category: getSectionCategoryName(task.sectionId),
      tags: [
        `priority:${task.priority}`,
        `depth:${task.depth}`,
        ...(task.sectionId ? [`section:${task.sectionId}`] : []),
        ...(task.parentId ? [`parent:${task.parentId}`] : []),
        ...(task.children && task.children.length > 0
          ? [`children:${task.children.length}`]
          : []),
        ...(task.completed ? ['completed'] : []),
      ],

      // 원본 데이터
      originalData: task,

      // 시각화 속성
      color: getPriorityColor(task.priority),
      icon: 'CheckCircle2',
    };
  }

  /**
   * UnifiedCalendarItem을 TodoTask로 역변환
   */
  fromUnified(item: UnifiedCalendarItem): TodoTask {
    if (item.source !== 'todo') {
      throw new Error('Invalid source for TodoDataAdapter');
    }

    // 원본 데이터가 TodoTask인지 확인
    const originalData = item.originalData as TodoTask;

    return {
      ...originalData,
      id: originalData.id || item.id.replace('todo-', ''),
      title: item.title,
      priority: mapPriorityToTodoPriority(item.priority),
      completed: item.status === 'completed',
      dueDate: item.date,
      // 나머지 필드는 원본 데이터 유지
    };
  }

  /**
   * 여러 TodoTask를 일괄 변환
   *
   * 참고:
   * - dueDate가 없는 작업은 변환하지 않음 (캘린더에 표시하지 않음)
   * - 하위 작업(children)이 있는 경우, 각 하위 작업도 개별 아이템으로 변환됩니다.
   * - 이를 원하지 않으면 depth가 0인 최상위 작업만 변환하도록 필터링할 수 있습니다.
   */
  toUnifiedBatch(tasks: TodoTask[]): UnifiedCalendarItem[] {
    const result: UnifiedCalendarItem[] = [];

    const processTasks = (taskList: TodoTask[]) => {
      for (const task of taskList) {
        const unified = this.toUnified(task);
        // null이 아닌 경우만 추가 (dueDate가 있는 경우)
        if (unified) {
          result.push(unified);
        }

        // 하위 작업도 처리
        if (task.children && task.children.length > 0) {
          processTasks(task.children);
        }
      }
    };

    processTasks(tasks);
    return result;
  }
}

/**
 * 싱글톤 인스턴스
 */
export const todoAdapter = new TodoDataAdapter();