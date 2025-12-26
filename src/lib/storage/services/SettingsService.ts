/**
 * Settings Service
 *
 * This file provides Settings domain service.
 * Manages user preferences, dashboard layout, and application settings.
 *
 * Note: Settings is a singleton entity per user (identified by userId).
 * Unlike other entities, Settings does not have id or createdAt fields.
 */

import type { StorageManager } from '../core/StorageManager';
import type {
  Settings,
  CalendarSettings,
  ProjectSettings,
  NotificationSettings,
  UserPreferences,
  CalendarView,
  ProjectView,
  Language,
  TimeFormat,
} from '../types/entities/settings';
import { isSettings } from '../types/entities/settings';
import { STORAGE_KEYS } from '../config';
import type { DashboardData } from './DashboardService';
import type { ImprovedWidget, DashboardConfig } from '@/types/improved-dashboard';

/**
 * Settings service class
 * Manages user settings and preferences
 *
 * Settings is stored as a Record<userId, Settings> in localStorage
 */
export class SettingsService {
  private storage: StorageManager;
  private entityKey = STORAGE_KEYS.SETTINGS;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  /**
   * Get current timestamp in ISO 8601 format
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Get all settings as a record
   */
  private async getAllSettings(): Promise<Record<string, Settings>> {
    return (await this.storage.get<Record<string, Settings>>(this.entityKey)) || {};
  }

  /**
   * Save all settings
   */
  private async saveAllSettings(settings: Record<string, Settings>): Promise<void> {
    await this.storage.set<Record<string, Settings>>(this.entityKey, settings);
  }

  // ============================================================================
  // User Settings
  // ============================================================================

  /**
   * Get settings by user ID
   */
  async getByUserId(userId: string): Promise<Settings | null> {
    const allSettings = await this.getAllSettings();
    return allSettings[userId] || null;
  }

  /**
   * Update settings for a user
   */
  async update(userId: string, updates: Partial<Settings>): Promise<Settings | null> {
    const allSettings = await this.getAllSettings();
    const existing = allSettings[userId];

    if (!existing) {
      return null;
    }

    const updated: Settings = {
      ...existing,
      ...updates,
      userId, // Ensure userId cannot be changed
      updatedAt: this.getCurrentTimestamp(),
    };

    allSettings[userId] = updated;
    await this.saveAllSettings(allSettings);
    return updated;
  }

  /**
   * Delete settings for a user
   */
  async delete(userId: string): Promise<boolean> {
    const allSettings = await this.getAllSettings();

    if (!allSettings[userId]) return false;

    delete allSettings[userId];
    await this.saveAllSettings(allSettings);
    return true;
  }

  /**
   * Get or create default settings for user
   */
  async getOrCreateDefaults(userId: string): Promise<Settings> {
    const existing = await this.getByUserId(userId);
    if (existing) return existing;

    // Create default settings
    const defaultSettings: Settings = {
      userId,
      dashboard: {
        widgets: [],
        config: {
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
        },
      },
      calendar: {
        defaultView: 'month',
        weekStartsOn: 0, // Sunday
      },
      projects: {
        defaultView: 'detail',
      },
      notifications: {},
      preferences: {
        language: 'ko',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      updatedAt: this.getCurrentTimestamp(),
    };

    const allSettings = await this.getAllSettings();
    allSettings[userId] = defaultSettings;
    await this.saveAllSettings(allSettings);

    return defaultSettings;
  }

  // ============================================================================
  // Dashboard Settings
  // ============================================================================

  /**
   * Update dashboard data (widgets + config)
   */
  async updateDashboard(userId: string, dashboard: Partial<DashboardData>): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    return this.update(userId, {
      dashboard: {
        ...settings.dashboard,
        ...dashboard,
      },
    });
  }

  /**
   * Add widget to dashboard
   */
  async addDashboardWidget(userId: string, widget: ImprovedWidget): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    const widgets = [...settings.dashboard.widgets, widget];

