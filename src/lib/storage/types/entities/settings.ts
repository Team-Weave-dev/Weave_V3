/**
 * Settings Entity Type Definitions
 *
 * This file defines the Settings entity schema and related types.
 * Manages user preferences, dashboard layout, calendar config, and more.
 */

import { isValidISODate, isStringArray, isPositiveNumber } from '../validators';
import type { DashboardData } from '@/lib/storage/services/DashboardService';
import type { ImprovedWidget, DashboardConfig } from '@/types/improved-dashboard';

/**
 * Theme option
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Calendar view option
 */
export type CalendarView = 'month' | 'week' | 'day' | 'list';

/**
 * Week start day (0: Sunday, 1: Monday)
 */
export type WeekStartDay = 0 | 1;

/**
 * Project view option
 */
export type ProjectView = 'list' | 'detail' | 'kanban';

/**
 * Sort field option
 */
export type SortField = 'name' | 'date' | 'status' | 'priority';

/**
 * Sort order option
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Language option
 */
export type Language = 'ko' | 'en';

/**
 * Time format option
 */
export type TimeFormat = '12' | '24';

/**
 * Dashboard widget position
 */
export interface WidgetPosition {
  /** X coordinate */
  x: number;

  /** Y coordinate */
  y: number;

  /** Width */
  w: number;

  /** Height */
  h: number;
}

/**
 * Dashboard widget
 */
export interface DashboardWidget {
  /** Widget ID */
  id: string;

  /** Widget type */
  type: string;

  /** Widget position */
  position: WidgetPosition;

  /** Widget configuration (optional) */
  config?: any;
}

/**
 * Dashboard layout configuration
 * @deprecated Use DashboardData from DashboardService instead
 * This interface is kept for backward compatibility only
 */
export interface DashboardLayout {
  /** Widget list */
  widgets: DashboardWidget[];

  /** Number of columns */
  columns: number;

  /** Row height in pixels */
  rowHeight: number;

  /** Gap between widgets in pixels */
  gap: number;
}

/**
 * Working hours configuration
 */
export interface WorkingHours {
  /** Start time (HH:mm) */
  start: string;

  /** End time (HH:mm) */
  end: string;
}

/**
 * Dashboard settings
 * @deprecated Use DashboardData from DashboardService instead
 * This interface is kept for backward compatibility only
 */
export interface DashboardSettings {
  /** Dashboard layout configuration */
  layout: DashboardLayout;

  /** Dashboard theme (optional) */
  theme?: Theme;
}

/**
 * Calendar settings
 */
export interface CalendarSettings {
  /** Default calendar view */
  defaultView: CalendarView;

  /** Week start day (0: Sunday, 1: Monday) */
  weekStartsOn: WeekStartDay;

  /** Working hours (optional) */
  workingHours?: WorkingHours;

  /** Holiday dates (ISO 8601 array, optional) */
  holidays?: string[];

  /** Default reminder times in minutes (optional) */
  defaultReminders?: number[];
}

/**
 * Project settings
 */
export interface ProjectSettings {
  /** Default project view */
  defaultView: ProjectView;

  /** Default sort field (optional) */
  sortBy?: SortField;

  /** Default sort order (optional) */
  sortOrder?: SortOrder;

  /** Items per page (optional) */
  itemsPerPage?: number;
}

/**
 * Project table column configuration
 * Aligned with @/lib/types/project-table.types.ts ProjectTableColumn
 */
export interface ProjectTableColumn {
  /** Column ID */
  id: string;

  /** Column key for data mapping */
  key: string;

  /** Column label */
  label: string;

  /** Column sortable */
  sortable?: boolean;

  /** Column filterable */
  filterable?: boolean;

  /** Column width (optional) */
  width?: number;

  /** Column visibility */
  visible: boolean;

  /** Column order */
  order: number;

  /** Column type */
  type: 'text' | 'date' | 'number' | 'status' | 'progress' | 'currency' | 'payment_progress';
}

/**
 * Table filter state
 * Aligned with @/lib/types/project-table.types.ts TableFilterState
 */
export interface TableFilterState {
  /** Search query */
  searchQuery: string;

  /** Status filter */
  statusFilter: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled' | 'all';

  /** Client filter */
  clientFilter: string;

  /** Custom filters (key-value pairs) */
  customFilters: Record<string, any>;
}

/**
 * Table sort state
 */
export interface TableSortState {
  /** Sort column */
  column: string;

  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Table pagination state
 */
export interface TablePaginationState {
  /** Current page number */
  page: number;

  /** Items per page */
  pageSize: number;

