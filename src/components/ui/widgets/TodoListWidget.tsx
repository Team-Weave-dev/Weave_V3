'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  GripVertical,
  Flag,
  MoreVertical,
  Edit2,
  FolderPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { TodoListWidgetProps, TodoTask, TodoSection, TodoPriority } from '@/types/dashboard';

// 우선순위 색상 매핑
const priorityColors: Record<TodoPriority, { badge: string; icon: string }> = {
  p1: { badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'text-red-500' },
  p2: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', icon: 'text-orange-500' },
  p3: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: 'text-blue-500' },
  p4: { badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: 'text-gray-400' }
};

export function TodoListWidget({ 
  title, 
  tasks = [], 
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
  onTaskUpdate
}: TodoListWidgetProps) {
  const displayTitle = title || getWidgetText.todoList.title('ko');
  const [localTasks, setLocalTasks] = useState<TodoTask[]>(tasks);
  const [sections, setSections] = useState<TodoSection[]>([
    { id: 'default', name: '기본', order: 0, isExpanded: true }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority>('p3');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [hoveringBetween, setHoveringBetween] = useState<{ afterId: string | null, sectionId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedTask, setDraggedTask] = useState<TodoTask | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'child' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 외부 tasks prop 변경 시 동기화
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // 새 작업 추가
  const handleAddTask = (sectionId: string = 'default', parentId?: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Omit<TodoTask, 'id' | 'createdAt'> = {
      title: newTaskTitle,
      completed: false,
      priority: selectedPriority,
      depth: parentId ? getTaskDepth(parentId) + 1 : 0,
      children: [],
      sectionId,
      parentId,
      order: localTasks.filter(t => t.sectionId === sectionId && !t.parentId).length,
      isExpanded: false
    };

    if (onTaskAdd) {
      onTaskAdd(newTask);
    } else {
      // 로컬 상태 관리 (데모용)
      const taskWithId: TodoTask = {
        ...newTask,
        id: `task-${Date.now()}`,
        createdAt: new Date()
      };
      
      if (parentId) {
        // 부모 작업에 자식으로 추가
        setLocalTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === parentId 
              ? { ...task, children: [...(task.children || []), taskWithId], isExpanded: true }
              : task
          )
        );
        setExpandedTasks(prev => new Set(prev).add(parentId));
      } else {
        setLocalTasks([...localTasks, taskWithId]);
      }
    }
    
    setNewTaskTitle('');
    setSelectedPriority('p3');
    setIsAdding(false);
    setAddingSectionId(null);
  };

  // 작업 깊이 계산
  const getTaskDepth = (taskId: string): number => {
    const task = localTasks.find(t => t.id === taskId);
    if (!task) return 0;
    if (task.parentId) {
      return getTaskDepth(task.parentId) + 1;
    }
    return task.depth || 0;
  };

  // 섹션 추가
  const handleAddSection = (name: string) => {
    const newSection: TodoSection = {
      id: `section-${Date.now()}`,
      name,
      order: sections.length,
      isExpanded: true
    };
    setSections([...sections, newSection]);
  };

  // 섹션 토글
  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  // 작업 완료 토글
  const handleToggleTask = (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    } else {
      // 로컬 상태 관리
      const toggleTaskRecursive = (tasks: TodoTask[]): TodoTask[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            const completed = !task.completed;
            return {
              ...task,
              completed,
              completedAt: completed ? new Date() : undefined,
              children: task.children?.map(child => ({ ...child, completed }))
            };
          }
          if (task.children) {
            return {
              ...task,
              children: toggleTaskRecursive(task.children)
            };
          }
          return task;
        });
      };
      
      setLocalTasks(toggleTaskRecursive(localTasks));
    }
  };

  // 작업 삭제
  const handleDeleteTask = (taskId: string) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    } else {
      // 로컬 상태 관리
      const deleteTaskRecursive = (tasks: TodoTask[]): TodoTask[] => {
        return tasks
          .filter(task => task.id !== taskId)
          .map(task => ({
            ...task,
            children: task.children ? deleteTaskRecursive(task.children) : []
          }));
      };
      
      setLocalTasks(deleteTaskRecursive(localTasks));
    }
  };

  // 작업 확장/축소 토글
  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
    
    setLocalTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, task: TodoTask) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Firefox 호환성
    
    // 드래그 이미지 스타일 설정
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, targetTask: TodoTask, position: 'before' | 'after' | 'child') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverTask(targetTask.id);
    setDragPosition(position);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverTask(null);
    setDragPosition(null);
    setIsDragging(false);
  };

  // 드롭
  const handleDrop = (e: React.DragEvent, targetTask: TodoTask | null, position: 'before' | 'after' | 'child', targetSectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || (targetTask && draggedTask.id === targetTask.id)) {
      handleDragEnd();
      return;
    }

    // 드래그된 작업을 모든 작업에서 제거하는 재귀 함수
    const removeFromAllTasks = (tasks: TodoTask[]): { found: TodoTask | null, updatedTasks: TodoTask[] } => {
      const result: TodoTask[] = [];
      let found: TodoTask | null = null;
      
      for (const task of tasks) {
        if (task.id === draggedTask.id) {
          found = { ...task }; // 복사본 생성
          continue; // 이 작업은 결과에 포함하지 않음 (제거)
        }
        
        const updatedTask = { ...task };
        if (task.children && task.children.length > 0) {
          const childResult = removeFromAllTasks(task.children);
          if (childResult.found && !found) {
            found = childResult.found;
          }
          updatedTask.children = childResult.updatedTasks;
        }
        result.push(updatedTask);
      }
      
      return { found, updatedTasks: result };
    };
    
    const { found: movedTask, updatedTasks: tasksAfterRemoval } = removeFromAllTasks(localTasks);
    
    if (!movedTask) {
      handleDragEnd();
      return;
    }

    // 섹션으로 직접 이동하는 경우 (섹션 영역에 드롭)
    if (!targetTask && targetSectionId) {
      const updatedTask: TodoTask = {
        ...movedTask,
        sectionId: targetSectionId,
        parentId: undefined,
        depth: 0,
        order: tasksAfterRemoval.filter(t => t.sectionId === targetSectionId && !t.parentId).length,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 sectionId도 업데이트
      const updateChildrenSection = (task: TodoTask, newSectionId: string): TodoTask => {
        return {
          ...task,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenSection(child, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenSection(updatedTask, targetSectionId);
      setLocalTasks([...tasksAfterRemoval, finalTask]);
    }
    // 타겟 위치에 추가
    else if (targetTask && position === 'child') {
      // 하위 작업으로 만들기
      const updatedTask: TodoTask = {
        ...movedTask,
        parentId: targetTask.id,
        depth: targetTask.depth + 1,
        sectionId: targetTask.sectionId,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 depth와 sectionId 업데이트
      const updateChildrenDepth = (task: TodoTask, baseDepth: number, newSectionId: string): TodoTask => {
        return {
          ...task,
          depth: baseDepth,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenDepth(child, baseDepth + 1, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenDepth(updatedTask, updatedTask.depth, targetTask.sectionId);
      
      const addAsChild = (tasks: TodoTask[]): TodoTask[] => {
        return tasks.map(task => {
          if (task.id === targetTask.id) {
            return {
              ...task,
              children: [...(task.children || []), finalTask],
              isExpanded: true
            };
          }
          if (task.children && task.children.length > 0) {
            return {
              ...task,
              children: addAsChild(task.children)
            };
          }
          return task;
        });
      };
      
      const finalTasks = addAsChild(tasksAfterRemoval);
      setLocalTasks(finalTasks);
      setExpandedTasks(prev => new Set(prev).add(targetTask.id));
    } else if (targetTask) {
      // 형제 작업으로 이동 (같은 레벨로 이동)
      const updatedTask: TodoTask = {
        ...movedTask,
        parentId: targetTask.parentId,
        depth: targetTask.depth,
        sectionId: targetTask.sectionId,
        children: movedTask.children || []
      };
      
      // 하위 태스크들의 depth와 sectionId 업데이트
      const updateChildrenDepth = (task: TodoTask, baseDepth: number, newSectionId: string): TodoTask => {
        return {
          ...task,
          depth: baseDepth,
          sectionId: newSectionId,
          children: task.children?.map(child => updateChildrenDepth(child, baseDepth + 1, newSectionId)) || []
        };
      };
      
      const finalTask = updateChildrenDepth(updatedTask, updatedTask.depth, targetTask.sectionId);
      
      // 타겟 작업을 찾아서 위치를 결정 (재귀적으로)
      const insertAtPosition = (tasks: TodoTask[], parentId?: string): TodoTask[] => {
        const result: TodoTask[] = [];
        
        for (const task of tasks) {
          if (task.id === targetTask.id) {
            if (position === 'before') {
              // 부모가 같은 경우에만 형제로 추가
              if (task.parentId === parentId) {
                result.push(finalTask);
                result.push(task);
              } else {
                result.push(task);
              }
            } else {
              result.push(task);
              if (task.parentId === parentId) {
                result.push(finalTask);
              }
            }
          } else {
            const updatedTask = { ...task };
            if (task.children && task.children.length > 0) {
              updatedTask.children = insertAtPosition(task.children, task.id);
            }
            result.push(updatedTask);
          }
        }
        
        return result;
      };
      
      const finalTasks = insertAtPosition(tasksAfterRemoval);
      setLocalTasks(finalTasks);
    }
    
    handleDragEnd();
  };

  // 작업 렌더링
  const renderTask = (task: TodoTask, index: number) => {
    const isExpanded = expandedTasks.has(task.id) || task.isExpanded;
    const hasChildren = task.children && task.children.length > 0;
    const isHoveringOver = draggedOverTask === task.id;

    return (
      <div key={task.id}>
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const height = rect.height;
            const relativeX = e.clientX - rect.left;
            const indent = task.depth * 24 + 40; // 현재 들여쓰기 + 여유공간
            
            // X 좌표를 고려한 더 정밀한 위치 계산
            let position: 'before' | 'after' | 'child';
            if (y < height * 0.25) {
              position = 'before';
            } else if (y > height * 0.75) {
              position = 'after';
            } else {
              // 중간 영역에서는 X 좌표로 child 여부 결정
              // 더 오른쪽에 있을수록 child가 될 가능성이 높음
              position = relativeX > indent ? 'child' : 'after';
            }
            
            handleDragOver(e, task, position);
          }}
          onDrop={(e) => {
            if (dragPosition) {
              handleDrop(e, task, dragPosition);
            }
          }}
          onDragLeave={(e) => {
            // 다른 요소로 이동할 때 시각적 피드백 제거
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDraggedOverTask(null);
              setDragPosition(null);
            }
          }}
          className={cn(
            "group flex items-center gap-1 py-1.5 px-1 rounded transition-all relative",
            "hover:bg-gray-50 dark:hover:bg-gray-900/50",
            draggedTask?.id === task.id && "opacity-40 bg-gray-100 dark:bg-gray-800",
            isHoveringOver && dragPosition === 'before' && "before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-primary before:rounded",
            isHoveringOver && dragPosition === 'after' && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary after:rounded",
            isHoveringOver && dragPosition === 'child' && "bg-primary/10 border-l-2 border-primary ml-4"
          )}
          style={{ paddingLeft: `${task.depth * 24 + 4}px` }}
        >
          {/* 드래그 핸들 */}
          <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0" />
          
          {/* 확장/축소 버튼 */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(task.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded flex-shrink-0"
            >
              {isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
            </button>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          
          {/* 체크박스 */}
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleTask(task.id)}
            className="flex-shrink-0"
          />
          
          {/* 작업 내용 */}
          <div className="flex-1 min-w-0">
            <span className={cn(
              "text-sm",
              task.completed && "line-through text-gray-400"
            )}>
              {task.title}
            </span>
          </div>
          
          {/* 우선순위 표시 */}
          {task.priority !== 'p4' && (
            <Flag className={cn("h-3 w-3 flex-shrink-0", priorityColors[task.priority].icon)} />
          )}
          
          {/* 삭제 버튼 */}
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
        
        {/* 자식 작업들 */}
        {hasChildren && isExpanded && (
          <div>
            {task.children!.map((child, idx) => renderTask(child, idx))}
          </div>
        )}
      </div>
    );
  };

  // 섹션별로 작업 그룹화
  const getTasksBySection = (sectionId: string) => {
    return localTasks.filter(task => (task.sectionId || 'default') === sectionId && !task.parentId);
  };

  // 섹션 렌더링
  const renderSection = (section: TodoSection) => {
    const sectionTasks = getTasksBySection(section.id);
    const isExpanded = section.isExpanded;
    
    return (
      <div key={section.id} className="mb-2">
        {/* 섹션 헤더 */}
        {section.id !== 'default' && (
          <div className="flex items-center gap-1 px-1 py-1 group">
            <button
              onClick={() => toggleSection(section.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
            >
              {isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
            </button>
            
            {editingSection === section.id ? (
              <Input
                defaultValue={section.name}
                onBlur={(e) => {
                  setSections(prev => prev.map(s => 
                    s.id === section.id ? { ...s, name: e.target.value } : s
                  ));
                  setEditingSection(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSections(prev => prev.map(s => 
                      s.id === section.id ? { ...s, name: e.currentTarget.value } : s
                    ));
                    setEditingSection(null);
                  }
                }}
                className="h-6 text-sm font-medium flex-1"
                autoFocus
              />
            ) : (
              <div 
                className="flex-1 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer"
                onClick={() => setEditingSection(section.id)}
              >
                {section.name}
              </div>
            )}
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={() => setEditingSection(section.id)}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  setAddingSectionId(section.id);
                  setIsAdding(true);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* 섹션 작업들 */}
        {isExpanded && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedTask) {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedTask && sectionTasks.length === 0) {
                handleDrop(e, null, 'before', section.id);
              }
            }}
            className={cn(
              "min-h-[40px] relative transition-all",
              draggedTask && sectionTasks.length === 0 && "bg-primary/5 border-2 border-dashed border-primary/20 rounded p-2"
            )}
          >
            {/* 섹션 내 작업 추가 입력 - default 섹션이 아닐 때만 표시 */}
            {isAdding && addingSectionId === section.id && section.id !== 'default' && (
              <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded mb-1">
                <Input
                  ref={inputRef}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask(section.id);
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setAddingSectionId(null);
                    }
                  }}
                  placeholder={getWidgetText.todoList.placeholder('ko')}
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
                
                {/* 우선순위 선택 */}
                <div className="flex gap-0.5">
                  {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setSelectedPriority(priority)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        selectedPriority === priority 
                          ? "bg-primary/10" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-800"
                      )}
                    >
                      <Flag className={cn("h-3 w-3", priorityColors[priority].icon)} />
                    </button>
                  ))}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleAddTask(section.id)}
                  className="h-7 px-2 text-xs"
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setAddingSectionId(null);
                    setNewTaskTitle('');
                    setSelectedPriority('p3');
                  }}
                  className="h-7 px-2 text-xs"
                >
                  취소
                </Button>
              </div>
            )}
            
            {sectionTasks.length === 0 && draggedTask && (
              <div className="text-center py-2 text-xs text-primary animate-pulse">
                여기에 드롭하여 이동
              </div>
            )}
            {sectionTasks.map((task, index) => renderTask(task, index))}
          </div>
        )}
        
        {/* 섹션 사이 호버 영역 (새 섹션 추가) */}
        {!isAddingSection ? (
          <div className="h-8 group">
            <button
              className="w-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1"
              onClick={() => setIsAddingSection(true)}
            >
              <FolderPlus className="h-3 w-3" />
              <span>새 섹션 추가</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-1 p-2 bg-gray-50 dark:bg-gray-900/50 rounded mb-2">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSectionName.trim()) {
                  handleAddSection(newSectionName);
                  setNewSectionName('');
                  setIsAddingSection(false);
                }
                if (e.key === 'Escape') {
                  setNewSectionName('');
                  setIsAddingSection(false);
                }
              }}
              placeholder="섹션 이름 입력..."
              className="flex-1 h-7 text-sm"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => {
                if (newSectionName.trim()) {
                  handleAddSection(newSectionName);
                  setNewSectionName('');
                  setIsAddingSection(false);
                }
              }}
              className="h-7 px-2 text-xs"
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewSectionName('');
                setIsAddingSection(false);
              }}
              className="h-7 px-2 text-xs"
            >
              취소
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn(
      "h-full flex flex-col overflow-hidden transition-all",
      isDragging && "shadow-lg"
    )}>
      <CardHeader>
        <CardTitle className={cn(typography.widget.title, "flex items-center justify-between")}>
          <span>{displayTitle}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(true);
              setAddingSectionId('default');
            }}
            className="h-6 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </CardTitle>
        <CardDescription className={typography.text.description}>
          {getWidgetText.todoList.description('ko')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1">
            <div className="space-y-2 px-3">
              {/* 기본 섹션 작업 추가 - 상단에 한 번만 표시 */}
              {isAdding && addingSectionId === 'default' && sections[0]?.id === 'default' && (
          <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900/50 rounded mb-2">
            <Input
              ref={inputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask('default');
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setAddingSectionId(null);
                }
              }}
              placeholder={getWidgetText.todoList.placeholder('ko')}
              className="flex-1 h-7 text-sm"
              autoFocus
            />
            
            {/* 우선순위 선택 */}
            <div className="flex gap-0.5">
              {(['p1', 'p2', 'p3', 'p4'] as TodoPriority[]).map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={cn(
                    "p-1 rounded transition-colors",
                    selectedPriority === priority 
                      ? "bg-primary/10" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-800"
                  )}
                >
                  <Flag className={cn("h-3 w-3", priorityColors[priority].icon)} />
                </button>
              ))}
            </div>
            
            <Button
              size="sm"
              onClick={() => handleAddTask('default')}
              className="h-7 px-2 text-xs"
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setAddingSectionId(null);
                setNewTaskTitle('');
                setSelectedPriority('p3');
              }}
              className="h-7 px-2 text-xs"
            >
              취소
            </Button>
          </div>
        )}
        
              {/* 섹션별 렌더링 */}
              {sections.map(section => renderSection(section))}
              
              {/* 작업이 없을 때 */}
              {localTasks.length === 0 && !isAdding && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">{getWidgetText.todoList.noTasks('ko')}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}