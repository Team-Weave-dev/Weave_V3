/**
 * Document Mock Data and Type Converters
 *
 * This file provides utilities for managing documents and converting between
 * DocumentInfo (UI type) and Document (Storage API entity type).
 */

import type { DocumentInfo } from '../types/project-table.types';
import type { GeneratedDocument } from '../document-generator/templates';
import type { Document, DocumentStatus as StorageDocumentStatus } from '@/lib/storage/types/entities/document';
import { documentService } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// Type Conversion Functions
// ============================================================================

/**
 * Status 매핑: DocumentInfo status → Document status
 */
const UI_TO_STORAGE_STATUS: Record<DocumentInfo['status'], StorageDocumentStatus> = {
  'draft': 'draft',
  'sent': 'sent',
  'approved': 'approved',
  'completed': 'completed',
};

/**
 * Status 매핑: Document status → DocumentInfo status
 */
const STORAGE_TO_UI_STATUS: Record<StorageDocumentStatus, DocumentInfo['status']> = {
  'draft': 'draft',
  'sent': 'sent',
  'approved': 'approved',
  'completed': 'completed',
  'archived': 'completed', // archived는 UI에서 completed로 표시
};

/**
 * Convert DocumentInfo (UI type) to Document (Storage API entity)
 *
 * @param documentInfo - UI type DocumentInfo
 * @param projectId - Project ID
 * @param userId - Current user ID (default: '1')
 * @returns Document entity for Storage API
 */
