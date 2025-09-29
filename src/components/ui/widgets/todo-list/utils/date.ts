import { getWidgetText } from '@/config/brand';
import type { DateGroup } from '../types';

// 날짜 관련 유틸리티 함수
export const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

export const formatDateBadge = (dueDate?: Date, isCompleted: boolean = false): { text: string; variant: "status-soft-error" | "status-soft-warning" | "status-soft-info" | "outline" } => {
  if (!dueDate) {
    return { text: '미정', variant: 'outline' };
  }
  
  // 완료된 태스크는 실제 날짜를 표시
  if (isCompleted) {
    const month = dueDate.getMonth() + 1;
    const day = dueDate.getDate();
    return { text: `${month}/${day}`, variant: 'outline' };
  }
  
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: `D+${Math.abs(diffDays)}`, variant: 'status-soft-error' };
  } else if (diffDays === 0) {
    return { text: getWidgetText.todoList.dateBadges.today('ko'), variant: 'status-soft-error' };
  } else if (diffDays === 1) {
    return { text: getWidgetText.todoList.dateBadges.tomorrow('ko'), variant: 'status-soft-warning' };
  } else if (diffDays <= 3) {
    return { text: `D-${diffDays}`, variant: 'status-soft-warning' };
  } else if (diffDays <= 7) {
    return { text: `D-${diffDays}`, variant: 'status-soft-info' };
  } else {
    return { text: `D-${diffDays}`, variant: 'outline' };
  }
};

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

// 빠른 날짜 선택 옵션
export const quickDateOptions = [
  { label: getWidgetText.todoList.dateBadges.today('ko'), value: () => new Date() },
  { label: getWidgetText.todoList.dateBadges.tomorrow('ko'), value: () => addDays(new Date(), 1) },
  { label: '3일 후', value: () => addDays(new Date(), 3) },
  { label: '1주 후', value: () => addDays(new Date(), 7) },
  { label: '날짜 없음', value: () => undefined }
];