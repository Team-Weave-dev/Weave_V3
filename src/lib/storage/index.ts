/**
 * Storage System Entry Point
 *
 * This file provides the main entry point for the storage system.
 * It exports singleton instances of all services and the storage manager.
 *
 * Phase 15 Update: Supabase-Only Mode (DualWrite Disabled)
 * - LocalStorage mode: Before authentication
 * - Supabase-only mode: After authentication (Supabase as Single Source of Truth)
 *
 * Note: DualWrite mode has been disabled due to multi-device design flaw.
 * See docs/DUALWRITE-DESIGN-FLAW.md for details.
 */

import { StorageManager } from './core/StorageManager';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
import { SupabaseAdapter } from './adapters/SupabaseAdapter';
import { STORAGE_CONFIG } from './config';
import { createClient } from '../supabase/client';

// Services
import { ProjectService } from './services/ProjectService';
import { TaskService } from './services/TaskService';
import { ClientService } from './services/ClientService';
import { CalendarService } from './services/CalendarService';
import { DocumentService } from './services/DocumentService';
import { SettingsService } from './services/SettingsService';
import { DashboardService } from './services/DashboardService';
import { UserService } from './services/UserService';
import { TodoSectionService } from './services/TodoSectionService';
import { ActivityLogService } from './services/ActivityLogService';

// Migration System
import { MigrationManager } from './migrations/MigrationManager';
import { BackupManager } from './utils/BackupManager';

import { StorageError, type StorageAdapter } from './types/base';

/**
 * Create a type-safe lazy proxy for services
 * This avoids using `as any` while still allowing lazy initialization
 */
function createLazyProxy<T extends object>(getter: () => T): T {
  return new Proxy({} as T, {
    get(_, prop: string | symbol) {
      const instance = getter();
      const key = prop as keyof T;
      const value = instance[key];
      if (typeof value === 'function') {
        return (value as Function).bind(instance);
      }
      return value;
    }
  });
}

/**
 * Type for accessing protected storage property from services
 * This is intentionally accessing a protected property for cache invalidation
 */
type ServiceWithInternalStorage<T> = T & { storage: StorageManager };

/**
 * Create a cached service proxy that recreates the service when storage changes
 * Services have a protected `storage` property that we need to access for cache invalidation
 * @param cache - Object holding the cached service instance
 * @param ServiceClass - Service constructor
 */
function createCachedServiceProxy<T extends object>(
  cache: { value: T | null },
  ServiceClass: new (storage: StorageManager) => T
): T {
  return new Proxy({} as T, {
    get(_, prop: string | symbol) {
      const currentStorage = getStorageOrDefault();
      // Access protected storage property for cache invalidation check
      const cached = cache.value as ServiceWithInternalStorage<T> | null;
      if (!cached || cached.storage !== currentStorage) {
        cache.value = new ServiceClass(currentStorage);
      }
      const key = prop as keyof T;
      const value = cache.value![key];
      if (typeof value === 'function') {
        return (value as Function).bind(cache.value);
      }
      return value;
    }
  });
}

/**
 * Global storage manager instance
 * Initialized by initializeStorage()
 */
let storageManager: StorageManager | null = null;
let currentAdapter: StorageAdapter | null = null;
let _defaultStorageManager: StorageManager | null = null;

// Service caches for lazy initialization (must be declared before initializeStorage uses them)
const _projectServiceCache = { value: null as ProjectService | null };
const _taskServiceCache = { value: null as TaskService | null };
const _clientServiceCache = { value: null as ClientService | null };
const _calendarServiceCache = { value: null as CalendarService | null };
const _documentServiceCache = { value: null as DocumentService | null };
const _settingsServiceCache = { value: null as SettingsService | null };
const _dashboardServiceCache = { value: null as DashboardService | null };
const _userServiceCache = { value: null as UserService | null };
const _todoSectionServiceCache = { value: null as TodoSectionService | null };
const _activityLogServiceCache = { value: null as ActivityLogService | null };

