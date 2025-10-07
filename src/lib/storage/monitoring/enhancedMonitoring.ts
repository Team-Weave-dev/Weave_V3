/**
 * Enhanced Monitoring System
 *
 * Provides comprehensive monitoring capabilities for the storage system
 * during and after the Supabase transition.
 */

import { performanceMetricsCollector, alertSystem } from './performanceMetrics';
import { validateDataIntegrity } from '../validation/dataIntegrityCheck';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { SupabaseAdapter } from '../adapters/SupabaseAdapter';
import { DualWriteAdapter } from '../adapters/DualWriteAdapter';
import { getCurrentStorageMode, getGlobalDualAdapter } from '../transition/finalTransition';

/**
 * Health status levels
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Monitoring metrics interface
 */
export interface MonitoringMetrics {
  timestamp: string;
  storageMode: string;
  health: {
    status: HealthStatus;
    score: number; // 0-100
    issues: string[];
  };
  performance: {
    responseTimeP50: number;
    responseTimeP95: number;
    responseTimeP99: number;
    throughput: number;
    errorRate: number;
  };
  sync?: {
    enabled: boolean;
    successRate: number;
    queueSize: number;
    lastSyncAt: string | null;
    pendingOperations: number;
  };
  integrity?: {
    lastCheckAt: string;
    overallMatch: boolean;
    entityResults: Record<string, boolean>;
  };
  resources: {
    localStorageUsed: number;
    localStorageAvailable: number;
    memoryUsage?: number;
  };
}

/**
 * Enhanced monitoring service
 */
export class EnhancedMonitoringService {
  private lastIntegrityCheck: Date | null = null;
  private integrityCheckInterval = 60 * 60 * 1000; // 1 hour
  private metricsHistory: MonitoringMetrics[] = [];
  private maxHistorySize = 100;

