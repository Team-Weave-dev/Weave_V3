/**
 * TaxScheduleService
 *
 * Service for managing tax schedules.
 * This is a read-only service that fetches data from Supabase.
 * All users can view the same tax schedules.
 */

import { createClient } from '@/lib/supabase/client';
import type {
  TaxSchedule,
  TaxCategory,
  TaxScheduleType,
} from '../types/entities/tax-schedule';
import { isTaxSchedule } from '../types/entities/tax-schedule';

/**
 * Tax Schedule Service
 *
 * **특징**:
 * - Supabase 전용 (LocalStorage 사용하지 않음)
 * - 읽기 전용 (사용자는 조회만 가능)
 * - 모든 사용자가 동일한 데이터 공유
 */
export class TaxScheduleService {
  private supabase = createClient();

  /**
   * Get all tax schedules
   *
   * @returns All tax schedules
   */
  async getAll(): Promise<TaxSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('tax_schedules')
        .select('*')
        .order('tax_date', { ascending: true });

      if (error) {
        console.error('[TaxScheduleService] Failed to fetch tax schedules:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Convert database format to entity format
      const schedules: TaxSchedule[] = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        taxDate: row.tax_date, // Convert snake_case to camelCase
        category: row.category as TaxCategory,
        type: row.type as TaxScheduleType,
        recurring: row.recurring,
        color: row.color || undefined,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      // Validate data
      return schedules.filter(isTaxSchedule);
    } catch (error) {
      console.error('[TaxScheduleService] Error in getAll:', error);
      return [];
    }
  }

  /**
   * Get tax schedule by ID
   *
   * @param id - Tax schedule ID
   * @returns Tax schedule or null
   */
  async getById(id: string): Promise<TaxSchedule | null> {
    try {
      const { data, error } = await this.supabase
        .from('tax_schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      const schedule: TaxSchedule = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        taxDate: data.tax_date,
        category: data.category as TaxCategory,
        type: data.type as TaxScheduleType,
        recurring: data.recurring,
        color: data.color || undefined,
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return isTaxSchedule(schedule) ? schedule : null;
    } catch (error) {
      console.error('[TaxScheduleService] Error in getById:', error);
      return null;
    }
  }

  /**
   * Get tax schedules by date range
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Tax schedules within the date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<TaxSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('tax_schedules')
        .select('*')
        .gte('tax_date', startDate)
        .lte('tax_date', endDate)
        .order('tax_date', { ascending: true });

      if (error || !data) {
        return [];
      }

      const schedules: TaxSchedule[] = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        taxDate: row.tax_date,
        category: row.category as TaxCategory,
        type: row.type as TaxScheduleType,
        recurring: row.recurring,
        color: row.color || undefined,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return schedules.filter(isTaxSchedule);
    } catch (error) {
      console.error('[TaxScheduleService] Error in getByDateRange:', error);
      return [];
    }
  }

  /**
   * Get tax schedules by category
   *
   * @param category - Tax category
   * @returns Tax schedules in the category
   */
  async getByCategory(category: TaxCategory): Promise<TaxSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('tax_schedules')
        .select('*')
        .eq('category', category)
        .order('tax_date', { ascending: true });

      if (error || !data) {
        return [];
      }

      const schedules: TaxSchedule[] = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        taxDate: row.tax_date,
        category: row.category as TaxCategory,
        type: row.type as TaxScheduleType,
        recurring: row.recurring,
        color: row.color || undefined,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return schedules.filter(isTaxSchedule);
    } catch (error) {
      console.error('[TaxScheduleService] Error in getByCategory:', error);
      return [];
    }
  }

  /**
   * Get tax schedules by type
   *
   * @param type - Tax schedule type
   * @returns Tax schedules of the type
   */
  async getByType(type: TaxScheduleType): Promise<TaxSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('tax_schedules')
        .select('*')
        .eq('type', type)
        .order('tax_date', { ascending: true });

      if (error || !data) {
        return [];
      }

      const schedules: TaxSchedule[] = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        taxDate: row.tax_date,
        category: row.category as TaxCategory,
        type: row.type as TaxScheduleType,
        recurring: row.recurring,
        color: row.color || undefined,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return schedules.filter(isTaxSchedule);
    } catch (error) {
      console.error('[TaxScheduleService] Error in getByType:', error);
      return [];
    }
  }

  /**
   * Get upcoming tax schedules (within next N days)
   *
   * @param days - Number of days to look ahead (default: 30)
   * @returns Upcoming tax schedules
   */
  async getUpcoming(days: number = 30): Promise<TaxSchedule[]> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const future = futureDate.toISOString().split('T')[0];

      return this.getByDateRange(today, future);
    } catch (error) {
      console.error('[TaxScheduleService] Error in getUpcoming:', error);
      return [];
    }
  }

  /**
   * Get recurring tax schedules
   *
   * @returns Recurring tax schedules
   */
  async getRecurring(): Promise<TaxSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('tax_schedules')
        .select('*')
        .eq('recurring', true)
        .order('tax_date', { ascending: true });

      if (error || !data) {
        return [];
      }

      const schedules: TaxSchedule[] = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        taxDate: row.tax_date,
        category: row.category as TaxCategory,
        type: row.type as TaxScheduleType,
        recurring: row.recurring,
        color: row.color || undefined,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return schedules.filter(isTaxSchedule);
    } catch (error) {
      console.error('[TaxScheduleService] Error in getRecurring:', error);
      return [];
    }
  }
}

// Export singleton instance
export const taxScheduleService = new TaxScheduleService();