  /** Total items count */
  total: number;
}

/**
 * Project table configuration (Phase 17)
 * User-specific UI settings for project table view
 */
export interface ProjectTableConfig {
  /** Column configurations */
  columns: ProjectTableColumn[];

  /** Filter state */
  filters: TableFilterState;

  /** Sort state */
  sort: TableSortState;

  /** Pagination state */
  pagination: TablePaginationState;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  /** Email notifications enabled (optional) */
  email?: boolean;

  /** Push notifications enabled (optional) */
  push?: boolean;

  /** Desktop notifications enabled (optional) */
  desktop?: boolean;

  /** Sound enabled (optional) */
  sound?: boolean;

  /** Task reminders enabled (optional) */
  taskReminders?: boolean;

  /** Event reminders enabled (optional) */
  eventReminders?: boolean;

  /** Project deadline reminders enabled (optional) */
  projectDeadlines?: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** User language */
  language: Language;

  /** User timezone */
  timezone: string;

  /** Date format (optional) */
  dateFormat?: string;

  /** Time format (optional) */
  timeFormat?: TimeFormat;

  /** Currency (optional) */
  currency?: string;

  /** Number format (optional) */
  numberFormat?: string;
}

/**
 * Settings entity
 */
export interface Settings {
  /** User ID */
  userId: string;

  /** Dashboard data (widgets + configuration) */
  dashboard: DashboardData;

  /** Calendar settings */
  calendar: CalendarSettings;

  /** Project settings */
  projects: ProjectSettings;

  /** Notification settings */
  notifications: NotificationSettings;

  /** User preferences */
  preferences: UserPreferences;

  /** Project table configuration (Phase 17 - optional) */
  projectTableConfig?: ProjectTableConfig;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Last update user ID (for conflict resolution) */
  updated_by?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for WidgetPosition
 */
export function isWidgetPosition(data: unknown): data is WidgetPosition {
  return (
    typeof data === 'object' &&
    data !== null &&
    'x' in data &&
    typeof (data as WidgetPosition).x === 'number' &&
    'y' in data &&
    typeof (data as WidgetPosition).y === 'number' &&
    'w' in data &&
    typeof (data as WidgetPosition).w === 'number' &&
    'h' in data &&
    typeof (data as WidgetPosition).h === 'number'
  );
}

/**
 * Type guard for DashboardWidget
 */
export function isDashboardWidget(data: unknown): data is DashboardWidget {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as DashboardWidget).id === 'string' &&
    'type' in data &&
    typeof (data as DashboardWidget).type === 'string' &&
    'position' in data &&
    isWidgetPosition((data as DashboardWidget).position)
  );
}

/**
 * Type guard for DashboardLayout
 */
export function isDashboardLayout(data: unknown): data is DashboardLayout {
  if (typeof data !== 'object' || data === null) return false;

  const layout = data as DashboardLayout;

  if (!Array.isArray(layout.widgets)) return false;
  if (!layout.widgets.every(isDashboardWidget)) return false;
  if (!isPositiveNumber(layout.columns)) return false;
  if (!isPositiveNumber(layout.rowHeight)) return false;
  if (typeof layout.gap !== 'number' || layout.gap < 0) return false;

  return true;
}

/**
 * Type guard for DashboardData (new format)
 * Validates dashboard with widgets and config structure
 */
export function isDashboardData(data: unknown): data is DashboardData {
  if (typeof data !== 'object' || data === null) return false;

  const dashboard = data as DashboardData;

  // Validate widgets array
  if (!Array.isArray(dashboard.widgets)) return false;
  // Note: We don't validate each widget deeply here for performance
  // ImprovedWidget validation is handled by DashboardService

  // Validate config object
  if (typeof dashboard.config !== 'object' || dashboard.config === null) return false;

  const config = dashboard.config;

  // Required config fields
  if (!isPositiveNumber(config.cols)) return false;
  if (!isPositiveNumber(config.rowHeight)) return false;
  if (typeof config.gap !== 'number' || config.gap < 0) return false;

  return true;
}

/**
 * Type guard for DashboardSettings (legacy format)
 * @deprecated Use isDashboardData instead
 * This function is kept for backward compatibility only
 */
export function isDashboardSettings(data: unknown): data is DashboardSettings {
  if (typeof data !== 'object' || data === null) return false;

  const dashboard = data as DashboardSettings;

  if (!isDashboardLayout(dashboard.layout)) return false;
  if (dashboard.theme != null && !['light', 'dark', 'auto'].includes(dashboard.theme)) {
    return false;
  }

  return true;
}

/**
 * Type guard for WorkingHours
 */
