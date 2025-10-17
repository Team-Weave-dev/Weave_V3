/**
 * SettingsService Tests
 *
 * Tests for the settings service
 */

import { SettingsService } from '../SettingsService'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { StorageManager } from '../../core/StorageManager'
import type { Settings } from '../../types/entities/settings'
import type { ImprovedWidget } from '@/types/improved-dashboard'

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

describe('SettingsService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: SettingsService

  const userId = 'user-1'

  beforeEach(async () => {
    localStorage.clear()

    const { LocalStorageAdapter } = await import('../../adapters/LocalStorageAdapter')
    const { StorageManager } = await import('../../core/StorageManager')

    adapter = new LocalStorageAdapter()
    storage = new StorageManager(adapter)
    service = new SettingsService(storage)
  })

  describe('basic operations', () => {
    it('should get or create default settings', async () => {
      const settings = await service.getOrCreateDefaults(userId)

      expect(settings.userId).toBe(userId)
      expect(settings.dashboard).toBeDefined()
      expect(settings.calendar).toBeDefined()
      expect(settings.projects).toBeDefined()
      expect(settings.preferences).toBeDefined()
      expect(settings.preferences.language).toBe('ko')
    })

    it('should return existing settings if already created', async () => {
      const first = await service.getOrCreateDefaults(userId)
      const second = await service.getOrCreateDefaults(userId)

      expect(first).toEqual(second)
    })

    it('should get settings by user ID', async () => {
      await service.getOrCreateDefaults(userId)

      const settings = await service.getByUserId(userId)

      expect(settings).not.toBeNull()
      expect(settings!.userId).toBe(userId)
    })

    it('should return null for non-existent user', async () => {
      const settings = await service.getByUserId('non-existent')

      expect(settings).toBeNull()
    })

    it('should update settings', async () => {
      await service.getOrCreateDefaults(userId)

      const updated = await service.update(userId, {
        preferences: {
          language: 'en',
          timezone: 'America/New_York',
        },
      })

      expect(updated!.preferences.language).toBe('en')
      expect(updated!.preferences.timezone).toBe('America/New_York')
    })

    it('should delete settings', async () => {
      await service.getOrCreateDefaults(userId)

      const deleted = await service.delete(userId)
      expect(deleted).toBe(true)

      const settings = await service.getByUserId(userId)
      expect(settings).toBeNull()
    })

    it('should return false when deleting non-existent settings', async () => {
      const deleted = await service.delete('non-existent')
      expect(deleted).toBe(false)
    })

    it('should reset all settings to default', async () => {
      await service.getOrCreateDefaults(userId)
      await service.update(userId, {
        preferences: { language: 'en', timezone: 'UTC' },
      })

      const reset = await service.resetAllSettings(userId)

      expect(reset.preferences.language).toBe('ko')
    })
  })

  describe('dashboard settings', () => {
    beforeEach(async () => {
      await service.getOrCreateDefaults(userId)
    })

    it('should add dashboard widget', async () => {
      const widget: ImprovedWidget = {
        id: 'widget-1',
        type: 'todoList' as const,
        position: { x: 0, y: 0, w: 2, h: 2 },
      }

      const updated = await service.addDashboardWidget(userId, widget)

      expect(updated!.dashboard.widgets).toHaveLength(1)
      expect(updated!.dashboard.widgets[0].id).toBe('widget-1')
    })

    it('should remove dashboard widget', async () => {
      const widget: ImprovedWidget = {
        id: 'widget-1',
        type: 'todoList' as const,
        position: { x: 0, y: 0, w: 2, h: 2 },
      }

      await service.addDashboardWidget(userId, widget)
      const updated = await service.removeDashboardWidget(userId, 'widget-1')

      expect(updated!.dashboard.widgets).toHaveLength(0)
    })

    it('should update widget', async () => {
      const widget: ImprovedWidget = {
        id: 'widget-1',
        type: 'todoList' as const,
        position: { x: 0, y: 0, w: 2, h: 2 },
      }

      await service.addDashboardWidget(userId, widget)
      const updated = await service.updateDashboardWidget(userId, 'widget-1', {
        position: { x: 2, y: 2, w: 3, h: 3 },
      })

      expect(updated!.dashboard.widgets[0].position.x).toBe(2)
      expect(updated!.dashboard.widgets[0].position.y).toBe(2)
      expect(updated!.dashboard.widgets[0].position.w).toBe(3)
    })

    it('should reset dashboard', async () => {
      const widget: ImprovedWidget = {
        id: 'widget-1',
        type: 'todoList' as const,
        position: { x: 0, y: 0, w: 2, h: 2 },
      }

      await service.addDashboardWidget(userId, widget)
      const reset = await service.resetDashboard(userId)

      expect(reset!.dashboard.widgets).toHaveLength(0)
      expect(reset!.dashboard.config.cols).toBe(9)
    })
  })

  describe('calendar settings', () => {
    beforeEach(async () => {
      await service.getOrCreateDefaults(userId)
    })

    it('should update calendar view', async () => {
      const updated = await service.updateCalendarView(userId, 'week')

      expect(updated!.calendar.defaultView).toBe('week')
    })

    it('should update week start day', async () => {
      const updated = await service.updateWeekStartDay(userId, 1)

      expect(updated!.calendar.weekStartsOn).toBe(1)
    })

    it('should update working hours', async () => {
      const updated = await service.updateWorkingHours(userId, '09:00', '18:00')

      expect(updated!.calendar.workingHours).toEqual({
        start: '09:00',
        end: '18:00',
      })
    })

    it('should add holiday', async () => {
      const updated = await service.addHoliday(userId, '2025-01-01')

      expect(updated!.calendar.holidays).toContain('2025-01-01')
    })

    it('should remove holiday', async () => {
      await service.addHoliday(userId, '2025-01-01')
      const updated = await service.removeHoliday(userId, '2025-01-01')

      expect(updated!.calendar.holidays || []).not.toContain('2025-01-01')
    })
  })

  describe('project settings', () => {
    beforeEach(async () => {
      await service.getOrCreateDefaults(userId)
    })

    it('should update project view', async () => {
      const updated = await service.updateProjectView(userId, 'detail')

      expect(updated!.projects.defaultView).toBe('detail')
    })

    it('should update project items per page', async () => {
      const updated = await service.updateProjectItemsPerPage(userId, 20)

      expect(updated!.projects.itemsPerPage).toBe(20)
    })
  })

  describe('notification settings', () => {
    beforeEach(async () => {
      await service.getOrCreateDefaults(userId)
    })

    it('should enable email notifications', async () => {
      const updated = await service.setEmailNotifications(userId, true)

      expect(updated!.notifications.email).toBe(true)
    })

    it('should disable email notifications', async () => {
      await service.setEmailNotifications(userId, true)
      const updated = await service.setEmailNotifications(userId, false)

      expect(updated!.notifications.email).toBe(false)
    })

    it('should enable push notifications', async () => {
      const updated = await service.setPushNotifications(userId, true)

      expect(updated!.notifications.push).toBe(true)
    })

    it('should enable desktop notifications', async () => {
      const updated = await service.setDesktopNotifications(userId, true)

      expect(updated!.notifications.desktop).toBe(true)
    })

    it('should enable notification sound', async () => {
      const updated = await service.setNotificationSound(userId, true)

      expect(updated!.notifications.sound).toBe(true)
    })
  })

  describe('user preferences', () => {
    beforeEach(async () => {
      await service.getOrCreateDefaults(userId)
    })

    it('should update language', async () => {
      const updated = await service.updateLanguage(userId, 'en')

      expect(updated!.preferences.language).toBe('en')
    })

    it('should update timezone', async () => {
      const updated = await service.updateTimezone(userId, 'America/New_York')

      expect(updated!.preferences.timezone).toBe('America/New_York')
    })

    it('should update date format', async () => {
      const updated = await service.updateDateFormat(userId, 'MM/DD/YYYY')

      expect(updated!.preferences.dateFormat).toBe('MM/DD/YYYY')
    })

    it('should update time format', async () => {
      const updated = await service.updateTimeFormat(userId, '12')

      expect(updated!.preferences.timeFormat).toBe('12')
    })

    it('should update currency', async () => {
      const updated = await service.updateCurrency(userId, 'USD')

      expect(updated!.preferences.currency).toBe('USD')
    })
  })

  describe('bulk operations', () => {
    beforeEach(async () => {
      await service.getOrCreateDefaults(userId)
    })

    it('should export settings', async () => {
      const exported = await service.exportSettings(userId)

      expect(typeof exported).toBe('string')
      const parsed = JSON.parse(exported) as Settings
      expect(parsed.userId).toBe(userId)
    })

    it('should throw error when exporting non-existent settings', async () => {
      await expect(service.exportSettings('non-existent')).rejects.toThrow()
    })

    it('should import settings', async () => {
      const original = await service.getByUserId(userId)
      const exported = await service.exportSettings(userId)

      // 설정 수정
      await service.updateLanguage(userId, 'en')

      // 원래 설정 가져오기
      const imported = await service.importSettings(userId, exported)

      expect(imported.preferences.language).toBe(original!.preferences.language)
    })

    it('should import settings for new user', async () => {
      const settings = await service.getByUserId(userId)
      const exported = JSON.stringify(settings)

      const newUserId = 'user-2'
      const imported = await service.importSettings(newUserId, exported)

      expect(imported.userId).toBe(newUserId)
      expect(imported.preferences.language).toBe('ko')
    })

    it('should throw error when importing invalid settings', async () => {
      const invalidSettings = JSON.stringify({ invalid: true })

      await expect(service.importSettings(userId, invalidSettings)).rejects.toThrow('Invalid settings format')
    })
  })

  describe('edge cases', () => {
    it('should return null when updating non-existent user', async () => {
      const updated = await service.update('non-existent', {
        preferences: { language: 'en', timezone: 'UTC' },
      })

      expect(updated).toBeNull()
    })

    it('should preserve userId when updating', async () => {
      await service.getOrCreateDefaults(userId)

      // userId를 변경하려고 시도
      const updated = await service.update(userId, {
        userId: 'different-user-id',
        preferences: { language: 'en', timezone: 'UTC' },
      } as any)

      // userId는 변경되지 않아야 함
      expect(updated!.userId).toBe(userId)
    })

    it('should handle multiple widgets', async () => {
      await service.getOrCreateDefaults(userId)

      const widget1: ImprovedWidget = {
        id: 'widget-1',
        type: 'todoList' as const,
        position: { x: 0, y: 0, w: 2, h: 2 },
      }

      const widget2: ImprovedWidget = {
        id: 'widget-2',
        type: 'calendar' as const,
        position: { x: 2, y: 0, w: 3, h: 2 },
      }

      await service.addDashboardWidget(userId, widget1)
      await service.addDashboardWidget(userId, widget2)

      const settings = await service.getByUserId(userId)
      expect(settings!.dashboard.widgets).toHaveLength(2)
    })

    it('should handle multiple holidays', async () => {
      await service.getOrCreateDefaults(userId)

      await service.addHoliday(userId, '2025-01-01')
      await service.addHoliday(userId, '2025-12-25')
      await service.addHoliday(userId, '2025-07-04')

      const settings = await service.getByUserId(userId)
      expect(settings!.calendar.holidays).toHaveLength(3)
    })
  })
})
