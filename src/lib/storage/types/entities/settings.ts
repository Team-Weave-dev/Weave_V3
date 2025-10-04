/**
 * Settings Entity Type Definitions
 *
 * This file defines the Settings entity schema and related types.
 * Manages user preferences, dashboard layout, calendar config, and more.
 */

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
export type ProjectView = 'list' | 'grid' | 'kanban';

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

  /** Dashboard settings */
  dashboard: DashboardSettings;

  /** Calendar settings */
  calendar: CalendarSettings;

  /** Project settings */
  projects: ProjectSettings;

  /** Notification settings */
  notifications: NotificationSettings;

  /** User preferences */
  preferences: UserPreferences;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
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
 * Type guard for Settings
 */
export function isSettings(data: unknown): data is Settings {
  return (
    typeof data === 'object' &&
    data !== null &&
    'userId' in data &&
    typeof (data as Settings).userId === 'string' &&
    'dashboard' in data &&
    typeof (data as Settings).dashboard === 'object' &&
    'calendar' in data &&
    typeof (data as Settings).calendar === 'object' &&
    'projects' in data &&
    typeof (data as Settings).projects === 'object' &&
    'notifications' in data &&
    typeof (data as Settings).notifications === 'object' &&
    'preferences' in data &&
    typeof (data as Settings).preferences === 'object' &&
    'updatedAt' in data &&
    typeof (data as Settings).updatedAt === 'string'
  );
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial settings type for updates
 */
export type SettingsUpdate = Partial<Omit<Settings, 'userId'>>;
