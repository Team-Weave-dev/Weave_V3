import { getWidgetText } from '@/config/brand';
import type { DateGroup, DateFormatType } from '../types';

// 날짜 관련 유틸리티 함수
export const startOfDay = (date: Date | string): Date => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date: Date | string): Date => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
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

export const formatDateBadge = (
  dueDate?: Date, 
  isCompleted: boolean = false,
  dateFormat: DateFormatType = 'dday'
): { text: string; variant: "status-soft-error" | "status-soft-warning" | "status-soft-info" | "outline" } => {
  if (!dueDate) {
    return { text: '미정', variant: 'outline' };
  }
  
  // 날짜를 Date 객체로 변환 (문자열로 저장되었을 수 있음)
  const dateObj = dueDate instanceof Date ? dueDate : new Date(dueDate);
  
  // 유효하지 않은 날짜 처리
  if (isNaN(dateObj.getTime())) {
    return { text: '미정', variant: 'outline' };
  }
  
  // 날짜 형식으로 표시하는 헬퍼 함수
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };
  
  // 완료된 태스크는 항상 실제 날짜를 표시
  if (isCompleted) {
    return { text: formatDate(dateObj), variant: 'outline' };
  }
  
  const today = startOfDay(new Date());
  const due = startOfDay(dateObj);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 날짜 형식 옵션에 따라 텍스트 결정
  let text: string;
  if (dateFormat === 'date') {
    text = formatDate(dateObj);
  } else {
    // D-day 형식
    if (diffDays < 0) {
      text = `D+${Math.abs(diffDays)}`;
    } else if (diffDays === 0) {
      text = getWidgetText.todoList.dateBadges.today('ko');
    } else if (diffDays === 1) {
      text = getWidgetText.todoList.dateBadges.tomorrow('ko');
    } else {
      text = `D-${diffDays}`;
    }
  }
  
  // 변형(색상) 결정
  let variant: "status-soft-error" | "status-soft-warning" | "status-soft-info" | "outline";
  if (diffDays < 0) {
    variant = 'status-soft-error';
  } else if (diffDays <= 1) {
    variant = 'status-soft-error';
  } else if (diffDays <= 3) {
    variant = 'status-soft-warning';
  } else if (diffDays <= 7) {
    variant = 'status-soft-info';
  } else {
    variant = 'outline';
  }
  
  return { text, variant };
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