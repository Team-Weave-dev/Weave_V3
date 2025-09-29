import { useState, useCallback, useRef } from 'react';
import type { TodoTask, TodoSection } from '../types';

interface DragAndDropState {
  draggedTask: TodoTask | null;
  draggedSection: TodoSection | null;
  dropTarget: string | null;
  isDragging: boolean;
}

interface DragAndDropHandlers {
  handleTaskDragStart: (e: React.DragEvent, task: TodoTask) => void;
  handleTaskDragEnd: () => void;
  handleTaskDrop: (e: React.DragEvent, targetTask: TodoTask) => void;
  handleSectionDragStart: (e: React.DragEvent, section: TodoSection) => void;
  handleSectionDragEnd: () => void;
  handleSectionDrop: (e: React.DragEvent, targetSection: TodoSection) => void;
  handleDragOver: (e: React.DragEvent) => void;
  setDropTarget: (target: string | null) => void;
}

export function useDragAndDrop(
  onTaskMove?: (taskId: string, targetTaskId: string, position: 'before' | 'after' | 'child') => void,
  onSectionMove?: (sectionId: string, targetSectionId: string, position: 'before' | 'after') => void,
  onTaskToSection?: (taskId: string, sectionId: string) => void
): [DragAndDropState, DragAndDropHandlers] {
  const [draggedTask, setDraggedTask] = useState<TodoTask | null>(null);
  const [draggedSection, setDraggedSection] = useState<TodoSection | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragCounter = useRef(0);

  const handleTaskDragStart = useCallback((e: React.DragEvent, task: TodoTask) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    
    // Set drag image
    if (e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.5';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }, []);

  const handleTaskDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDropTarget(null);
    setIsDragging(false);
    dragCounter.current = 0;
  }, []);

  const handleTaskDrop = useCallback((e: React.DragEvent, targetTask: TodoTask) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      handleTaskDragEnd();
      return;
    }

    // Determine drop position based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'child';
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'child';
    }

    onTaskMove?.(draggedTask.id, targetTask.id, position);
    handleTaskDragEnd();
  }, [draggedTask, onTaskMove, handleTaskDragEnd]);

  const handleSectionDragStart = useCallback((e: React.DragEvent, section: TodoSection) => {
    setDraggedSection(section);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', section.id);
  }, []);

  const handleSectionDragEnd = useCallback(() => {
    setDraggedSection(null);
    setDropTarget(null);
    setIsDragging(false);
    dragCounter.current = 0;
  }, []);

  const handleSectionDrop = useCallback((e: React.DragEvent, targetSection: TodoSection) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedSection && draggedSection.id !== targetSection.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = y < rect.height / 2 ? 'before' : 'after';
      
      onSectionMove?.(draggedSection.id, targetSection.id, position);
    } else if (draggedTask) {
      onTaskToSection?.(draggedTask.id, targetSection.id);
    }
    
    handleTaskDragEnd();
    handleSectionDragEnd();
  }, [draggedSection, draggedTask, onSectionMove, onTaskToSection, handleTaskDragEnd, handleSectionDragEnd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isDragging) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, [isDragging]);

  return [
    {
      draggedTask,
      draggedSection,
      dropTarget,
      isDragging
    },
    {
      handleTaskDragStart,
      handleTaskDragEnd,
      handleTaskDrop,
      handleSectionDragStart,
      handleSectionDragEnd,
      handleSectionDrop,
      handleDragOver,
      setDropTarget
    }
  ];
}