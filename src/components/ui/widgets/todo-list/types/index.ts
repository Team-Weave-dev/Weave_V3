// TodoList 위젯 타입 정의

export type TodoPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type ViewMode = 'section' | 'date' | 'completed';

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  depth: number;
  children?: TodoTask[];
  sectionId?: string;
  parentId?: string;
  order: number;
  isExpanded?: boolean;
  createdAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
}

export interface TodoSection {
  id: string;
  name: string;
  order: number;
  isExpanded?: boolean;
}

export interface DateGroup {
  id: string;
  name: string;
  emoji: string;
  order: number;
  isExpanded: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  } | null;
  isOverdue?: boolean;
}

export interface TodoListWidgetProps {
  title?: string;
  tasks?: TodoTask[];
  onTaskAdd?: (task: Omit<TodoTask, 'id' | 'createdAt'>) => void;
  onTaskToggle?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TodoTask>) => void;
  defaultSize?: { w: number; h: number };
}