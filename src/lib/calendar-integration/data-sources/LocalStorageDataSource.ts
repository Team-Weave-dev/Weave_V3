// LocalStorage Data Source
// Storage API 기반 실제 데이터 소스 구현

import type { CalendarEvent, TaxDeadline, TodoTask } from '@/types/dashboard';
import type { IDataSource } from '../IntegratedCalendarManager';
import { notifyCalendarDataChanged } from '../events';
import {
  getCalendarEvents as getStorageCalendarEvents,
  saveCalendarEvents as saveStorageCalendarEvents,
  deleteCalendarEvent as deleteStorageCalendarEvent,
  clearAllCalendarEvents as clearStorageCalendarEvents,
} from '@/lib/mock/calendar';
import {
  getTodoTasks as getStorageTodoTasks,
  saveTodoTasks as saveStorageTodoTasks,
  deleteTodoTask as deleteStorageTodoTask,
  clearAllTodoTasks as clearStorageTodoTasks,
} from '@/lib/mock/tasks';

/**
 * LocalStorage 키 상수
 * 실제 위젯들이 사용하는 키와 일치시킴
 */
const STORAGE_KEYS = {
  CALENDAR_EVENTS: 'weave_calendar_events', // CalendarWidget이 실제로 사용하는 키
  TAX_DEADLINES: 'improved-dashboard-tax-deadlines',
  TODO_TASKS: 'weave_dashboard_todo_tasks', // TodoListWidget이 실제로 사용하는 키 (tasks 저장)
} as const;

/**
 * Storage API 기반 데이터 소스
 * ImprovedDashboard의 위젯 데이터를 통합 캘린더로 제공
 */
export class LocalStorageDataSource implements IDataSource {
  /**
   * 캘린더 이벤트 조회
   */
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      return await getStorageCalendarEvents();
    } catch (error) {
      console.error('Failed to load calendar events from Storage API:', error);
      return [];
    }
  }

  /**
   * 세무 일정 조회
   */
  async getTaxDeadlines(): Promise<TaxDeadline[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAX_DEADLINES);
      if (!data) return [];

      const parsed = JSON.parse(data);

      // TaxDeadlineWidget 데이터 구조 처리
      if (parsed.deadlines && Array.isArray(parsed.deadlines)) {
        return parsed.deadlines;
      }

      // 직접 배열인 경우
      if (Array.isArray(parsed)) {
        return parsed;
      }

      return [];
    } catch (error) {
      console.error('Failed to load tax deadlines from localStorage:', error);
      return [];
    }
  }

  /**
   * 할 일 작업 조회
   */
  async getTodoTasks(): Promise<TodoTask[]> {
    try {
      return await getStorageTodoTasks();
    } catch (error) {
      console.error('Failed to load todo tasks from Storage API:', error);
      return [];
    }
  }

  /**
   * 캘린더 이벤트 저장
   */
  async saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
    try {
      await saveStorageCalendarEvents(events);
    } catch (error) {
      console.error('Failed to save calendar events to Storage API:', error);
      throw error;
    }
  }

  /**
   * 세무 일정 저장
   */
  async saveTaxDeadlines(deadlines: TaxDeadline[]): Promise<void> {
    try {
      // TaxDeadlineWidget 형식으로 저장
      const data = { deadlines };
      localStorage.setItem(STORAGE_KEYS.TAX_DEADLINES, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save tax deadlines to localStorage:', error);
      throw error;
    }
  }

  /**
   * 할 일 작업 저장
   */
  async saveTodoTasks(tasks: TodoTask[]): Promise<void> {
    try {
      await saveStorageTodoTasks(tasks);
    } catch (error) {
      console.error('Failed to save todo tasks to Storage API:', error);
      throw error;
    }
  }

  /**
   * 캘린더 이벤트 삭제
   */
  async deleteCalendarEvent(eventId: string): Promise<void> {
    try {
      await deleteStorageCalendarEvent(eventId);

      // 삭제 이벤트 발송 - 다른 위젯들에게 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'delete',
        itemId: eventId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      throw error;
    }
  }

  /**
   * 세무 일정 삭제
   */
  async deleteTaxDeadline(deadlineId: string): Promise<void> {
    try {
      const deadlines = await this.getTaxDeadlines();
      const filteredDeadlines = deadlines.filter(deadline => deadline.id !== deadlineId);
      await this.saveTaxDeadlines(filteredDeadlines);

      // 삭제 이벤트 발송 - 다른 위젯들에게 알림
      notifyCalendarDataChanged({
        source: 'tax',
        changeType: 'delete',
        itemId: deadlineId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to delete tax deadline:', error);
      throw error;
    }
  }

  /**
   * 할 일 작업 삭제
   */
  async deleteTodoTask(taskId: string): Promise<void> {
    try {
      // taskId에서 'todo-' 접두사 제거 (통합 캘린더가 추가한 접두사)
      const actualTaskId = taskId.startsWith('todo-') ? taskId.replace('todo-', '') : taskId;

      await deleteStorageTodoTask(actualTaskId);

      // 삭제 이벤트 발송 - 다른 위젯들에게 알림
      notifyCalendarDataChanged({
        source: 'todo',
        changeType: 'delete',
        itemId: actualTaskId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to delete todo task:', error);
      throw error;
    }
  }

  /**
   * 모든 데이터 초기화
   */
  async clearAll(): Promise<void> {
    try {
      // Calendar events - Storage API 사용
      await clearStorageCalendarEvents();

      // Tax deadlines - localStorage 유지 (아직 Storage API 미마이그레이션)
      localStorage.removeItem(STORAGE_KEYS.TAX_DEADLINES);

      // Todo tasks - Storage API 사용
      await clearStorageTodoTasks();
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
export const localStorageDataSource = new LocalStorageDataSource();