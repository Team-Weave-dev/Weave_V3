/**
 * ClientService Tests
 *
 * Tests for the client management service
 */

import { ClientService } from '../ClientService'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { StorageManager } from '../../core/StorageManager'
import type { Client, ClientContact } from '../../types/entities/client'

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

describe('ClientService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: ClientService

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear()

    // Create fresh adapter and storage manager
    const { LocalStorageAdapter } = await import('../../adapters/LocalStorageAdapter')
    const { StorageManager } = await import('../../core/StorageManager')

    adapter = new LocalStorageAdapter()
    storage = new StorageManager(adapter)
    service = new ClientService(storage)
  })

  describe('basic CRUD operations', () => {
    it('should create a new client', async () => {
      const clientData = {
        userId: 'user-1',
        name: 'John Doe',
      }

      const client = await service.create(clientData)

      expect(client.id).toBeDefined()
      expect(client.userId).toBe('user-1')
      expect(client.name).toBe('John Doe')
      expect(client.createdAt).toBeDefined()
      expect(client.updatedAt).toBeDefined()
    })

    it('should get client by ID', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Jane Smith',
      })

      const retrieved = await service.getById(client.id)

      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe(client.id)
      expect(retrieved!.name).toBe('Jane Smith')
    })

    it('should update client', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Old Name',
      })

      const updated = await service.update(client.id, {
        name: 'New Name',
        email: 'new@example.com',
      })

      expect(updated).not.toBeNull()
      expect(updated!.name).toBe('New Name')
      expect(updated!.email).toBe('new@example.com')
    })

    it('should delete client', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'To Delete',
      })

      await service.delete(client.id)

      const retrieved = await service.getById(client.id)
      expect(retrieved).toBeNull()
    })

    it('should get all clients', async () => {
      await service.create({ userId: 'user-1', name: 'Client 1' })
      await service.create({ userId: 'user-1', name: 'Client 2' })
      await service.create({ userId: 'user-1', name: 'Client 3' })

      const allClients = await service.getAll()

      expect(allClients).toHaveLength(3)
    })
  })

  describe('basic query methods', () => {
    beforeEach(async () => {
      // Create test data
      await service.create({ userId: 'user-1', name: 'Client 1', company: 'Company A' })
      await service.create({ userId: 'user-1', name: 'Client 2' })
      await service.create({ userId: 'user-2', name: 'Client 3', company: 'Company B' })
    })

    it('should get clients by user ID', async () => {
      const clients = await service.getClientsByUser('user-1')

      expect(clients).toHaveLength(2)
      expect(clients.every((c) => c.userId === 'user-1')).toBe(true)
    })

    it('should get company clients', async () => {
      const companyClients = await service.getCompanyClients()

      expect(companyClients).toHaveLength(2)
      expect(companyClients.every((c) => c.company !== undefined)).toBe(true)
    })

    it('should get individual clients', async () => {
      const individualClients = await service.getIndividualClients()

      expect(individualClients).toHaveLength(1)
      expect(individualClients.every((c) => c.company === undefined)).toBe(true)
    })
  })

  describe('search methods', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        name: 'Alice Johnson',
        company: 'Tech Corp',
        email: 'alice@techcorp.com',
        phone: '555-1234',
      })
      await service.create({
        userId: 'user-1',
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '555-5678',
      })
      await service.create({
        userId: 'user-1',
        name: 'Charlie Brown',
        company: 'Design Studio',
        email: 'charlie@design.com',
      })
    })

    it('should search clients by name', async () => {
      const results = await service.searchClients('alice')

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Alice Johnson')
    })

    it('should search clients by company', async () => {
      const results = await service.searchClients('tech')

      expect(results).toHaveLength(1)
      expect(results[0].company).toBe('Tech Corp')
    })

    it('should search by email', async () => {
      const results = await service.searchByEmail('bob@')

      expect(results).toHaveLength(1)
      expect(results[0].email).toBe('bob@example.com')
    })

    it('should search by phone', async () => {
      const results = await service.searchByPhone('555-1234')

      expect(results).toHaveLength(1)
      expect(results[0].phone).toBe('555-1234')
    })

    it('should get client by exact email', async () => {
      const client = await service.getClientByEmail('alice@techcorp.com')

      expect(client).not.toBeNull()
      expect(client!.name).toBe('Alice Johnson')
    })

    it('should return null for non-existent email', async () => {
      const client = await service.getClientByEmail('nonexistent@example.com')

      expect(client).toBeNull()
    })
  })

  describe('address management', () => {
    it('should update client address', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const updated = await service.updateAddress(client.id, {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      })

      expect(updated).not.toBeNull()
      expect(updated!.address).toEqual({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      })
    })

    it('should partially update address', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        address: {
          street: '123 Main St',
          city: 'Old City',
        },
      })

      const updated = await service.updateAddress(client.id, {
        city: 'New City',
        country: 'USA',
      })

      expect(updated!.address).toEqual({
        street: '123 Main St',
        city: 'New City',
        country: 'USA',
      })
    })

    it('should get clients by city', async () => {
      await service.create({
        userId: 'user-1',
        name: 'Client 1',
        address: { city: 'New York' },
      })
      await service.create({
        userId: 'user-1',
        name: 'Client 2',
        address: { city: 'New York' },
      })
      await service.create({
        userId: 'user-1',
        name: 'Client 3',
        address: { city: 'Los Angeles' },
      })

      const nyClients = await service.getClientsByCity('New York')

      expect(nyClients).toHaveLength(2)
    })

    it('should get clients by country', async () => {
      await service.create({
        userId: 'user-1',
        name: 'Client 1',
        address: { country: 'USA' },
      })
      await service.create({
        userId: 'user-1',
        name: 'Client 2',
        address: { country: 'USA' },
      })
      await service.create({
        userId: 'user-1',
        name: 'Client 3',
        address: { country: 'Canada' },
      })

      const usaClients = await service.getClientsByCountry('USA')

      expect(usaClients).toHaveLength(2)
    })
  })

  describe('contact management', () => {
    it('should update primary contact information', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const updated = await service.updateContact(client.id, {
        email: 'new@example.com',
        phone: '555-9999',
        website: 'https://example.com',
      })

      expect(updated!.email).toBe('new@example.com')
      expect(updated!.phone).toBe('555-9999')
      expect(updated!.website).toBe('https://example.com')
    })

    it('should add contact person', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const contactPerson: ClientContact = {
        name: 'John Manager',
        role: 'Project Manager',
        email: 'john@example.com',
        phone: '555-1111',
      }

      const updated = await service.addContactPerson(client.id, contactPerson)

      expect(updated!.contacts).toHaveLength(1)
      expect(updated!.contacts![0].name).toBe('John Manager')
    })

    it('should remove contact person', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        contacts: [
          { name: 'Person 1', email: 'p1@example.com' },
          { name: 'Person 2', email: 'p2@example.com' },
        ],
      })

      const updated = await service.removeContactPerson(client.id, 'Person 1')

      expect(updated!.contacts).toHaveLength(1)
      expect(updated!.contacts![0].name).toBe('Person 2')
    })

    it('should update contact person', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        contacts: [{ name: 'John Doe', role: 'Manager' }],
      })

      const updated = await service.updateContactPerson(client.id, 'John Doe', {
        role: 'Senior Manager',
        email: 'john@example.com',
      })

      expect(updated!.contacts![0].role).toBe('Senior Manager')
      expect(updated!.contacts![0].email).toBe('john@example.com')
    })

    it('should set primary contact', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        contacts: [
          { name: 'Person 1', isPrimary: true },
          { name: 'Person 2', isPrimary: false },
        ],
      })

      const updated = await service.setPrimaryContact(client.id, 'Person 2')

      expect(updated!.contacts![0].isPrimary).toBe(false)
      expect(updated!.contacts![1].isPrimary).toBe(true)
    })

    it('should get primary contact', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        contacts: [
          { name: 'Person 1', isPrimary: false },
          { name: 'Person 2', isPrimary: true },
        ],
      })

      const primary = await service.getPrimaryContact(client.id)

      expect(primary).not.toBeNull()
      expect(primary!.name).toBe('Person 2')
    })
  })

  describe('rating management', () => {
    it('should update client rating', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const updated = await service.updateRating(client.id, 4)

      expect(updated!.rating).toBe(4)
    })

    it('should throw error for invalid rating', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      await expect(service.updateRating(client.id, 6)).rejects.toThrow(
        'Rating must be between 1 and 5'
      )
      await expect(service.updateRating(client.id, 0)).rejects.toThrow(
        'Rating must be between 1 and 5'
      )
    })

    it('should get clients by rating', async () => {
      await service.create({ userId: 'user-1', name: 'Client 1', rating: 5 })
      await service.create({ userId: 'user-1', name: 'Client 2', rating: 4 })
      await service.create({ userId: 'user-1', name: 'Client 3', rating: 5 })

      const fiveStarClients = await service.getClientsByRating(5)

      expect(fiveStarClients).toHaveLength(2)
    })

    it('should get clients by minimum rating', async () => {
      await service.create({ userId: 'user-1', name: 'Client 1', rating: 5 })
      await service.create({ userId: 'user-1', name: 'Client 2', rating: 3 })
      await service.create({ userId: 'user-1', name: 'Client 3', rating: 4 })

      const highRatedClients = await service.getClientsByMinRating(4)

      expect(highRatedClients).toHaveLength(2)
    })
  })

  describe('tag management', () => {
    it('should add tags to client', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const updated = await service.addTags(client.id, ['important', 'vip'])

      expect(updated!.tags).toEqual(['important', 'vip'])
    })

    it('should add tags without duplicates', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        tags: ['existing'],
      })

      const updated = await service.addTags(client.id, ['existing', 'new'])

      expect(updated!.tags).toEqual(['existing', 'new'])
    })

    it('should remove tags from client', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        tags: ['tag1', 'tag2', 'tag3'],
      })

      const updated = await service.removeTags(client.id, ['tag1', 'tag3'])

      expect(updated!.tags).toEqual(['tag2'])
    })

    it('should get clients by tag', async () => {
      await service.create({ userId: 'user-1', name: 'Client 1', tags: ['vip'] })
      await service.create({ userId: 'user-1', name: 'Client 2', tags: ['regular'] })
      await service.create({ userId: 'user-1', name: 'Client 3', tags: ['vip'] })

      const vipClients = await service.getClientsByTag('vip')

      expect(vipClients).toHaveLength(2)
    })
  })

  describe('notes management', () => {
    it('should add note to client', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const updated = await service.addNote(client.id, 'First note')

      expect(updated!.notes).toContain('First note')
      expect(updated!.notes).toContain('[')
    })

    it('should append notes with timestamps', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        notes: '[2025-01-01T00:00:00.000Z]\nFirst note',
      })

      const updated = await service.addNote(client.id, 'Second note')

      expect(updated!.notes).toContain('First note')
      expect(updated!.notes).toContain('Second note')
    })

    it('should update notes completely', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
        notes: 'Old notes',
      })

      const updated = await service.updateNotes(client.id, 'New notes')

      expect(updated!.notes).toBe('New notes')
    })
  })

  describe('business information', () => {
    it('should update business information', async () => {
      const client = await service.create({
        userId: 'user-1',
        name: 'Test Client',
      })

      const updated = await service.updateBusinessInfo(client.id, {
        businessNumber: '123-45-6789',
        taxId: 'TAX-123',
        website: 'https://example.com',
        industry: 'Technology',
      })

      expect(updated!.businessNumber).toBe('123-45-6789')
      expect(updated!.taxId).toBe('TAX-123')
      expect(updated!.website).toBe('https://example.com')
      expect(updated!.industry).toBe('Technology')
    })

    it('should get clients by industry', async () => {
      await service.create({ userId: 'user-1', name: 'Client 1', industry: 'Technology' })
      await service.create({ userId: 'user-1', name: 'Client 2', industry: 'Finance' })
      await service.create({ userId: 'user-1', name: 'Client 3', industry: 'Technology' })

      const techClients = await service.getClientsByIndustry('Technology')

      expect(techClients).toHaveLength(2)
    })
  })

  describe('sorting and organization', () => {
    beforeEach(async () => {
      await service.create({ userId: 'user-1', name: 'Charlie', company: 'B Corp', rating: 3 })
      await service.create({ userId: 'user-1', name: 'Alice', company: 'A Corp', rating: 5 })
      await service.create({ userId: 'user-1', name: 'Bob', company: 'C Corp', rating: 4 })
    })

    it('should get clients sorted by name', async () => {
      const sorted = await service.getClientsSortedByName()

      expect(sorted[0].name).toBe('Alice')
      expect(sorted[1].name).toBe('Bob')
      expect(sorted[2].name).toBe('Charlie')
    })

    it('should get clients sorted by company', async () => {
      const sorted = await service.getClientsSortedByCompany()

      expect(sorted[0].company).toBe('A Corp')
      expect(sorted[1].company).toBe('B Corp')
      expect(sorted[2].company).toBe('C Corp')
    })

    it('should get clients sorted by rating (descending)', async () => {
      const sorted = await service.getClientsSortedByRating()

      expect(sorted[0].rating).toBe(5)
      expect(sorted[1].rating).toBe(4)
      expect(sorted[2].rating).toBe(3)
    })

    it('should get recent clients', async () => {
      const recent = await service.getRecentClients(2)

      expect(recent).toHaveLength(2)
      // Recently created clients (order may vary due to same timestamp)
      const names = recent.map((c) => c.name)
      expect(names).toContain('Charlie')
      expect(names).toContain('Alice')
    })
  })

  describe('statistics', () => {
    beforeEach(async () => {
      await service.create({ userId: 'user-1', name: 'Client 1', company: 'Corp A', rating: 5 })
      await service.create({ userId: 'user-1', name: 'Client 2', rating: 4 })
      await service.create({ userId: 'user-1', name: 'Client 3', company: 'Corp B', rating: 5 })
      await service.create({
        userId: 'user-1',
        name: 'Client 4',
        address: { country: 'USA' },
        rating: 3,
      })
      await service.create({
        userId: 'user-1',
        name: 'Client 5',
        address: { country: 'USA' },
        rating: 4,
      })
      await service.create({
        userId: 'user-1',
        name: 'Client 6',
        address: { country: 'Canada' },
      })
    })

    it('should get client count by type', async () => {
      const counts = await service.getClientCountByType()

      expect(counts.company).toBe(2)
      expect(counts.individual).toBe(4)
    })

    it('should get clients by country statistics', async () => {
      const stats = await service.getClientsByCountryStats()

      expect(stats['USA']).toBe(2)
      expect(stats['Canada']).toBe(1)
      expect(stats['Unknown']).toBe(3)
    })

    it('should get rating statistics', async () => {
      const stats = await service.getRatingStats()

      expect(stats[5]).toBe(2)
      expect(stats[4]).toBe(2)
      expect(stats[3]).toBe(1)
      expect(stats[2]).toBe(0)
      expect(stats[1]).toBe(0)
    })

    it('should get average rating', async () => {
      const avgRating = await service.getAverageRating()

      // (5 + 4 + 5 + 3 + 4) / 5 = 4.2
      expect(avgRating).toBeCloseTo(4.2, 1)
    })

    it('should return 0 for average rating when no ratings exist', async () => {
      // Clear and create clients without ratings
      await service.delete((await service.getAll())[0].id)
      await service.delete((await service.getAll())[0].id)
      await service.delete((await service.getAll())[0].id)
      await service.delete((await service.getAll())[0].id)
      await service.delete((await service.getAll())[0].id)
      await service.delete((await service.getAll())[0].id)

      await service.create({ userId: 'user-1', name: 'No Rating' })

      const avgRating = await service.getAverageRating()

      expect(avgRating).toBe(0)
    })
  })
})
