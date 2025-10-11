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

import type { StorageAdapter } from './types/base';

/**
 * Global storage manager instance
 * Initialized by initializeStorage()
 */
let storageManager: StorageManager | null = null;
let currentAdapter: StorageAdapter | null = null;

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
 * It determines the adapter mode based on authentication status and
 * initializes the storage system accordingly.
 *
 * Phase 15: Supabase-Only Mode (DualWrite Disabled)
 * - Before authentication: LocalStorageAdapter only
 * - After authentication: SupabaseAdapter (Supabase as Single Source of Truth)
 *
 * Note: DualWrite mode disabled to fix multi-device data resurrection issue.
 *
 * @returns Promise that resolves when storage is initialized
 */
export async function initializeStorage(): Promise<void> {
  console.log('🔧 Initializing storage system...');

  try {
    // Get user authentication status
    const userId = await getUserId();

    if (userId) {
      // Authenticated: Use Supabase-only mode
      console.log('✅ User authenticated, enabling Supabase-only mode');

      const supabaseAdapter = new SupabaseAdapter({ userId });

      currentAdapter = supabaseAdapter;
    } else {
      // Not authenticated: Use LocalStorage only
      console.log('ℹ️ User not authenticated, using LocalStorage mode');
      const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
      currentAdapter = localAdapter;
    }

    // Create storage manager
    storageManager = new StorageManager(currentAdapter);

    // Clear fallback storage manager
    defaultStorageManager = null;

    // Recreate services with new storage manager
    _projectService = null;
    _taskService = null;
    _clientService = null;
    _calendarService = null;
    _documentService = null;
    _settingsService = null;
    _dashboardService = null;
    _userService = null;
    _todoSectionService = null;
    _activityLogService = null;

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
    defaultStorageManager = null;

    // Recreate services with new storage manager
    _projectService = null;
    _taskService = null;
    _clientService = null;
    _calendarService = null;
    _documentService = null;
    _settingsService = null;
    _dashboardService = null;
    _userService = null;
    _todoSectionService = null;
    _activityLogService = null;

    console.log('✅ Switched to Supabase-only mode successfully');
  } catch (error) {
    console.error('❌ Failed to switch to Supabase-only mode:', error);
    throw error;
  }
}


/**
 * Fallback to LocalStorage-only mode
 *
 * This function can be used to revert to LocalStorage mode
 * in case of Supabase connection issues.
 */
export async function fallbackToLocalStorageMode(): Promise<void> {
  console.log('⚠️ Falling back to LocalStorage mode...');

  try {
    const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
    currentAdapter = localAdapter;
    storageManager = new StorageManager(currentAdapter);

    // Clear fallback storage manager
    defaultStorageManager = null;

    // Recreate services with new storage manager
    _projectService = null;
    _taskService = null;
    _clientService = null;
    _calendarService = null;
    _documentService = null;
    _settingsService = null;
    _dashboardService = null;
    _userService = null;
    _todoSectionService = null;
    _activityLogService = null;

    console.log('✅ Fallback to LocalStorage mode completed');
  } catch (error) {
    console.error('❌ Failed to fallback to LocalStorage mode:', error);
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
let defaultStorageManager: StorageManager | null = null;

function getStorageOrDefault(): StorageManager {
  if (storageManager) {
    return storageManager;
  }
  // Fallback to default if not initialized yet (singleton)
  if (!defaultStorageManager) {
    const defaultLocalAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
    defaultStorageManager = new StorageManager(defaultLocalAdapter);
    console.warn('⚠️ Using fallback StorageManager - initializeStorage() was not called');
  }
  return defaultStorageManager;
}

/**
 * Legacy exports for backward compatibility
 * Note: These dynamically use the current storage instance
 */
export const storage = new Proxy({} as StorageManager, {
  get: (_, prop) => {
    return (getStorageOrDefault() as any)[prop];
  }
});

// Service singletons that use current storage
let _projectService: ProjectService | null = null;
let _taskService: TaskService | null = null;
let _clientService: ClientService | null = null;
let _calendarService: CalendarService | null = null;
let _documentService: DocumentService | null = null;
let _settingsService: SettingsService | null = null;
let _dashboardService: DashboardService | null = null;
let _userService: UserService | null = null;
let _todoSectionService: TodoSectionService | null = null;
let _activityLogService: ActivityLogService | null = null;

export const projectService = new Proxy({} as ProjectService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_projectService || (_projectService as any).storage !== currentStorage) {
      _projectService = new ProjectService(currentStorage);
    }
    return (_projectService as any)[prop];
  }
});

export const taskService = new Proxy({} as TaskService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_taskService || (_taskService as any).storage !== currentStorage) {
      _taskService = new TaskService(currentStorage);
    }
    return (_taskService as any)[prop];
  }
});

export const clientService = new Proxy({} as ClientService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_clientService || (_clientService as any).storage !== currentStorage) {
      _clientService = new ClientService(currentStorage);
    }
    return (_clientService as any)[prop];
  }
});

export const calendarService = new Proxy({} as CalendarService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_calendarService || (_calendarService as any).storage !== currentStorage) {
      _calendarService = new CalendarService(currentStorage);
    }
    return (_calendarService as any)[prop];
  }
});

export const documentService = new Proxy({} as DocumentService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_documentService || (_documentService as any).storage !== currentStorage) {
      _documentService = new DocumentService(currentStorage);
    }
    return (_documentService as any)[prop];
  }
});

export const settingsService = new Proxy({} as SettingsService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_settingsService || (_settingsService as any).storage !== currentStorage) {
      _settingsService = new SettingsService(currentStorage);
    }
    return (_settingsService as any)[prop];
  }
});

export const dashboardService = new Proxy({} as DashboardService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_dashboardService || (_dashboardService as any).storage !== currentStorage) {
      _dashboardService = new DashboardService(currentStorage);
    }
    return (_dashboardService as any)[prop];
  }
});

export const userService = new Proxy({} as UserService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_userService || (_userService as any).storage !== currentStorage) {
      _userService = new UserService(currentStorage);
    }
    return (_userService as any)[prop];
  }
});

export const todoSectionService = new Proxy({} as TodoSectionService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_todoSectionService || (_todoSectionService as any).storage !== currentStorage) {
      _todoSectionService = new TodoSectionService(currentStorage);
    }
    return (_todoSectionService as any)[prop];
  }
});

export const activityLogService = new Proxy({} as ActivityLogService, {
  get: (_, prop) => {
    const currentStorage = getStorageOrDefault();
    if (!_activityLogService || (_activityLogService as any).storage !== currentStorage) {
      _activityLogService = new ActivityLogService(currentStorage);
    }
    return (_activityLogService as any)[prop];
  }
});

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
export type { User, UserCreate, UserUpdate } from './types/entities/user';
export type { TodoSection, TodoSectionCreate, TodoSectionUpdate } from './types/entities/todo-section';
export type { ActivityLog, CreateActivityLogInput, ActivityLogFilter } from './types/entities/activity-log';
