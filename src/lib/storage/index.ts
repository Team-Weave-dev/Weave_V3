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
 * Create default instances for backward compatibility
 * These will be replaced when initializeStorage() is called
 */
const defaultLocalAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
const defaultStorageManager = new StorageManager(defaultLocalAdapter);

/**
 * Legacy exports for backward compatibility
 * Note: These use the default LocalStorage adapter
 * Call initializeStorage() to enable DualWrite mode
 */
export const storage = defaultStorageManager;
export const projectService = new ProjectService(defaultStorageManager);
export const taskService = new TaskService(defaultStorageManager);
export const clientService = new ClientService(defaultStorageManager);
export const calendarService = new CalendarService(defaultStorageManager);
export const documentService = new DocumentService(defaultStorageManager);
export const settingsService = new SettingsService(defaultStorageManager);
export const dashboardService = new DashboardService(defaultStorageManager);

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