/**
 * Get current user ID from Supabase auth
 * Uses getSession() instead of getUser() for faster, local-first auth check.
 * getSession() reads from local cookies, avoiding network round-trip.
 *
 * @returns User ID or null if not authenticated
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    // Use getSession() for faster local check (reads from cookies)
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return null;
  }
}

/**
 * Initialize storage system
 *
 * This function should be called once when the application starts.
 * It requires user authentication and initializes Supabase-only storage.
 *
 * Phase 16: Supabase-Only Mode (LocalStorage Removed)
 * - Authentication is REQUIRED to use the application
 * - Supabase is the Single Source of Truth
 * - LocalStorage fallback has been completely removed
 *
 * @returns Promise that resolves when storage is initialized
 * @throws {StorageError} If user is not authenticated
 */
export async function initializeStorage(): Promise<void> {
  console.log('🔧 Initializing storage system...');

  try {
    // Get user authentication status
    const userId = await getUserId();

    if (!userId) {
      // Authentication required - throw error
      throw new StorageError(
        'Authentication required to use this application',
        'AUTH_REQUIRED',
        {
          severity: 'critical',
          userMessage: '앱을 사용하려면 로그인이 필요합니다.',
        }
      );
    }

    // Authenticated: Use Supabase-only mode
    console.log('✅ User authenticated, enabling Supabase-only mode');

    const supabaseAdapter = new SupabaseAdapter({ userId });
    currentAdapter = supabaseAdapter;

    // Create storage manager
    storageManager = new StorageManager(currentAdapter);

    // Clear fallback storage manager
    _defaultStorageManager = null;

    // Clear service caches to force recreation with new storage manager
    _projectServiceCache.value = null;
    _taskServiceCache.value = null;
    _clientServiceCache.value = null;
    _calendarServiceCache.value = null;
    _documentServiceCache.value = null;
    _settingsServiceCache.value = null;
    _dashboardServiceCache.value = null;
    _userServiceCache.value = null;
    _todoSectionServiceCache.value = null;
    _activityLogServiceCache.value = null;

    console.log('✅ Storage system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage system:', error);
    throw error;
  }
}

/**
 * Get storage manager instance
 *
 * @returns Storage manager instance
 * @throws Error if storage is not initialized
 */
export function getStorage(): StorageManager {
  if (!storageManager) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return storageManager;
}


/**
 * Switch to Supabase-only mode
 *
 * This function should be called after user authentication to enable
 * Supabase as the single source of truth.
 *
 * Note: DualWrite mode has been disabled due to multi-device design flaw.
 *
 * @param userId - User ID for Supabase RLS filtering
 */
export async function switchToSupabaseMode(userId: string): Promise<void> {
  console.log('🔄 Switching to Supabase-only mode...');

  try {
    const supabaseAdapter = new SupabaseAdapter({ userId });

    currentAdapter = supabaseAdapter;
    storageManager = new StorageManager(currentAdapter);

    // Clear fallback storage manager
    _defaultStorageManager = null;

    // Clear service caches to force recreation with new storage manager
    _projectServiceCache.value = null;
    _taskServiceCache.value = null;
    _clientServiceCache.value = null;
    _calendarServiceCache.value = null;
    _documentServiceCache.value = null;
    _settingsServiceCache.value = null;
    _dashboardServiceCache.value = null;
    _userServiceCache.value = null;
    _todoSectionServiceCache.value = null;
    _activityLogServiceCache.value = null;

    console.log('✅ Switched to Supabase-only mode successfully');
  } catch (error) {
    console.error('❌ Failed to switch to Supabase-only mode:', error);
    throw error;
  }
}



/**
 * Service factory functions
 * Services are created on-demand to ensure they use the current storage instance
 */
