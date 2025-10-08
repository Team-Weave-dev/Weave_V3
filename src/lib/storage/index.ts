/**
 * Storage System Entry Point
 *
 * This file provides the main entry point for the storage system.
 * It exports singleton instances of all services and the storage manager.
 *
 * Phase 13 Update: DualWrite Mode Support
 * - LocalStorage mode: Before authentication
 * - DualWrite mode: After authentication (LocalStorage + Supabase)
 */

import { StorageManager } from './core/StorageManager';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
import { SupabaseAdapter } from './adapters/SupabaseAdapter';
import { DualWriteAdapter } from './adapters/DualWriteAdapter';
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
let currentDualWriteAdapter: DualWriteAdapter | null = null;

/**
 * Get current user ID from Supabase auth
 * @returns User ID or null if not authenticated
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
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
 * Phase 13: DualWrite Mode Support
 * - Before authentication: LocalStorageAdapter only
 * - After authentication: DualWriteAdapter (LocalStorage + Supabase)
 *
 * @returns Promise that resolves when storage is initialized
 */
export async function initializeStorage(): Promise<void> {
  console.log('🔧 Initializing storage system...');

  try {
    // Get user authentication status
    const userId = await getUserId();

    if (userId) {
      // Authenticated: Use DualWrite mode
      console.log('✅ User authenticated, enabling DualWrite mode');

      const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
      const supabaseAdapter = new SupabaseAdapter({ userId });

      const dualAdapter = new DualWriteAdapter({
        local: localAdapter,
        supabase: supabaseAdapter,
        syncInterval: 5000, // 5 seconds
        enableSyncWorker: true,
        enableVerification: false, // Disable for performance
        maxRetries: 3,
      });

      currentAdapter = dualAdapter;
      currentDualWriteAdapter = dualAdapter;
    } else {
      // Not authenticated: Use LocalStorage only
      console.log('ℹ️ User not authenticated, using LocalStorage mode');
      const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
      currentAdapter = localAdapter;
      currentDualWriteAdapter = null;
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
 * Get current DualWriteAdapter instance (if in DualWrite mode)
 *
 * @returns DualWriteAdapter instance or null
 */
export function getDualWriteAdapter(): DualWriteAdapter | null {
  return currentDualWriteAdapter;
}

/**
 * Switch to DualWrite mode
 *
 * This function should be called after user authentication to enable
 * background synchronization to Supabase.
 *
 * @param userId - User ID for Supabase RLS filtering
 */
export async function switchToDualWriteMode(userId: string): Promise<void> {
  console.log('🔄 Switching to DualWrite mode...');

  try {
    const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
    const supabaseAdapter = new SupabaseAdapter({ userId });

    const dualAdapter = new DualWriteAdapter({
      local: localAdapter,
      supabase: supabaseAdapter,
      syncInterval: 5000,
      enableSyncWorker: true,
      enableVerification: false,
      maxRetries: 3,
    });

    // Stop old sync worker if exists
    if (currentDualWriteAdapter) {
      currentDualWriteAdapter.stopSyncWorker();
    }

    currentAdapter = dualAdapter;
    currentDualWriteAdapter = dualAdapter;
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

    console.log('✅ Switched to DualWrite mode successfully');
  } catch (error) {
    console.error('❌ Failed to switch to DualWrite mode:', error);
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
    // Stop sync worker if exists
    if (currentDualWriteAdapter) {
      currentDualWriteAdapter.stopSyncWorker();
    }

    const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
    currentAdapter = localAdapter;
    currentDualWriteAdapter = null;
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
