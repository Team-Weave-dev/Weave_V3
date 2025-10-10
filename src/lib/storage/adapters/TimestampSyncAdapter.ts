/**
 * TimestampSyncAdapter - Timestamp-based Conflict Resolution
 *
 * Phase 2: Timestamp System for Multi-device Sync
 *
 * This adapter provides timestamp-based conflict resolution using the
 * Last Write Wins (LWW) strategy. It compares `updated_at` timestamps
 * and `updated_by` user IDs to determine which version of data is most recent.
 *
 * Key Features:
 * - Last Write Wins (LWW) conflict resolution
 * - updated_at timestamp comparison
 * - updated_by user ID tracking
 * - Conflict logging for debugging
 * - Integration with SupabaseAdapter
 */

import type { JsonValue } from '../types/base'

/**
 * Conflict resolution result
 */
export interface ConflictResolution<T extends JsonValue = JsonValue> {
  /** Winner of the conflict resolution */
  winner: 'local' | 'remote' | 'none'
  /** The resolved data (winner's data) */
  resolved: T | null
  /** Reason for the resolution */
  reason: string
  /** Timestamp when the resolution occurred */
  resolvedAt: string
  /** Conflict details for logging */
  conflict: {
    localTimestamp: string | null
    remoteTimestamp: string | null
    localUser: string | null
    remoteUser: string | null
  }
}

/**
 * Entity with timestamp fields for conflict resolution
 */
export interface TimestampedEntity {
  /** Unique identifier */
  id: string
  /** Last update timestamp (ISO 8601) */
  updatedAt?: string
  updated_at?: string  // snake_case variant for Supabase compatibility
  /** Last update user ID (for conflict resolution) */
  updated_by?: string
  updatedBy?: string  // camelCase variant
  [key: string]: any
}

/**
 * Conflict log entry
 */
export interface ConflictLog {
  /** Entity ID */
  entityId: string
  /** Entity type (e.g., 'project', 'task') */
  entityType: string
  /** Resolution result */
  resolution: 'local_wins' | 'remote_wins' | 'no_conflict'
  /** Local timestamp */
  localTimestamp: string | null
  /** Remote timestamp */
  remoteTimestamp: string | null
  /** Local user ID */
  localUser: string | null
  /** Remote user ID */
  remoteUser: string | null
  /** Timestamp when the conflict was resolved */
  resolvedAt: string
  /** Additional notes */
  notes?: string
}

/**
 * TimestampSyncAdapter
 *
 * Provides timestamp-based conflict resolution for multi-device sync scenarios.
 * Uses Last Write Wins (LWW) strategy based on `updated_at` timestamps.
 */
export class TimestampSyncAdapter {
  /**
   * Conflict log for debugging and auditing
   */
  private conflictLog: ConflictLog[] = []

  /**
   * Maximum conflict log entries (prevent memory leaks)
   */
  private readonly maxLogEntries = 1000

