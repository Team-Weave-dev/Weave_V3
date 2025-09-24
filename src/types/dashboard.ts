// Dashboard Widget Types

export interface WidgetPosition {
  gridColumn: string;
  gridRow: string;
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  width: number;
  height: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'quickActions' | 'progress' | 'list' | 'custom' | 'projectSummary' | 'todoList';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  data?: any;
  style?: React.CSSProperties;
  isLocked?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  columns: number;
  widgets: Widget[];
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StatsData {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
  type?: 'line' | 'bar' | 'pie' | 'doughnut';
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

// 프로젝트 요약 위젯 인터페이스
export interface ProjectReview {
  id: string;
  projectId: string;
  projectName: string;
  client: string;
  pm: string;
  status: 'critical' | 'warning' | 'normal' | 'completed';
  statusLabel: string;
  progress: number;
  deadline: Date;
  daysRemaining: number;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  currentStatus: string;
  issues?: string[];
  nextActions?: string[];
}

export interface ProjectSummaryWidgetProps {
  projects: ProjectReview[];
  title?: string;
  lang?: 'ko' | 'en';
  onProjectClick?: (project: ProjectReview) => void;
}

// TodoList 위젯 인터페이스
export type TodoPriority = 'p1' | 'p2' | 'p3' | 'p4';

export interface TodoSection {
  id: string;
  name: string;
  order: number;
  isExpanded: boolean;
  color?: string;
  icon?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  parentId?: string;
  depth: number;
  children?: TodoTask[];
  sectionId?: string;
  order: number;
  isExpanded?: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface TodoListWidgetProps {
  title?: string;
  tasks?: TodoTask[];
  onTaskAdd?: (task: Omit<TodoTask, 'id' | 'createdAt'>) => void;
  onTaskToggle?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TodoTask>) => void;
}

// Calendar 위젯 인터페이스
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  color?: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  type?: 'meeting' | 'task' | 'reminder' | 'deadline' | 'holiday' | 'other';
}

export interface CalendarWidgetProps {
  title?: string;
  selectedDate?: Date;
  events?: CalendarEvent[];
  onDateSelect?: (date: Date | undefined) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventAdd?: (date: Date, event: Omit<CalendarEvent, 'id' | 'date'>) => void;
  onViewChange?: (view: 'month' | 'week' | 'day' | 'agenda') => void;
  showWeekNumbers?: boolean;
  showToday?: boolean;
  view?: 'month' | 'week' | 'day' | 'agenda';
  lang?: 'ko' | 'en';
}

// 세무 일정 위젯 인터페이스
export type TaxCategory = 
  | 'VAT'            // 부가가치세
  | 'income-tax'     // 소득세
  | 'corporate-tax'  // 법인세
  | 'local-tax'      // 지방세
  | 'withholding'    // 원천세
  | 'property-tax'   // 재산세
  | 'customs'        // 관세
  | 'other';         // 기타

export type TaxStatus = 
  | 'upcoming'       // 예정
  | 'urgent'         // 긴급 (D-3 이내)
  | 'overdue'        // 연체
  | 'completed'      // 완료
  | 'in-progress';   // 진행중

export interface TaxDeadline {
  id: string;
  title: string;                  // 세무 일정 이름
  category: TaxCategory;          // 세금 종류
  
  // 일정 정보
  deadlineDay: number;            // 마감일 (1-31)
  deadlineMonth?: number;         // 특정 월 (연간 일정용)
  frequency: 'monthly' | 'quarterly' | 'yearly';  // 반복 주기
  
  // 중요도 및 상태
  importance: 'critical' | 'high' | 'medium' | 'low';
  
  // 표시 정보
  description?: string;           // 간단한 설명
  taxPeriod?: string;            // 과세 기간 (예: "전월분", "1분기")
  note?: string;                 // 추가 안내사항
}

export interface TaxDeadlineWidgetProps {
  id?: string;
  title?: string;
  selectedMonth?: number;          // 선택된 월 (1-12, null은 전체)
  showOnlyUpcoming?: boolean;      // 다가오는 일정만 표시
  maxItems?: number;              // 표시할 최대 항목 수 (기본: 5)
  compactMode?: boolean;          // 컴팩트 모드 (1x1 크기용)
  categories?: TaxCategory[];     // 표시할 세금 카테고리
  highlightDays?: number;         // D-day 며칠 전부터 강조 (기본: 7)
  onDeadlineClick?: (deadline: TaxDeadline) => void;
  onMonthChange?: (month: number) => void;
  lang?: 'ko' | 'en';
}