export function documentInfoToDocument(
  documentInfo: DocumentInfo,
  projectId: string,
  userId: string = '1'
): Document {
  const status = UI_TO_STORAGE_STATUS[documentInfo.status] || 'draft';

  const document: Document = {
    id: documentInfo.id,
    projectId,
    userId,
    name: documentInfo.name,
    type: documentInfo.type,
    status,
    content: documentInfo.content,
    templateId: documentInfo.templateId,
    source: documentInfo.source,
    savedAt: documentInfo.createdAt || new Date().toISOString(),
    createdAt: documentInfo.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return document;
}

/**
 * Convert Document (Storage API entity) to DocumentInfo (UI type)
 *
 * @param document - Storage API Document entity
 * @returns UI type DocumentInfo
 */
export function documentToDocumentInfo(document: Document): DocumentInfo {
  const status = STORAGE_TO_UI_STATUS[document.status] || 'draft';

  const documentInfo: DocumentInfo = {
    id: document.id,
    type: document.type,
    name: document.name,
    createdAt: document.savedAt || document.createdAt,
    status,
    content: document.content,
    templateId: document.templateId,
    source: document.source,
  };

  return documentInfo;
}

// ============================================================================
// Legacy Migration
// ============================================================================

const LEGACY_DOCUMENTS_KEY = 'weave_project_documents';

/**
 * Migrate legacy documents from localStorage to Storage API
 *
 * Old keys:
 * - 'weave_project_documents' → STORAGE_KEYS.DOCUMENTS (via DocumentService)
 */
export async function migrateLegacyDocuments(): Promise<void> {
  try {
    // 이미 마이그레이션 되었는지 확인
    const existingDocs = await documentService.getAll();
    if (existingDocs.length > 0) {
      console.log('✅ Documents already migrated, skipping legacy migration');
      return;
    }

    // Legacy documents 읽기
    if (typeof window === 'undefined') {
      console.log('ℹ️ Server-side environment, skipping migration');
      return;
    }

    const legacyDocsStr = localStorage.getItem(LEGACY_DOCUMENTS_KEY);
    if (!legacyDocsStr) {
      console.log('ℹ️ No legacy documents found');
      return;
    }

    const legacyDocsByProject = JSON.parse(legacyDocsStr) as Record<string, DocumentInfo[]>;
    let totalMigrated = 0;

    console.log(`📦 Migrating legacy documents from ${Object.keys(legacyDocsByProject).length} projects...`);

    // 프로젝트별 문서 마이그레이션
    for (const [projectId, documents] of Object.entries(legacyDocsByProject)) {
      for (const documentInfo of documents) {
        const document = documentInfoToDocument(documentInfo, projectId);
        await documentService.create(document);
        totalMigrated++;
      }
    }

    console.log(`✅ Successfully migrated ${totalMigrated} documents`);

  } catch (error) {
    console.error('❌ Failed to migrate legacy documents:', error);
  }
}

// ============================================================================
// Storage API Wrapper Functions (async)
// ============================================================================

/**
 * Get all documents for a project (converts Document[] to DocumentInfo[])
 */
export async function getProjectDocuments(projectId: string): Promise<DocumentInfo[]> {
  // Legacy migration (once)
  await migrateLegacyDocuments();

  // 🔑 프로젝트 번호(no)를 UUID로 변환
  let actualProjectId = projectId;

  if (projectId.startsWith('WEAVE_') || projectId.startsWith('project-')) {
    const { projectService } = await import('@/lib/storage');
    const projects = await projectService.getAll();
    const project = projects.find(p => p.no === projectId || p.id === projectId);

    if (project && project.id) {
      actualProjectId = project.id;
      console.log(`✅ [getProjectDocuments] 프로젝트 번호 '${projectId}' → UUID '${actualProjectId}' 변환 완료`);
    } else {
      console.error(`❌ [getProjectDocuments] 프로젝트를 찾을 수 없습니다: ${projectId}`);
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}. 프로젝트가 존재하는지 확인해주세요.`);
    }
  }

  const documents = await documentService.getDocumentsByProject(actualProjectId);
  return documents.map(documentToDocumentInfo);
}

/**
 * Add a new document to a project
 */
export async function addProjectDocument(projectId: string, documentInfo: DocumentInfo): Promise<DocumentInfo> {
  // 🔑 인증된 사용자 ID 가져오기
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('❌ [addProjectDocument] 인증된 사용자를 찾을 수 없습니다:', authError);
    throw new Error('인증되지 않은 사용자입니다. 로그인 후 다시 시도해주세요.');
  }

  const userId = user.id;
  console.log(`✅ [addProjectDocument] 인증된 userId: ${userId}`);

  // 🔑 프로젝트 번호(no)를 UUID로 변환
  // projectId가 'WEAVE_XXX' 형태(프로젝트 번호)라면 실제 UUID를 조회
  let actualProjectId = projectId;

  if (projectId.startsWith('WEAVE_') || projectId.startsWith('project-')) {
    // projectId가 프로젝트 번호 또는 LocalStorage ID인 경우
    // ProjectService를 통해 실제 프로젝트를 조회하여 UUID 가져오기
    const { projectService } = await import('@/lib/storage');
    const projects = await projectService.getAll();

    // 'no' 필드로 프로젝트 찾기
    const project = projects.find(p => p.no === projectId || p.id === projectId);

    if (project && project.id) {
      actualProjectId = project.id;
      console.log(`✅ [addProjectDocument] 프로젝트 번호 '${projectId}' → UUID '${actualProjectId}' 변환 완료`);
    } else {
      console.error(`❌ [addProjectDocument] 프로젝트를 찾을 수 없습니다: ${projectId}`);
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}. 프로젝트가 존재하는지 확인해주세요.`);
    }
  }

  // 📝 인증된 userId를 전달하여 Document 엔티티 생성
  const document = documentInfoToDocument(documentInfo, actualProjectId, userId);
  const created = await documentService.create(document);

  // 📊 문서 추가 후 프로젝트의 document_status 자동 업데이트
  await updateProjectDocumentStatus(actualProjectId);

  // 🔔 이벤트 발생 (원본 projectId 사용 - UI 동기화용)
  notifyDocumentChange(projectId, 'added', { documentId: created.id, documentName: created.name });

  return documentToDocumentInfo(created);
}

/**
 * Update an existing document
 */
export async function updateProjectDocument(
  projectId: string,
  documentId: string,
  updates: Partial<DocumentInfo>
): Promise<boolean> {
  const docUpdates: Partial<Document> = {};

  if (updates.name !== undefined) docUpdates.name = updates.name;
  if (updates.status !== undefined) {
    docUpdates.status = UI_TO_STORAGE_STATUS[updates.status];
  }
  if (updates.content !== undefined) docUpdates.content = updates.content;
  if (updates.templateId !== undefined) docUpdates.templateId = updates.templateId;
  if (updates.source !== undefined) docUpdates.source = updates.source;

  const updated = await documentService.update(documentId, docUpdates);

  // 🔔 이벤트 발생 (원본 projectId 사용 - UI 동기화용)
  if (updated) {
    notifyDocumentChange(projectId, 'updated', { documentId, updates: Object.keys(updates) });
  }

  return updated !== null;
}