  /**
   * Collect current monitoring metrics
   */
  async collectMetrics(userId?: string): Promise<MonitoringMetrics> {
    const timestamp = new Date().toISOString();
    const storageMode = getCurrentStorageMode();
    const perfMetrics = performanceMetricsCollector.getMetrics();

    // Base metrics
    const metrics: MonitoringMetrics = {
      timestamp,
      storageMode: storageMode.mode,
      health: {
        status: HealthStatus.HEALTHY,
        score: 100,
        issues: []
      },
      performance: {
        responseTimeP50: perfMetrics.responseTime.p50,
        responseTimeP95: perfMetrics.responseTime.p95,
        responseTimeP99: perfMetrics.responseTime.p99,
        throughput: perfMetrics.throughput.total,
        errorRate: perfMetrics.errorRate
      },
      resources: this.getResourceUsage()
    };

    // Add sync metrics if in DualWrite mode
    if (storageMode.mode === 'dualwrite') {
      const dualAdapter = getGlobalDualAdapter();
      if (dualAdapter) {
        const syncStats = dualAdapter.getSyncStats();
        metrics.sync = {
          enabled: true,
          successRate: syncStats.totalAttempts > 0
            ? (syncStats.successCount / syncStats.totalAttempts) * 100
            : 100,
          queueSize: syncStats.queueSize,
          lastSyncAt: syncStats.lastSyncAt ? String(syncStats.lastSyncAt) : null,
          pendingOperations: syncStats.pendingCount || 0
        };

        // Check sync health
        if (metrics.sync && metrics.sync.successRate < 95) {
          metrics.health.issues.push(`Low sync success rate: ${metrics.sync.successRate.toFixed(1)}%`);
          metrics.health.status = HealthStatus.WARNING;
          metrics.health.score -= 20;
        }

        if (metrics.sync && metrics.sync.queueSize > 100) {
          metrics.health.issues.push(`Large sync queue: ${metrics.sync.queueSize} operations`);
          metrics.health.status = HealthStatus.WARNING;
          metrics.health.score -= 10;
        }
      }
    }

    // Add integrity check if needed
    if (userId && this.shouldRunIntegrityCheck()) {
      try {
        const integrityResult = await this.runIntegrityCheck(userId);
        metrics.integrity = integrityResult;

        if (!integrityResult.overallMatch) {
          metrics.health.issues.push('Data integrity check failed');
          metrics.health.status = HealthStatus.ERROR;
          metrics.health.score -= 30;
        }
      } catch (error) {
        metrics.health.issues.push(`Integrity check error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Check performance health
    if (perfMetrics.errorRate > 5) {
      metrics.health.issues.push(`High error rate: ${perfMetrics.errorRate.toFixed(1)}%`);
      metrics.health.status = HealthStatus.WARNING;
      metrics.health.score -= 15;
    }

    if (perfMetrics.responseTime.p99 > 1000) {
      metrics.health.issues.push(`Slow response time (p99): ${perfMetrics.responseTime.p99}ms`);
      metrics.health.status = HealthStatus.WARNING;
      metrics.health.score -= 10;
    }

    // Check resource usage
    if (metrics.resources.localStorageAvailable < 1024 * 1024) { // Less than 1MB
      metrics.health.issues.push('Low LocalStorage space available');
      metrics.health.status = HealthStatus.WARNING;
      metrics.health.score -= 10;
    }

    // Update health status based on score
    if (metrics.health.score >= 80) {
      metrics.health.status = HealthStatus.HEALTHY;
    } else if (metrics.health.score >= 60) {
      metrics.health.status = HealthStatus.WARNING;
    } else if (metrics.health.score >= 40) {
      metrics.health.status = HealthStatus.ERROR;
    } else {
      metrics.health.status = HealthStatus.CRITICAL;
    }

    // Store in history
    this.addToHistory(metrics);

    // Trigger alerts if needed
    this.checkAndTriggerAlerts(metrics);

    return metrics;
  }

  /**
   * Check if integrity check should run
   */
  private shouldRunIntegrityCheck(): boolean {
    if (!this.lastIntegrityCheck) return true;

    const timeSinceLastCheck = Date.now() - this.lastIntegrityCheck.getTime();
    return timeSinceLastCheck >= this.integrityCheckInterval;
  }

  /**
   * Run data integrity check
   */
  private async runIntegrityCheck(userId: string): Promise<{
    lastCheckAt: string;
    overallMatch: boolean;
    entityResults: Record<string, boolean>;
  }> {
    const localAdapter = new LocalStorageAdapter();
    const supabaseAdapter = new SupabaseAdapter({ userId });

    const report = await validateDataIntegrity(localAdapter, supabaseAdapter, {
      deepCheck: false, // Quick check for monitoring
      entities: ['projects', 'tasks', 'events', 'clients', 'documents', 'settings']
    });

    this.lastIntegrityCheck = new Date();

    const entityResults: Record<string, boolean> = {};
    report.results.forEach(result => {
      entityResults[result.entity] = result.match;
    });

    return {
      lastCheckAt: new Date().toISOString(),
      overallMatch: report.overallMatch,
      entityResults
    };
  }

  /**
   * Get resource usage information
   */
  private getResourceUsage(): {
    localStorageUsed: number;
    localStorageAvailable: number;
    memoryUsage?: number;
  } {
    let localStorageUsed = 0;
    let localStorageAvailable = 5 * 1024 * 1024; // Default 5MB

    try {
      // Estimate LocalStorage usage
      if (typeof localStorage !== 'undefined') {
        let totalSize = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key) || '';
            totalSize += key.length + value.length;
          }
        }
        localStorageUsed = totalSize * 2; // UTF-16 encoding

        // Try to get available space (Chrome/Edge only)
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          navigator.storage.estimate().then(estimate => {
            if (estimate.quota && estimate.usage) {
              localStorageAvailable = estimate.quota - estimate.usage;
            }
          }).catch(() => {
            // Ignore error, use default
          });
        }
      }
    } catch (error) {
      console.warn('Failed to get storage usage:', error);
    }

    const result: any = {
      localStorageUsed,
      localStorageAvailable
    };

    // Try to get memory usage (Node.js or browser with performance.memory)
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const mem = (performance as any).memory;
      if (mem && mem.usedJSHeapSize) {
        result.memoryUsage = mem.usedJSHeapSize;
      }
    }

    return result;
  }

  /**
   * Add metrics to history
   */
  private addToHistory(metrics: MonitoringMetrics): void {
    this.metricsHistory.push(metrics);

    // Keep only recent history
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Check and trigger alerts based on metrics
   */
  private checkAndTriggerAlerts(metrics: MonitoringMetrics): void {
    const alerts = [];

    // Check sync alerts
    if (metrics.sync) {
      alerts.push(...alertSystem.checkSyncStatus({
        queueSize: metrics.sync.queueSize,
        successRate: metrics.sync.successRate,
        errorRate: metrics.performance.errorRate,
        responseTimeP99: metrics.performance.responseTimeP99
      }));
    } else {
      // Check performance alerts for non-sync modes
      if (metrics.performance.errorRate > 5) {
        alerts.push({
          severity: 'warning' as const,
          message: 'High error rate detected',
          metric: 'errorRate',
          value: `${metrics.performance.errorRate.toFixed(1)}%`,
          threshold: '5%',
          timestamp: metrics.timestamp
        });
      }

      if (metrics.performance.responseTimeP99 > 1000) {
        alerts.push({
          severity: 'warning' as const,
          message: 'Slow response time',
          metric: 'responseTimeP99',
          value: `${metrics.performance.responseTimeP99}ms`,
          threshold: '1000ms',
          timestamp: metrics.timestamp
        });
      }
    }

    // Log critical health issues
    if (metrics.health.status === HealthStatus.CRITICAL) {
      console.error('🚨 CRITICAL: Storage system health critical:', metrics.health.issues);
    } else if (metrics.health.status === HealthStatus.ERROR) {
      console.error('❌ ERROR: Storage system health degraded:', metrics.health.issues);
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit?: number): MonitoringMetrics[] {
    if (limit) {
      return this.metricsHistory.slice(-limit);
    }
    return [...this.metricsHistory];
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    currentStatus: HealthStatus;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];

    if (!latestMetrics) {
      return {
        currentStatus: HealthStatus.HEALTHY,
        score: 100,
        issues: [],
        recommendations: []
      };
    }

    const recommendations: string[] = [];

    // Generate recommendations based on issues
    if (latestMetrics.health.issues.length > 0) {
      latestMetrics.health.issues.forEach(issue => {
        if (issue.includes('sync success rate')) {
          recommendations.push('Check network connectivity and Supabase service status');
        }
        if (issue.includes('sync queue')) {
          recommendations.push('Consider triggering manual sync to clear queue');
        }
        if (issue.includes('error rate')) {
          recommendations.push('Review error logs and check for API issues');
        }
        if (issue.includes('response time')) {
          recommendations.push('Optimize queries or consider caching');
        }
        if (issue.includes('LocalStorage space')) {
          recommendations.push('Clear unnecessary data or migrate to Supabase');
        }
        if (issue.includes('integrity')) {
          recommendations.push('Run manual data validation and sync');
        }
      });
    }

    return {
      currentStatus: latestMetrics.health.status,
      score: latestMetrics.health.score,
      issues: latestMetrics.health.issues,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  /**
   * Reset metrics collector
   */
  reset(): void {
    performanceMetricsCollector.reset();
    alertSystem.clearAlerts();
    this.metricsHistory = [];
    this.lastIntegrityCheck = null;
  }
}

// Global monitoring service instance
export const monitoringService = new EnhancedMonitoringService();