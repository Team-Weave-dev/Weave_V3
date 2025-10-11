/**
 * Task Mock Data and Type Converters
 *
 * This file provides utilities for managing tasks and converting between
 * TodoTask (UI type) and Task (Storage API entity type).
 */

import type { TodoTask as WidgetTodoTask, TodoSection, TodoPriority } from '@/components/ui/widgets/todo-list/types';
import type { TodoTask as DashboardTodoTask } from '@/types/dashboard';
import type { Task, TaskCreate, TaskPriority, TaskStatus } from '@/lib/storage/types/entities/task';
import { taskService } from '@/lib/storage';

// ============================================================================
// Type Conversion Functions
// ============================================================================

/**
 * Priority 매핑: TodoPriority → TaskPriority
 */
const TODO_TO_TASK_PRIORITY: Record<TodoPriority, TaskPriority> = {
  'p1': 'urgent',
  'p2': 'high',
  'p3': 'medium',
  'p4': 'low',
};

/**
 * Priority 매핑: TaskPriority → TodoPriority
 */
const TASK_TO_TODO_PRIORITY: Record<TaskPriority, TodoPriority> = {
  'urgent': 'p1',
  'high': 'p2',
  'medium': 'p3',
  'low': 'p4',
};

/**
 * Convert DashboardTodoTask (Dashboard type) to Task (Storage API entity)
 *
 * @param todoTask - Dashboard type TodoTask
 * @param userId - Current user ID (default: '1')
 * @returns Task entity for Storage API
 */
export function toTask(todoTask: DashboardTodoTask, userId: string = '1'): Task {
  const status: TaskStatus = todoTask.completed ? 'completed' : 'pending';
  const priority: TaskPriority = TODO_TO_TASK_PRIORITY[todoTask.priority] || 'medium';

  // Section ID를 tag로 변환
  const tags: string[] = [];
  console.log(`[toTask] Converting TodoTask "${todoTask.title}" with sectionId: ${todoTask.sectionId}`);

  if (todoTask.sectionId) {
    tags.push(`section:${todoTask.sectionId}`);
    console.log(`[toTask] Added section tag: section:${todoTask.sectionId}`);
  }
  if (todoTask.depth > 0) {
    tags.push(`depth:${todoTask.depth}`);
  }
  if (todoTask.order !== undefined) {
    tags.push(`order:${todoTask.order}`);
  }

  // Children을 subtasks ID 배열로 변환
  const subtasks = todoTask.children?.map(child => child.id) || [];

  // 날짜 변환 헬퍼: Date 객체 또는 문자열을 ISO string으로 안전하게 변환
  const toISOString = (date: Date | string | undefined): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date; // 이미 문자열이면 그대로 반환
    if (date instanceof Date) return date.toISOString(); // Date 객체면 변환
    return undefined;
  };

  const task: Task & { sectionId?: string } = {
    id: todoTask.id,
    userId,
    title: todoTask.title,
    status,
    priority,
    dueDate: toISOString(todoTask.dueDate),
    completedAt: toISOString(todoTask.completedAt),
    createdAt: toISOString(todoTask.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentTaskId: todoTask.parentId,
    subtasks,
    tags,
    // sectionId를 별도 필드로도 추가 (TodoListWidget 필터링용)
    ...(todoTask.sectionId && { sectionId: todoTask.sectionId }),
  };

  console.log(`[toTask] Created Task with sectionId: ${task.sectionId} and tags:`, task.tags);
  return task as Task;
}

/**
 * Convert Task (Storage API entity) to TodoTask (Dashboard type)
 *
 * @param task - Storage API Task entity
 * @param children - Child DashboardTodoTasks (for recursive conversion)
 * @returns Dashboard type TodoTask
 */
