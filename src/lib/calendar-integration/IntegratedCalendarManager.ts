// Integrated Calendar Manager
// 모든 위젯 데이터를 통합 관리하는 중앙 관리자

import type {
  UnifiedCalendarItem,
  CalendarFilters,
  CalendarItemSource,
} from '@/types/integrated-calendar';
import type { CalendarEvent, TaxDeadline, TodoTask } from '@/types/dashboard';

import { calendarAdapter } from './adapters/calendar-adapter';
import { taxAdapter } from './adapters/tax-adapter';
import { todoAdapter } from './adapters/todo-adapter';
import { localStorageDataSource } from './data-sources/LocalStorageDataSource';
import {
  addCalendarDataChangedListener,
  addStorageListener,
  type CalendarDataChangedDetail,
} from './events';

/**
 * 구독 콜백 함수 타입
 */
type SubscriberCallback = (items: UnifiedCalendarItem[]) => void;

/**
 * 데이터 소스 인터페이스
 * LocalStorage, IndexedDB, API 등으로 확장 가능
 */
export interface IDataSource {
  getCalendarEvents(): Promise<CalendarEvent[]>;
  getTaxDeadlines(): Promise<TaxDeadline[]>;
  getTodoTasks(): Promise<TodoTask[]>;
  deleteCalendarEvent?(eventId: string): Promise<void>;
  deleteTaxDeadline?(deadlineId: string): Promise<void>;
  deleteTodoTask?(taskId: string): Promise<void>;
}

/**
 * 통합 캘린더 관리자
 *
 * 모든 위젯(캘린더, 세무, 할일)의 데이터를 통합하여 관리하고,
 * 필터링, 검색, 구독 기능을 제공합니다.
 *
 * Phase 4 성능 최적화: 인덱싱 시스템으로 O(1) 조회 지원
 */
export class IntegratedCalendarManager {
  private dataSource: IDataSource;
  private subscribers: Set<SubscriberCallback> = new Set();
  private cache: UnifiedCalendarItem[] = [];
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  // 인덱싱 시스템 (Phase 4 최적화)
  private indexByDate: Map<string, UnifiedCalendarItem[]> = new Map();
  private indexBySource: Map<CalendarItemSource, UnifiedCalendarItem[]> = new Map();
  private indexByPriority: Map<string, UnifiedCalendarItem[]> = new Map();
  private indexByStatus: Map<string, UnifiedCalendarItem[]> = new Map();

  // 이벤트 리스너 해제 함수들
  private unsubscribeDataChanged?: () => void;
  private unsubscribeStorageCalendar?: () => void;
  private unsubscribeStorageTax?: () => void;
  private unsubscribeStorageTodo?: () => void;

  constructor(dataSource?: IDataSource) {
    // 기본값으로 LocalStorageDataSource 사용
    // 실제 데이터 소스를 주입하지 않으면 임시 빈 데이터 소스 사용
    this.dataSource = dataSource || {
      async getCalendarEvents() { return []; },
      async getTaxDeadlines() { return []; },
      async getTodoTasks() { return []; },
    };

    // 실시간 동기화 이벤트 리스너 등록
    this.setupEventListeners();
  }

  /**
   * 실시간 동기화를 위한 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // CustomEvent 리스너 (같은 탭 내 위젯 간 통신)
    this.unsubscribeDataChanged = addCalendarDataChangedListener((event) => {
      this.handleDataChanged(event.detail);
    });

    // localStorage 이벤트 리스너 (크로스 탭 동기화)
    this.unsubscribeStorageCalendar = addStorageListener(
      'weave_calendar_events',
      () => this.handleStorageChange('calendar')
    );

    this.unsubscribeStorageTax = addStorageListener(
      'improved-dashboard-tax-deadlines',
      () => this.handleStorageChange('tax')
    );

    this.unsubscribeStorageTodo = addStorageListener(
      'weave_dashboard_todo_sections',
      () => this.handleStorageChange('todo')
    );
  }

  /**
   * 데이터 변경 이벤트 처리
   */
  private async handleDataChanged(detail: CalendarDataChangedDetail): Promise<void> {
    // 캐시 무효화
    this.invalidateCache();

    // 새 데이터 로드
    const updatedItems = await this.getAllItems();

    // 구독자들에게 알림
    this.notifySubscribers(updatedItems);
  }

  /**
   * localStorage 변경 이벤트 처리 (크로스 탭 동기화)
   */
  private async handleStorageChange(source: CalendarItemSource): Promise<void> {
    // 캐시 무효화
    this.invalidateCache();

    // 새 데이터 로드
    const updatedItems = await this.getAllItems();

    // 구독자들에게 알림
    this.notifySubscribers(updatedItems);
  }

  /**
   * 이벤트 리스너 정리
   */
  destroy(): void {
    // 이벤트 리스너 해제
    this.unsubscribeDataChanged?.();
    this.unsubscribeStorageCalendar?.();
    this.unsubscribeStorageTax?.();
    this.unsubscribeStorageTodo?.();

    // 구독자 정리
    this.subscribers.clear();

    // 캐시 정리
    this.invalidateCache();
  }

