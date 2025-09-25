import type { DocumentInfo } from '../types/project-table.types';

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

// 프로젝트에 새 문서 추가
export function addProjectDocument(projectId: string, document: DocumentInfo): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const updatedDocs = [...existingDocs, document];
  saveProjectDocuments(projectId, updatedDocs);
  return updatedDocs;
}

// 프로젝트 문서 업데이트
export function updateProjectDocument(projectId: string, documentId: string, updates: Partial<DocumentInfo>): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const updatedDocs = existingDocs.map(doc =>
    doc.id === documentId ? { ...doc, ...updates } : doc
  );
  saveProjectDocuments(projectId, updatedDocs);
  return updatedDocs;
}

// 프로젝트 문서 삭제
export function deleteProjectDocument(projectId: string, documentId: string): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const updatedDocs = existingDocs.filter(doc => doc.id !== documentId);
  saveProjectDocuments(projectId, updatedDocs);
  return updatedDocs;
}

// 프로젝트의 특정 타입 문서들 삭제
export function deleteProjectDocumentsByType(projectId: string, documentType: DocumentInfo['type']): DocumentInfo[] {
  const existingDocs = getProjectDocuments(projectId);
  const updatedDocs = existingDocs.filter(doc => doc.type !== documentType);
  saveProjectDocuments(projectId, updatedDocs);
  return updatedDocs;
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

// localStorage 키 export (디버깅 용도)
export { PROJECT_DOCUMENTS_KEY };