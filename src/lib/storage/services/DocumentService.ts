/**
 * Document Service
 *
 * This file provides Document domain service.
 */

import { BaseService } from './BaseService';
import type { StorageManager } from '../core/StorageManager';
import type { Document, DocumentCreate, DocumentUpdate, DocumentType, DocumentStatus } from '../types/entities/document';
import { isDocument } from '../types/entities/document';
import { STORAGE_KEYS, buildKey } from '../config';

/**
 * Document service class
 * Manages documents with project associations
 */
export class DocumentService extends BaseService<Document> {
  protected entityKey = STORAGE_KEYS.PROJECTS; // Documents are stored with projects

  constructor(storage: StorageManager) {
    super(storage);
  }

  /**
   * Type guard implementation
   */
  protected isValidEntity(data: unknown): data is Document {
    return isDocument(data);
  }

  // ============================================================================
  // Basic Query Methods
  // ============================================================================

  /**
   * Get documents by project ID
   */
  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    return this.find((doc) => doc.projectId === projectId);
  }

  /**
   * Get documents by user ID
   */
  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return this.find((doc) => doc.userId === userId);
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(type: DocumentType): Promise<Document[]> {
    return this.find((doc) => doc.type === type);
  }

  /**
   * Get documents by status
   */
  async getDocumentsByStatus(status: DocumentStatus): Promise<Document[]> {
    return this.find((doc) => doc.status === status);
  }

  /**
   * Get documents by template ID
   */
  async getDocumentsByTemplate(templateId: string): Promise<Document[]> {
    return this.find((doc) => doc.templateId === templateId);
  }

  // ============================================================================
  // Advanced Query Methods
  // ============================================================================

  /**
   * Get contracts
   */
  async getContracts(): Promise<Document[]> {
    return this.getDocumentsByType('contract');
  }

  /**
   * Get invoices
   */
  async getInvoices(): Promise<Document[]> {
    return this.getDocumentsByType('invoice');
  }

  /**
   * Get estimates
   */
  async getEstimates(): Promise<Document[]> {
    return this.getDocumentsByType('estimate');
  }

  /**
   * Get reports
   */
  async getReports(): Promise<Document[]> {
    return this.getDocumentsByType('report');
  }

  /**
   * Get draft documents
   */
  async getDraftDocuments(): Promise<Document[]> {
    return this.getDocumentsByStatus('draft');
  }

  /**
   * Get sent documents
   */
  async getSentDocuments(): Promise<Document[]> {
    return this.getDocumentsByStatus('sent');
  }

  /**
   * Get approved documents
   */
  async getApprovedDocuments(): Promise<Document[]> {
    return this.getDocumentsByStatus('approved');
  }

  /**
   * Get documents requiring signature
   */
  async getDocumentsRequiringSignature(): Promise<Document[]> {
    return this.find((doc) => {
      if (!doc.signatures || doc.signatures.length === 0) return false;
      return doc.signatures.some((sig) => !sig.signedAt);
    });
  }

  /**
   * Get signed documents
   */
  async getSignedDocuments(): Promise<Document[]> {
    return this.find((doc) => {
      if (!doc.signatures || doc.signatures.length === 0) return false;
      return doc.signatures.every((sig) => sig.signedAt !== undefined);
    });
  }

  /**
   * Search documents by name
   */
  async searchDocuments(query: string): Promise<Document[]> {
    const lowerQuery = query.toLowerCase();
    return this.find((doc) => doc.name.toLowerCase().includes(lowerQuery));
  }

  // ============================================================================
  // Document Status Management
  // ============================================================================

  /**
   * Update document status
   */
  async updateStatus(documentId: string, status: DocumentStatus): Promise<Document | null> {
    return this.update(documentId, { status });
  }

  /**
   * Mark document as draft
   */
  async markAsDraft(documentId: string): Promise<Document | null> {
    return this.updateStatus(documentId, 'draft');
  }

  /**
   * Mark document as sent
   */
  async markAsSent(documentId: string): Promise<Document | null> {
    return this.updateStatus(documentId, 'sent');
  }

  /**
   * Mark document as approved
   */
  async markAsApproved(documentId: string): Promise<Document | null> {
    return this.updateStatus(documentId, 'approved');
  }

  /**
   * Mark document as completed
   */
  async markAsCompleted(documentId: string): Promise<Document | null> {
    return this.updateStatus(documentId, 'completed');
  }

  /**
   * Archive document
   */
  async archiveDocument(documentId: string): Promise<Document | null> {
    return this.updateStatus(documentId, 'archived');
  }

  // ============================================================================
  // Signature Management
  // ============================================================================

  /**
   * Add signature to document
   */
  async addSignature(
    documentId: string,
    signature: {
      name: string;
      signedAt?: string;
      ip?: string;
    }
  ): Promise<Document | null> {
    const document = await this.getById(documentId);
    if (!document) return null;

    const signatures = document.signatures || [];
    const updatedSignatures = [...signatures, signature];

    return this.update(documentId, { signatures: updatedSignatures });
  }

  /**
   * Remove signature from document
   */
  async removeSignature(documentId: string, signerName: string): Promise<Document | null> {
    const document = await this.getById(documentId);
    if (!document || !document.signatures) return null;

    const updatedSignatures = document.signatures.filter((sig) => sig.name !== signerName);

    return this.update(documentId, { signatures: updatedSignatures });
  }

  /**
   * Update signature (mark as signed)
   */
  async signDocument(documentId: string, signerName: string, ip?: string): Promise<Document | null> {
    const document = await this.getById(documentId);
    if (!document || !document.signatures) return null;

    const updatedSignatures = document.signatures.map((sig) => {
      if (sig.name === signerName) {
        return {
          ...sig,
          signedAt: this.getCurrentTimestamp(),
          ip,
        };
      }
      return sig;
    });

    return this.update(documentId, { signatures: updatedSignatures });
  }

  // ============================================================================
  // Version Management
  // ============================================================================

  /**
   * Update document version
   */
  async incrementVersion(documentId: string): Promise<Document | null> {
    const document = await this.getById(documentId);
    if (!document) return null;

    const currentVersion = document.version || 1;
    return this.update(documentId, { version: currentVersion + 1 });
  }

  /**
   * Get documents by version
   */
  async getDocumentsByVersion(version: number): Promise<Document[]> {
    return this.find((doc) => doc.version === version);
  }

  /**
   * Get latest version of documents
   */
  async getLatestVersionDocuments(): Promise<Document[]> {
    const allDocs = await this.getAll();
    const docsByName = new Map<string, Document>();

    allDocs.forEach((doc) => {
      const existing = docsByName.get(doc.name);
      if (!existing || (doc.version || 0) > (existing.version || 0)) {
        docsByName.set(doc.name, doc);
      }
    });

    return Array.from(docsByName.values());
  }

  // ============================================================================
  // Tag Management
  // ============================================================================

  /**
   * Add tags to document
   */
  async addTags(documentId: string, tags: string[]): Promise<Document | null> {
    const document = await this.getById(documentId);
    if (!document) return null;

    const existingTags = document.tags || [];
    const uniqueTags = Array.from(new Set([...existingTags, ...tags]));

    return this.update(documentId, { tags: uniqueTags });
  }

  /**
   * Remove tags from document
   */
  async removeTags(documentId: string, tags: string[]): Promise<Document | null> {
    const document = await this.getById(documentId);
    if (!document || !document.tags) return null;

    const tagsToRemove = new Set(tags);
    const updatedTags = document.tags.filter((tag) => !tagsToRemove.has(tag));

    return this.update(documentId, { tags: updatedTags });
  }

  /**
   * Get documents by tag
   */
  async getDocumentsByTag(tag: string): Promise<Document[]> {
    return this.find((doc) => {
      if (!doc.tags) return false;
      return doc.tags.includes(tag);
    });
  }

  /**
   * Get documents by multiple tags (all tags must match)
   */
  async getDocumentsByTags(tags: string[]): Promise<Document[]> {
    const tagSet = new Set(tags);
    return this.find((doc) => {
      if (!doc.tags) return false;
      return tags.every((tag) => doc.tags!.includes(tag));
    });
  }

  // ============================================================================
  // Date-based Queries
  // ============================================================================

  /**
   * Get documents saved within date range
   */
  async getDocumentsByDateRange(startDate: string, endDate: string): Promise<Document[]> {
    return this.find((doc) => {
      return doc.savedAt >= startDate && doc.savedAt <= endDate;
    });
  }

  /**
   * Get recently saved documents
   */
  async getRecentDocuments(limit: number = 10): Promise<Document[]> {
    const allDocs = await this.getAll();
    return allDocs.sort((a, b) => (a.savedAt > b.savedAt ? -1 : 1)).slice(0, limit);
  }

  // ============================================================================
  // Project Association
  // ============================================================================

  /**
   * Move document to another project
   */
  async moveToProject(documentId: string, newProjectId: string): Promise<Document | null> {
    return this.update(documentId, { projectId: newProjectId });
  }

  /**
   * Get project documents grouped by type
   */
  async getProjectDocumentsGroupedByType(projectId: string): Promise<Record<DocumentType, Document[]>> {
    const projectDocs = await this.getDocumentsByProject(projectId);

    const grouped: Record<DocumentType, Document[]> = {
      contract: [],
      invoice: [],
      estimate: [],
      report: [],
      etc: [],
    };

    projectDocs.forEach((doc) => {
      grouped[doc.type].push(doc);
    });

    return grouped;
  }
}
