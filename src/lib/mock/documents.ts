import type { DocumentInfo } from '../types/project-table.types';
import type { GeneratedDocument } from '../document-generator/templates';

const PROJECT_DOCUMENTS_KEY = 'weave_project_documents';

// localStorage에서 프로젝트별 문서 데이터 조회
export function getProjectDocuments(projectId: string): DocumentInfo[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PROJECT_DOCUMENTS_KEY);
    if (!stored) return [];

    const allDocuments = JSON.parse(stored) as Record<string, DocumentInfo[]>;
    return allDocuments[projectId] || [];
  } catch (error) {
    console.error('Error reading project documents from localStorage:', error);
    return [];
  }
}

// localStorage에 프로젝트별 문서 데이터 저장
export function saveProjectDocuments(projectId: string, documents: DocumentInfo[]): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(PROJECT_DOCUMENTS_KEY);
    const allDocuments = stored ? JSON.parse(stored) : {};

    allDocuments[projectId] = documents;
    localStorage.setItem(PROJECT_DOCUMENTS_KEY, JSON.stringify(allDocuments));
  } catch (error) {
    console.error('Error saving project documents to localStorage:', error);
  }
}

// 🔔 문서 변경 이벤트를 발생시키는 헬퍼 함수
function notifyDocumentChange(projectId: string, action: 'added' | 'updated' | 'deleted' | 'bulk-deleted', details?: any): void {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('weave-documents-changed', {
      detail: { projectId, action, ...details }
    });
    window.dispatchEvent(event);
    console.log(`🔔 [EVENT] 문서 ${action} 이벤트 발생 - 프로젝트: ${projectId}`);
  }
}

// 프로젝트에 새 문서 추가
export function addProjectDocument(projectId: string, document: DocumentInfo): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const updatedDocs = [...existingDocs, document];
  saveProjectDocuments(projectId, updatedDocs);

  // 이벤트 발생
  notifyDocumentChange(projectId, 'added', { documentId: document.id, documentName: document.name });

  return updatedDocs;
}

// 프로젝트 문서 업데이트
export function updateProjectDocument(projectId: string, documentId: string, updates: Partial<DocumentInfo>): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const updatedDocs = existingDocs.map(doc =>
    doc.id === documentId ? { ...doc, ...updates } : doc
  );
  saveProjectDocuments(projectId, updatedDocs);

  // 이벤트 발생
  notifyDocumentChange(projectId, 'updated', { documentId, updates: Object.keys(updates) });

  return updatedDocs;
}

// 프로젝트 문서 삭제
export function deleteProjectDocument(projectId: string, documentId: string): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const deletedDoc = existingDocs.find(doc => doc.id === documentId);
  const updatedDocs = existingDocs.filter(doc => doc.id !== documentId);
  saveProjectDocuments(projectId, updatedDocs);

  // 이벤트 발생
  notifyDocumentChange(projectId, 'deleted', {
    documentId,
    documentName: deletedDoc?.name,
    remainingCount: updatedDocs.length
  });

  return updatedDocs;
}

// 프로젝트의 특정 타입 문서들 삭제
export function deleteProjectDocumentsByType(projectId: string, documentType: DocumentInfo['type']): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const deletedDocs = existingDocs.filter(doc => doc.type === documentType);
  const updatedDocs = existingDocs.filter(doc => doc.type !== documentType);
  saveProjectDocuments(projectId, updatedDocs);

  // 이벤트 발생
  notifyDocumentChange(projectId, 'bulk-deleted', {
    documentType,
    deletedCount: deletedDocs.length,
    remainingCount: updatedDocs.length
  });

  return updatedDocs;
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

// 프로젝트 생성 시 생성된 문서들을 documents 시스템에 저장
export function saveGeneratedDocumentsToProject(projectId: string, generatedDocuments: GeneratedDocument[]): DocumentInfo[] {
  // GeneratedDocument를 DocumentInfo로 변환
  const documentInfos = generatedDocuments.map(convertGeneratedDocumentToDocumentInfo);

  // 프로젝트에 문서들 저장
  saveProjectDocuments(projectId, documentInfos);

  console.log(`✅ 프로젝트 ${projectId}에 ${documentInfos.length}개의 생성된 문서를 저장했습니다.`, documentInfos.map(d => d.name));

  // 🔔 문서 변경 알림 이벤트 발생 (실시간 동기화용)
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('weave-documents-changed', {
      detail: { projectId, documentCount: documentInfos.length, action: 'created' }
    });
    window.dispatchEvent(event);
    console.log(`🔔 [EVENT] 문서 변경 이벤트 발생 - 프로젝트: ${projectId}, 문서수: ${documentInfos.length}`);
  }

  return documentInfos;
}