    return this.update(userId, {
      dashboard: {
        ...settings.dashboard,
        widgets,
      },
    });
  }

  /**
   * Remove widget from dashboard
   */
  async removeDashboardWidget(userId: string, widgetId: string): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    const widgets = settings.dashboard.widgets.filter((w: ImprovedWidget) => w.id !== widgetId);

    return this.update(userId, {
      dashboard: {
        ...settings.dashboard,
        widgets,
      },
    });
  }

  /**
   * Update widget in dashboard
   */
  async updateDashboardWidget(
    userId: string,
    widgetId: string,
    updates: Partial<ImprovedWidget>
  ): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    const widgets = settings.dashboard.widgets.map((w: ImprovedWidget) => {
      if (w.id === widgetId) {
        return { ...w, ...updates };
      }
      return w;
    });

    return this.update(userId, {
      dashboard: {
        ...settings.dashboard,
        widgets,
      },
    });
  }

  /**
   * Update dashboard config
   */
  async updateDashboardConfig(userId: string, config: Partial<DashboardConfig>): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    return this.update(userId, {
      dashboard: {
        ...settings.dashboard,
        config: {
          ...settings.dashboard.config,
          ...config,
        },
      },
    });
  }

  /**
   * Reset dashboard to default
   */
  async resetDashboard(userId: string): Promise<Settings | null> {
    return this.update(userId, {
      dashboard: {
        widgets: [],
        config: {
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
        },
      },
    });
  }

  // ============================================================================
  // Calendar Settings
  // ============================================================================

  /**
   * Update calendar settings
   */
  async updateCalendarSettings(userId: string, calendarSettings: Partial<CalendarSettings>): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    return this.update(userId, {
      calendar: {
        ...settings.calendar,
        ...calendarSettings,
      },
    });
  }

  /**
   * Update calendar default view
   */
  async updateCalendarView(userId: string, view: CalendarView): Promise<Settings | null> {
    return this.updateCalendarSettings(userId, { defaultView: view });
  }

  /**
   * Update week start day
   */
  async updateWeekStartDay(userId: string, day: 0 | 1): Promise<Settings | null> {
    return this.updateCalendarSettings(userId, { weekStartsOn: day });
  }

  /**
   * Update working hours
   */
  async updateWorkingHours(userId: string, start: string, end: string): Promise<Settings | null> {
    return this.updateCalendarSettings(userId, {
      workingHours: { start, end },
    });
  }

  /**
   * Add holiday
   */
  async addHoliday(userId: string, date: string): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    const holidays = settings.calendar.holidays || [];
    const updatedHolidays = [...holidays, date];

    return this.updateCalendarSettings(userId, { holidays: updatedHolidays });
  }

  /**
   * Remove holiday
   */
  async removeHoliday(userId: string, date: string): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    const holidays = settings.calendar.holidays || [];
    const updatedHolidays = holidays.filter((h) => h !== date);

    return this.updateCalendarSettings(userId, { holidays: updatedHolidays });
  }

  // ============================================================================
  // Project Settings
  // ============================================================================

  /**
   * Update project settings
   */
  async updateProjectSettings(userId: string, projectSettings: Partial<ProjectSettings>): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    return this.update(userId, {
      projects: {
        ...settings.projects,
        ...projectSettings,
      },
    });
  }

  /**
   * Update project default view
   */
  async updateProjectView(userId: string, view: ProjectView): Promise<Settings | null> {
    return this.updateProjectSettings(userId, { defaultView: view });
  }

  /**
   * Update project items per page
   */
  async updateProjectItemsPerPage(userId: string, itemsPerPage: number): Promise<Settings | null> {
    return this.updateProjectSettings(userId, { itemsPerPage });
  }

  // ============================================================================
  // Notification Settings
  // ============================================================================

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    notificationSettings: Partial<NotificationSettings>
  ): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    return this.update(userId, {
      notifications: {
        ...settings.notifications,
        ...notificationSettings,
      },
    });
  }

  /**
   * Enable/disable email notifications
   */
  async setEmailNotifications(userId: string, enabled: boolean): Promise<Settings | null> {
    return this.updateNotificationSettings(userId, { email: enabled });
  }

  /**
   * Enable/disable push notifications
   */
  async setPushNotifications(userId: string, enabled: boolean): Promise<Settings | null> {
    return this.updateNotificationSettings(userId, { push: enabled });
  }

  /**
   * Enable/disable desktop notifications
   */
  async setDesktopNotifications(userId: string, enabled: boolean): Promise<Settings | null> {
    return this.updateNotificationSettings(userId, { desktop: enabled });
  }

  /**
   * Enable/disable sound
   */
  async setNotificationSound(userId: string, enabled: boolean): Promise<Settings | null> {
    return this.updateNotificationSettings(userId, { sound: enabled });
  }

  // ============================================================================
  // User Preferences
  // ============================================================================

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<Settings | null> {
    const settings = await this.getByUserId(userId);
    if (!settings) return null;

    return this.update(userId, {
      preferences: {
        ...settings.preferences,
        ...preferences,
      },
    });
  }

  /**
   * Update language
   */
  async updateLanguage(userId: string, language: Language): Promise<Settings | null> {
    return this.updateUserPreferences(userId, { language });
  }

  /**
   * Update timezone
   */
  async updateTimezone(userId: string, timezone: string): Promise<Settings | null> {
    return this.updateUserPreferences(userId, { timezone });
  }

  /**
   * Update date format
   */
  async updateDateFormat(userId: string, dateFormat: string): Promise<Settings | null> {
    return this.updateUserPreferences(userId, { dateFormat });
  }

  /**
   * Update time format
   */
  async updateTimeFormat(userId: string, timeFormat: TimeFormat): Promise<Settings | null> {
    return this.updateUserPreferences(userId, { timeFormat });
  }

  /**
   * Update currency
   */
  async updateCurrency(userId: string, currency: string): Promise<Settings | null> {
    return this.updateUserPreferences(userId, { currency });
  }

  // ============================================================================
  // Project Table Configuration (Phase 17)
  // ============================================================================

  /**
   * Get project table configuration
   */
  async getProjectTableConfig(userId: string): Promise<import('../types/entities/settings').ProjectTableConfig | null> {
    const settings = await this.getByUserId(userId);
    return settings?.projectTableConfig || null;
  }

  /**
   * Update project table configuration
   */
  async updateProjectTableConfig(
    userId: string,
    config: import('../types/entities/settings').ProjectTableConfig
  ): Promise<Settings | null> {
    return this.update(userId, { projectTableConfig: config });
  }

  /**
   * Reset project table configuration
   */
  async resetProjectTableConfig(userId: string): Promise<Settings | null> {
    return this.update(userId, { projectTableConfig: undefined });
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Reset all settings to default for a user
   */
  async resetAllSettings(userId: string): Promise<Settings> {
    await this.delete(userId);
    return this.getOrCreateDefaults(userId);
  }

  /**
   * Export settings as JSON
   */
  async exportSettings(userId: string): Promise<string> {
    const settings = await this.getByUserId(userId);
    if (!settings) {
      throw new Error(`Settings not found for user ${userId}`);
    }

    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(userId: string, settingsJson: string): Promise<Settings> {
    const importedSettings = JSON.parse(settingsJson) as Settings;

    // Validate imported settings
    if (!isSettings(importedSettings)) {
      throw new Error('Invalid settings format');
    }

    const existing = await this.getByUserId(userId);
    if (existing) {
      // Update existing settings
      return (await this.update(userId, {
        dashboard: importedSettings.dashboard,
        calendar: importedSettings.calendar,
        projects: importedSettings.projects,
        notifications: importedSettings.notifications,
        preferences: importedSettings.preferences,
      })) as Settings;
    } else {
      // Create new settings
      const allSettings = await this.getAllSettings();
      const newSettings: Settings = {
        ...importedSettings,
        userId, // Ensure correct userId
        updatedAt: this.getCurrentTimestamp(),
      };

      allSettings[userId] = newSettings;
      await this.saveAllSettings(allSettings);
      return newSettings;
    }
  }
}
