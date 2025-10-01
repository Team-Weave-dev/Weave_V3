import type { TodoPriority, DateGroup, TodoListOptions } from '../types';
import { addDays, startOfDay, endOfDay } from '../utils/date';
import { getWidgetText } from '@/config/brand';

// 우선순위 색상 매핑
export const priorityColors: Record<TodoPriority, { badge: string; icon: string }> = {
  p1: { badge: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: 'text-red-500' },
  p2: { badge: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', icon: 'text-orange-500' },
  p3: { badge: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: 'text-blue-500' },
  p4: { badge: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400', icon: 'text-gray-400' }
};

// 로컬 스토리지 키
export const STORAGE_KEY = 'weave_dashboard_todo_tasks';     // 태스크 저장소 키
export const SECTIONS_KEY = 'weave_dashboard_todo_sections';  // 섹션 저장소 키
export const VIEW_MODE_KEY = 'weave_dashboard_todo_view_mode';
export const OPTIONS_KEY = 'weave_dashboard_todo_options';

// 기본 우선순위
export const DEFAULT_PRIORITY: TodoPriority = 'p3';

// 기본 크기
export const DEFAULT_SIZE = { w: 4, h: 4 };

// 기본 옵션 설정
export const DEFAULT_OPTIONS: TodoListOptions = {
  dateFormat: 'dday',
  subtaskDisplay: 'expanded'
};

// 날짜 그룹 생성 함수
export const getDateGroups = (): DateGroup[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const thisWeekEnd = addDays(today, 7 - today.getDay());
  const nextWeekStart = addDays(thisWeekEnd, 1);
  const nextWeekEnd = addDays(nextWeekStart, 6);
  
  return [
    { 
      id: 'overdue', 
      name: getWidgetText.todoList.dateGroups.overdue('ko'), 
      emoji: '🚨', 
      order: 0, 
      isExpanded: true, 
      isOverdue: true,
      dateRange: null
    },
    { 
      id: 'today', 
      name: getWidgetText.todoList.dateGroups.today('ko'), 
      emoji: '📅', 
      order: 1, 
      isExpanded: true,
      dateRange: { start: startOfDay(today), end: endOfDay(today) }
    },
    { 
      id: 'tomorrow', 
      name: getWidgetText.todoList.dateGroups.tomorrow('ko'), 
      emoji: '📆', 
      order: 2, 
      isExpanded: true,
      dateRange: { start: startOfDay(tomorrow), end: endOfDay(tomorrow) }
    },
    { 
      id: 'this_week', 
      name: getWidgetText.todoList.dateGroups.thisWeek('ko'), 
      emoji: '📍', 
      order: 3, 
      isExpanded: true,
      dateRange: { start: addDays(today, 2), end: thisWeekEnd }
    },
    { 
      id: 'next_week', 
      name: getWidgetText.todoList.dateGroups.nextWeek('ko'), 
      emoji: '🗓️', 
      order: 4, 
      isExpanded: false,
      dateRange: { start: nextWeekStart, end: nextWeekEnd }
    }
  ];
};