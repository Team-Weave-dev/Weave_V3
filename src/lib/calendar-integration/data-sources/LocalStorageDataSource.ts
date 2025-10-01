// LocalStorage Data Source
// localStorage 기반 실제 데이터 소스 구현

import type { CalendarEvent, TaxDeadline, TodoTask } from '@/types/dashboard';
import type { IDataSource } from '../IntegratedCalendarManager';
import { notifyCalendarDataChanged } from '../events';

/**
 * LocalStorage 키 상수
 * 실제 위젯들이 사용하는 키와 일치시킴
 */
const STORAGE_KEYS = {
  CALENDAR_EVENTS: 'weave_calendar_events', // CalendarWidget이 실제로 사용하는 키
  TAX_DEADLINES: 'improved-dashboard-tax-deadlines',
  TODO_TASKS: 'weave_dashboard_todo_sections', // TodoListWidget이 실제로 사용하는 키
} as const;

/**
 * LocalStorage 기반 데이터 소스
 * ImprovedDashboard의 위젯 데이터를 통합 캘린더로 제공
 */
export class LocalStorageDataSource implements IDataSource {
  /**
   * 캘린더 이벤트 조회
   */
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
      if (!data) return [];

      const parsed = JSON.parse(data);

      // CalendarWidget 데이터 구조 처리
      if (parsed.events && Array.isArray(parsed.events)) {
        return parsed.events;
      }

      // 직접 배열인 경우
      if (Array.isArray(parsed)) {
        return parsed;
      }

      return [];
    } catch (error) {
      console.error('Failed to load calendar events from localStorage:', error);
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
   * TodoListWidget은 TodoTask 배열을 직접 저장함
   */
  async getTodoTasks(): Promise<TodoTask[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TODO_TASKS);
      if (!data) return [];

      const parsed = JSON.parse(data);

      // 직접 배열인 경우 (현재 사용 중인 구조)
      if (Array.isArray(parsed)) {
        return parsed;
      }

      // 구 버전 sections 구조 처리 (하위 호환성)
      if (parsed.sections && Array.isArray(parsed.sections)) {
        // 모든 섹션의 tasks를 평탄화
        const allTasks: TodoTask[] = [];
        for (const section of parsed.sections) {
          if (section.tasks && Array.isArray(section.tasks)) {
            allTasks.push(...section.tasks);
          }
        }
        return allTasks;
      }

      return [];
    } catch (error) {
      console.error('Failed to load todo tasks from localStorage:', error);
      return [];
    }
  }

  /**
   * 캘린더 이벤트 저장
   */
  async saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
    try {
      // CalendarWidget 형식으로 저장
      const data = { events };
      localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save calendar events to localStorage:', error);
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
   * TodoListWidget은 TodoTask 배열을 직접 저장함
   */
  async saveTodoTasks(tasks: TodoTask[]): Promise<void> {
    try {
      // 직접 배열로 저장 (현재 사용 중인 구조)
      localStorage.setItem(STORAGE_KEYS.TODO_TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save todo tasks to localStorage:', error);
      throw error;
    }
  }

  /**
   * 캘린더 이벤트 삭제
   */
  async deleteCalendarEvent(eventId: string): Promise<void> {
    try {
      const events = await this.getCalendarEvents();
      const filteredEvents = events.filter(event => event.id !== eventId);
      await this.saveCalendarEvents(filteredEvents);

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
   * TodoListWidget은 TodoTask 배열을 직접 저장함
   */
  async deleteTodoTask(taskId: string): Promise<void> {
    try {
      // taskId에서 'todo-' 접두사 제거 (통합 캘린더가 추가한 접두사)
      const actualTaskId = taskId.startsWith('todo-') ? taskId.replace('todo-', '') : taskId;

      // TodoListWidget의 저장소에서 삭제
      const todoData = localStorage.getItem(STORAGE_KEYS.TODO_TASKS);
      if (!todoData) {
        console.warn('No todo data found in localStorage');
        return;
      }

      const parsed = JSON.parse(todoData);

      // 직접 배열인 경우 (현재 사용 중인 구조)
      if (Array.isArray(parsed)) {
        const filteredTasks = parsed.filter((task: TodoTask) => {
          // 해당 task 자체 제거
          if (task.id === actualTaskId) {
            return false;
          }
          // children 배열에서도 제거
          if (task.children && Array.isArray(task.children)) {
            task.children = task.children.filter((child: TodoTask) => child.id !== actualTaskId);
          }
          return true;
        });

        // 수정된 데이터 저장
        localStorage.setItem(STORAGE_KEYS.TODO_TASKS, JSON.stringify(filteredTasks));
      }
      // 구 버전 sections 구조 처리 (하위 호환성)
      else if (parsed.sections && Array.isArray(parsed.sections)) {
        for (const section of parsed.sections) {
          if (section.tasks && Array.isArray(section.tasks)) {
            section.tasks = section.tasks.filter((task: TodoTask) => {
              if (task.id === actualTaskId) {
                return false;
              }
              if (task.children && Array.isArray(task.children)) {
                task.children = task.children.filter((child: TodoTask) => child.id !== actualTaskId);
              }
              return true;
            });
          }
        }
        // 수정된 데이터 저장
        localStorage.setItem(STORAGE_KEYS.TODO_TASKS, JSON.stringify(parsed));
      }

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
      localStorage.removeItem(STORAGE_KEYS.CALENDAR_EVENTS);
      localStorage.removeItem(STORAGE_KEYS.TAX_DEADLINES);
      localStorage.removeItem(STORAGE_KEYS.TODO_TASKS);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      throw error;
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
export const localStorageDataSource = new LocalStorageDataSource();