/**
 * Delete a document
 */
export async function deleteProjectDocument(projectId: string, documentId: string): Promise<boolean> {
  // 🔑 프로젝트 번호(no)를 UUID로 변환
  let actualProjectId = projectId;

  if (projectId.startsWith('WEAVE_') || projectId.startsWith('project-')) {
    const { projectService } = await import('@/lib/storage');
    const projects = await projectService.getAll();
    const project = projects.find(p => p.no === projectId || p.id === projectId);

    if (project && project.id) {
      actualProjectId = project.id;
      console.log(`✅ [deleteProjectDocument] 프로젝트 번호 '${projectId}' → UUID '${actualProjectId}' 변환 완료`);
    } else {
      console.error(`❌ [deleteProjectDocument] 프로젝트를 찾을 수 없습니다: ${projectId}`);
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}. 프로젝트가 존재하는지 확인해주세요.`);
    }
  }

  // Get document info before deletion for event
  const document = await documentService.getById(documentId);
  const deleted = await documentService.delete(documentId);

  if (deleted) {
    // 📊 문서 삭제 후 프로젝트의 document_status 자동 업데이트
    await updateProjectDocumentStatus(actualProjectId);

    // 🔔 이벤트 발생 (원본 projectId 사용 - UI 동기화용)
    if (document) {
      const remaining = await documentService.getDocumentsByProject(actualProjectId);
      notifyDocumentChange(projectId, 'deleted', {
        documentId,
        documentName: document.name,
        remainingCount: remaining.length
      });
    }
  }

  return deleted;
}

/**
 * Delete all documents of a specific type from a project
 */
export async function deleteProjectDocumentsByType(
  projectId: string,
  documentType: DocumentInfo['type']
): Promise<number> {
  // 🔑 프로젝트 번호(no)를 UUID로 변환
  let actualProjectId = projectId;

  if (projectId.startsWith('WEAVE_') || projectId.startsWith('project-')) {
    const { projectService } = await import('@/lib/storage');
    const projects = await projectService.getAll();
    const project = projects.find(p => p.no === projectId || p.id === projectId);

    if (project && project.id) {
      actualProjectId = project.id;
      console.log(`✅ [deleteProjectDocumentsByType] 프로젝트 번호 '${projectId}' → UUID '${actualProjectId}' 변환 완료`);
    } else {
      console.error(`❌ [deleteProjectDocumentsByType] 프로젝트를 찾을 수 없습니다: ${projectId}`);
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}. 프로젝트가 존재하는지 확인해주세요.`);
    }
  }

  const projectDocs = await documentService.getDocumentsByProject(actualProjectId);
  const docsToDelete = projectDocs.filter(doc => doc.type === documentType);

  let deletedCount = 0;
  for (const doc of docsToDelete) {
    const deleted = await documentService.delete(doc.id);
    if (deleted) deletedCount++;
  }

  if (deletedCount > 0) {
    // 📊 문서 삭제 후 프로젝트의 document_status 자동 업데이트
    await updateProjectDocumentStatus(actualProjectId);

    // 🔔 이벤트 발생 (원본 projectId 사용 - UI 동기화용)
    const remaining = await documentService.getDocumentsByProject(actualProjectId);
    notifyDocumentChange(projectId, 'bulk-deleted', {
      documentType,
      deletedCount,
      remainingCount: remaining.length
    });
  }

  return deletedCount;
}

/**
 * Clear all documents for a project
 */
