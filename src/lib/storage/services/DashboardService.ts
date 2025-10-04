/**
 * Dashboard Service
 *
 * This file provides Dashboard domain service for managing dashboard layout and configuration.
 * Handles widget positions, dashboard configuration, and data persistence.
 *
 * Note: This service is independent like SettingsService and does not extend BaseService.
 */

import type { StorageManager } from '../core/StorageManager';
import type { ImprovedWidget, DashboardConfig } from '@/types/improved-dashboard';
import { STORAGE_KEYS } from '../config';

/**
 * Dashboard data structure
 */
export interface DashboardData {
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
   */
  async save(widgets: ImprovedWidget[], config: DashboardConfig): Promise<void> {
    const data: DashboardData = {
      widgets,
      config,
    };

    await this.storage.set<DashboardData>(this.entityKey, data);
  }

  /**
   * Load dashboard data
   * Automatically migrates from legacy format if needed
   */
  async load(): Promise<DashboardData | null> {
    // Try to load from new key first
    const data = await this.storage.get<DashboardData>(this.entityKey);

    if (data) {
      return data;
    }

    // If not found, try to migrate from legacy format
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
