/**
 * DashboardService Tests
 *
 * Tests for the dashboard service
 */

import { DashboardService } from '../DashboardService'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { StorageManager } from '../../core/StorageManager'
import type { ImprovedWidget, DashboardConfig } from '@/types/improved-dashboard'
import type { DashboardData } from '../DashboardService'

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

describe('DashboardService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: DashboardService

  // 테스트용 샘플 데이터
  const sampleWidgets: ImprovedWidget[] = [
    {
      id: 'widget-1',
      type: 'projectSummary',
      position: { x: 0, y: 0, w: 4, h: 2 },
      title: 'Project Summary',
    },
    {
      id: 'widget-2',
      type: 'todoList',
      position: { x: 4, y: 0, w: 5, h: 2 },
      title: 'Todo List',
    },
  ]

  const sampleConfig: DashboardConfig = {
    cols: 9,
    rowHeight: 120,
    gap: 16,
    isDraggable: true,
    isResizable: true,
    preventCollision: true,
    allowOverlap: false,
    compactType: 'vertical',
    useCSSTransforms: true,
    transformScale: 1,
    resizeHandles: ['se'],
    isDroppable: false,
  }

  beforeEach(async () => {
    localStorage.clear()

    const { LocalStorageAdapter } = await import('../../adapters/LocalStorageAdapter')
    const { StorageManager } = await import('../../core/StorageManager')

    adapter = new LocalStorageAdapter()
    storage = new StorageManager(adapter)
    service = new DashboardService(storage)
  })

  describe('basic operations', () => {
    it('should save dashboard data', async () => {
      await service.save(sampleWidgets, sampleConfig)

      const loaded = await service.load()

      expect(loaded).not.toBeNull()
      expect(loaded!.widgets).toEqual(sampleWidgets)
      expect(loaded!.config).toEqual(sampleConfig)
    })

    it('should load dashboard data', async () => {
      await service.save(sampleWidgets, sampleConfig)

      const loaded = await service.load()

      expect(loaded).not.toBeNull()
      expect(loaded!.widgets).toHaveLength(2)
      expect(loaded!.config.cols).toBe(9)
    })

    it('should return null when no data exists', async () => {
      const loaded = await service.load()

      expect(loaded).toBeNull()
    })

    it('should clear dashboard data', async () => {
      await service.save(sampleWidgets, sampleConfig)

      await service.clear()

      const loaded = await service.load()
      expect(loaded).toBeNull()
    })
  })

  describe('widget management', () => {
    it('should save only widgets', async () => {
      // 먼저 초기 데이터 저장
      await service.save(sampleWidgets, sampleConfig)

      // 새로운 위젯 배열로 업데이트
      const newWidgets: ImprovedWidget[] = [
        {
          id: 'widget-3',
          type: 'calendar',
          position: { x: 0, y: 2, w: 4, h: 3 },
          title: 'Calendar',
        },
      ]

      await service.saveWidgets(newWidgets)

      const loaded = await service.load()
      expect(loaded!.widgets).toEqual(newWidgets)
      expect(loaded!.config).toEqual(sampleConfig) // 설정은 유지
    })

    it('should get only widgets', async () => {
      await service.save(sampleWidgets, sampleConfig)

      const widgets = await service.getWidgets()

      expect(widgets).toEqual(sampleWidgets)
      expect(widgets).toHaveLength(2)
    })

    it('should return empty array when no widgets exist', async () => {
      const widgets = await service.getWidgets()

      expect(widgets).toEqual([])
    })
  })

  describe('config management', () => {
    it('should save only config', async () => {
      // 먼저 초기 데이터 저장
      await service.save(sampleWidgets, sampleConfig)

      // 새로운 설정으로 업데이트
      const newConfig: DashboardConfig = {
        ...sampleConfig,
        cols: 12,
        rowHeight: 100,
      }

      await service.saveConfig(newConfig)

      const loaded = await service.load()
      expect(loaded!.widgets).toEqual(sampleWidgets) // 위젯은 유지
      expect(loaded!.config).toEqual(newConfig)
      expect(loaded!.config.cols).toBe(12)
    })

    it('should get only config', async () => {
      await service.save(sampleWidgets, sampleConfig)

      const config = await service.getConfig()

      expect(config).toEqual(sampleConfig)
      expect(config.cols).toBe(9)
    })

    it('should return default config when no config exists', async () => {
      const config = await service.getConfig()

      expect(config.cols).toBe(9)
      expect(config.rowHeight).toBe(120)
      expect(config.gap).toBe(16)
      expect(config.isDraggable).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty widgets array', async () => {
      await service.save([], sampleConfig)

      const loaded = await service.load()
      expect(loaded!.widgets).toEqual([])
      expect(loaded!.config).toEqual(sampleConfig)
    })

    it('should handle multiple save operations', async () => {
      // 첫 번째 저장
      await service.save(sampleWidgets, sampleConfig)

      // 두 번째 저장
      const newWidgets: ImprovedWidget[] = [
        {
          id: 'widget-new',
          type: 'kpiMetrics',
          position: { x: 0, y: 0, w: 3, h: 2 },
        },
      ]

      await service.save(newWidgets, sampleConfig)

      const loaded = await service.load()
      expect(loaded!.widgets).toEqual(newWidgets)
      expect(loaded!.widgets).toHaveLength(1)
    })

    it('should preserve widget properties', async () => {
      const detailedWidget: ImprovedWidget = {
        id: 'widget-detailed',
        type: 'calendar',
        position: { x: 0, y: 0, w: 4, h: 3 },
        title: 'Detailed Widget',
        minW: 2,
        maxW: 6,
        minH: 2,
        maxH: 4,
        isDraggable: true,
        isResizable: true,
        static: false,
        isLocked: false,
        isVisible: true,
      }

      await service.save([detailedWidget], sampleConfig)

      const loaded = await service.load()
      expect(loaded!.widgets[0]).toEqual(detailedWidget)
      expect(loaded!.widgets[0].minW).toBe(2)
      expect(loaded!.widgets[0].maxW).toBe(6)
    })

    it('should handle saveWidgets with no existing data', async () => {
      const newWidgets: ImprovedWidget[] = [
        {
          id: 'widget-first',
          type: 'todoList',
          position: { x: 0, y: 0, w: 3, h: 2 },
        },
      ]

      await service.saveWidgets(newWidgets)

      const loaded = await service.load()
      expect(loaded!.widgets).toEqual(newWidgets)
      // 기본 설정이 사용되어야 함
      expect(loaded!.config.cols).toBe(9)
    })

    it('should handle saveConfig with no existing data', async () => {
      const newConfig: DashboardConfig = {
        ...sampleConfig,
        cols: 12,
      }

      await service.saveConfig(newConfig)

      const loaded = await service.load()
      expect(loaded!.widgets).toEqual([]) // 빈 배열
      expect(loaded!.config).toEqual(newConfig)
    })
  })
})
