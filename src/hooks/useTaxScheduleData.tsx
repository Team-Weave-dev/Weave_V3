'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TaxSchedule } from '@/lib/storage/types/entities/tax-schedule';

interface UseTaxScheduleDataReturn {
  schedules: TaxSchedule[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * TaxSchedule 데이터 로딩 훅
 * Supabase 기반 실시간 동기화
 */
export function useTaxScheduleData(): UseTaxScheduleDataReturn {
  const [schedules, setSchedules] = useState<TaxSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTaxScheduleData] Loading tax schedules from Supabase...');

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('tax_schedules')
        .select('*')
        .order('tax_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      console.log('[useTaxScheduleData] Tax schedules loaded:', data?.length || 0, data);

      setSchedules(data || []);
    } catch (err) {
      console.error('[useTaxScheduleData] Failed to load tax schedules:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();

    // Supabase Realtime 구독 (선택적)
    const supabase = createClient();
    const subscription = supabase
      .channel('tax_schedules_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tax_schedules' },
        () => {
          console.log('[useTaxScheduleData] Realtime change detected, reloading...');
          loadSchedules();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { schedules, loading, error, refresh: loadSchedules };
}