  /**
   * Resolve conflict between local and remote data using Last Write Wins (LWW)
   *
   * Strategy:
   * 1. Compare `updated_at` timestamps
   * 2. If timestamps are equal, compare `updated_by` user IDs (newer user ID wins)
   * 3. If both are equal, prefer remote (Supabase as SSOT)
   * 4. If either timestamp is missing, prefer the one with timestamp
   * 5. If both timestamps are missing, prefer remote
   *
   * @param local - Local data (from LocalStorage)
   * @param remote - Remote data (from Supabase)
   * @param entityType - Entity type for logging (e.g., 'project', 'task')
   * @returns Conflict resolution result
   */
  resolveConflict<T extends TimestampedEntity>(
    local: T | null,
    remote: T | null,
    entityType: string = 'unknown'
  ): ConflictResolution<T> {
    const now = new Date().toISOString()

    // Case 1: Only one version exists
    if (!local && remote) {
      return {
        winner: 'remote',
        resolved: remote,
        reason: 'Only remote version exists',
        resolvedAt: now,
        conflict: {
          localTimestamp: null,
          remoteTimestamp: this.extractTimestamp(remote),
          localUser: null,
          remoteUser: this.extractUserId(remote),
        },
      }
    }

    if (local && !remote) {
      return {
        winner: 'local',
        resolved: local,
        reason: 'Only local version exists',
        resolvedAt: now,
        conflict: {
          localTimestamp: this.extractTimestamp(local),
          remoteTimestamp: null,
          localUser: this.extractUserId(local),
          remoteUser: null,
        },
      }
    }

    if (!local && !remote) {
      return {
        winner: 'none',
        resolved: null,
        reason: 'No data exists',
        resolvedAt: now,
        conflict: {
          localTimestamp: null,
          remoteTimestamp: null,
          localUser: null,
          remoteUser: null,
        },
      }
    }

    // Case 2: Both versions exist - compare timestamps
    const localTimestamp = this.extractTimestamp(local!)
    const remoteTimestamp = this.extractTimestamp(remote!)
    const localUser = this.extractUserId(local!)
    const remoteUser = this.extractUserId(remote!)

    // Case 2.1: Both timestamps missing - prefer remote (SSOT)
    if (!localTimestamp && !remoteTimestamp) {
      this.logConflict(local!.id, entityType, {
        resolution: 'remote_wins',
        localTimestamp,
        remoteTimestamp,
        localUser,
        remoteUser,
        notes: 'Both timestamps missing, preferring remote (SSOT)',
      })

      return {
        winner: 'remote',
        resolved: remote,
        reason: 'Both timestamps missing, preferring remote (SSOT)',
        resolvedAt: now,
        conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
      }
    }

    // Case 2.2: Only one timestamp exists
    if (!localTimestamp && remoteTimestamp) {
      this.logConflict(local!.id, entityType, {
        resolution: 'remote_wins',
        localTimestamp,
        remoteTimestamp,
        localUser,
        remoteUser,
        notes: 'Only remote has timestamp',
      })

      return {
        winner: 'remote',
        resolved: remote,
        reason: 'Only remote has timestamp',
        resolvedAt: now,
        conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
      }
    }

    if (localTimestamp && !remoteTimestamp) {
      this.logConflict(local!.id, entityType, {
        resolution: 'local_wins',
        localTimestamp,
        remoteTimestamp,
        localUser,
        remoteUser,
        notes: 'Only local has timestamp',
      })

      return {
        winner: 'local',
        resolved: local,
        reason: 'Only local has timestamp',
        resolvedAt: now,
        conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
      }
    }

    // Case 2.3: Both timestamps exist - compare them (LWW)
    const comparison = this.compareTimestamps(localTimestamp!, remoteTimestamp!)

    if (comparison > 0) {
      // Local is newer
      this.logConflict(local!.id, entityType, {
        resolution: 'local_wins',
        localTimestamp,
        remoteTimestamp,
        localUser,
        remoteUser,
        notes: 'Local timestamp is more recent',
      })

      return {
        winner: 'local',
        resolved: local,
        reason: `Local is newer (${localTimestamp} > ${remoteTimestamp})`,
        resolvedAt: now,
        conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
      }
    } else if (comparison < 0) {
      // Remote is newer
      this.logConflict(local!.id, entityType, {
        resolution: 'remote_wins',
        localTimestamp,
        remoteTimestamp,
        localUser,
        remoteUser,
        notes: 'Remote timestamp is more recent',
      })

      return {
        winner: 'remote',
        resolved: remote,
        reason: `Remote is newer (${remoteTimestamp} > ${localTimestamp})`,
        resolvedAt: now,
        conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
      }
    }

    // Case 2.4: Timestamps are equal - compare user IDs
    if (localUser && remoteUser && localUser !== remoteUser) {
      // Prefer newer user ID (lexicographically)
      const userWinner = localUser > remoteUser ? 'local' : 'remote'

      this.logConflict(local!.id, entityType, {
        resolution: userWinner === 'local' ? 'local_wins' : 'remote_wins',
        localTimestamp,
        remoteTimestamp,
        localUser,
        remoteUser,
        notes: `Timestamps equal, ${userWinner} user ID is newer`,
      })

      return {
        winner: userWinner,
        resolved: userWinner === 'local' ? local : remote,
        reason: `Timestamps equal, ${userWinner} user ID is newer (${userWinner === 'local' ? localUser : remoteUser})`,
        resolvedAt: now,
        conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
      }
    }

    // Case 2.5: Everything is equal - prefer remote (SSOT)
    this.logConflict(local!.id, entityType, {
      resolution: 'remote_wins',
      localTimestamp,
      remoteTimestamp,
      localUser,
      remoteUser,
      notes: 'All fields equal, preferring remote (SSOT)',
    })

    return {
      winner: 'remote',
      resolved: remote,
      reason: 'All fields equal, preferring remote (SSOT)',
      resolvedAt: now,
      conflict: { localTimestamp, remoteTimestamp, localUser, remoteUser },
    }
  }

