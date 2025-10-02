import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { useDragAndDrop } from './useDragAndDrop';
import type { TodoTask, TodoSection, TodoPriority, ViewMode } from '../types';
import {
  STORAGE_KEY,
  SECTIONS_KEY,
  VIEW_MODE_KEY,
  DEFAULT_PRIORITY
} from '../constants';
import { generateInitialData } from '../constants/mock-data';
import { notifyCalendarDataChanged, addCalendarDataChangedListener } from '@/lib/calendar-integration/events';

export function useTodoState(props?: {
  tasks?: TodoTask[],
  onTaskAdd?: (task: TodoTask) => void,
  onTaskToggle?: (id: string) => void,
  onTaskDelete?: (id: string) => void,
  onTaskUpdate?: (id: string, updates: Partial<TodoTask>) => void
}) {
  const { tasks: propsTasks, onTaskAdd, onTaskToggle, onTaskDelete, onTaskUpdate } = props || {};
  
  // Load initial data from localStorage or generate mock data
  const loadInitialData = useCallback(() => {
    // SSR check - return initial data on server
    if (typeof window === 'undefined') {
      console.log('SSR detected, returning initial data');
      return generateInitialData();
    }
    
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      const savedSections = localStorage.getItem(SECTIONS_KEY);
      
      console.log('LocalStorage savedTasks:', savedTasks);
      console.log('LocalStorage savedSections:', savedSections);
      
      if (savedTasks && savedSections && savedTasks !== '[]') {
        // Use saved data if available
        const parsedTasks = JSON.parse(savedTasks);
        const parsedSections = JSON.parse(savedSections);

        // Validate parsed data is array
        if (!Array.isArray(parsedTasks) || !Array.isArray(parsedSections)) {
          console.warn('Invalid data format in localStorage, generating initial data');
          return generateInitialData();
        }

        // Restore Date objects
        parsedTasks.forEach((task: any) => {
          task.createdAt = task.createdAt ? new Date(task.createdAt) : new Date();
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

        console.log('Returning saved data');
        return { tasks: parsedTasks, sections: parsedSections };
      } else {
        // Generate initial data
        console.log('Generating initial data');
        const initialData = generateInitialData();
        console.log('Generated initial data:', initialData);
        return initialData;
      }
    } catch (error) {
      console.error('Failed to load todo data from localStorage:', error);
      const initialData = generateInitialData();
      console.log('Generated initial data after error:', initialData);
      return initialData;
    }
  }, []);

  // Get initial data - prefer localStorage over props
  const getInitialData = useCallback(() => {
    // If props tasks are provided and not empty, use them
    if (propsTasks && propsTasks.length > 0) {
      console.log('Using tasks from props:', propsTasks);
      const sectionsFromTasks = Array.from(new Set(propsTasks.map(t => t.sectionId)))
        .filter(Boolean)
        .map((sectionId, index) => ({
          id: sectionId,
          name: sectionId,
          order: index,
          isExpanded: true
        }));
      return { tasks: propsTasks, sections: sectionsFromTasks };
    }
    
    // Otherwise, load from localStorage or generate initial data
    return loadInitialData();
  }, [propsTasks, loadInitialData]);

  // Initialize data once
  const initialData = useMemo(() => getInitialData(), []);

  // Custom serialization for Date objects
  const dateSerializer = {
    serialize: (value: TodoTask[]) => {
      console.log('[useTodoState] Serializing tasks:', value);
      return JSON.stringify(value);
    },
    deserialize: (value: string) => {
      const parsed = JSON.parse(value);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        parsed.forEach((task: any) => {
          if (task.createdAt) task.createdAt = new Date(task.createdAt);
          if (task.completedAt) task.completedAt = new Date(task.completedAt);
          if (task.dueDate) task.dueDate = new Date(task.dueDate);
          if (task.children) {
            task.children.forEach((child: any) => {
              if (child.createdAt) child.createdAt = new Date(child.createdAt);
              if (child.completedAt) child.completedAt = new Date(child.completedAt);
              if (child.dueDate) child.dueDate = new Date(child.dueDate);
            });
          }
        });
      }
      console.log('[useTodoState] Deserialized tasks:', parsed);
      return parsed;
    }
  };

  // Local storage hooks (Date는 ISO string으로 자동 변환됨)
  const [localTasks, setLocalTasks, clearTasks] = useLocalStorage<TodoTask[]>(
    STORAGE_KEY,
    initialData.tasks,
    dateSerializer
  );
  
  const [sectionsRaw, setSectionsRaw, clearSections] = useLocalStorage<TodoSection[]>(
    SECTIONS_KEY,
    initialData.sections
  );

  // Ensure sections is always an array (defensive programming)
  const sections = Array.isArray(sectionsRaw) ? sectionsRaw : initialData.sections;
  const setSections = useCallback((value: TodoSection[] | ((prev: TodoSection[]) => TodoSection[])) => {
    const newValue = value instanceof Function ? value(sections) : value;
    // Ensure we only set arrays
    if (Array.isArray(newValue)) {
      setSectionsRaw(newValue);
    }
  }, [sections, setSectionsRaw]);
  
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    VIEW_MODE_KEY,
    'section'
  );

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
    // 자기 자신의 삭제 타임스탬프 기록 (리스너가 무시하도록)
    const deleteTimestamp = Date.now();
    lastDeleteTimestamp.current = deleteTimestamp;

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
  // 타임스탬프를 사용하여 자기 자신의 이벤트와 외부 이벤트를 구분
  const lastDeleteTimestamp = useRef<number>(0);

  useEffect(() => {
    const unsubscribe = addCalendarDataChangedListener((event) => {
      const { source, changeType, itemId, timestamp } = event.detail;

      // 투두 소스의 이벤트만 처리
      if (source === 'todo' && itemId) {
        // 자기 자신이 방금 발생시킨 이벤트는 무시 (100ms 이내)
        if (Math.abs(timestamp - lastDeleteTimestamp.current) < 100) {
          return;
        }

        // 다른 위젯(캘린더)에서 발생한 변경사항만 처리
        // localStorage에서 최신 데이터 다시 로드
        try {
          const data = localStorage.getItem(STORAGE_KEY);
          if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              // Date 객체 복원
              parsed.forEach((task: any) => {
                task.createdAt = task.createdAt ? new Date(task.createdAt) : new Date();
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
              // 상태 업데이트
              setLocalTasks(parsed);
            }
          }
        } catch (error) {
          console.error('Failed to sync todo data from external change:', error);
        }
      }
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribe();
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