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
  type: 'stats' | 'chart' | 'quickActions' | 'progress' | 'list' | 'custom';
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