  /**
   * Extract timestamp from entity
   * Supports both camelCase (updatedAt) and snake_case (updated_at)
   *
   * @param entity - Entity with timestamp field
   * @returns ISO 8601 timestamp or null
   */
  private extractTimestamp(entity: TimestampedEntity): string | null {
    return entity.updated_at || entity.updatedAt || null
  }

  /**
   * Extract user ID from entity
   * Supports both camelCase (updatedBy) and snake_case (updated_by)
   *
   * @param entity - Entity with user ID field
   * @returns User ID or null
   */
  private extractUserId(entity: TimestampedEntity): string | null {
    return entity.updated_by || entity.updatedBy || null
  }

  /**
   * Compare two ISO 8601 timestamps
   *
   * @param ts1 - First timestamp
   * @param ts2 - Second timestamp
   * @returns 1 if ts1 > ts2, -1 if ts1 < ts2, 0 if equal
   */
  private compareTimestamps(ts1: string, ts2: string): number {
    const date1 = new Date(ts1).getTime()
    const date2 = new Date(ts2).getTime()

    if (date1 > date2) return 1
    if (date1 < date2) return -1
    return 0
  }

  /**
   * Log conflict resolution for debugging
   *
   * @param entityId - Entity ID
   * @param entityType - Entity type
   * @param details - Conflict details
   */
  private logConflict(
    entityId: string,
    entityType: string,
    details: Omit<ConflictLog, 'entityId' | 'entityType' | 'resolvedAt'>
  ): void {
    const logEntry: ConflictLog = {
      entityId,
      entityType,
      resolvedAt: new Date().toISOString(),
      ...details,
    }

    this.conflictLog.push(logEntry)

    // Prevent memory leaks by limiting log size
    if (this.conflictLog.length > this.maxLogEntries) {
      this.conflictLog.shift() // Remove oldest entry
    }

    // Console logging for development (can be disabled in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[TimestampSyncAdapter] Conflict resolved:', {
        entityId,
        entityType,
        resolution: details.resolution,
        reason: details.notes,
      })
    }
  }

  /**
   * Get conflict log
   *
   * @param entityType - Filter by entity type (optional)
   * @param limit - Maximum number of entries to return
   * @returns Conflict log entries
   */
  getConflictLog(entityType?: string, limit: number = 100): ConflictLog[] {
    let logs = this.conflictLog

    if (entityType) {
      logs = logs.filter((log) => log.entityType === entityType)
    }

    return logs.slice(-limit) // Return last N entries
  }

  /**
   * Clear conflict log
   */
  clearConflictLog(): void {
    this.conflictLog = []
  }

  /**
   * Get conflict statistics
   *
   * @returns Conflict statistics
   */
  getConflictStats(): {
    total: number
    localWins: number
    remoteWins: number
    noConflict: number
    byEntityType: Record<string, { local: number; remote: number; none: number }>
  } {
    const stats = {
      total: this.conflictLog.length,
      localWins: 0,
      remoteWins: 0,
      noConflict: 0,
      byEntityType: {} as Record<string, { local: number; remote: number; none: number }>,
    }

    this.conflictLog.forEach((log) => {
      if (log.resolution === 'local_wins') stats.localWins++
      if (log.resolution === 'remote_wins') stats.remoteWins++
      if (log.resolution === 'no_conflict') stats.noConflict++

      if (!stats.byEntityType[log.entityType]) {
        stats.byEntityType[log.entityType] = { local: 0, remote: 0, none: 0 }
      }

      if (log.resolution === 'local_wins') stats.byEntityType[log.entityType].local++
      if (log.resolution === 'remote_wins') stats.byEntityType[log.entityType].remote++
      if (log.resolution === 'no_conflict') stats.byEntityType[log.entityType].none++
    })

    return stats
  }
}
