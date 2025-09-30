// CalendarFilterContext
// 통합 캘린더 필터 상태를 전역으로 관리하는 Context

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useIntegratedCalendar,
  type UseIntegratedCalendarReturn,
  type UseIntegratedCalendarOptions,
} from '@/hooks/useIntegratedCalendar';

/**
 * CalendarFilterContext의 타입
 * useIntegratedCalendar 훅의 반환 타입을 그대로 사용
 */
type CalendarFilterContextType = UseIntegratedCalendarReturn | null;

/**
 * CalendarFilterContext
 */
const CalendarFilterContext = createContext<CalendarFilterContextType>(null);

/**
 * CalendarFilterProvider Props
 */
interface CalendarFilterProviderProps {
  children: ReactNode;
  /**
   * useIntegratedCalendar 훅에 전달할 옵션
   */
  options?: UseIntegratedCalendarOptions;
}

/**
 * CalendarFilterProvider
 *
 * 통합 캘린더 데이터와 필터 상태를 하위 컴포넌트들에게 제공합니다.
 *
 * @example
 * ```tsx
 * <CalendarFilterProvider options={{ autoRefresh: true }}>
 *   <CalendarView />
 *   <FilterControls />
 * </CalendarFilterProvider>
 * ```
 */
export function CalendarFilterProvider({
  children,
  options = {},
}: CalendarFilterProviderProps) {
  const calendarState = useIntegratedCalendar(options);

  return (
    <CalendarFilterContext.Provider value={calendarState}>
      {children}
    </CalendarFilterContext.Provider>
  );
}

/**
 * useCalendarFilter
 *
 * CalendarFilterContext를 사용하는 커스텀 훅
 *
 * @throws {Error} Provider 외부에서 사용 시 에러 발생
 *
 * @example
 * ```tsx
 * function CalendarView() {
 *   const { filteredItems, filters, setFilters } = useCalendarFilter();
 *
 *   return (
 *     <div>
 *       {filteredItems.map(item => (
 *         <CalendarItem key={item.id} item={item} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCalendarFilter(): UseIntegratedCalendarReturn {
  const context = useContext(CalendarFilterContext);

  if (!context) {
    throw new Error(
      'useCalendarFilter must be used within a CalendarFilterProvider'
    );
  }

  return context;
}

/**
 * Optional: useCalendarFilterOptional
 *
 * Provider 외부에서 사용해도 에러를 발생시키지 않는 버전
 * null을 반환하므로 optional chaining 사용 필요
 *
 * @example
 * ```tsx
 * function OptionalCalendarComponent() {
 *   const calendar = useCalendarFilterOptional();
 *
 *   if (!calendar) {
 *     return <div>No calendar context available</div>;
 *   }
 *
 *   return <div>{calendar.filteredItems.length} items</div>;
 * }
 * ```
 */
export function useCalendarFilterOptional(): UseIntegratedCalendarReturn | null {
  return useContext(CalendarFilterContext);
}