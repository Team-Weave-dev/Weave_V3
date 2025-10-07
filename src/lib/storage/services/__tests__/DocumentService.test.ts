/**
 * DocumentService Tests
 *
 * Tests for the document management service
 */

import { DocumentService } from '../DocumentService'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { StorageManager } from '../../core/StorageManager'
import type { Document, DocumentType, DocumentStatus } from '../../types/entities/document'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

global.localStorage = localStorageMock as any

describe('DocumentService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: DocumentService

  beforeEach(async () => {
    localStorage.clear()

    const { LocalStorageAdapter } = await import('../../adapters/LocalStorageAdapter')
    const { StorageManager } = await import('../../core/StorageManager')

    adapter = new LocalStorageAdapter()
    storage = new StorageManager(adapter)
    service = new DocumentService(storage)
  })

  describe('basic CRUD operations', () => {
    it('should create a new document', async () => {
      const docData = {
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      }

      const doc = await service.create(docData)

      expect(doc.id).toBeDefined()
      expect(doc.name).toBe('Contract')
      expect(doc.type).toBe('contract')
      expect(doc.status).toBe('draft')
    })

    it('should get document by ID', async () => {
      const doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Test Doc',
        type: 'report' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })

      const retrieved = await service.getById(doc.id)

      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe(doc.id)
    })

    it('should update document', async () => {
      const doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Old Name',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })

      const updated = await service.update(doc.id, {
        name: 'New Name',
        status: 'sent' as DocumentStatus,
      })

      expect(updated!.name).toBe('New Name')
      expect(updated!.status).toBe('sent')
    })

    it('should delete document', async () => {
      const doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'To Delete',
        type: 'invoice' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })

      await service.delete(doc.id)

      const retrieved = await service.getById(doc.id)
      expect(retrieved).toBeNull()
    })
  })

  describe('basic query methods', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc 1',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-2',
        name: 'Doc 2',
        type: 'invoice' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-2',
        projectId: 'project-1',
        name: 'Doc 3',
        type: 'report' as DocumentType,
        status: 'approved' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
    })

    it('should get documents by project', async () => {
      const docs = await service.getDocumentsByProject('project-1')

      expect(docs).toHaveLength(2)
      expect(docs.every((d) => d.projectId === 'project-1')).toBe(true)
    })

    it('should get documents by user', async () => {
      const docs = await service.getDocumentsByUser('user-1')

      expect(docs).toHaveLength(2)
      expect(docs.every((d) => d.userId === 'user-1')).toBe(true)
    })

    it('should get documents by type', async () => {
      const contracts = await service.getDocumentsByType('contract')

      expect(contracts).toHaveLength(1)
      expect(contracts[0].type).toBe('contract')
    })

    it('should get documents by status', async () => {
      const drafts = await service.getDocumentsByStatus('draft')

      expect(drafts).toHaveLength(1)
      expect(drafts[0].status).toBe('draft')
    })
  })

  describe('advanced query methods', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract 1',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Invoice 1',
        type: 'invoice' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Estimate 1',
        type: 'estimate' as DocumentType,
        status: 'approved' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Report 1',
        type: 'report' as DocumentType,
        status: 'completed' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
    })

    it('should get contracts', async () => {
      const contracts = await service.getContracts()

      expect(contracts).toHaveLength(1)
      expect(contracts[0].type).toBe('contract')
    })

    it('should get invoices', async () => {
      const invoices = await service.getInvoices()

      expect(invoices).toHaveLength(1)
      expect(invoices[0].type).toBe('invoice')
    })

    it('should get estimates', async () => {
      const estimates = await service.getEstimates()

      expect(estimates).toHaveLength(1)
      expect(estimates[0].type).toBe('estimate')
    })

    it('should get reports', async () => {
      const reports = await service.getReports()

      expect(reports).toHaveLength(1)
      expect(reports[0].type).toBe('report')
    })

    it('should get draft documents', async () => {
      const drafts = await service.getDraftDocuments()

      expect(drafts).toHaveLength(1)
      expect(drafts[0].status).toBe('draft')
    })

    it('should get sent documents', async () => {
      const sent = await service.getSentDocuments()

      expect(sent).toHaveLength(1)
      expect(sent[0].status).toBe('sent')
    })

    it('should get approved documents', async () => {
      const approved = await service.getApprovedDocuments()

      expect(approved).toHaveLength(1)
      expect(approved[0].status).toBe('approved')
    })

    it('should search documents by name', async () => {
      const results = await service.searchDocuments('contract')

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Contract 1')
    })
  })

  describe('document status management', () => {
    let doc: Document

    beforeEach(async () => {
      doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Test Doc',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
    })

    it('should update document status', async () => {
      const updated = await service.updateStatus(doc.id, 'sent')

      expect(updated!.status).toBe('sent')
    })

    it('should mark as draft', async () => {
      const updated = await service.markAsDraft(doc.id)

      expect(updated!.status).toBe('draft')
    })

    it('should mark as sent', async () => {
      const updated = await service.markAsSent(doc.id)

      expect(updated!.status).toBe('sent')
    })

    it('should mark as approved', async () => {
      const updated = await service.markAsApproved(doc.id)

      expect(updated!.status).toBe('approved')
    })

    it('should mark as completed', async () => {
      const updated = await service.markAsCompleted(doc.id)

      expect(updated!.status).toBe('completed')
    })

    it('should archive document', async () => {
      const updated = await service.archiveDocument(doc.id)

      expect(updated!.status).toBe('archived')
    })
  })

  describe('signature management', () => {
    let doc: Document

    beforeEach(async () => {
      doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract',
        type: 'contract' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
    })

    it('should add signature', async () => {
      const updated = await service.addSignature(doc.id, {
        name: 'John Doe',
      })

      expect(updated!.signatures).toHaveLength(1)
      expect(updated!.signatures![0].name).toBe('John Doe')
    })

    it('should remove signature', async () => {
      await service.addSignature(doc.id, { name: 'John Doe' })
      await service.addSignature(doc.id, { name: 'Jane Smith' })

      const updated = await service.removeSignature(doc.id, 'John Doe')

      expect(updated!.signatures).toHaveLength(1)
      expect(updated!.signatures![0].name).toBe('Jane Smith')
    })

    it('should sign document', async () => {
      await service.addSignature(doc.id, { name: 'John Doe' })

      const updated = await service.signDocument(doc.id, 'John Doe', '192.168.1.1')

      expect(updated!.signatures![0].signedAt).toBeDefined()
      expect(updated!.signatures![0].ip).toBe('192.168.1.1')
    })

    it('should get documents requiring signature', async () => {
      await service.addSignature(doc.id, { name: 'John Doe' })

      const doc2 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract 2',
        type: 'contract' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date().toISOString(),
        signatures: [{ name: 'Jane Smith', signedAt: new Date().toISOString() }],
      })

      const requiring = await service.getDocumentsRequiringSignature()

      expect(requiring).toHaveLength(1)
      expect(requiring[0].id).toBe(doc.id)
    })

    it('should get signed documents', async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Signed Contract',
        type: 'contract' as DocumentType,
        status: 'approved' as DocumentStatus,
        savedAt: new Date().toISOString(),
        signatures: [{ name: 'John Doe', signedAt: new Date().toISOString() }],
      })

      const signed = await service.getSignedDocuments()

      expect(signed).toHaveLength(1)
      expect(signed[0].name).toBe('Signed Contract')
    })
  })

  describe('version management', () => {
    it('should increment version', async () => {
      const doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
        version: 1,
      })

      const updated = await service.incrementVersion(doc.id)

      expect(updated!.version).toBe(2)
    })

    it('should get documents by version', async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc v1',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
        version: 1,
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc v2',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
        version: 2,
      })

      const v1Docs = await service.getDocumentsByVersion(1)

      expect(v1Docs).toHaveLength(1)
      expect(v1Docs[0].version).toBe(1)
    })

    it('should get latest version documents', async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
        version: 1,
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
        version: 2,
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Invoice',
        type: 'invoice' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date().toISOString(),
        version: 1,
      })

      const latest = await service.getLatestVersionDocuments()

      expect(latest).toHaveLength(2)
      const contractDoc = latest.find((d) => d.name === 'Contract')
      expect(contractDoc!.version).toBe(2)
    })
  })

  describe('tag management', () => {
    let doc: Document

    beforeEach(async () => {
      doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Test Doc',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
    })

    it('should add tags', async () => {
      const updated = await service.addTags(doc.id, ['important', 'urgent'])

      expect(updated!.tags).toEqual(['important', 'urgent'])
    })

    it('should remove tags', async () => {
      await service.addTags(doc.id, ['tag1', 'tag2', 'tag3'])

      const updated = await service.removeTags(doc.id, ['tag1', 'tag3'])

      expect(updated!.tags).toEqual(['tag2'])
    })

    it('should get documents by tag', async () => {
      await service.addTags(doc.id, ['urgent'])

      const urgent = await service.getDocumentsByTag('urgent')

      expect(urgent).toHaveLength(1)
      expect(urgent[0].id).toBe(doc.id)
    })

    it('should get documents by multiple tags', async () => {
      await service.addTags(doc.id, ['urgent', 'important'])

      const doc2 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc 2',
        type: 'invoice' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
        tags: ['urgent'],
      })

      const matching = await service.getDocumentsByTags(['urgent', 'important'])

      expect(matching).toHaveLength(1)
      expect(matching[0].id).toBe(doc.id)
    })
  })

  describe('date-based queries', () => {
    it('should get documents by date range', async () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z').toISOString()
      const date2 = new Date('2025-01-15T00:00:00.000Z').toISOString()
      const date3 = new Date('2025-02-01T00:00:00.000Z').toISOString()

      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc 1',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: date1,
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc 2',
        type: 'invoice' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: date2,
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc 3',
        type: 'report' as DocumentType,
        status: 'approved' as DocumentStatus,
        savedAt: date3,
      })

      const inRange = await service.getDocumentsByDateRange(date1, date2)

      expect(inRange).toHaveLength(2)
    })

    it('should get recent documents', async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Old Doc',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'New Doc 1',
        type: 'invoice' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date('2025-02-01T00:00:00.000Z').toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'New Doc 2',
        type: 'report' as DocumentType,
        status: 'approved' as DocumentStatus,
        savedAt: new Date('2025-02-15T00:00:00.000Z').toISOString(),
      })

      const recent = await service.getRecentDocuments(2)

      expect(recent).toHaveLength(2)
      // ISO 8601 문자열은 렉시컬 비교로 시간 순서 보장
      expect(recent[0].savedAt > recent[1].savedAt).toBe(true)
    })
  })

  describe('project association', () => {
    it('should move document to another project', async () => {
      const doc = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Doc',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })

      const updated = await service.moveToProject(doc.id, 'project-2')

      expect(updated!.projectId).toBe('project-2')
    })

    it('should get project documents grouped by type', async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract 1',
        type: 'contract' as DocumentType,
        status: 'draft' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Invoice 1',
        type: 'invoice' as DocumentType,
        status: 'sent' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })
      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        name: 'Contract 2',
        type: 'contract' as DocumentType,
        status: 'approved' as DocumentStatus,
        savedAt: new Date().toISOString(),
      })

      const grouped = await service.getProjectDocumentsGroupedByType('project-1')

      expect(grouped.contract).toHaveLength(2)
      expect(grouped.invoice).toHaveLength(1)
      expect(grouped.estimate).toHaveLength(0)
    })
  })
})