export function isWorkingHours(data: unknown): data is WorkingHours {
  if (typeof data !== 'object' || data === null) return false;

  const hours = data as WorkingHours;

  // Basic validation for HH:mm format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return typeof hours.start === 'string' && timeRegex.test(hours.start) &&
         typeof hours.end === 'string' && timeRegex.test(hours.end);
}

/**
 * Type guard for CalendarSettings
 */
export function isCalendarSettings(data: unknown): data is CalendarSettings {
  if (typeof data !== 'object' || data === null) return false;

  const calendar = data as CalendarSettings;

  if (!['month', 'week', 'day', 'list'].includes(calendar.defaultView)) return false;
  if (![0, 1].includes(calendar.weekStartsOn)) return false;

  // Optional fields (use != null to handle both null and undefined)
  if (calendar.workingHours != null && !isWorkingHours(calendar.workingHours)) return false;
  if (calendar.holidays != null && !isStringArray(calendar.holidays)) return false;
  if (calendar.defaultReminders != null) {
    if (!Array.isArray(calendar.defaultReminders)) return false;
    if (!calendar.defaultReminders.every((reminder) => typeof reminder === 'number')) return false;
  }

  return true;
}

/**
 * Type guard for ProjectSettings
 */
export function isProjectSettings(data: unknown): data is ProjectSettings {
  if (typeof data !== 'object' || data === null) return false;

  const projects = data as ProjectSettings;

  if (!['list', 'detail', 'kanban'].includes(projects.defaultView)) return false;

  // Optional fields (use != null to handle both null and undefined)
  if (
    projects.sortBy != null &&
    !['name', 'date', 'status', 'priority'].includes(projects.sortBy)
  ) {
    return false;
  }

  if (projects.sortOrder != null && !['asc', 'desc'].includes(projects.sortOrder)) {
    return false;
  }

  if (projects.itemsPerPage != null && !isPositiveNumber(projects.itemsPerPage)) {
    return false;
  }

  return true;
}

/**
 * Type guard for NotificationSettings
 */
export function isNotificationSettings(data: unknown): data is NotificationSettings {
  if (typeof data !== 'object' || data === null) return false;

  const notifications = data as NotificationSettings;

  // All fields are optional booleans (use != null to handle both null and undefined)
  if (notifications.email != null && typeof notifications.email !== 'boolean') return false;
  if (notifications.push != null && typeof notifications.push !== 'boolean') return false;
  if (notifications.desktop != null && typeof notifications.desktop !== 'boolean') return false;
  if (notifications.sound != null && typeof notifications.sound !== 'boolean') return false;
  if (notifications.taskReminders != null && typeof notifications.taskReminders !== 'boolean') return false;
  if (notifications.eventReminders != null && typeof notifications.eventReminders !== 'boolean') return false;
  if (notifications.projectDeadlines != null && typeof notifications.projectDeadlines !== 'boolean') return false;

  return true;
}

/**
 * Type guard for UserPreferences
 */
export function isUserPreferences(data: unknown): data is UserPreferences {
  if (typeof data !== 'object' || data === null) return false;

  const prefs = data as UserPreferences;

  // Required fields
  if (!['ko', 'en'].includes(prefs.language)) return false;
  if (typeof prefs.timezone !== 'string' || !prefs.timezone) return false;

  // Optional fields (use != null to handle both null and undefined)
  if (prefs.dateFormat != null && typeof prefs.dateFormat !== 'string') return false;
  if (prefs.timeFormat != null && !['12', '24'].includes(prefs.timeFormat)) return false;
  if (prefs.currency != null && typeof prefs.currency !== 'string') return false;
  if (prefs.numberFormat != null && typeof prefs.numberFormat !== 'string') return false;

  return true;
}

/**
 * Type guard for Settings
 */
export function isSettings(data: unknown): data is Settings {
  if (typeof data !== 'object' || data === null) return false;

  const s = data as Settings;

  // Required fields
  if (!s.userId || typeof s.userId !== 'string') return false;
  if (!isValidISODate(s.updatedAt)) return false;

  // Required nested objects with full validation
  if (!isDashboardData(s.dashboard)) return false;
  if (!isCalendarSettings(s.calendar)) return false;
  if (!isProjectSettings(s.projects)) return false;
  if (!isNotificationSettings(s.notifications)) return false;
  if (!isUserPreferences(s.preferences)) return false;

  // Optional updated_by validation (use != null to handle both null and undefined)
  if (s.updated_by != null && typeof s.updated_by !== 'string') return false;

  return true;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial settings type for updates
 */
export type SettingsUpdate = Partial<Omit<Settings, 'userId'>>;
