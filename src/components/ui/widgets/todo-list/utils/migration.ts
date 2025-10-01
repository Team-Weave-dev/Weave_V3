// TodoList 저장소 마이그레이션 유틸리티
// 이중 저장소 구조(weave_dashboard_todos + weave_dashboard_todo_sections)를
// 단일 구조(weave_dashboard_todo_sections)로 마이그레이션

import type { TodoTask, TodoSection } from '../types';

/**
 * 기존 데이터를 새로운 통합 구조로 마이그레이션
 *
 * @returns 마이그레이션된 sections (tasks 포함) 또는 null (마이그레이션 불필요)
 */
export function migrateTodoStorage(): TodoSection[] | null {
  try {
    // 1. 기존 키 확인
    const oldTasksKey = 'weave_dashboard_todos';
    const sectionsKey = 'weave_dashboard_todo_sections';

    const oldTasksData = localStorage.getItem(oldTasksKey);
    const sectionsData = localStorage.getItem(sectionsKey);

    // 기존 tasks 키가 없으면 마이그레이션 불필요
    if (!oldTasksData) {
      return null;
    }

    const oldTasks: TodoTask[] = JSON.parse(oldTasksData);

    // tasks 배열이 비어있으면 마이그레이션 불필요
    if (!Array.isArray(oldTasks) || oldTasks.length === 0) {
      // 빈 데이터이므로 제거만 하고 null 반환
      localStorage.removeItem(oldTasksKey);
      return null;
    }

    // 2. 기존 sections 데이터 파싱
    let sections: TodoSection[] = [];

    if (sectionsData) {
      sections = JSON.parse(sectionsData);

      // sections가 배열이 아니면 새로 생성
      if (!Array.isArray(sections)) {
        sections = [];
      }
    }

    // 3. sections가 비어있으면 기본 섹션 생성
    if (sections.length === 0) {
      sections = [
        {
          id: 'default',
          name: '기본',
          order: 0,
          isExpanded: true,
          tasks: []
        }
      ];
    }

    // 4. 각 섹션에 tasks 필드가 없으면 추가
    for (const section of sections) {
      if (!section.tasks) {
        section.tasks = [];
      }
    }

    // 5. oldTasks를 sectionId별로 그룹화
    const tasksBySectionId = new Map<string, TodoTask[]>();
    const tasksWithoutSection: TodoTask[] = [];

    for (const task of oldTasks) {
      if (task.sectionId) {
        if (!tasksBySectionId.has(task.sectionId)) {
          tasksBySectionId.set(task.sectionId, []);
        }
        tasksBySectionId.get(task.sectionId)!.push(task);
      } else {
        // sectionId가 없는 tasks는 기본 섹션으로
        tasksWithoutSection.push(task);
      }
    }

    // 6. 각 섹션에 해당하는 tasks 할당
    for (const section of sections) {
      const sectionTasks = tasksBySectionId.get(section.id) || [];

      // 기존 section.tasks와 병합 (중복 제거)
      const existingTaskIds = new Set(section.tasks!.map(t => t.id));
      const newTasks = sectionTasks.filter(t => !existingTaskIds.has(t.id));

      section.tasks = [...section.tasks!, ...newTasks];
    }

    // 7. sectionId가 없는 tasks를 기본 섹션에 추가
    if (tasksWithoutSection.length > 0) {
      const defaultSection = sections.find(s => s.id === 'default') || sections[0];
      if (defaultSection) {
        const existingTaskIds = new Set(defaultSection.tasks!.map(t => t.id));
        const newTasks = tasksWithoutSection.filter(t => !existingTaskIds.has(t.id));
        defaultSection.tasks = [...defaultSection.tasks!, ...newTasks];
      }
    }

    // 8. 마이그레이션된 데이터 저장
    localStorage.setItem(sectionsKey, JSON.stringify(sections));

    // 9. 기존 oldTasks 키 제거
    localStorage.removeItem(oldTasksKey);

    console.log('[Migration] Successfully migrated todo storage from dual to single structure');
    console.log(`[Migration] Migrated ${oldTasks.length} tasks across ${sections.length} sections`);

    return sections;
  } catch (error) {
    console.error('[Migration] Failed to migrate todo storage:', error);
    // 마이그레이션 실패 시 null 반환 (기존 동작 유지)
    return null;
  }
}

/**
 * 마이그레이션이 필요한지 확인
 */
export function needsMigration(): boolean {
  const oldTasksKey = 'weave_dashboard_todos';
  return localStorage.getItem(oldTasksKey) !== null;
}

/**
 * Date 객체 복원 헬퍼
 * localStorage에서 읽은 데이터의 Date 필드를 실제 Date 객체로 변환
 */
export function restoreDateFields(sections: TodoSection[]): TodoSection[] {
  return sections.map(section => ({
    ...section,
    tasks: section.tasks?.map(task => ({
      ...task,
      createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      children: task.children?.map(child => ({
        ...child,
        createdAt: child.createdAt ? new Date(child.createdAt) : undefined,
        completedAt: child.completedAt ? new Date(child.completedAt) : undefined,
        dueDate: child.dueDate ? new Date(child.dueDate) : undefined,
      }))
    }))
  }));
}