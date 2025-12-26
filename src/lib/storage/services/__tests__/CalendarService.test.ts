/**
 * CalendarService Unit Tests
 *
 * Tests for the Calendar Event domain service
 */

import { CalendarService } from '../CalendarService'
import { StorageManager } from '../../core/StorageManager'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'

describe('CalendarService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: CalendarService
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    // Reset mock localStorage
    mockLocalStorage = {}

    ;(global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      return mockLocalStorage[key] ?? null
    })

    ;(global.localStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        mockLocalStorage[key] = value
      }
    )

    ;(global.localStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      delete mockLocalStorage[key]
    })

    ;(global.localStorage.clear as jest.Mock).mockImplementation(() => {
      mockLocalStorage = {}
    })

    Object.defineProperty(global.localStorage, 'length', {
      get: () => Object.keys(mockLocalStorage).length,
      configurable: true,
    })

    ;(global.localStorage.key as jest.Mock).mockImplementation((index: number) => {
      const keys = Object.keys(mockLocalStorage)
      return keys[index] ?? null
    })

    // Create adapter, storage, and service
    adapter = new LocalStorageAdapter({ prefix: 'test_' })
    storage = new StorageManager(adapter)
    service = new CalendarService(storage)
  })

  describe('constructor', () => {
    it('should create CalendarService instance', () => {
      expect(service).toBeInstanceOf(CalendarService)
    })
  })

  describe('basic CRUD operations', () => {
    it('should create a new event', async () => {
      const eventData = {
        userId: 'user-1',
        title: 'Team Meeting',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed' as const,
      }

      const event = await service.create(eventData)

      expect(event).toMatchObject(eventData)
      expect(event.id).toBeDefined()
      expect(event.createdAt).toBeDefined()
      expect(event.updatedAt).toBeDefined()
    })

    it('should get event by ID', async () => {
      const eventData = {
        userId: 'user-1',
        title: 'Team Meeting',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed' as const,
      }

      const created = await service.create(eventData)
      const retrieved = await service.getById(created.id)

      expect(retrieved).toEqual(created)
    })

    it('should update an event', async () => {
      const eventData = {
        userId: 'user-1',
        title: 'Team Meeting',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed' as const,
      }

      const created = await service.create(eventData)
      const updated = await service.update(created.id, { title: 'Updated Meeting' })

      expect(updated).not.toBeNull()
      expect(updated?.title).toBe('Updated Meeting')
    })

    it('should delete an event', async () => {
      const eventData = {
        userId: 'user-1',
        title: 'Team Meeting',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed' as const,
      }

      const created = await service.create(eventData)
      const deleted = await service.delete(created.id)

      expect(deleted).toBe(true)
      expect(await service.getById(created.id)).toBeNull()
    })
  })

  describe('date range queries', () => {
    beforeEach(async () => {
      // January events
      await service.create({
        userId: 'user-1',
        title: 'January Event',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      // February events
      await service.create({
        userId: 'user-1',
        title: 'February Event',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-02-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-02-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      // March events
      await service.create({
        userId: 'user-1',
        title: 'March Event',
        type: 'deadline',
        category: 'work',
        startDate: new Date('2025-03-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-03-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })
    })

    it('should get events by date range', async () => {
      const events = await service.getEventsByDateRange(
        new Date('2025-01-01T00:00:00.000Z').toISOString(),
        new Date('2025-02-01T00:00:00.000Z').toISOString()
      )

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('January Event')
    })

    it('should get events spanning multiple months', async () => {
      const events = await service.getEventsByDateRange(
        new Date('2025-01-01T00:00:00.000Z').toISOString(),
        new Date('2025-03-31T23:59:59.999Z').toISOString()
      )

      expect(events).toHaveLength(3)
    })

    it('should handle events overlapping with range boundaries', async () => {
      // Create an event that spans the boundary
      await service.create({
        userId: 'user-1',
        title: 'Spanning Event',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-31T23:00:00.000Z').toISOString(),
        endDate: new Date('2025-02-01T01:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      const januaryEvents = await service.getEventsByDateRange(
        new Date('2025-01-01T00:00:00.000Z').toISOString(),
        new Date('2025-02-01T00:00:00.000Z').toISOString()
      )

      expect(januaryEvents.some(e => e.title === 'Spanning Event')).toBe(true)
    })
  })

  describe('query by associations', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-a',
        title: 'Project A Meeting',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-2',
        clientId: 'client-x',
        title: 'Client X Meeting',
        type: 'meeting',
        category: 'client',
        startDate: new Date('2025-01-16T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-16T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })
    })

    it('should get events by project ID', async () => {
      const events = await service.getEventsByProject('project-a')

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Project A Meeting')
    })

    it('should get events by client ID', async () => {
      const events = await service.getEventsByClient('client-x')

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Client X Meeting')
    })

    it('should get events by user ID', async () => {
      const user1Events = await service.getEventsByUser('user-1')
      const user2Events = await service.getEventsByUser('user-2')

      expect(user1Events).toHaveLength(1)
      expect(user2Events).toHaveLength(1)
    })
  })

  describe('type and category queries', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        title: 'Team Meeting',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-1',
        title: 'Project Deadline',
        type: 'deadline',
        category: 'work',
        startDate: new Date('2025-01-20T23:59:59.999Z').toISOString(),
        endDate: new Date('2025-01-20T23:59:59.999Z').toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-1',
        title: 'Vacation',
        type: 'other',
        category: 'personal',
        startDate: new Date('2025-02-01T00:00:00.000Z').toISOString(),
        endDate: new Date('2025-02-07T23:59:59.999Z').toISOString(),
        status: 'confirmed',
      })
    })

    it('should get events by type', async () => {
      const meetings = await service.getEventsByType('meeting')
      const deadlines = await service.getEventsByType('deadline')

      expect(meetings).toHaveLength(1)
      expect(deadlines).toHaveLength(1)
    })

    it('should get events by category', async () => {
      const workEvents = await service.getEventsByCategory('work')
      const personalEvents = await service.getEventsByCategory('personal')

      expect(workEvents).toHaveLength(2)
      expect(personalEvents).toHaveLength(1)
    })

    it('should get meetings', async () => {
      const meetings = await service.getMeetings()

      expect(meetings).toHaveLength(1)
      expect(meetings[0].title).toBe('Team Meeting')
    })

    it('should get deadlines', async () => {
      const deadlines = await service.getDeadlines()

      expect(deadlines).toHaveLength(1)
      expect(deadlines[0].title).toBe('Project Deadline')
    })
  })

  describe('status management', () => {
    it('should update event status', async () => {
      const event = await service.create({
        userId: 'user-1',
        title: 'Meeting',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'tentative',
      })

      const updated = await service.updateStatus(event.id, 'confirmed')

      expect(updated).not.toBeNull()
      expect(updated?.status).toBe('confirmed')
    })

    it('should confirm an event', async () => {
      const event = await service.create({
        userId: 'user-1',
        title: 'Meeting',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'tentative',
      })

      const confirmed = await service.confirmEvent(event.id)

      expect(confirmed).not.toBeNull()
      expect(confirmed?.status).toBe('confirmed')
    })

    it('should mark event as tentative', async () => {
      const event = await service.create({
        userId: 'user-1',
        title: 'Meeting',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      const tentative = await service.markTentative(event.id)

      expect(tentative).not.toBeNull()
      expect(tentative?.status).toBe('tentative')
    })

    it('should cancel an event', async () => {
      const event = await service.create({
        userId: 'user-1',
        title: 'Meeting',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      const cancelled = await service.cancelEvent(event.id)

      expect(cancelled).not.toBeNull()
      expect(cancelled?.status).toBe('cancelled')
    })
  })

  describe('time-based queries', () => {
    beforeEach(async () => {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)

      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)

      await service.create({
        userId: 'user-1',
        title: 'Past Event',
        type: 'meeting',
        category: 'work',
        startDate: yesterday.toISOString(),
        endDate: yesterday.toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-1',
        title: 'Today Event',
        type: 'meeting',
        category: 'work',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 3600000).toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-1',
        title: 'Tomorrow Event',
        type: 'meeting',
        category: 'work',
        startDate: tomorrow.toISOString(),
        endDate: tomorrow.toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-1',
        title: 'Next Week Event',
        type: 'meeting',
        category: 'work',
        startDate: nextWeek.toISOString(),
        endDate: nextWeek.toISOString(),
        status: 'confirmed',
      })
    })

    it('should get upcoming events', async () => {
      const upcoming = await service.getUpcomingEvents()

      expect(upcoming.length).toBeGreaterThanOrEqual(2)
      expect(upcoming.every(e => new Date(e.startDate) > new Date())).toBe(true)
    })

    it('should get past events', async () => {
      const past = await service.getPastEvents()

      expect(past.length).toBeGreaterThanOrEqual(1)
      expect(past.some(e => e.title === 'Past Event')).toBe(true)
    })

    it('should limit upcoming events', async () => {
      const upcoming = await service.getUpcomingEvents(1)

      expect(upcoming).toHaveLength(1)
    })

    it('should sort upcoming events by start date', async () => {
      const upcoming = await service.getUpcomingEvents()

      for (let i = 1; i < upcoming.length; i++) {
        expect(new Date(upcoming[i].startDate).getTime()).toBeGreaterThanOrEqual(
          new Date(upcoming[i - 1].startDate).getTime()
        )
      }
    })
  })

  describe('recurring events', () => {
    it('should create a recurring event', async () => {
      const eventData = {
        userId: 'user-1',
        title: 'Weekly Standup',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T10:30:00.000Z').toISOString(),
        status: 'confirmed' as const,
        recurring: {
          pattern: 'weekly' as const,
          interval: 1,
        },
      }

      const event = await service.createRecurringEvent(eventData)

      expect(event).toBeDefined()
      expect(event.recurring).toEqual(eventData.recurring)
    })

    it('should generate next instance of a weekly recurring event', async () => {
      const today = new Date('2025-01-15T10:00:00.000Z')
      const eventData = {
        userId: 'user-1',
        title: 'Weekly Meeting',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 3600000).toISOString(),
        status: 'confirmed' as const,
        recurring: {
          pattern: 'weekly' as const,
          interval: 1,
        },
      }

      const originalEvent = await service.createRecurringEvent(eventData)
      const nextEvent = await service.generateNextRecurringEvent(originalEvent.id)

      expect(nextEvent).toBeDefined()
      expect(nextEvent?.title).toBe(originalEvent.title)

      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      expect(new Date(nextEvent!.startDate).getDate()).toBe(nextWeek.getDate())
    })

    it('should not generate next instance after end date', async () => {
      const today = new Date('2025-01-15T10:00:00.000Z')
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const eventData = {
        userId: 'user-1',
        title: 'Ended Recurring Event',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: yesterday.toISOString(),
        endDate: new Date(yesterday.getTime() + 3600000).toISOString(),
        status: 'confirmed' as const,
        recurring: {
          pattern: 'daily' as const,
          interval: 1,
          endDate: yesterday.toISOString(),
        },
      }

      const event = await service.createRecurringEvent(eventData)
      const nextEvent = await service.generateNextRecurringEvent(event.id)

      expect(nextEvent).toBeNull()
    })

    it('should calculate duration correctly for recurring events', async () => {
      const startDate = new Date('2025-01-15T10:00:00.000Z')
      const endDate = new Date('2025-01-15T11:30:00.000Z')

      const eventData = {
        userId: 'user-1',
        title: '90-minute Meeting',
        type: 'meeting' as const,
        category: 'work' as const,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'confirmed' as const,
        recurring: {
          pattern: 'weekly' as const,
          interval: 1,
        },
      }

      const originalEvent = await service.createRecurringEvent(eventData)
      const nextEvent = await service.generateNextRecurringEvent(originalEvent.id)

      expect(nextEvent).toBeDefined()

      const originalDuration = await service.getEventDuration(originalEvent.id)
      const nextDuration = await service.getEventDuration(nextEvent!.id)

      expect(originalDuration).toBe(90)
      expect(nextDuration).toBe(90)
    })
  })

  describe('attendee queries', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        title: 'Meeting with John',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
        attendees: [
          { name: 'John Doe', email: 'john@example.com', status: 'accepted' },
        ],
      })

      await service.create({
        userId: 'user-1',
        title: 'Meeting with Jane',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-16T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-16T11:00:00.000Z').toISOString(),
        status: 'confirmed',
        attendees: [
          { name: 'Jane Smith', email: 'jane@example.com', status: 'accepted' },
        ],
      })
    })

    it('should get events by attendee name', async () => {
      const events = await service.getEventsByAttendee('John Doe')

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Meeting with John')
    })

    it('should get events by attendee email', async () => {
      const events = await service.getEventsByAttendeeEmail('jane@example.com')

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Meeting with Jane')
    })
  })

  describe('search functionality', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        title: 'React Development Meeting',
        description: 'Discuss React component architecture',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-15T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-15T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })

      await service.create({
        userId: 'user-1',
        title: 'Vue Project',
        description: 'Building a Vue application',
        type: 'meeting',
        category: 'work',
        startDate: new Date('2025-01-16T10:00:00.000Z').toISOString(),
        endDate: new Date('2025-01-16T11:00:00.000Z').toISOString(),
        status: 'confirmed',
      })
    })

    it('should search events by title', async () => {
      const events = await service.searchEvents('React')

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('React Development Meeting')
    })

    it('should search events by description', async () => {
      const events = await service.searchEvents('application')

      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Vue Project')
    })

    it('should be case insensitive', async () => {
      const events = await service.searchEvents('react')

      expect(events).toHaveLength(1)
    })
  })
})
