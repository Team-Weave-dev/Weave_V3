/**
 * TodoSectionService - TodoSection 도메인 서비스
 *
 * TodoSection 엔티티 관리를 위한 비즈니스 로직 및 쿼리 메서드 제공
 */

import type { StorageManager } from '../core/StorageManager';
import { BaseService } from './BaseService';
import type { TodoSection } from '../types/entities/todo-section';
import { isTodoSection } from '../types/entities/todo-section';
import { STORAGE_KEYS } from '../config';

/**
 * TodoSectionService
 *
 * TodoSection 엔티티를 위한 도메인 서비스
 * - 사용자별 섹션 관리
 * - 정렬 순서 관리
 * - 섹션 CRUD 작업
 */
export class TodoSectionService extends BaseService<TodoSection> {
  protected entityKey = STORAGE_KEYS.TODO_SECTIONS;
  protected isValidEntity = isTodoSection;

  constructor(storage: StorageManager) {
    super(storage);
  }

  // ============================================================================
  // 사용자별 조회
  // ============================================================================

  /**
   * 사용자별 모든 섹션 조회 (정렬된 상태)
   * @param userId - 사용자 ID
   * @returns 정렬된 섹션 배열
   */
  async getByUserId(userId: string): Promise<TodoSection[]> {
    const sections = await this.getAll();
    return sections
      .filter(section => section.userId === userId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // ============================================================================
  // 정렬 관리
  // ============================================================================

  /**
   * 섹션 순서 변경
   * @param sectionId - 섹션 ID
   * @param newOrderIndex - 새 정렬 순서
   * @returns 업데이트된 섹션
   */
  async reorder(sectionId: string, newOrderIndex: number): Promise<TodoSection | null> {
    if (newOrderIndex < 0) {
      throw new Error('orderIndex must be non-negative');
    }

    return await this.update(sectionId, { orderIndex: newOrderIndex });
  }

  /**
   * 여러 섹션의 순서 일괄 변경
   * @param reorderMap - { sectionId: newOrderIndex } 맵
   * @returns 업데이트된 섹션 배열
   */
  async reorderBatch(reorderMap: Record<string, number>): Promise<TodoSection[]> {
    const updates = Object.entries(reorderMap).map(([id, orderIndex]) => ({
      id,
      data: { orderIndex }
    }));

    return await this.updateMany(updates);
  }

  // ============================================================================
  // 펼침 상태 관리
  // ============================================================================

  /**
   * 섹션 펼침 상태 토글
   * @param sectionId - 섹션 ID
   * @returns 업데이트된 섹션
   */
  async toggleExpanded(sectionId: string): Promise<TodoSection | null> {
    const section = await this.getById(sectionId);
    if (!section) return null;

    return await this.update(sectionId, { isExpanded: !section.isExpanded });
  }

  /**
   * 모든 섹션 펼침
   * @param userId - 사용자 ID
   * @returns 업데이트된 섹션 배열
   */
  async expandAll(userId: string): Promise<TodoSection[]> {
    const sections = await this.getByUserId(userId);
    const updates = sections.map(section => ({
      id: section.id,
      data: { isExpanded: true }
    }));

    return await this.updateMany(updates);
  }

  /**
   * 모든 섹션 접기
   * @param userId - 사용자 ID
   * @returns 업데이트된 섹션 배열
   */
  async collapseAll(userId: string): Promise<TodoSection[]> {
    const sections = await this.getByUserId(userId);
    const updates = sections.map(section => ({
      id: section.id,
      data: { isExpanded: false }
    }));

    return await this.updateMany(updates);
  }

  // ============================================================================
  // 스타일 관리
  // ============================================================================

  /**
   * 섹션 색상 업데이트
   * @param sectionId - 섹션 ID
   * @param color - 색상 (hex)
   * @returns 업데이트된 섹션
   */
  async updateColor(sectionId: string, color: string): Promise<TodoSection | null> {
    return await this.update(sectionId, { color });
  }

  /**
   * 섹션 아이콘 업데이트
   * @param sectionId - 섹션 ID
   * @param icon - 아이콘 (emoji 또는 이름)
   * @returns 업데이트된 섹션
   */
  async updateIcon(sectionId: string, icon: string): Promise<TodoSection | null> {
    return await this.update(sectionId, { icon });
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let todoSectionServiceInstance: TodoSectionService | null = null;

/**
 * TodoSectionService 싱글톤 인스턴스 가져오기
 * @param storage - StorageManager 인스턴스
 * @returns TodoSectionService 인스턴스
 */
export function getTodoSectionService(storage: StorageManager): TodoSectionService {
  if (!todoSectionServiceInstance) {
    todoSectionServiceInstance = new TodoSectionService(storage);
  }
  return todoSectionServiceInstance;
}
