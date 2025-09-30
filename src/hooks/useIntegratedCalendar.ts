// useIntegratedCalendar Hook
// 통합 캘린더 데이터를 React 컴포넌트에서 사용하기 위한 훅

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  UnifiedCalendarItem,
  CalendarFilters,
  CalendarItemSource,
} from '@/types/integrated-calendar';
import { integratedCalendarManager } from '@/lib/calendar-integration';

/**
 * 훅 옵션
 */
export interface UseIntegratedCalendarOptions {
  /**
   * 초기 필터
   */
  initialFilters?: CalendarFilters;

  /**
   * 자동 새로고침 여부
   */
  autoRefresh?: boolean;

  /**
   * 자동 새로고침 간격 (ms)
   */
  refreshInterval?: number;

  /**
   * 초기 로딩 시 데이터 가져오기 여부
   */
  fetchOnMount?: boolean;
}

/**
 * 훅 반환 타입
 */
export interface UseIntegratedCalendarReturn {
  // 데이터
  items: UnifiedCalendarItem[];
  filteredItems: UnifiedCalendarItem[];

  // 로딩 상태
  isLoading: boolean;
  error: Error | null;

  // 필터
  filters: CalendarFilters;
  setFilters: (filters: CalendarFilters) => void;
  updateFilters: (partialFilters: Partial<CalendarFilters>) => void;
  clearFilters: () => void;

  // 데이터 액션
  refresh: () => Promise<void>;
  invalidateCache: () => void;

  // 유틸리티
  getItemById: (id: string) => UnifiedCalendarItem | undefined;
  getItemsBySource: (source: CalendarItemSource) => UnifiedCalendarItem[];
  getTodayItems: () => UnifiedCalendarItem[];
  getThisWeekItems: () => UnifiedCalendarItem[];
  getThisMonthItems: () => UnifiedCalendarItem[];

  // 통계
  stats: {
    total: number;
    bySource: Record<CalendarItemSource, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

/**
 * 통합 캘린더 데이터를 React 컴포넌트에서 사용하기 위한 훅
 *
 * @param options 훅 옵션
 * @returns 통합 캘린더 데이터 및 관련 함수들
 *
 * @example
 * ```tsx
 * const { items, filters, setFilters, isLoading } = useIntegratedCalendar({
 *   initialFilters: { sources: ['calendar', 'todo'] },
 *   autoRefresh: true,
 * });
 * ```
 */
export function useIntegratedCalendar(
  options: UseIntegratedCalendarOptions = {}
): UseIntegratedCalendarReturn {
  const {
    initialFilters = {},
    autoRefresh = false,
    refreshInterval = 60000, // 1분
    fetchOnMount = true,
  } = options;

  // 상태
  const [items, setItems] = useState<UnifiedCalendarItem[]>([]);
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 데이터 가져오기
   */
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allItems = await integratedCalendarManager.getAllItems();
      setItems(allItems);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch integrated calendar items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 필터 업데이트 (부분 업데이트)
   */
  const updateFilters = useCallback((partialFilters: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...partialFilters }));
  }, []);

  /**
   * 필터 초기화
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * 캐시 무효화
   */
  const invalidateCache = useCallback(() => {
    integratedCalendarManager.invalidateCache();
  }, []);

  /**
   * 수동 새로고침
   */
  const refresh = useCallback(async () => {
    invalidateCache();
    await fetchItems();
  }, [fetchItems, invalidateCache]);

  /**
   * 필터링된 아이템
   */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 소스 필터
    if (filters.sources && filters.sources.length > 0) {
      result = result.filter((item) => filters.sources!.includes(item.source));
    }

    // 타입 필터
    if (filters.types && filters.types.length > 0) {
      result = result.filter((item) => filters.types!.includes(item.type));
    }

    // 우선순위 필터
    if (filters.priorities && filters.priorities.length > 0) {
      result = result.filter((item) => filters.priorities!.includes(item.priority));
    }

    // 상태 필터
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter((item) => filters.statuses!.includes(item.status));
    }

    // 카테고리 필터
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(
        (item) => item.category && filters.categories!.includes(item.category)
      );
    }

    // 태그 필터 (OR 조건)
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(
        (item) =>
          item.tags && item.tags.some((tag) => filters.tags!.includes(tag))
      );
    }

    // 날짜 범위 필터
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = result.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });
    }

    // 텍스트 검색 필터
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchLower = filters.searchText.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [items, filters]);

  /**
   * ID로 아이템 찾기
   */
  const getItemById = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  /**
   * 소스별 아이템 가져오기
   */
  const getItemsBySource = useCallback(
    (source: CalendarItemSource) => {
      return items.filter((item) => item.source === source);
    },
    [items]
  );

  /**
   * 오늘의 아이템
   */
  const getTodayItems = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return items.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  }, [items]);

  /**
   * 이번 주의 아이템
   */
  const getThisWeekItems = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= today && itemDate < nextWeek;
    });
  }, [items]);

  /**
   * 이번 달의 아이템
   */
  const getThisMonthItems = useCallback(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    return items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= firstDay && itemDate <= lastDay;
    });
  }, [items]);

  /**
   * 통계 정보
   */
  const stats = useMemo(() => {
    const bySource: Record<CalendarItemSource, number> = {
      calendar: 0,
      tax: 0,
      todo: 0,
    };

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    filteredItems.forEach((item) => {
      bySource[item.source]++;

      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    });

    return {
      total: filteredItems.length,
      bySource,
      byStatus,
      byPriority,
    };
  }, [filteredItems]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    if (fetchOnMount) {
      fetchItems();
    }
  }, [fetchOnMount, fetchItems]);

  /**
   * 자동 새로고침
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchItems();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchItems]);

  /**
   * 데이터 변경 구독
   */
  useEffect(() => {
    const unsubscribe = integratedCalendarManager.subscribe((newItems) => {
      setItems(newItems);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    // 데이터
    items,
    filteredItems,

    // 로딩 상태
    isLoading,
    error,

    // 필터
    filters,
    setFilters,
    updateFilters,
    clearFilters,

    // 데이터 액션
    refresh,
    invalidateCache,

    // 유틸리티
    getItemById,
    getItemsBySource,
    getTodayItems,
    getThisWeekItems,
    getThisMonthItems,

    // 통계
    stats,
  };
}