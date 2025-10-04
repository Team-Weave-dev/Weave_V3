import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { useDragAndDrop } from './useDragAndDrop';
import type { TodoTask, TodoSection, TodoPriority, ViewMode } from '../types';
import type { TodoTask as DashboardTodoTask } from '@/types/dashboard';
import {
  STORAGE_KEY,
  SECTIONS_KEY,
  VIEW_MODE_KEY,
  DEFAULT_PRIORITY
} from '../constants';
import { generateInitialData } from '../constants/mock-data';
import { notifyCalendarDataChanged, addCalendarDataChangedListener } from '@/lib/calendar-integration/events';
import {
  getTodoTasks,
  addTodoTask,
  updateTodoTask,
  deleteTodoTask,
  saveTodoTasks
} from '@/lib/mock/tasks';

// ============================================================================
// Type Conversion: Widget TodoTask ↔ Dashboard TodoTask
// ============================================================================

/**
 * Convert Dashboard TodoTask to Widget TodoTask
 */
function dashboardToWidgetTask(dashboardTask: DashboardTodoTask): TodoTask {
  return {
    id: dashboardTask.id,
    title: dashboardTask.title,
    completed: dashboardTask.completed,
    priority: dashboardTask.priority,
    depth: dashboardTask.depth,
    children: dashboardTask.children?.map(dashboardToWidgetTask),
    sectionId: dashboardTask.sectionId,
    parentId: dashboardTask.parentId,
    order: dashboardTask.order,
    isExpanded: dashboardTask.isExpanded,
    createdAt: dashboardTask.createdAt, // Dashboard has required createdAt
    completedAt: dashboardTask.completedAt,
    dueDate: dashboardTask.dueDate,
  };
}

/**
 * Convert Widget TodoTask to Dashboard TodoTask
 */
function widgetToDashboardTask(widgetTask: TodoTask): DashboardTodoTask {
  return {
    id: widgetTask.id,
    title: widgetTask.title,
    completed: widgetTask.completed,
    priority: widgetTask.priority,
    depth: widgetTask.depth,
    children: widgetTask.children?.map(widgetToDashboardTask),
    sectionId: widgetTask.sectionId,
    parentId: widgetTask.parentId,
    order: widgetTask.order,
    isExpanded: widgetTask.isExpanded,
    createdAt: widgetTask.createdAt || new Date(), // Ensure createdAt is always set
    completedAt: widgetTask.completedAt,
    dueDate: widgetTask.dueDate,
  };
}