// 프로젝트의 모든 문서 삭제
export function clearProjectDocuments(projectId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(PROJECT_DOCUMENTS_KEY);
    if (!stored) return;

    const allDocuments = JSON.parse(stored);
    delete allDocuments[projectId];
    localStorage.setItem(PROJECT_DOCUMENTS_KEY, JSON.stringify(allDocuments));
  } catch (error) {
    console.error('Error clearing project documents from localStorage:', error);
  }
}

// ========================================
// 🐛 디버깅 및 캐시 문제 해결 함수들
// ========================================

/**
 * 브라우저 캐싱 vs localStorage 불일치 문제 디버깅 함수
 * 시크릿 모드에서는 작동하지만 일반 모드에서 작동하지 않는 문제 해결용
 */

// localStorage의 모든 데이터를 로그로 출력하여 상태 확인
export function debugLocalStorageState(): void {
  if (typeof window === 'undefined') {
    console.log('🔍 [DEBUG] 서버사이드에서는 localStorage에 접근할 수 없습니다.');
    return;
  }

  console.log('🔍 [DEBUG] === localStorage 상태 전체 점검 ===');
  console.log(`총 localStorage 키 개수: ${localStorage.length}`);

  // 모든 localStorage 키를 순회하며 출력
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`🗝️  ${key}:`, value);

      // Weave 관련 데이터인지 확인
      if (key.includes('weave') || key.includes('project') || key.includes('document')) {
        console.log(`🎯 [WEAVE 관련] ${key}:`, JSON.parse(value || '{}'));
      }
    }
  }

  // 우리 시스템의 프로젝트 문서 키 특별히 확인
  const projectDocuments = localStorage.getItem(PROJECT_DOCUMENTS_KEY);
  console.log('📊 [WEAVE DOCS] 프로젝트 문서 데이터:', projectDocuments);
  if (projectDocuments) {
    try {
      const parsed = JSON.parse(projectDocuments);
      console.log('📊 [WEAVE DOCS] 파싱된 데이터:', parsed);
      console.log('📊 [WEAVE DOCS] 프로젝트 키 목록:', Object.keys(parsed));

      // 각 프로젝트별 문서 개수 확인
      Object.entries(parsed).forEach(([projectId, documents]) => {
        console.log(`📁 프로젝트 ${projectId}: ${Array.isArray(documents) ? documents.length : 0}개 문서`);
      });
    } catch (error) {
      console.error('❌ [ERROR] 프로젝트 문서 데이터 파싱 실패:', error);
    }
  }
  console.log('🔍 [DEBUG] =================================');
}