export async function clearProjectDocuments(projectId: string): Promise<void> {
  // 🔑 프로젝트 번호(no)를 UUID로 변환
  let actualProjectId = projectId;

  if (projectId.startsWith('WEAVE_') || projectId.startsWith('project-')) {
    const { projectService } = await import('@/lib/storage');
    const projects = await projectService.getAll();
    const project = projects.find(p => p.no === projectId || p.id === projectId);

    if (project && project.id) {
      actualProjectId = project.id;
      console.log(`✅ [clearProjectDocuments] 프로젝트 번호 '${projectId}' → UUID '${actualProjectId}' 변환 완료`);
    } else {
      console.error(`❌ [clearProjectDocuments] 프로젝트를 찾을 수 없습니다: ${projectId}`);
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}. 프로젝트가 존재하는지 확인해주세요.`);
    }
  }

  const projectDocs = await documentService.getDocumentsByProject(actualProjectId);

  for (const doc of projectDocs) {
    await documentService.delete(doc.id);
  }

  // 📊 모든 문서 삭제 후 프로젝트의 document_status 자동 업데이트
  if (projectDocs.length > 0) {
    await updateProjectDocumentStatus(actualProjectId);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 프로젝트의 document_status 자동 업데이트
 * 모든 문서를 조회하여 타입별 요약 정보를 계산하고 ProjectService로 업데이트
 */
async function updateProjectDocumentStatus(projectId: string): Promise<void> {
  try {
    const { projectService } = await import('@/lib/storage');
    const documents = await documentService.getDocumentsByProject(projectId);

    // 타입별 문서 요약 계산
    const documentStatus: any = {
      contract: { exists: false, count: 0, status: 'none' as const, latestSavedAt: undefined },
      invoice: { exists: false, count: 0, status: 'none' as const, latestSavedAt: undefined },
      estimate: { exists: false, count: 0, status: 'none' as const, latestSavedAt: undefined },
      report: { exists: false, count: 0, status: 'none' as const, latestSavedAt: undefined },
      etc: { exists: false, count: 0, status: 'none' as const, latestSavedAt: undefined },
    };

    // 각 문서를 순회하며 타입별 카운트 및 최신 날짜 계산
    documents.forEach(doc => {
      const type = doc.type;
      if (documentStatus[type]) {
        documentStatus[type].exists = true;
        documentStatus[type].count++;
        documentStatus[type].status = 'completed'; // 문서가 있으면 completed

        // 최신 저장일 업데이트
        const savedAt = doc.savedAt || doc.createdAt;
        if (!documentStatus[type].latestSavedAt || savedAt > documentStatus[type].latestSavedAt) {
          documentStatus[type].latestSavedAt = savedAt;
        }
      }
    });

    // ProjectService를 통해 document_status 업데이트
    await projectService.updateDocumentStatus(projectId, documentStatus);

    console.log(`📊 [updateProjectDocumentStatus] 프로젝트 ${projectId}의 document_status 업데이트 완료`);
  } catch (error) {
    console.error(`❌ [updateProjectDocumentStatus] document_status 업데이트 실패:`, error);
  }
}

// 🔔 문서 변경 이벤트를 발생시키는 헬퍼 함수
function notifyDocumentChange(projectId: string, action: 'added' | 'updated' | 'deleted' | 'bulk-deleted' | 'created', details?: any): void {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('weave-documents-changed', {
      detail: { projectId, action, ...details }
    });
    window.dispatchEvent(event);
    console.log(`🔔 [EVENT] 문서 ${action} 이벤트 발생 - 프로젝트: ${projectId}`);
  }
}

// GeneratedDocument를 DocumentInfo로 변환하는 헬퍼 함수
export function convertGeneratedDocumentToDocumentInfo(generatedDoc: GeneratedDocument): DocumentInfo {
  // category 매핑: 'others' -> 'etc'
  const typeMapping: Record<string, DocumentInfo['type']> = {
    contract: 'contract',
    invoice: 'invoice',
    report: 'report',
    estimate: 'estimate',
    others: 'etc'
  };

  return {
    id: generatedDoc.id,
    type: typeMapping[generatedDoc.category] || 'etc',
    name: generatedDoc.title,
    createdAt: generatedDoc.createdAt.toISOString(),
    status: 'draft', // 새로 생성된 문서는 초안 상태
    content: generatedDoc.content,
    templateId: generatedDoc.templateId,
    source: 'generated'
  };
}

/**
 * Save generated documents to a project
 */
export async function saveGeneratedDocumentsToProject(
  projectId: string,
  generatedDocuments: GeneratedDocument[]
): Promise<DocumentInfo[]> {
  // GeneratedDocument를 DocumentInfo로 변환
  const documentInfos = generatedDocuments.map(convertGeneratedDocumentToDocumentInfo);

  // 프로젝트에 문서들 저장 (addProjectDocument가 자동으로 UUID 변환 처리)
  const savedDocs: DocumentInfo[] = [];
  for (const docInfo of documentInfos) {
    const saved = await addProjectDocument(projectId, docInfo);
    savedDocs.push(saved);
  }

  console.log(`✅ 프로젝트 ${projectId}에 ${savedDocs.length}개의 생성된 문서를 저장했습니다.`, savedDocs.map(d => d.name));

  // 🔔 문서 변경 알림 이벤트 발생 (실시간 동기화용)
  notifyDocumentChange(projectId, 'created', { documentCount: savedDocs.length });

  return savedDocs;
}

// ========================================
// 🐛 디버깅 및 레거시 정리 함수들
// ========================================

/**
 * Debug project documents (Storage API version)
 */
export async function debugProjectDocuments(projectId: string): Promise<void> {
  console.log(`🔍 [PROJECT DEBUG] 프로젝트 ${projectId} 문서 상태 확인`);

  // 🔑 프로젝트 번호(no)를 UUID로 변환
  let actualProjectId = projectId;

  if (projectId.startsWith('WEAVE_') || projectId.startsWith('project-')) {
    const { projectService } = await import('@/lib/storage');
    const projects = await projectService.getAll();
    const project = projects.find(p => p.no === projectId || p.id === projectId);

    if (project && project.id) {
      actualProjectId = project.id;
      console.log(`✅ [DEBUG] 프로젝트 번호 '${projectId}' → UUID '${actualProjectId}' 변환 완료`);
    } else {
      console.error(`❌ [debugProjectDocuments] 프로젝트를 찾을 수 없습니다: ${projectId}`);
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}. 프로젝트가 존재하는지 확인해주세요.`);
    }
  }

  const documents = await getProjectDocuments(projectId);
  console.log(`📊 현재 문서 개수: ${documents.length}`);
  console.log('📄 문서 목록:', documents);

  if (documents.length > 0) {
    documents.forEach((doc, index) => {
      console.log(`📄 문서 ${index + 1}:`, {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        status: doc.status,
        createdAt: doc.createdAt,
        source: doc.source
      });
    });
  } else {
    console.log('📭 해당 프로젝트에는 저장된 문서가 없습니다.');
  }

  // Storage API에서 직접 확인 (UUID 사용)
  const allDocs = await documentService.getDocumentsByProject(actualProjectId);
  console.log(`🗄️  Storage API 직접 조회 결과 (${allDocs.length}개):`, allDocs);
}