export function toTodoTask(task: Task, children: DashboardTodoTask[] = []): DashboardTodoTask {
  const completed = task.status === 'completed';
  const priority: TodoPriority = TASK_TO_TODO_PRIORITY[task.priority] || 'p3';

  // sectionId 추출: 직접 필드 우선, tags 배열 폴백
  let sectionId: string | undefined = (task as any).sectionId;
  let depth = 0;
  let order = 0;

  // sectionId가 필드로 없으면 tags에서 추출
  if (task.tags) {
    for (const tag of task.tags) {
      if (!sectionId && tag.startsWith('section:')) {
        sectionId = tag.substring(8);
      } else if (tag.startsWith('depth:')) {
        depth = parseInt(tag.substring(6), 10) || 0;
      } else if (tag.startsWith('order:')) {
        order = parseInt(tag.substring(6), 10) || 0;
      }
    }
  }

  console.log(`[toTodoTask] Task "${task.title}" - sectionId from field: ${(task as any).sectionId}, extracted sectionId: ${sectionId}`);

  const todoTask: DashboardTodoTask = {
    id: task.id,
    title: task.title,
    completed,
    priority,
    depth,
    children,
    sectionId,
    parentId: task.parentTaskId,
    order,
    isExpanded: false, // 기본값
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(), // Dashboard TodoTask는 createdAt이 required
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
  };

  return todoTask;
}

// ============================================================================
// Legacy Migration
// ============================================================================

/**
 * Migrate legacy todo tasks from old localStorage to new Storage API
 *
 * Old keys:
 * - 'weave_dashboard_todo_tasks' → STORAGE_KEYS.TASKS
 * - 'weave_dashboard_todo_sections' → Keep in localStorage (sections are UI state)
 */
export async function migrateLegacyTodoTasks(): Promise<void> {
  const LEGACY_TASKS_KEY = 'weave_dashboard_todo_tasks';
  const LEGACY_SECTIONS_KEY = 'weave_dashboard_todo_sections';

  try {
    // 이미 마이그레이션 되었는지 확인
    const existingTasks = await taskService.getAll();
    if (existingTasks.length > 0) {
      console.log('✅ Tasks already migrated, skipping legacy migration');
      return;
    }

    // Legacy tasks 읽기
    const legacyTasksStr = localStorage.getItem(LEGACY_TASKS_KEY);
    if (!legacyTasksStr) {
      console.log('ℹ️ No legacy todo tasks found');
      return;
    }

    const legacyTasks: DashboardTodoTask[] = JSON.parse(legacyTasksStr);

    // Date 객체 복원 및 Dashboard TodoTask 타입으로 변환
    legacyTasks.forEach((task: any) => {
      task.createdAt = task.createdAt ? new Date(task.createdAt) : new Date(); // Dashboard TodoTask는 createdAt required
      task.completedAt = task.completedAt ? new Date(task.completedAt) : undefined;
      task.dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
      if (task.children) {
        task.children.forEach((child: any) => {
          child.createdAt = child.createdAt ? new Date(child.createdAt) : new Date();
          child.completedAt = child.completedAt ? new Date(child.completedAt) : undefined;
          child.dueDate = child.dueDate ? new Date(child.dueDate) : undefined;
        });
      }
    });

    console.log(`📦 Migrating ${legacyTasks.length} legacy todo tasks...`);

    // TodoTask → Task 변환 및 저장
    for (const todoTask of legacyTasks) {
      const task = toTask(todoTask);
      await taskService.create(task);

      // Children도 마이그레이션
      if (todoTask.children && todoTask.children.length > 0) {
        for (const child of todoTask.children) {
          const childTask = toTask(child);
          await taskService.create(childTask);
        }
      }
    }

    console.log(`✅ Successfully migrated ${legacyTasks.length} todo tasks`);
    console.log(`ℹ️ Sections remain in localStorage: ${LEGACY_SECTIONS_KEY}`);

  } catch (error) {
    console.error('❌ Failed to migrate legacy todo tasks:', error);
  }
}

// ============================================================================
// Storage API Wrapper Functions (async)
// ============================================================================

/**
 * Get all todo tasks (converts Task[] to DashboardTodoTask[])
 */
export async function getTodoTasks(): Promise<DashboardTodoTask[]> {
  // Legacy migration (once)
  await migrateLegacyTodoTasks();

  const tasks = await taskService.getAll();

  // Task[] → DashboardTodoTask[] 변환 (부모-자식 관계 고려)
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => taskMap.set(task.id, task));

  const todoTasks: DashboardTodoTask[] = [];

  for (const task of tasks) {
    // 부모 태스크만 먼저 변환
    if (!task.parentTaskId) {
      const children: DashboardTodoTask[] = [];

      // 자식 태스크 변환
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtaskId of task.subtasks) {
          const subtask = taskMap.get(subtaskId);
          if (subtask) {
            children.push(toTodoTask(subtask, []));
          }
        }
      }

      todoTasks.push(toTodoTask(task, children));
    }
  }

  return todoTasks;
}

