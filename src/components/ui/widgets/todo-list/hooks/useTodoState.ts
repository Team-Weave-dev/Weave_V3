import { useState, useCallback, useEffect, useMemo } from 'react';
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

  // Local storage hooks
  const [localTasks, setLocalTasks, clearTasks] = useLocalStorage<TodoTask[]>(
    STORAGE_KEY,
    initialData.tasks
  );
  
  const [sections, setSections, clearSections] = useLocalStorage<TodoSection[]>(
    SECTIONS_KEY,
    initialData.sections
  );
  
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
    setLocalTasks(prev => {
      const filtered = prev.filter(task => {
        if (task.id === taskId) {
          onTaskDelete?.(taskId);
          return false;
        }
        // Keep task but filter children
        if (task.children?.length) {
          task.children = task.children.filter(child => child.id !== taskId);
        }
        return true;
      });
      return filtered;
    });
  }, [setLocalTasks, onTaskDelete]);

  const handleAddTask = useCallback((title: string, sectionId?: string, parentId?: string, priority?: TodoPriority, dueDate?: Date) => {
    const newTask: TodoTask = {
      id: uuidv4(),
      title,
      completed: false,
      priority: priority || DEFAULT_PRIORITY,
      depth: parentId ? 1 : 0,
      children: [],
      sectionId: sectionId || sections[0]?.id || 'default',
      parentId,
      order: localTasks.filter(t => t.sectionId === sectionId && !t.parentId).length,
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
  }, [localTasks, sections, setLocalTasks, onTaskAdd]);

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<TodoTask>) => {
    setLocalTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        onTaskUpdate?.(taskId, updates);
        return updatedTask;
      }
      // Check children
      if (task.children?.length) {
        return {
          ...task,
          children: task.children.map(child =>
            child.id === taskId ? { ...child, ...updates } : child
          )
        };
      }
      return task;
    }));
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
    
    // 날짜 뷰에서 드롭한 경우 'date-' 접두사 제거
    let actualSectionId = targetSectionId;
    if (targetSectionId.startsWith('date-')) {
      // 날짜 뷰에서는 첫 번째 섹션으로 이동하거나 'default' 섹션으로 이동
      actualSectionId = sections[0]?.id || 'default';
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
  }, [draggedTask, sections, setLocalTasks]);

  // Date groups for date view
  const dateGroups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() + 7);
    
    return {
      today: localTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === today.getTime();
      }),
      tomorrow: localTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === tomorrow.getTime();
      }),
      thisWeek: localTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due > tomorrow && due <= thisWeek;
      }),
      overdue: localTasks.filter(t => {
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