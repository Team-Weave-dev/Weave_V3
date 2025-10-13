/**
 * Dashboard Service
 *
 * This file provides Dashboard domain service for managing dashboard layout and configuration.
 * Handles widget positions, dashboard configuration, and data persistence.
 *
 * Note: This service is independent like SettingsService and does not extend BaseService.
 * Dashboard layout is synced to Supabase (user_settings.dashboard column).
 */

import type { StorageManager } from '../core/StorageManager';
import type { ImprovedWidget, DashboardConfig } from '@/types/improved-dashboard';
import type { JsonObject } from '../types/base';
import { STORAGE_KEYS } from '../config';
import { createClient } from '@/lib/supabase/client';

/**
 * Dashboard data structure
 */
export interface DashboardData extends JsonObject {
  /** Widget list */
  widgets: ImprovedWidget[];
  /** Dashboard configuration */
  config: DashboardConfig;
}

/**
 * Legacy dashboard data structure (from Zustand persist)
 */
interface LegacyDashboardData {
  state: {
    widgets: ImprovedWidget[];
    config: DashboardConfig;
  };
  version?: number;
}

/**
 * Dashboard service class
 * Manages dashboard layout, widgets, and configuration
 */
export class DashboardService {
  private storage: StorageManager;
  private entityKey = STORAGE_KEYS.DASHBOARD;
  private legacyKey = 'weave-dashboard-layout'; // Old Zustand persist key

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  /**
   * Save dashboard data
   * Saves to both LocalStorage and Supabase (user_settings.dashboard)
   *
   * @throws Error if Supabase sync fails (LocalStorage is still saved)
   */
  async save(widgets: ImprovedWidget[], config: DashboardConfig): Promise<void> {
    const data: DashboardData = {
      widgets,
      config,
    };

    // 1. LocalStorage에 즉시 저장 (빠른 응답)
    await this.storage.set<DashboardData>(this.entityKey, data);
    console.log('💾 Dashboard saved to LocalStorage');

    // 2. Supabase에 동기화
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Authentication error:', authError);
      throw new Error(`Failed to get authenticated user: ${authError.message}`);
    }

    if (!user) {
      console.warn('⚠️ No authenticated user, skipping Supabase sync');
      return;
    }

    // user_settings 테이블의 dashboard 컬럼 업데이트
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        dashboard: data, // 타입 캐스팅 제거 - Supabase가 자동으로 JSONB로 변환
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Failed to sync dashboard to Supabase:', error);
      throw new Error(`Failed to sync dashboard to Supabase: ${error.message}`);
    }

    console.log('✅ Dashboard synced to Supabase', {
      widgetCount: widgets.length,
      userId: user.id
    });
  }

  /**
   * Load dashboard data
   * Loads from Supabase first, falls back to LocalStorage
   * Automatically migrates from legacy format if needed
   */
  async load(): Promise<DashboardData | null> {
    // 1. Supabase에서 먼저 조회 시도
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: settings, error } = await supabase
          .from('user_settings')
          .select('dashboard')
          .eq('user_id', user.id)
          .single();

        if (!error && settings?.dashboard) {
          console.log('✅ Dashboard loaded from Supabase');
          // Supabase 데이터를 LocalStorage에도 동기화
          await this.storage.set<DashboardData>(this.entityKey, settings.dashboard);
          return settings.dashboard as DashboardData;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load from Supabase, falling back to LocalStorage:', error);
    }

    // 2. LocalStorage에서 조회
    const data = await this.storage.get<DashboardData>(this.entityKey);

    if (data) {
      return data;
    }

    // 3. Legacy 데이터 마이그레이션
    return this.migrateLegacyData();
  }

  /**
   * Clear dashboard data
   */
  async clear(): Promise<void> {
    await this.storage.remove(this.entityKey);
  }

  /**
   * Migrate legacy dashboard data from Zustand persist
   */
  private async migrateLegacyData(): Promise<DashboardData | null> {
    try {
      // Try to read legacy data directly from localStorage
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      const legacyDataStr = window.localStorage.getItem(this.legacyKey);
      if (!legacyDataStr) {
        return null;
      }

      console.log('🔄 Migrating dashboard data from legacy format...');

      // Parse legacy data
      const legacyData = JSON.parse(legacyDataStr) as LegacyDashboardData;

      // Extract widgets and config
      const widgets = legacyData.state?.widgets || [];
      const config = legacyData.state?.config || this.getDefaultConfig();

      const migratedData: DashboardData = {
        widgets,
        config,
      };

      // Save to new format
      await this.save(widgets, config);

      // Remove legacy key
      window.localStorage.removeItem(this.legacyKey);

      console.log('✅ Dashboard data migration completed');
      console.log(`   - Migrated ${widgets.length} widgets`);
      console.log(`   - Legacy key removed: ${this.legacyKey}`);

      return migratedData;
    } catch (error) {
      console.error('❌ Failed to migrate legacy dashboard data:', error);
      return null;
    }
  }

  /**
   * Get default dashboard configuration
   */
  private getDefaultConfig(): DashboardConfig {
    return {
      cols: 9,
      rowHeight: 120,
      gap: 16,
      isDraggable: true,
      isResizable: true,
      preventCollision: true,
      allowOverlap: false,
      compactType: 'vertical',
      useCSSTransforms: true,
      transformScale: 1,
      resizeHandles: ['se'],
      isDroppable: false,
    };
  }

  /**
   * Save only widgets (keep existing config)
   */
  async saveWidgets(widgets: ImprovedWidget[]): Promise<void> {
    const currentData = await this.load();
    const config = currentData?.config || this.getDefaultConfig();
    await this.save(widgets, config);
  }

  /**
   * Save only config (keep existing widgets)
   */
  async saveConfig(config: DashboardConfig): Promise<void> {
    const currentData = await this.load();
    const widgets = currentData?.widgets || [];
    await this.save(widgets, config);
  }

  /**
   * Get only widgets
   */
  async getWidgets(): Promise<ImprovedWidget[]> {
    const data = await this.load();
    return data?.widgets || [];
  }

  /**
   * Get only config
   */
  async getConfig(): Promise<DashboardConfig> {
    const data = await this.load();
    return data?.config || this.getDefaultConfig();
  }
}