/**
 * Add a new todo task
 */
export async function addTodoTask(todoTask: Omit<DashboardTodoTask, 'id'>): Promise<DashboardTodoTask> {
  const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: '1', // TODO: Get from auth context
    title: todoTask.title,
    status: todoTask.completed ? 'completed' : 'pending',
    priority: TODO_TO_TASK_PRIORITY[todoTask.priority] || 'medium',
    dueDate: todoTask.dueDate?.toISOString(),
    completedAt: todoTask.completedAt?.toISOString(),
    parentTaskId: todoTask.parentId,
    subtasks: todoTask.children?.map(c => c.id) || [],
    tags: todoTask.sectionId ? [`section:${todoTask.sectionId}`] : [],
  };

  const created = await taskService.create(task);
  return toTodoTask(created);
}

/**
 * Update an existing todo task
 */
export async function updateTodoTask(id: string, updates: Partial<DashboardTodoTask>): Promise<boolean> {
  const taskUpdates: Partial<Task> = {};

  if (updates.title !== undefined) taskUpdates.title = updates.title;
  if (updates.completed !== undefined) {
    taskUpdates.status = updates.completed ? 'completed' : 'pending';
    if (updates.completed) {
      taskUpdates.completedAt = new Date().toISOString();
    }
  }
  if (updates.priority !== undefined) {
    taskUpdates.priority = TODO_TO_TASK_PRIORITY[updates.priority];
  }
  if (updates.dueDate !== undefined) {
    taskUpdates.dueDate = updates.dueDate?.toISOString();
  }
  if (updates.sectionId !== undefined) {
    taskUpdates.tags = [`section:${updates.sectionId}`];
  }

  const updated = await taskService.update(id, taskUpdates);
  return updated !== null;
}

/**
 * Delete a todo task
 */
export async function deleteTodoTask(id: string): Promise<boolean> {
  return await taskService.delete(id);
}

/**
 * Save all todo tasks (incremental update)
 *
 * ✅ 개선된 방식: 기존 태스크와 비교하여 create/update/delete만 수행
 * ❌ 이전 방식: 모든 태스크를 삭제하고 재생성 (비효율적)
 */
export async function saveTodoTasks(todoTasks: DashboardTodoTask[]): Promise<void> {
  // 1. 기존 태스크 조회
  const existingTasks = await taskService.getAll();
  const existingTaskIds = new Set(existingTasks.map(t => t.id));

  // 2. 새로운 태스크 ID 세트
  const newTaskIds = new Set<string>();
  const allNewTasks: DashboardTodoTask[] = [];

  // 부모 태스크와 자식 태스크 모두 수집
  for (const todoTask of todoTasks) {
    allNewTasks.push(todoTask);
    newTaskIds.add(todoTask.id);

    if (todoTask.children && todoTask.children.length > 0) {
      for (const child of todoTask.children) {
        allNewTasks.push(child);
        newTaskIds.add(child.id);
      }
    }
  }

  // 3. 삭제할 태스크 (기존에는 있었지만 새로운 목록에는 없음)
  const tasksToDelete = existingTasks.filter(t => !newTaskIds.has(t.id));
  for (const task of tasksToDelete) {
    await taskService.delete(task.id);
  }

  // 4. 생성 또는 업데이트
  for (const todoTask of allNewTasks) {
    const task = toTask(todoTask);

    if (existingTaskIds.has(todoTask.id)) {
      // 기존 태스크 업데이트
      await taskService.update(todoTask.id, task);
    } else {
      // 새 태스크 생성
      await taskService.create(task);
    }
  }
}

/**
 * Clear all todo tasks
 */
export async function clearAllTodoTasks(): Promise<void> {
  const tasks = await taskService.getAll();
  for (const task of tasks) {
    await taskService.delete(task.id);
  }
}