function createServices(storage: StorageManager) {
  return {
    projectService: new ProjectService(storage),
    taskService: new TaskService(storage),
    clientService: new ClientService(storage),
    calendarService: new CalendarService(storage),
    documentService: new DocumentService(storage),
    settingsService: new SettingsService(storage),
    dashboardService: new DashboardService(storage),
    userService: new UserService(storage),
    todoSectionService: new TodoSectionService(storage),
    activityLogService: new ActivityLogService(storage),
  };
}

/**
 * Get service instances
 * @returns All service instances
 */
export function getServices() {
  const storage = getStorage();
  return createServices(storage);
}

/**
 * Migration system (uses LocalStorageAdapter directly)
 */
const localAdapterForMigration = new LocalStorageAdapter(STORAGE_CONFIG);
export const migrationManager = new MigrationManager(localAdapterForMigration);
export const backupManager = new BackupManager(localAdapterForMigration);

/**
 * Service getter functions
 * These ensure services always use the current storage manager instance
 */
function getStorageOrDefault(): StorageManager {
  if (storageManager) {
    return storageManager;
  }

  // No fallback to LocalStorage - authentication is required
  throw new StorageError(
    'Storage not initialized. Authentication required.',
    'STORAGE_NOT_INITIALIZED',
    {
      severity: 'critical',
      userMessage: '스토리지가 초기화되지 않았습니다. 로그인이 필요합니다.',
    }
  );
}

/**
 * Legacy exports for backward compatibility
 * Note: These dynamically use the current storage instance
 */
export const storage = createLazyProxy<StorageManager>(getStorageOrDefault);

// Type-safe cached service proxies (cache objects declared at top of file)
export const projectService = createCachedServiceProxy(_projectServiceCache, ProjectService);
export const taskService = createCachedServiceProxy(_taskServiceCache, TaskService);
export const clientService = createCachedServiceProxy(_clientServiceCache, ClientService);
export const calendarService = createCachedServiceProxy(_calendarServiceCache, CalendarService);
export const documentService = createCachedServiceProxy(_documentServiceCache, DocumentService);
export const settingsService = createCachedServiceProxy(_settingsServiceCache, SettingsService);
export const dashboardService = createCachedServiceProxy(_dashboardServiceCache, DashboardService);
export const userService = createCachedServiceProxy(_userServiceCache, UserService);
export const todoSectionService = createCachedServiceProxy(_todoSectionServiceCache, TodoSectionService);
export const activityLogService = createCachedServiceProxy(_activityLogServiceCache, ActivityLogService);

/**
 * Plan service (Supabase-only, no storage instance needed)
 */
import { planService as _planService } from './services/PlanService';
export const planService = _planService;

/**
 * Plan limits utility functions
 */
export * from './utils/planLimits';

/**
 * Export types for convenience
 */
export type { StorageManager } from './core/StorageManager';
export type { StorageAdapter } from './types/base';

// Re-export entity types individually to avoid conflicts
export type { Project, ProjectCreate, ProjectUpdate, ProjectListItem } from './types/entities/project';
export type { Task, TaskCreate, TaskUpdate } from './types/entities/task';
export type { Client, ClientCreate, ClientUpdate } from './types/entities/client';
export type { CalendarEvent, CalendarEventCreate, CalendarEventUpdate } from './types/entities/event';
export type { Document, DocumentCreate, DocumentUpdate } from './types/entities/document';
export type { Settings, SettingsUpdate, DashboardWidget } from './types/entities/settings';
export type { User, UserCreate, UserUpdate, PlanType as UserPlanType } from './types/entities/user';
export type { TodoSection, TodoSectionCreate, TodoSectionUpdate } from './types/entities/todo-section';
export type { ActivityLog, CreateActivityLogInput, ActivityLogFilter } from './types/entities/activity-log';
export type { Plan, PlanType, PlanLimits, PlanCreate, PlanUpdate } from './types/entities/plan';
