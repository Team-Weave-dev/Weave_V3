/**
 * useStorageSync Hook
 *
 * Real-time synchronization hook for Storage system (Phase 7.4)
 * Subscribes to storage changes and keeps React state in sync
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { storage } from '@/lib/storage';

/**
 * Hook for real-time storage synchronization
 *
 * Automatically subscribes to storage changes and updates React state
 * Works across multiple tabs/windows through localStorage events
 *
 * @param key - Storage key to subscribe to
 * @param initialValue - Initial value to use before data is loaded
 * @returns Current value, loading state, and error
 *
 * @example
 * ```tsx
 * function ProjectList() {
 *   const { data, isLoading, error } = useStorageSync<Project[]>('projects', []);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>{data.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
 * }
 * ```
 */
export function useStorageSync<T>(
  key: string,
  initialValue: T
): {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const value = await storage.get<T>(key);
      setData(value ?? initialValue);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      setData(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  // Subscribe to changes
  useEffect(() => {
    // Initial load
    loadData();

    // Subscribe to updates
    const unsubscribe = storage.subscribe(key, (event) => {
      setData((event.value as T) ?? initialValue);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [key, initialValue, loadData]);

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
  };
}

/**
 * Hook for watching multiple storage keys
 *
 * @param keys - Array of storage keys to watch
 * @returns Map of key to value
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, isLoading } = useStorageSyncMulti(['projects', 'tasks', 'events']);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   const projects = data.get('projects') as Project[];
 *   const tasks = data.get('tasks') as Task[];
 *   const events = data.get('events') as CalendarEvent[];
 *
 *   return <DashboardView projects={projects} tasks={tasks} events={events} />;
 * }
 * ```
 */
export function useStorageSyncMulti(
  keys: string[]
): {
  data: Map<string, unknown>;
  isLoading: boolean;
  errors: Map<string, Error>;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<Map<string, unknown>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());

  // Load initial data for all keys
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const newData = new Map<string, unknown>();
    const newErrors = new Map<string, Error>();

    await Promise.all(
      keys.map(async (key) => {
        try {
          const value = await storage.get(key);
          newData.set(key, value);
        } catch (err) {
          newErrors.set(key, err instanceof Error ? err : new Error(`Failed to load ${key}`));
        }
      })
    );

    setData(newData);
    setErrors(newErrors);
    setIsLoading(false);
  }, [keys]);

  // Subscribe to all keys
  useEffect(() => {
    loadData();

    // Subscribe to each key
    const unsubscribers = keys.map((key) =>
      storage.subscribe(key, (event) => {
        setData((prev) => {
          const updated = new Map(prev);
          updated.set(event.key, event.value);
          return updated;
        });
      })
    );

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [keys, loadData]);

  return {
    data,
    isLoading,
    errors,
    refresh: loadData,
  };
}

/**
 * Hook for syncing a single entity by ID
 *
 * @param serviceGetter - Function that returns the service instance
 * @param id - Entity ID
 * @param initialValue - Initial value before data loads
 * @returns Entity data, loading state, and error
 *
 * @example
 * ```tsx
 * function ProjectDetail({ projectId }: { projectId: string }) {
 *   const { data: project, isLoading } = useStorageSyncEntity(
 *     () => projectService,
 *     projectId,
 *     null
 *   );
 *
 *   if (isLoading) return <div>Loading project...</div>;
 *   if (!project) return <div>Project not found</div>;
 *
 *   return <ProjectInfo project={project} />;
 * }
 * ```
 */
export function useStorageSyncEntity<T extends { id: string }>(
  serviceGetter: () => { getById: (id: string) => Promise<T | null> },
  id: string,
  initialValue: T | null
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const service = serviceGetter();
      const entity = await service.getById(id);
      setData(entity);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load entity'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [serviceGetter, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
  };
}

/**
 * Hook for optimistic updates with automatic rollback on error
 *
 * @param key - Storage key
 * @param initialValue - Initial value
 * @returns Current value and update function with optimistic updates
 *
 * @example
 * ```tsx
 * function TaskItem({ task }: { task: Task }) {
 *   const { data, update } = useStorageSyncOptimistic('tasks', []);
 *
 *   const handleComplete = async () => {
 *     await update(async (tasks) => {
 *       // Optimistically update UI
 *       return tasks.map(t =>
 *         t.id === task.id ? { ...t, status: 'completed' } : t
 *       );
 *     });
 *   };
 *
 *   return <TaskCard task={task} onComplete={handleComplete} />;
 * }
 * ```
 */
export function useStorageSyncOptimistic<T>(
  key: string,
  initialValue: T
): {
  data: T;
  isLoading: boolean;
  error: Error | null;
  update: (updater: (current: T) => Promise<T>) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const value = await storage.get<T>(key);
      setData(value ?? initialValue);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      setData(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  // Subscribe to changes
  useEffect(() => {
    loadData();

    const unsubscribe = storage.subscribe(key, (event) => {
      setData((event.value as T) ?? initialValue);
    });

    return unsubscribe;
  }, [key, initialValue, loadData]);

  // Optimistic update with rollback
  const update = useCallback(
    async (updater: (current: T) => Promise<T>) => {
      const previousValue = data;
      try {
        // Optimistically update state
        const newValue = await updater(data);
        setData(newValue);

        // Persist to storage
        await storage.set(key, newValue);
      } catch (err) {
        // Rollback on error
        setData(previousValue);
        setError(err instanceof Error ? err : new Error('Update failed'));
        throw err;
      }
    },
    [key, data]
  );

  return {
    data,
    isLoading,
    error,
    update,
    refresh: loadData,
  };
}