  /**
   * 날짜를 YYYY-MM-DD 형식의 키로 변환
   */
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 캐시 데이터로부터 인덱스 구축 (Phase 4 최적화)
   */
  private buildIndexes(): void {
    // 인덱스 초기화
    this.indexByDate.clear();
    this.indexBySource.clear();
    this.indexByPriority.clear();
    this.indexByStatus.clear();

    // 소스별 인덱스 초기화
    (['calendar', 'tax', 'todo'] as CalendarItemSource[]).forEach(source => {
      this.indexBySource.set(source, []);
    });

    // 캐시 데이터를 순회하며 인덱스 구축
    this.cache.forEach(item => {
      // 날짜별 인덱스
      const dateKey = this.formatDateKey(item.date);
      if (!this.indexByDate.has(dateKey)) {
        this.indexByDate.set(dateKey, []);
      }
      this.indexByDate.get(dateKey)!.push(item);

      // 소스별 인덱스
      const sourceItems = this.indexBySource.get(item.source) || [];
      sourceItems.push(item);
      this.indexBySource.set(item.source, sourceItems);

      // 우선순위별 인덱스
      if (!this.indexByPriority.has(item.priority)) {
        this.indexByPriority.set(item.priority, []);
      }
      this.indexByPriority.get(item.priority)!.push(item);

      // 상태별 인덱스
      if (!this.indexByStatus.has(item.status)) {
        this.indexByStatus.set(item.status, []);
      }
      this.indexByStatus.get(item.status)!.push(item);
    });
  }

  /**
   * 모든 통합 아이템 조회
   * Phase 4 최적화: 캐시 업데이트 시 인덱스도 함께 구축
   */
  async getAllItems(): Promise<UnifiedCalendarItem[]> {
    // 캐시 확인
    if (this.isCacheValid()) {
      return [...this.cache];
    }

    // 각 소스에서 데이터 가져오기
    const [calendarEvents, taxDeadlines, todoTasks] = await Promise.all([
      this.dataSource.getCalendarEvents(),
      this.dataSource.getTaxDeadlines(),
      this.dataSource.getTodoTasks(),
    ]);

    // 어댑터를 통해 변환
    const calendarItems = calendarAdapter.toUnifiedBatch(calendarEvents);
    const taxItems = taxAdapter.toUnifiedBatch(taxDeadlines);
    const todoItems = todoAdapter.toUnifiedBatch(todoTasks);

    // 모든 아이템 통합 및 정렬 (날짜 기준)
    const allItems = [...calendarItems, ...taxItems, ...todoItems].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // 캐시 업데이트
    this.cache = allItems;
    this.cacheTime = Date.now();

    // 인덱스 구축 (Phase 4 최적화)
    this.buildIndexes();

    return [...allItems];
  }

  /**
   * ID로 아이템 조회
   */
  async getItemById(id: string): Promise<UnifiedCalendarItem | null> {
    const allItems = await this.getAllItems();
    return allItems.find(item => item.id === id) || null;
  }

