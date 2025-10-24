import type { CalendarEvent } from '@/types/dashboard';

// Event type configuration
export const eventTypeConfig = {
  meeting: { 
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    badgeVariant: 'status-soft-info' as const,
    icon: 'Users',
    label: '회의'
  },
  task: { 
    color: 'bg-green-500',
    lightColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    badgeVariant: 'status-soft-success' as const,
    icon: 'CheckCircle2',
    label: '작업'
  },
  reminder: { 
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    badgeVariant: 'status-soft-warning' as const,
    icon: 'AlertCircle',
    label: '알림'
  },
  deadline: { 
    color: 'bg-red-500',
    lightColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    badgeVariant: 'status-soft-error' as const,
    icon: 'Clock',
    label: '마감'
  },
  holiday: { 
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    badgeVariant: 'status-soft-completed' as const,
    icon: 'CalendarDays',
    label: '휴일'
  },
  other: { 
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    badgeVariant: 'status-soft-planning' as const,
    icon: 'CalendarIcon',
    label: '기타'
  }
};

// View modes configuration
export const viewModes = [
  { value: 'month', label: '월', icon: 'Grid3x3' },
  { value: 'week', label: '주', icon: 'CalendarDays' },
  { value: 'day', label: '일', icon: 'CalendarIconOutline' },
  { value: 'agenda', label: '일정', icon: 'List' }
];

// Calendar settings interface
export interface CalendarSettings {
  weekStartsOn: 0 | 1; // 0: 일요일, 1: 월요일
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  showWeekNumbers: boolean;
  eventColors?: Record<string, string>;
  googleCalendarEnabled?: boolean;
  googleCalendarApiKey?: string;
  googleCalendarId?: string;
  notificationSettings?: {
    enabled: boolean;
    defaultReminderMinutes: number;
  };
}

// Google Calendar integration types
export interface GoogleCalendarConfig {
  apiKey: string;
  clientId: string;
  discoveryDocs: string[];
  scope: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  location?: string;
  recurrence?: string[];
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

// Props interfaces for subcomponents
export interface MiniEventProps {
  event: CalendarEvent;
  onClick?: () => void;
  displayMode?: 'dot' | 'compact' | 'bar' | 'full';
  isDragging?: boolean; // 드래그 중일 때 transition 비활성화
}

export interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export interface CalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateDoubleClick?: (date: Date, time?: string) => void;
  containerHeight?: number; // Optional - CSS height 사용 시 불필요
  containerWidth?: number;
  selectedDate?: Date;
  gridSize?: { w: number; h: number };
  weekStartsOn?: 0 | 1; // 주 시작일 설정
}

export type ViewMode = 'month' | 'week' | 'day' | 'agenda';