export function useTodoState(props?: {
  tasks?: TodoTask[],
  onTaskAdd?: (task: TodoTask) => void,
  onTaskToggle?: (id: string) => void,
  onTaskDelete?: (id: string) => void,
  onTaskUpdate?: (id: string, updates: Partial<TodoTask>) => void
}) {
  const { tasks: propsTasks, onTaskAdd, onTaskToggle, onTaskDelete, onTaskUpdate } = props || {};
  
  // Load initial data from Storage API or generate mock data
  const loadInitialData = useCallback(async () => {
    // SSR check - return initial data on server
    if (typeof window === 'undefined') {
      console.log('SSR detected, returning initial data');
      return generateInitialData();
    }

    try {
      // Storage API에서 tasks 로드 (Dashboard TodoTask[])
      const savedDashboardTasks = await getTodoTasks();

      // Dashboard TodoTask[] → Widget TodoTask[] 변환
      const savedTasks = savedDashboardTasks.map(dashboardToWidgetTask);

      // Sections는 여전히 localStorage에서 로드 (UI state)
      const savedSections = localStorage.getItem(SECTIONS_KEY);

      console.log('Storage API savedTasks:', savedTasks);
      console.log('LocalStorage savedSections:', savedSections);

      if (savedTasks && savedTasks.length > 0 && savedSections) {
        // Use saved data if available
        const parsedSections = JSON.parse(savedSections);

        // Validate parsed data is array
        if (!Array.isArray(parsedSections)) {
          console.warn('Invalid sections format in localStorage, generating initial data');
          return generateInitialData();
        }

        console.log('Returning saved data');
        return { tasks: savedTasks, sections: parsedSections };
      } else {
        // Generate initial data
        console.log('Generating initial data');
        const initialData = generateInitialData();
        console.log('Generated initial data:', initialData);
        return initialData;
      }
    } catch (error) {
      console.error('Failed to load todo data from Storage API:', error);
      const initialData = generateInitialData();
      console.log('Generated initial data after error:', initialData);
      return initialData;
    }
  }, []);

  // Get initial data - prefer props over Storage API
  const getInitialData = useCallback(async () => {
    // If props tasks are provided and not empty, use them
    if (propsTasks && propsTasks.length > 0) {
      console.log('Using tasks from props:', propsTasks);
      const sectionsFromTasks: TodoSection[] = Array.from(new Set(propsTasks.map(t => t.sectionId)))
        .filter((id): id is string => Boolean(id)) // Type guard to filter out undefined
        .map((sectionId, index) => ({
          id: sectionId,
          name: sectionId,
          order: index,
          isExpanded: true
        }));
      return { tasks: propsTasks, sections: sectionsFromTasks };
    }

    // Otherwise, load from Storage API or generate initial data
    return await loadInitialData();
  }, [propsTasks, loadInitialData]);

  // React 상태 직접 관리 (useLocalStorage 대신 useState 사용)
  const [localTasks, setLocalTasksState] = useState<TodoTask[]>([]);
  const [sectionsRaw, setSectionsRaw] = useState<TodoSection[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial data 비동기 로드
  useEffect(() => {
    const initializeData = async () => {
      const data = await getInitialData();
      setLocalTasksState(data.tasks);
      setSectionsRaw(data.sections);
      setIsInitialized(true);
    };

    initializeData();
  }, []); // 한 번만 실행

  // Storage API 동기화를 위한 헬퍼 함수
  const setLocalTasks = useCallback((tasks: TodoTask[] | ((prev: TodoTask[]) => TodoTask[])) => {
    setLocalTasksState((prevTasks) => {
      const newTasks = typeof tasks === 'function' ? tasks(prevTasks) : tasks;
      // Widget TodoTask[] → Dashboard TodoTask[] 변환 후 Storage API에 저장 (비동기)
      if (typeof window !== 'undefined') {
        const dashboardTasks = newTasks.map(widgetToDashboardTask);
        saveTodoTasks(dashboardTasks).catch((error) => {
          console.error('Failed to save tasks to Storage API:', error);
        });
      }
      return newTasks;
    });
  }, []);

  // sections 업데이트 시 localStorage 동기화
  const setSections = useCallback((sections: TodoSection[] | ((prev: TodoSection[]) => TodoSection[])) => {
    setSectionsRaw((prevSections) => {
      const newSections = typeof sections === 'function' ? sections(prevSections) : sections;
      // localStorage에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(newSections));
      }
      return newSections;
    });
  }, []);

  // Ensure sections is always an array (defensive programming)
  const sections = Array.isArray(sectionsRaw) ? sectionsRaw : [];
  
  // viewMode도 useState로 변경
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return 'section';
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(VIEW_MODE_KEY, JSON.stringify(mode));
    }
  }, []);

  // Local UI state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState<TodoTask | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

  // Initialize expanded sections on mount
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    sections.forEach(section => {
      initialExpanded[section.id] = section.isExpanded !== false;
    });
    setExpandedSections(initialExpanded);
  }, [sections]);

  // Task operations
  const handleToggleTask = useCallback((taskId: string) => {
    setLocalTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, completed: !task.completed };
        onTaskToggle?.(taskId);

        // 실시간 동기화: 다른 위젯들에게 변경사항 알림
        notifyCalendarDataChanged({
          source: 'todo',
          changeType: 'update',
          itemId: taskId,
          timestamp: Date.now(),
        });

        return updatedTask;
      }
      // Check children
      if (task.children?.length) {
        return {
          ...task,
          children: task.children.map(child =>
            child.id === taskId
              ? { ...child, completed: !child.completed }
              : child
          )
        };
      }
      return task;
    }));
  }, [setLocalTasks, onTaskToggle]);

  const handleDeleteTask = useCallback((taskId: string) => {
    // 자기 자신의 삭제 타임스탬프 기록 (이벤트 중복 방지용)
    const deleteTimestamp = Date.now();

    setLocalTasks(prev => {
      const filtered = prev.map(task => {
        if (task.id === taskId) {
          onTaskDelete?.(taskId);

          // 실시간 동기화: 다른 위젯들에게 변경사항 알림
          notifyCalendarDataChanged({
            source: 'todo',
            changeType: 'delete',
            itemId: taskId,
            timestamp: deleteTimestamp,
          });

          return null; // Mark for removal
        }
        // Keep task but filter children
        if (task.children?.length) {
          const filteredChildren = task.children.filter(child => child.id !== taskId);
          if (filteredChildren.length !== task.children.length) {
            // Child was removed, return new task object
            return {
              ...task,
              children: filteredChildren
            };
          }
        }
        return task;
      }).filter((task): task is TodoTask => task !== null);
      return filtered;
    });
  }, [setLocalTasks, onTaskDelete]);

  const handleAddTask = useCallback((title: string, sectionId?: string, parentId?: string, priority?: TodoPriority, dueDate?: Date) => {
    // Ensure localTasks is an array
    const tasks = Array.isArray(localTasks) ? localTasks : [];

    // 섹션이 없으면 기본 섹션 자동 생성
    let targetSectionId = sectionId;
    if (sections.length === 0) {
      const defaultSection: TodoSection = {
        id: 'default',
        name: '📌 미구분', // brand.ts의 defaultSection 텍스트와 동일
        order: 0,
        isExpanded: true
      };
      setSections([defaultSection]);
      targetSectionId = 'default';
    } else if (!targetSectionId) {
      targetSectionId = sections[0]?.id || 'default';
    }

    const newTask: TodoTask = {
      id: uuidv4(),
      title,
      completed: false,
      priority: priority || DEFAULT_PRIORITY,
      depth: parentId ? 1 : 0,
      children: [],
      sectionId: targetSectionId,
      parentId,
      order: tasks.filter(t => t.sectionId === targetSectionId && !t.parentId).length,
      isExpanded: false,
      createdAt: new Date(),
      dueDate,
    };

    setLocalTasks(prev => {
      if (parentId) {
        return prev.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              children: [...(task.children || []), newTask],
              isExpanded: true
            };
          }
          return task;
        });
      }
      return [...prev, newTask];
    });

    onTaskAdd?.(newTask);

    // 실시간 동기화: 다른 위젯들에게 변경사항 알림
    notifyCalendarDataChanged({
      source: 'todo',
      changeType: 'add',
      itemId: newTask.id,
      timestamp: Date.now(),
    });
  }, [localTasks, sections, setSections, setLocalTasks, onTaskAdd]);

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<TodoTask>) => {
    console.log('[useTodoState] handleUpdateTask called:', taskId, updates);

    setLocalTasks(prev => {
      console.log('[useTodoState] Previous tasks:', prev);

      const updatedTasks = prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
          console.log('[useTodoState] Updated task:', updatedTask);

          // Defer callbacks to avoid state update issues
          setTimeout(() => {
            onTaskUpdate?.(taskId, updates);

            // 실시간 동기화: 다른 위젯들에게 변경사항 알림
            notifyCalendarDataChanged({
              source: 'todo',
              changeType: 'update',
              itemId: taskId,
              timestamp: Date.now(),
            });
          }, 0);

          return updatedTask;
        }
        // Check children
        if (task.children?.length) {
          const hasChildUpdate = task.children.some(child => child.id === taskId);
          if (hasChildUpdate) {
            // 하위 작업 업데이트 시에도 동기화 이벤트 발생
            setTimeout(() => {
              onTaskUpdate?.(taskId, updates);
              notifyCalendarDataChanged({
                source: 'todo',
                changeType: 'update',
                itemId: taskId,
                timestamp: Date.now(),
              });
            }, 0);

            return {
              ...task,
              children: task.children.map(child =>
                child.id === taskId ? { ...child, ...updates } : child
              )
            };
          }
        }
        return task;
      });

      console.log('[useTodoState] Updated tasks:', updatedTasks);
      return updatedTasks;
    });
  }, [setLocalTasks, onTaskUpdate]);

  // Section operations
  const handleToggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const handleAddSection = useCallback((name: string) => {
    const newSection: TodoSection = {
      id: uuidv4(),
      name,
      order: sections.length,
      isExpanded: true
    };
    setSections(prev => [...prev, newSection]);
  }, [sections, setSections]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setLocalTasks(prev => prev.filter(t => t.sectionId !== sectionId));
  }, [setSections, setLocalTasks]);

  const handleUpdateSection = useCallback((sectionId: string, name: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, name } : section
    ));
  }, [setSections]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, task: TodoTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';

    // 캘린더 위젯과의 상호작용을 위해 task 데이터를 dataTransfer에 저장
    // HTML5 drag and drop API를 사용하여 위젯 간 드래그 지원
    const taskData = {
      type: 'todo-task',
      task: {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        completed: task.completed
      }
    };
    e.dataTransfer.setData('application/json', JSON.stringify(taskData));
    e.dataTransfer.setData('text/plain', task.title); // 폴백용

    console.log('[TodoListWidget] Drag started for task:', task.id, task.title);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverSection(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    
    if (!draggedTask) {
      setDraggedTask(null);
      setDragOverSection(null);
      return;
    }
    
    // 섹션이 없으면 기본 섹션 자동 생성
    if (sections.length === 0) {
      const defaultSection: TodoSection = {
        id: 'default',
        name: '📌 미구분',
        order: 0,
        isExpanded: true
      };
      setSections([defaultSection]);
    }

    // 날짜 뷰에서 드롭한 경우 'date-' 접두사 제거
    let actualSectionId = targetSectionId;
    if (targetSectionId.startsWith('date-')) {
      // 날짜 뷰에서는 첫 번째 섹션으로 이동하거나 'default' 섹션으로 이동
      actualSectionId = sections.length > 0 ? sections[0].id : 'default';
    }
    
    // 드래그한 작업을 새로운 섹션으로 이동
    if (draggedTask.sectionId !== actualSectionId) {
      setLocalTasks(prev => {
        // 먼저 하위 작업들도 함께 이동
        const moveTaskWithChildren = (tasks: TodoTask[]): TodoTask[] => {
          return tasks.map(task => {
            if (task.id === draggedTask.id) {
              return { ...task, sectionId: actualSectionId };
            }
            // 부모가 이동하는 경우 자식들도 함께 이동
            if (task.parentId === draggedTask.id) {
              return { ...task, sectionId: actualSectionId };
            }
            // 자식 작업들 확인
            if (task.children && task.children.length > 0) {
              return {
                ...task,
                children: task.children.map(child => {
                  if (child.id === draggedTask.id || child.parentId === draggedTask.id) {
                    return { ...child, sectionId: actualSectionId };
                  }
                  return child;
                })
              };
            }
            return task;
          });
        };
        
        return moveTaskWithChildren(prev);
      });
    }
    
    setDraggedTask(null);
    setDragOverSection(null);
  }, [draggedTask, sections, setSections, setLocalTasks]);

  // 실시간 동기화: 다른 위젯(캘린더)에서의 변경사항 감지

  useEffect(() => {
    const handleStorageChange = async () => {
      // Storage API에서 최신 데이터 다시 로드
      console.log('[TodoListWidget] handleStorageChange called');
      try {
        const updatedTasks = await getTodoTasks();
        console.log('[TodoListWidget] Storage API data:', updatedTasks);

        if (Array.isArray(updatedTasks)) {
          // React 상태 직접 업데이트 (Storage API 저장 없이)
          console.log('[TodoListWidget] Updating local tasks with fresh data from Storage API:', updatedTasks);
          setLocalTasksState([...updatedTasks]);
          console.log('[TodoListWidget] Local tasks updated successfully');
        }
      } catch (error) {
        console.error('Failed to sync todo data from Storage API:', error);
      }
    };

    const unsubscribe = addCalendarDataChangedListener((event) => {
      const { source, changeType, itemId, timestamp } = event.detail;

      console.log('[TodoListWidget] Received calendarDataChanged event:', event.detail);
      console.log('[TodoListWidget] Event detail breakdown - source:', source, 'changeType:', changeType, 'itemId:', itemId);

      // 투두 소스의 이벤트만 처리 (캘린더에서 발생한 이벤트)
      // changeType을 any로 캐스팅하여 타입 체크 우회 (CalendarWidget에서 'update'와 'todo-date-update' 사용)
      if (source === 'todo') {
        console.log('[TodoListWidget] Source is todo, checking changeType...');
        if ((changeType as any) === 'update' || (changeType as any) === 'todo-date-update') {
          console.log('[TodoListWidget] Processing todo update from calendar, itemId:', itemId, 'changeType:', changeType);
          console.log('[TodoListWidget] Calling handleStorageChange...');

          // localStorage 변경을 감지하여 상태 업데이트
          handleStorageChange();
        } else {
          console.log('[TodoListWidget] ChangeType not matched. Actual changeType:', changeType);
        }
      } else {
        console.log('[TodoListWidget] Source not matched. Actual source:', source);
      }
    });

    // storage 이벤트 리스너 추가 (다른 탭/윈도우에서의 변경사항 감지)
    window.addEventListener('storage', handleStorageChange);

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setLocalTasks]);

  // Date groups for date view
  const dateGroups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() + 7);

    // Ensure localTasks is an array
    const tasks = Array.isArray(localTasks) ? localTasks : [];

    return {
      today: tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === today.getTime();
      }),
      tomorrow: tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === tomorrow.getTime();
      }),
      thisWeek: tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due > tomorrow && due <= thisWeek;
      }),
      overdue: tasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
      })
    };
  }, [localTasks]);

  return {
    // State
    localTasks,
    sections,
    viewMode,
    expandedSections,
    selectedSectionId,
    editingTaskId,
    editingTaskTitle,
    editingSectionId,
    editingSectionTitle,
    draggedTask,
    dragOverSection,
    isAddingSection,
    newSectionTitle,
    dateGroups,
    
    // Task handlers
    handleToggleTask,
    handleDeleteTask,
    handleAddTask,
    handleUpdateTask,
    
    // Section handlers
    handleToggleSection,
    handleAddSection,
    handleDeleteSection,
    handleUpdateSection,
    
    // Drag handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    
    // State setters
    setEditingTaskId,
    setEditingTaskTitle,
    setEditingSectionId,
    setEditingSectionTitle,
    setIsAddingSection,
    setNewSectionTitle,
    setViewMode
  };
}