  /**
   * 날짜 범위로 아이템 조회
   * Phase 4 최적화: 날짜 인덱스 활용으로 O(1) 조회
   */
  async getItemsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<UnifiedCalendarItem[]> {
    // 캐시 및 인덱스 준비
    await this.getAllItems();

    const result: UnifiedCalendarItem[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 날짜만 비교 (시간 무시)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // 날짜 범위 내의 모든 날짜를 순회하며 인덱스에서 조회
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = this.formatDateKey(currentDate);
      const items = this.indexByDate.get(dateKey);
      if (items) {
        result.push(...items);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 날짜순 정렬
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * 필터를 적용하여 아이템 조회
   * Phase 4 최적화: 인덱스 활용으로 초기 필터링 성능 향상
   */
  async getItemsWithFilters(
    filters: CalendarFilters
  ): Promise<UnifiedCalendarItem[]> {
    // 캐시 및 인덱스 준비
    await this.getAllItems();

    let items: UnifiedCalendarItem[] = [];

    // Phase 4 최적화: 인덱스를 활용한 초기 필터링
    // 가장 선택적인 필터부터 적용하여 검색 공간 축소

    // 1. 소스 필터 (인덱스 활용)
    if (filters.sources && filters.sources.length > 0) {
      filters.sources.forEach(source => {
        const sourceItems = this.indexBySource.get(source);
        if (sourceItems) {
          items.push(...sourceItems);
        }
      });
    } else {
      items = [...this.cache];
    }

    // 2. 날짜 범위 필터 (인덱스 활용)
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const currentDate = new Date(start);
      const dateKeys = new Set<string>();

      while (currentDate <= end) {
        dateKeys.add(this.formatDateKey(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      items = items.filter(item => {
        const itemDateKey = this.formatDateKey(item.date);
        return dateKeys.has(itemDateKey);
      });
    }

    // 3. 우선순위 필터 (인덱스 교차 검증)
    if (filters.priorities && filters.priorities.length > 0) {
      const prioritySet = new Set<string>();
      filters.priorities.forEach(priority => {
        const priorityItems = this.indexByPriority.get(priority);
        if (priorityItems) {
          priorityItems.forEach(item => prioritySet.add(item.id));
        }
      });
      items = items.filter(item => prioritySet.has(item.id));
    }

    // 4. 상태 필터 (인덱스 교차 검증)
    if (filters.statuses && filters.statuses.length > 0) {
      const statusSet = new Set<string>();
      filters.statuses.forEach(status => {
        const statusItems = this.indexByStatus.get(status);
        if (statusItems) {
          statusItems.forEach(item => statusSet.add(item.id));
        }
      });
      items = items.filter(item => statusSet.has(item.id));
    }

    // 5. 타입 필터
    if (filters.types && filters.types.length > 0) {
      items = items.filter(item => filters.types!.includes(item.type));
    }

    // 6. 카테고리 필터
    if (filters.categories && filters.categories.length > 0) {
      items = items.filter(
        item => item.category && filters.categories!.includes(item.category)
      );
    }

    // 7. 태그 필터 (OR 조건: 하나라도 일치하면 포함)
    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(
        item =>
          item.tags &&
          item.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    // 8. 텍스트 검색 필터 (제목, 설명에서 검색)
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchLower = filters.searchText.toLowerCase().trim();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower))
      );
    }

    return items;
  }

  /**
   * 소스별 통계 정보 조회
   * Phase 4 최적화: 소스 인덱스 활용으로 O(1) 조회
   */
  async getStatsBySource(): Promise<
    Record<CalendarItemSource, number>
  > {
    // 캐시 및 인덱스 준비
    await this.getAllItems();

    // 인덱스에서 직접 개수 조회
    const stats: Record<CalendarItemSource, number> = {
      calendar: this.indexBySource.get('calendar')?.length || 0,
      tax: this.indexBySource.get('tax')?.length || 0,
      todo: this.indexBySource.get('todo')?.length || 0,
    };

    return stats;
  }

  /**
   * 오늘의 아이템 조회
   */
  async getTodayItems(): Promise<UnifiedCalendarItem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getItemsByDateRange(today, tomorrow);
  }

  /**
   * 이번 주의 아이템 조회
   */
  async getThisWeekItems(): Promise<UnifiedCalendarItem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.getItemsByDateRange(today, nextWeek);
  }

  /**
   * 이번 달의 아이템 조회
   */
  async getThisMonthItems(): Promise<UnifiedCalendarItem[]> {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.getItemsByDateRange(firstDay, lastDay);
  }

  /**
   * 데이터 변경 구독
   *
   * @param callback 데이터 변경 시 호출될 콜백 함수
   * @returns 구독 해제 함수
   */
  subscribe(callback: SubscriberCallback): () => void {
    this.subscribers.add(callback);

    // 구독 해제 함수 반환
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * 구독자들에게 데이터 변경 알림
   */
  private notifySubscribers(items: UnifiedCalendarItem[]): void {
    this.subscribers.forEach(callback => {
      try {
        callback(items);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  /**
   * 아이템 삭제 (소스별 자동 감지)
   * ID 패턴을 기반으로 올바른 소스에서 삭제
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      // ID 패턴으로 소스 감지 및 삭제
      if (itemId.startsWith('calendar-event-') || itemId.startsWith('event-')) {
        if (this.dataSource.deleteCalendarEvent) {
          await this.dataSource.deleteCalendarEvent(itemId);
        }
      } else if (itemId.startsWith('todo-')) {
        if (this.dataSource.deleteTodoTask) {
          await this.dataSource.deleteTodoTask(itemId);
        }
      } else if (itemId.startsWith('tax-')) {
        if (this.dataSource.deleteTaxDeadline) {
          await this.dataSource.deleteTaxDeadline(itemId);
        }
      }

      // 캐시 무효화 및 새로고침
      this.invalidateCache();
      const updatedItems = await this.getAllItems();

      // 구독자들에게 알림
      this.notifySubscribers(updatedItems);
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  }

  /**
   * 캐시 무효화
   * Phase 4 최적화: 인덱스도 함께 초기화
   */
  invalidateCache(): void {
    this.cache = [];
    this.cacheTime = 0;

    // 인덱스 초기화 (Phase 4 최적화)
    this.indexByDate.clear();
    this.indexBySource.clear();
    this.indexByPriority.clear();
    this.indexByStatus.clear();
  }

  /**
   * 캐시 유효성 확인
   */
  private isCacheValid(): boolean {
    if (this.cache.length === 0) return false;
    return Date.now() - this.cacheTime < this.CACHE_DURATION;
  }

  /**
   * 데이터 소스 설정
   */
  setDataSource(dataSource: IDataSource): void {
    this.dataSource = dataSource;
    this.invalidateCache();
  }
}

/**
 * 싱글톤 인스턴스
 * LocalStorageDataSource와 연결되어 실제 위젯 데이터를 읽음
 */
export const integratedCalendarManager = new IntegratedCalendarManager(localStorageDataSource);