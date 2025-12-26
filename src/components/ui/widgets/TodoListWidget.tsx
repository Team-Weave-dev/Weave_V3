'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  List,
  Calendar as CalendarIcon,
  Clock,
  FolderPlus,
  Settings
} from 'lucide-react';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
// TodoListWidgetProps는 로컬 타입에서 import
import type { TodoListWidgetProps, TodoTask, TodoSection, TodoPriority, TodoListOptions } from './todo-list/types';

// 리팩토링된 컴포넌트들 import
import { TodoTask as TodoTaskComponent } from './todo-list/components/TodoTask';
import { TodoSection as TodoSectionComponent } from './todo-list/components/TodoSection';
import { TodoDateGroup } from './todo-list/components/TodoDateGroup';
import { AddTaskInput } from './todo-list/components/AddTaskInput';
import { TodoOptionsModal } from './todo-list/components/TodoOptionsModal';

// 리팩토링된 훅들 import
import { useTodoState } from './todo-list/hooks/useTodoState';

// 상수들 import
import {
  OPTIONS_KEY,
  DEFAULT_OPTIONS,
  getDateGroups
} from './todo-list/constants';

// 유틸리티 함수들 import
import {
  startOfDay,
  addDays
} from './todo-list/utils/date';

export function TodoListWidget({ 
  title, 
  tasks = [], 
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
  onTaskUpdate,
  defaultSize: _defaultSize = { w: 4, h: 4 }
}: TodoListWidgetProps & { defaultSize?: { w: number; h: number } }) {
  const displayTitle = title || getWidgetText.todoList.title('ko');
  
  // 중앙화된 상태 관리 훅 사용
  const {
    localTasks,
    sections,
    viewMode,
    expandedSections,
    selectedSectionId: _selectedSectionId,
    editingTaskId: _editingTaskId,
    editingTaskTitle: _editingTaskTitle,
    editingSectionId: _editingSectionId,
    editingSectionTitle: _editingSectionTitle,
    draggedTask,
    dragOverSection: _dragOverSection,
    isAddingSection,
    newSectionTitle,
    dateGroups: _dateGroups,
    
    handleToggleTask,
    handleDeleteTask,
    handleAddTask,
    handleUpdateTask,
    
    handleToggleSection,
    handleAddSection,
    handleDeleteSection,
    handleUpdateSection,
    
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    
    setEditingTaskId: _setEditingTaskId,
    setEditingTaskTitle: _setEditingTaskTitle,
    setEditingSectionId: _setEditingSectionId,
    setEditingSectionTitle: _setEditingSectionTitle,
    setIsAddingSection,
    setNewSectionTitle,
    setViewMode
  } = useTodoState({
    tasks,
    onTaskAdd,
    onTaskToggle,
    onTaskDelete,
    onTaskUpdate
  });

  // UI 상태
  const [_isAdding, setIsAdding] = useState(false);
  const [addingSectionId, setAddingSectionId] = useState<string | null>(null);
  const [addingDateGroupId, setAddingDateGroupId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority>('p3');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const _inputRef = useRef<HTMLInputElement>(null);
  
  // 옵션 설정 상태
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [options, setOptions] = useState<TodoListOptions>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(OPTIONS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_e) {
          return DEFAULT_OPTIONS;
        }
      }
    }
    return DEFAULT_OPTIONS;
  });

  // 날짜 그룹 관련
  const [dateGroupsState, setDateGroupsState] = useState(getDateGroups());
  
  // 옵션 저장 함수
  const handleSaveOptions = useCallback((newOptions: TodoListOptions) => {
    setOptions(newOptions);
    localStorage.setItem(OPTIONS_KEY, JSON.stringify(newOptions));
    
    // 하위 태스크 표시 설정에 따라 모든 태스크 상태 업데이트
    if (newOptions.subtaskDisplay === 'expanded') {
      const allTaskIds = new Set<string>();
      const collectTaskIds = (tasks: TodoTask[]) => {
        tasks.forEach(task => {
          if (task.children && task.children.length > 0) {
            allTaskIds.add(task.id);
          }
          if (task.children) {
            collectTaskIds(task.children);
          }
        });
      };
      collectTaskIds(localTasks);
      setExpandedTasks(allTaskIds);
    } else if (newOptions.subtaskDisplay === 'collapsed') {
      setExpandedTasks(new Set());
    }
  }, [localTasks]);

  // 섹션별로 작업 가져오기
  const getTasksBySection = useCallback((sectionId: string) => {
    // Ensure localTasks is an array
    const tasks = Array.isArray(localTasks) ? localTasks : [];
    return tasks.filter(task => task.sectionId === sectionId && !task.parentId);
  }, [localTasks]);

  // 날짜별로 작업 그룹화
  const getTasksByDateGroup = useCallback((group: any) => {
    const today = startOfDay(new Date());
    const result: TodoTask[] = [];

    const collectTasks = (tasks: TodoTask[]) => {
      // Ensure tasks is an array
      if (!Array.isArray(tasks)) return;

      tasks.forEach(task => {
        if (!task.completed) {
          let shouldInclude = false;

          if (group.id === 'overdue') {
            shouldInclude = !!(task.dueDate && startOfDay(task.dueDate) < today);
          } else if (group.dateRange) {
            shouldInclude = !!(task.dueDate &&
                           task.dueDate >= group.dateRange.start &&
                           task.dueDate <= group.dateRange.end);
          }

          if (shouldInclude) {
            result.push({
              ...task,
              depth: 0,
              parentId: undefined,
              children: []
            });
          }
        }

        if (task.children && task.children.length > 0) {
          collectTasks(task.children);
        }
      });
    };

    collectTasks(localTasks);

    return result.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [localTasks]);

  // 완료된 작업 가져오기
  const getCompletedTasks = useCallback(() => {
    const result: TodoTask[] = [];

    const collectCompletedTasks = (tasks: TodoTask[]) => {
      // Ensure tasks is an array
      if (!Array.isArray(tasks)) return;

      tasks.forEach(task => {
        if (task.completed) {
          result.push(task);
        }
        if (task.children && task.children.length > 0) {
          collectCompletedTasks(task.children);
        }
      });
    };
    
    collectCompletedTasks(localTasks);
    return result;
  }, [localTasks]);

  // 새 작업 추가 핸들러
  const _handleAddNewTask = useCallback((sectionId: string = 'default', parentId?: string) => {
    if (!newTaskTitle.trim()) return;

    handleAddTask(newTaskTitle, sectionId, parentId, selectedPriority, selectedDueDate);
    
    setNewTaskTitle('');
    setSelectedPriority('p3');
    setSelectedDueDate(undefined);
    setIsAdding(false);
    setAddingSectionId(null);
  }, [newTaskTitle, selectedPriority, selectedDueDate, handleAddTask]);

  // 작업 확장/축소 토글
  const toggleExpanded = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
    
    handleUpdateTask(taskId, { isExpanded: !expandedTasks.has(taskId) });
  }, [handleUpdateTask, expandedTasks]);

  // 날짜 그룹 토글
  const toggleDateGroup = useCallback((groupId: string) => {
    setDateGroupsState(prev => prev.map(g => 
      g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
    ));
  }, []);

  // 뷰 모드별 렌더링
  const renderContent = () => {
    switch (viewMode) {
      case 'date':
        // 날짜 뷰 빈 상태 체크
        const hasAnyDateTasks = dateGroupsState.some(group =>
          getTasksByDateGroup(group).length > 0
        );

        if (!hasAnyDateTasks) {
          return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <CalendarIcon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {getWidgetText.todoList.emptyState.title('ko')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                {getWidgetText.todoList.emptyState.description('ko')}
              </p>
              <Button
                onClick={() => {
                  setViewMode('section');
                  setTimeout(() => setAddingSectionId(sections[0]?.id || 'default'), 100);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {getWidgetText.todoList.addTask('ko')}
              </Button>
            </div>
          );
        }

        return (
          <div>
            {dateGroupsState.map(group => {
              const groupTasks = getTasksByDateGroup(group);
              return (
                <TodoDateGroup
                  key={group.id}
                  group={group}
                  tasks={groupTasks}
                  isExpanded={group.isExpanded}
                  onToggleExpand={() => toggleDateGroup(group.id)}
                  onAddTask={() => {
                    // 날짜 그룹에 따라 기본 마감일 설정
                    let dueDate: Date | undefined;
                    if (group.id === 'today') {
                      dueDate = new Date();
                    } else if (group.id === 'tomorrow') {
                      dueDate = addDays(new Date(), 1);
                    } else if (group.id === 'this_week') {
                      dueDate = addDays(new Date(), 3);
                    } else if (group.id === 'next_week') {
                      dueDate = addDays(new Date(), 10);
                    }
                    setSelectedDueDate(dueDate);
                    setAddingDateGroupId(group.id);
                    setNewTaskTitle('');
                    setSelectedPriority('p3');
                  }}
                  onDragOver={(e) => handleDragOver(e, 'date-' + group.id)}
                  onDrop={(e) => handleDrop(e, 'date-' + group.id)}
                >
                  {groupTasks.map(task => (
                    <TodoTaskComponent
                      key={task.id}
                      task={task}
                      depth={task.depth || 0}
                      isExpanded={expandedTasks.has(task.id)}
                      isDragging={draggedTask?.id === task.id}
                      dateFormat={options.dateFormat}
                      onToggleComplete={() => handleToggleTask(task.id)}
                      onToggleExpand={() => toggleExpanded(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onUpdateDueDate={(taskId, dueDate) => handleUpdateTask(taskId, { dueDate })}
                      onUpdatePriority={(taskId, priority) => handleUpdateTask(taskId, { priority })}
                      onUpdateTitle={(taskId, title) => handleUpdateTask(taskId, { title })}
                      onAddSubtask={(parentId, title, priority, dueDate) => handleAddTask(title, task.sectionId || 'default', parentId, priority, dueDate)}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, task.sectionId || sections[0]?.id || 'default')}
                    />
                  ))}
                  {/* 날짜 그룹 내 작업 추가 입력 */}
                  {addingDateGroupId === group.id && (
                    <div className="mt-2 mb-4">
                      <AddTaskInput
                        value={newTaskTitle}
                        onChange={setNewTaskTitle}
                        onSubmit={(title, priority, dueDate) => {
                          handleAddTask(title, sections[0]?.id || 'default', undefined, priority, dueDate);
                          setAddingDateGroupId(null);
                          setNewTaskTitle('');
                          setSelectedPriority('p3');
                          setSelectedDueDate(undefined);
                        }}
                        onCancel={() => {
                          setAddingDateGroupId(null);
                          setNewTaskTitle('');
                          setSelectedPriority('p3');
                          setSelectedDueDate(undefined);
                        }}
                        priority={selectedPriority}
                        onPriorityChange={setSelectedPriority}
                        dueDate={selectedDueDate}
                        onDueDateChange={setSelectedDueDate}
                        autoFocus
                      />
                    </div>
                  )}
                </TodoDateGroup>
              );
            })}
          </div>
        );
        
      case 'completed':
        const completedTasks = getCompletedTasks();
        return (
          <div className="space-y-2">
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TodoTaskComponent
                  key={task.id}
                  task={task}
                  depth={task.depth || 0}
                  isExpanded={expandedTasks.has(task.id)}
                  isDragging={draggedTask?.id === task.id}
                  dateFormat={options.dateFormat}
                  onToggleComplete={() => handleToggleTask(task.id)}
                  onToggleExpand={() => toggleExpanded(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onUpdateDueDate={(taskId, dueDate) => handleUpdateTask(taskId, { dueDate })}
                  onUpdatePriority={(taskId, priority) => handleUpdateTask(taskId, { priority })}
                  onUpdateTitle={(taskId, title) => handleUpdateTask(taskId, { title })}
                  onAddSubtask={(parentId, title, priority, dueDate) => handleAddTask(title, task.sectionId || 'default', parentId, priority, dueDate)}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, task.sectionId || sections[0]?.id || 'default')}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {getWidgetText.todoList.noCompletedTasks('ko')}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  완료한 작업이 여기에 표시됩니다
                </p>
              </div>
            )}
          </div>
        );
        
      default: // section view
        // 섹션이 하나도 없을 때만 빈 상태 UI 표시
        if (sections.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <List className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {getWidgetText.todoList.emptyState.title('ko')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm whitespace-pre-line">
                {getWidgetText.todoList.emptyState.description('ko')}
              </p>
              <Button
                onClick={() => {
                  // 기본 섹션 생성하고 작업 추가 모드 활성화
                  const defaultSection: TodoSection = {
                    id: 'default',
                    name: '📌 미구분',
                    order: 0,
                    isExpanded: true
                  };
                  handleAddSection(defaultSection.name);
                  setTimeout(() => setAddingSectionId('default'), 100);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {getWidgetText.todoList.addTask('ko')}
              </Button>
              <p className="text-xs text-muted-foreground mt-4 whitespace-pre-line leading-relaxed">
                {getWidgetText.todoList.emptyState.actionHint('ko')}
              </p>
            </div>
          );
        }

        return (
          <div>
            {sections.map((section, sectionIndex) => {
              const sectionTasks = getTasksBySection(section.id);
              return (
                <div key={section.id} className={addingSectionId === sections[sectionIndex - 1]?.id ? "mt-0" : ""}>
                  {/* 섹션 사이 호버 영역 (첫 번째 섹션 제외) */}
                  {sectionIndex > 0 && !isAddingSection && addingSectionId !== sections[sectionIndex - 1].id && (
                    <div className="h-4 group relative">
                      <button
                        onClick={() => {
                          setIsAddingSection(true);
                          setAddingSectionId(`before-${section.id}`);
                        }}
                        className="absolute inset-x-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center gap-2 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                          <FolderPlus className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">새 섹션 추가</span>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {/* 섹션 추가 입력 (해당 위치에) */}
                  {isAddingSection && addingSectionId === `before-${section.id}` && (
                    <div className="flex gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 rounded mb-3 mt-3">
                      <FolderPlus className="h-4 w-4 text-muted-foreground mt-1.5 flex-shrink-0" />
                      <Input
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSectionTitle.trim()) {
                            handleAddSection(newSectionTitle);
                            setNewSectionTitle('');
                            setIsAddingSection(false);
                            setAddingSectionId(null);
                          }
                          if (e.key === 'Escape') {
                            setIsAddingSection(false);
                            setAddingSectionId(null);
                            setNewSectionTitle('');
                          }
                        }}
                        placeholder="새 섹션 이름"
                        className="flex-1 h-7 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newSectionTitle.trim()) {
                            handleAddSection(newSectionTitle);
                            setNewSectionTitle('');
                            setIsAddingSection(false);
                            setAddingSectionId(null);
                          }
                        }}
                        className="h-7 px-2 text-xs flex-shrink-0"
                      >
                        추가
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsAddingSection(false);
                          setAddingSectionId(null);
                          setNewSectionTitle('');
                        }}
                        className="h-7 px-2 text-xs flex-shrink-0"
                      >
                        취소
                      </Button>
                    </div>
                  )}
                  
                  <TodoSectionComponent
                    section={section}
                    tasks={sectionTasks}
                    isExpanded={expandedSections[section.id] !== false}
                    onToggleExpand={() => handleToggleSection(section.id)}
                    onAddTask={() => setAddingSectionId(section.id)}
                    onUpdateSection={(sectionId, name) => handleUpdateSection(sectionId, name)}
                    onDeleteSection={handleDeleteSection}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDrop={(e) => handleDrop(e, section.id)}
                  >
                  {sectionTasks.map(task => (
                    <React.Fragment key={task.id}>
                      <TodoTaskComponent
                        task={task}
                        depth={task.depth || 0}
                        isExpanded={expandedTasks.has(task.id)}
                        isDragging={draggedTask?.id === task.id}
                        dateFormat={options.dateFormat}
                        onToggleComplete={() => handleToggleTask(task.id)}
                        onToggleExpand={() => toggleExpanded(task.id)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onUpdateDueDate={(taskId, dueDate) => handleUpdateTask(taskId, { dueDate })}
                        onUpdatePriority={(taskId, priority) => handleUpdateTask(taskId, { priority })}
                        onUpdateTitle={(taskId, title) => handleUpdateTask(taskId, { title })}
                        onAddSubtask={(parentId, title, priority, dueDate) => handleAddTask(title, section.id, parentId, priority, dueDate)}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, section.id)}
                        showAddSubtask={true}
                      />
                      {task.children && task.children.length > 0 && expandedTasks.has(task.id) && (
                        <div className="ml-6">
                          {task.children.map(child => (
                            <TodoTaskComponent
                              key={child.id}
                              task={child}
                              depth={(child.depth || 0) + 1}
                              isExpanded={expandedTasks.has(child.id)}
                              isDragging={draggedTask?.id === child.id}
                              dateFormat={options.dateFormat}
                              onToggleComplete={() => handleToggleTask(child.id)}
                              onToggleExpand={() => toggleExpanded(child.id)}
                              onDelete={() => handleDeleteTask(child.id)}
                              onUpdateDueDate={(taskId, dueDate) => handleUpdateTask(taskId, { dueDate })}
                              onUpdatePriority={(taskId, priority) => handleUpdateTask(taskId, { priority })}
                              onUpdateTitle={(taskId, title) => handleUpdateTask(taskId, { title })}
                              onAddSubtask={(parentId, title, priority, dueDate) => handleAddTask(title, section.id, parentId, priority, dueDate)}
                              onDragStart={(e) => handleDragStart(e, child)}
                              onDragEnd={handleDragEnd}
                              onDrop={(e) => handleDrop(e, section.id)}
                              showAddSubtask={false}
                            />
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </TodoSectionComponent>
                  {/* 섹션 내 작업 추가 입력 */}
                  {addingSectionId === section.id && (
                    <div className="mt-3 mb-2">
                      <AddTaskInput
                        value={newTaskTitle}
                        onChange={setNewTaskTitle}
                        onSubmit={(title, priority, dueDate) => {
                          handleAddTask(title, section.id, undefined, priority, dueDate);
                          setAddingSectionId(null);
                          setNewTaskTitle('');
                          setSelectedPriority('p3');
                          setSelectedDueDate(undefined);
                        }}
                        onCancel={() => {
                          setAddingSectionId(null);
                          setNewTaskTitle('');
                          setSelectedPriority('p3');
                          setSelectedDueDate(undefined);
                        }}
                        priority={selectedPriority}
                        onPriorityChange={setSelectedPriority}
                        dueDate={selectedDueDate}
                        onDueDateChange={setSelectedDueDate}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* 마지막 섹션 뒤 호버 영역 */}
            {!isAddingSection && (
              <div className="h-4 group relative mt-6">
                <button
                  onClick={() => {
                    setIsAddingSection(true);
                    setAddingSectionId('bottom');
                  }}
                  className="absolute inset-x-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <FolderPlus className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">새 섹션 추가</span>
                  </div>
                </button>
              </div>
            )}
            
            {/* 마지막 위치 섹션 추가 입력 */}
            {isAddingSection && addingSectionId === 'bottom' && (
              <div className="flex gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 rounded mt-6">
                <FolderPlus className="h-4 w-4 text-muted-foreground mt-1.5 flex-shrink-0" />
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSectionTitle.trim()) {
                      handleAddSection(newSectionTitle);
                      setNewSectionTitle('');
                      setIsAddingSection(false);
                      setAddingSectionId(null);
                    }
                    if (e.key === 'Escape') {
                      setIsAddingSection(false);
                      setAddingSectionId(null);
                      setNewSectionTitle('');
                    }
                  }}
                  placeholder="새 섹션 이름"
                  className="flex-1 h-7 text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (newSectionTitle.trim()) {
                      handleAddSection(newSectionTitle);
                      setNewSectionTitle('');
                      setIsAddingSection(false);
                      setAddingSectionId(null);
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
                    setIsAddingSection(false);
                    setAddingSectionId(null);
                    setNewSectionTitle('');
                  }}
                  className="h-7 px-2 text-xs"
                >
                  취소
                </Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
            <CardDescription className={typography.text.description}>
              {getWidgetText.todoList.description('ko')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1">
            {/* 할 일 추가 버튼 - 아이콘만 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                // 섹션이 없으면 기본 섹션 생성
                if (sections.length === 0) {
                  handleAddSection('📌 미구분');
                  setTimeout(() => setAddingSectionId('default'), 100);
                  if (viewMode !== 'section') {
                    setViewMode('section');
                  }
                } else if (viewMode === 'date' || viewMode === 'completed') {
                  setViewMode('section');
                  setTimeout(() => setAddingSectionId(sections[0]?.id || 'default'), 100);
                } else {
                  setAddingSectionId(sections[0]?.id || 'default');
                }
              }}
              title={getWidgetText.todoList.addTask('ko')}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* 뷰 모드 탭 - 아이콘만 */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid grid-cols-3 h-8">
                <TabsTrigger value="section" className="px-2" title="섹션">
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="date" className="px-2" title="날짜">
                  <CalendarIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="completed" className="px-2" title="완료">
                  <Clock className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 옵션 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsOptionsOpen(true)}
              title="옵션"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        <ScrollArea className="h-full">
          <div className="px-3 space-y-2">
            
            {renderContent()}
          </div>
        </ScrollArea>
      </CardContent>
      {/* 옵션 모달 */}
      <TodoOptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        options={options}
        onSave={handleSaveOptions}
      />
    </Card>
  );
}