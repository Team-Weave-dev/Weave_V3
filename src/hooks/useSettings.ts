/**
 * useSettings Hook
 *
 * SettingsService를 사용하여 사용자 설정을 관리하는 커스텀 훅
 * 로컬스토리지에 설정을 저장하고, 향후 Supabase로 마이그레이션 준비
 */

import { useState, useEffect, useCallback } from 'react'
import { settingsService } from '@/lib/storage'
import type { Settings, UserPreferences, NotificationSettings, CalendarSettings, ProjectSettings, DashboardSettings } from '@/lib/storage/types/entities/settings'

interface UseSettingsReturn {
  settings: Settings | null
  loading: boolean
  error: Error | null

  // User Preferences
  updateLanguage: (language: UserPreferences['language']) => Promise<void>
  updateTimezone: (timezone: string) => Promise<void>
  updateDateFormat: (dateFormat: string) => Promise<void>
  updateTimeFormat: (timeFormat: '12' | '24') => Promise<void>
  updateCurrency: (currency: string) => Promise<void>

  // Notification Settings
  updateNotifications: (notifications: Partial<NotificationSettings>) => Promise<void>

  // Calendar Settings
  updateCalendarSettings: (calendar: Partial<CalendarSettings>) => Promise<void>

  // Project Settings
  updateProjectSettings: (projects: Partial<ProjectSettings>) => Promise<void>

  // Dashboard Settings
  updateDashboardSettings: (dashboard: Partial<DashboardSettings>) => Promise<void>

  // Refresh
  refresh: () => Promise<void>
}

/**
 * Settings 관리 훅
 * @param userId - 사용자 ID
 */
export function useSettings(userId: string): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 설정 로드
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 설정 로드 또는 기본값 생성
      const userSettings = await settingsService.getOrCreateDefaults(userId)
      setSettings(userSettings)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  // 초기 로드
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // User Preferences 업데이트
  const updateLanguage = useCallback(async (language: UserPreferences['language']) => {
    try {
      const updated = await settingsService.updateLanguage(userId, language)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update language')
    }
  }, [userId])

  const updateTimezone = useCallback(async (timezone: string) => {
    try {
      const updated = await settingsService.updateTimezone(userId, timezone)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update timezone')
    }
  }, [userId])

  const updateDateFormat = useCallback(async (dateFormat: string) => {
    try {
      const updated = await settingsService.updateDateFormat(userId, dateFormat)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update date format')
    }
  }, [userId])

  const updateTimeFormat = useCallback(async (timeFormat: '12' | '24') => {
    try {
      const updated = await settingsService.updateTimeFormat(userId, timeFormat)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update time format')
    }
  }, [userId])

  const updateCurrency = useCallback(async (currency: string) => {
    try {
      const updated = await settingsService.updateCurrency(userId, currency)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update currency')
    }
  }, [userId])

  // Notification Settings 업데이트
  const updateNotifications = useCallback(async (notifications: Partial<NotificationSettings>) => {
    try {
      const updated = await settingsService.updateNotificationSettings(userId, notifications)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update notifications')
    }
  }, [userId])

  // Calendar Settings 업데이트
  const updateCalendarSettings = useCallback(async (calendar: Partial<CalendarSettings>) => {
    try {
      const updated = await settingsService.updateCalendarSettings(userId, calendar)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update calendar settings')
    }
  }, [userId])

  // Project Settings 업데이트
  const updateProjectSettings = useCallback(async (projects: Partial<ProjectSettings>) => {
    try {
      const updated = await settingsService.updateProjectSettings(userId, projects)
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update project settings')
    }
  }, [userId])

  // Dashboard Settings 업데이트
  const updateDashboardSettings = useCallback(async (dashboard: Partial<DashboardSettings>) => {
    try {
      const updated = await settingsService.update(userId, { dashboard: { ...settings?.dashboard, ...dashboard } as DashboardSettings })
      if (updated) setSettings(updated)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update dashboard settings')
    }
  }, [userId, settings])

  // 새로고침
  const refresh = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    updateLanguage,
    updateTimezone,
    updateDateFormat,
    updateTimeFormat,
    updateCurrency,
    updateNotifications,
    updateCalendarSettings,
    updateProjectSettings,
    updateDashboardSettings,
    refresh,
  }
}