/**
 * Clean up legacy document data from localStorage
 */
export function cleanupLegacyDocumentData(): void {
  if (typeof window === 'undefined') return;

  console.log('🧹 [CLEANUP] 레거시 문서 데이터 정리 시작...');

  let cleanupCount = 0;
  const keysToRemove: string[] = [];

  // localStorage를 순회하며 정리할 키들 찾기
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // 레거시 문서 키 패턴
      const isLegacyDocumentKey = (
        key === LEGACY_DOCUMENTS_KEY ||
        (key.includes('document') && key.includes('weave'))
      );

      if (isLegacyDocumentKey) {
        keysToRemove.push(key);
        cleanupCount++;
        console.log(`🗑️  정리 대상: ${key}`);
      }
    }
  }

  // 찾은 키들 삭제
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ 삭제 완료: ${key}`);
  });

  console.log(`🧹 [CLEANUP] 정리 완료! ${cleanupCount}개 항목 정리됨`);
}

/**
 * Reset all documents (Storage API version)
 */
export async function resetAllDocuments(): Promise<void> {
  console.log('💣 [RESET] 모든 문서 데이터 초기화...');

  const allDocs = await documentService.getAll();
  let deletedCount = 0;

  for (const doc of allDocs) {
    const deleted = await documentService.delete(doc.id);
    if (deleted) deletedCount++;
  }

  // 레거시 데이터도 정리
  cleanupLegacyDocumentData();

  console.log(`💣 [RESET] ${deletedCount}개 문서 초기화 완료!`);
  console.log('🔄 페이지를 새로고침하여 깨끗한 상태로 시작하세요.');
}

// 개발 환경에서 디버깅 함수들을 전역으로 노출
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugWeaveDocuments = {
    debugProjectDocuments,
    cleanupLegacyDocumentData,
    resetAllDocuments,
  };
  console.log('🛠️  개발 모드: window.debugWeaveDocuments 디버깅 도구 사용 가능');
}