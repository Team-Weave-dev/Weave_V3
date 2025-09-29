import { useState, useEffect, useCallback } from 'react';
import type { CalendarSettings } from '../types';

const DEFAULT_SETTINGS: CalendarSettings = {
  weekStartsOn: 0,
  defaultView: 'month',
  showWeekNumbers: false,
  eventColors: {},
  googleCalendarEnabled: false,
  notificationSettings: {
    enabled: false,
    defaultReminderMinutes: 15,
  },
};

/**
 * useCalendarSettings Hook
 * 캘린더 설정 관리를 위한 커스텀 훅
 */
export function useCalendarSettings() {
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 설정 로드
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('calendarSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load calendar settings:', error);
      setIsLoading(false);
    }
  }, []);

  // 설정 저장
  const saveSettings = useCallback((newSettings: CalendarSettings) => {
    try {
      localStorage.setItem('calendarSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Failed to save calendar settings:', error);
      return false;
    }
  }, []);

  // 설정 초기화
  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem('calendarSettings');
      setSettings(DEFAULT_SETTINGS);
      return true;
    } catch (error) {
      console.error('Failed to reset calendar settings:', error);
      return false;
    }
  }, []);

  // 특정 설정 업데이트
  const updateSetting = useCallback(
    <K extends keyof CalendarSettings>(
      key: K,
      value: CalendarSettings[K]
    ) => {
      const newSettings = { ...settings, [key]: value };
      return saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  return {
    settings,
    isLoading,
    saveSettings,
    resetSettings,
    updateSetting,
  };
}