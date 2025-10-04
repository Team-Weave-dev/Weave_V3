/**
 * Storage System Entry Point
 *
 * This file provides the main entry point for the storage system.
 * It exports singleton instances of all services and the storage manager.
 */

import { StorageManager } from './core/StorageManager';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
import { STORAGE_CONFIG } from './config';

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

/**
 * Create singleton adapter instance
 */
const adapter = new LocalStorageAdapter(STORAGE_CONFIG);

/**
 * Create singleton storage manager instance
 */
export const storage = new StorageManager(adapter);

/**
 * Service instances
 */
export const projectService = new ProjectService(storage);
export const taskService = new TaskService(storage);
export const clientService = new ClientService(storage);
export const calendarService = new CalendarService(storage);
export const documentService = new DocumentService(storage);
export const settingsService = new SettingsService(storage);
export const dashboardService = new DashboardService(storage);

/**
 * Migration system
 */
export const migrationManager = new MigrationManager(adapter);
export const backupManager = new BackupManager(adapter);

/**
 * Initialize storage system
 *
 * This function should be called once when the application starts.
 * It runs any pending migrations and initializes the storage system.
 */
export async function initializeStorage(): Promise<void> {
  console.log('🔧 Initializing storage system...');

  try {
    // Check current version
    const currentVersion = await migrationManager.getCurrentVersion();
    console.log(`Current storage version: ${currentVersion}`);

    // Run migrations if needed
    if (currentVersion < STORAGE_CONFIG.version) {
      console.log(`Migrating from version ${currentVersion} to ${STORAGE_CONFIG.version}...`);
      // Register migrations here if needed
      // await migrationManager.registerAll([...]);
      // await migrationManager.migrate(STORAGE_CONFIG.version);
    } else {
      console.log('Storage is up to date');
    }

    console.log('✅ Storage system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage system:', error);
    throw error;
  }
}

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