// 오래된/잘못된 데이터 구조를 감지하고 정리
export function clearStaleDocumentData(): void {
  if (typeof window === 'undefined') return;

  console.log('🧹 [CLEANUP] 오래된 문서 데이터 정리 시작...');

  let cleanupCount = 0;
  const keysToRemove: string[] = [];

  // localStorage를 순회하며 정리할 키들 찾기
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // 이전 버전에서 사용했을 가능성이 있는 키 패턴들
      const isOldDocumentKey = (
        key.includes('document') &&
        key !== PROJECT_DOCUMENTS_KEY &&
        (key.includes('project') || key.includes('weave'))
      );

      // 잘못된 형식의 프로젝트 문서 키
      const isInvalidProjectKey = (
        key.startsWith('project-') && key.includes('documents')
      );

      if (isOldDocumentKey || isInvalidProjectKey) {
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

  // 현재 프로젝트 문서 데이터도 검증하고 정리
  const currentDocuments = localStorage.getItem(PROJECT_DOCUMENTS_KEY);
  if (currentDocuments) {
    try {
      const parsed = JSON.parse(currentDocuments);
      let needsUpdate = false;
      const cleanedData: Record<string, DocumentInfo[]> = {};

      Object.entries(parsed).forEach(([projectId, documents]) => {
        if (Array.isArray(documents)) {
          // 유효한 문서 데이터인지 검증
          const validDocuments = documents.filter(doc =>
            doc &&
            typeof doc === 'object' &&
            doc.id &&
            doc.name &&
            doc.type
          );

          if (validDocuments.length !== documents.length) {
            console.log(`🔧 프로젝트 ${projectId}: ${documents.length - validDocuments.length}개 잘못된 문서 데이터 정리`);
            needsUpdate = true;
          }

          if (validDocuments.length > 0) {
            cleanedData[projectId] = validDocuments;
          }
        } else {
          console.log(`🗑️  잘못된 문서 데이터 형식 제거: 프로젝트 ${projectId}`);
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        localStorage.setItem(PROJECT_DOCUMENTS_KEY, JSON.stringify(cleanedData));
        console.log('✅ 프로젝트 문서 데이터 정리 및 업데이트 완료');
      }
    } catch (error) {
      console.error('❌ 현재 프로젝트 문서 데이터 정리 중 오류:', error);
      // 완전히 깨진 데이터라면 초기화
      localStorage.removeItem(PROJECT_DOCUMENTS_KEY);
      console.log('🆕 프로젝트 문서 데이터 초기화 완료');
    }
  }

  console.log(`🧹 [CLEANUP] 정리 완료! ${cleanupCount}개 항목 정리됨`);
}

// 강제로 모든 프로젝트 문서 데이터를 초기화 (핵옵션)
export function resetAllDocumentData(): void {
  if (typeof window === 'undefined') return;

  console.log('💣 [RESET] 모든 문서 데이터 초기화...');

  // 문서 관련 모든 localStorage 키 제거
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('document') || key.includes('weave_project'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️  제거: ${key}`);
  });

  console.log(`💣 [RESET] ${keysToRemove.length}개 항목 초기화 완료!`);
  console.log('🔄 페이지를 새로고침하여 깨끗한 상태로 시작하세요.');
}

// 특정 프로젝트의 문서 데이터 상태 확인
export function debugProjectDocuments(projectId: string): void {
  console.log(`🔍 [PROJECT DEBUG] 프로젝트 ${projectId} 문서 상태 확인`);

  const documents = getProjectDocuments(projectId);
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

  // localStorage에서 직접 확인
  const rawData = localStorage.getItem(PROJECT_DOCUMENTS_KEY);
  if (rawData) {
    try {
      const allDocs = JSON.parse(rawData);
      const projectDocs = allDocs[projectId];
      console.log(`🗄️  localStorage 직접 조회 결과:`, projectDocs);
    } catch (error) {
      console.error('❌ localStorage 데이터 파싱 오류:', error);
    }
  }
}

// 캐시 문제 해결을 위한 원스톱 함수
export function fixCacheIssues(): void {
  console.log('🚑 [CACHE FIX] 브라우저 캐싱 문제 해결 시작...');

  // 1단계: 현재 상태 진단
  console.log('1️⃣ 현재 상태 진단');
  debugLocalStorageState();

  // 2단계: 오래된 데이터 정리
  console.log('2️⃣ 오래된 데이터 정리');
  clearStaleDocumentData();

  // 3단계: 정리 후 상태 확인
  console.log('3️⃣ 정리 후 상태 확인');
  debugLocalStorageState();

  console.log('🚑 [CACHE FIX] 캐시 문제 해결 완료!');
  console.log('🔄 이제 프로젝트 생성 모달에서 문서를 생성해보세요.');
}

// localStorage 키 export (디버깅 용도)
export { PROJECT_DOCUMENTS_KEY };

// 개발 환경에서 디버깅 함수들을 전역으로 노출
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugWeaveDocuments = {
    debugLocalStorageState,
    clearStaleDocumentData,
    resetAllDocumentData,
    debugProjectDocuments,
    fixCacheIssues
  };
  console.log('🛠️  개발 모드: window.debugWeaveDocuments 디버깅 도구 사용 가능');
}