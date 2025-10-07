/**
 * Performance Metrics and Monitoring System
 *
 * Collects and analyzes performance metrics, sends alerts,
 * and generates weekly reports for the storage system.
 *
 * Features:
 * - Performance metrics (response time, throughput, error rate)
 * - Threshold-based alerting
 * - Weekly report generation
 * - Historical data tracking
 */

/**
 * Performance metrics snapshot
 */
export interface PerformanceMetrics {
  /** Timestamp of metrics */
  timestamp: string;
  /** Response time percentiles (ms) */
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
  };
  /** Operations per second */
  throughput: {
    reads: number;
    writes: number;
    total: number;
  };
  /** Error rate (percentage) */
  errorRate: number;
  /** Memory usage (MB) */
  memoryUsage?: number;
}

/**
 * Alert configuration
 */
export interface AlertThresholds {
  /** Max queue size before alert */
  maxQueueSize: number;
  /** Min success rate (percentage) */
  minSuccessRate: number;
  /** Max error rate (percentage) */
  maxErrorRate: number;
  /** Max response time p99 (ms) */
  maxResponseTimeP99: number;
}

/**
 * Alert information
 */
export interface Alert {
  /** Alert severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Alert message */
  message: string;
  /** Timestamp */
  timestamp: string;
  /** Metric that triggered alert */
  metric: string;
  /** Current value */
  value: number | string;
  /** Threshold value */
  threshold: number | string;
}

/**
 * Weekly report data
 */
export interface WeeklyReport {
  /** Report period */
  period: {
    start: string;
    end: string;
  };
  /** Total sync operations */
  totalOperations: number;
  /** Average success rate */
  averageSuccessRate: number;
  /** Data integrity score (0-100) */
  integrityScore: number;
  /** Number of alerts by severity */
  alerts: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
  /** Performance summary */
  performance: {
    avgResponseTime: number;
    avgThroughput: number;
    avgErrorRate: number;
  };
  /** Top issues */
  topIssues: Array<{
    issue: string;
    count: number;
  }>;
}

/**
 * Performance metrics collector
 */
export class PerformanceMetricsCollector {
  private responseTimes: number[] = [];
  private operations = {
    reads: 0,
    writes: 0,
  };
  private errors = 0;
  private startTime = Date.now();

  /**
   * Record operation response time
   */
  recordResponseTime(durationMs: number): void {
    this.responseTimes.push(durationMs);

    // Keep only last 1000 measurements
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
  }

  /**
   * Record operation
   */
  recordOperation(type: 'read' | 'write'): void {
    if (type === 'read') {
      this.operations.reads++;
    } else {
      this.operations.writes++;
    }
  }

  /**
   * Record error
   */
  recordError(): void {
    this.errors++;
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    const totalOps = this.operations.reads + this.operations.writes;
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;

    return {
      timestamp: new Date().toISOString(),
      responseTime: {
        p50: this.calculatePercentile(this.responseTimes, 50),
        p95: this.calculatePercentile(this.responseTimes, 95),
        p99: this.calculatePercentile(this.responseTimes, 99),
        avg:
          this.responseTimes.length > 0
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
            : 0,
      },
      throughput: {
        reads: elapsedSeconds > 0 ? this.operations.reads / elapsedSeconds : 0,
        writes: elapsedSeconds > 0 ? this.operations.writes / elapsedSeconds : 0,
        total: elapsedSeconds > 0 ? totalOps / elapsedSeconds : 0,
      },
      errorRate: totalOps > 0 ? (this.errors / totalOps) * 100 : 0,
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.responseTimes = [];
    this.operations = { reads: 0, writes: 0 };
    this.errors = 0;
    this.startTime = Date.now();
  }
}

/**
 * Alert system
 */
export class AlertSystem {
  private alerts: Alert[] = [];
  private thresholds: AlertThresholds;

  constructor(thresholds?: Partial<AlertThresholds>) {
    this.thresholds = {
      maxQueueSize: 100,
      minSuccessRate: 95,
      maxErrorRate: 5,
      maxResponseTimeP99: 1000,
      ...thresholds,
    };
  }

  /**
   * Check sync status and trigger alerts
   */
  checkSyncStatus(stats: {
    queueSize: number;
    successRate: number;
    errorRate: number;
    responseTimeP99?: number;
  }): Alert[] {
    const newAlerts: Alert[] = [];

    // Queue size check
    if (stats.queueSize >= this.thresholds.maxQueueSize) {
      const alert: Alert = {
        severity: stats.queueSize >= this.thresholds.maxQueueSize * 2 ? 'critical' : 'warning',
        message: `동기화 큐 크기가 임계값을 초과했습니다`,
        timestamp: new Date().toISOString(),
        metric: 'queueSize',
        value: stats.queueSize,
        threshold: this.thresholds.maxQueueSize,
      };
      newAlerts.push(alert);
      this.addAlert(alert);
    }

    // Success rate check
    if (stats.successRate < this.thresholds.minSuccessRate) {
      const alert: Alert = {
        severity: stats.successRate < this.thresholds.minSuccessRate - 10 ? 'error' : 'warning',
        message: `동기화 성공률이 목표치보다 낮습니다`,
        timestamp: new Date().toISOString(),
        metric: 'successRate',
        value: `${stats.successRate.toFixed(1)}%`,
        threshold: `${this.thresholds.minSuccessRate}%`,
      };
      newAlerts.push(alert);
      this.addAlert(alert);
    }

    // Error rate check
    if (stats.errorRate > this.thresholds.maxErrorRate) {
      const alert: Alert = {
        severity: stats.errorRate > this.thresholds.maxErrorRate * 2 ? 'error' : 'warning',
        message: `에러율이 높습니다`,
        timestamp: new Date().toISOString(),
        metric: 'errorRate',
        value: `${stats.errorRate.toFixed(1)}%`,
        threshold: `${this.thresholds.maxErrorRate}%`,
      };
      newAlerts.push(alert);
      this.addAlert(alert);
    }

    // Response time check (if provided)
    if (stats.responseTimeP99 && stats.responseTimeP99 > this.thresholds.maxResponseTimeP99) {
      const alert: Alert = {
        severity: 'warning',
        message: `응답 시간이 느립니다 (p99)`,
        timestamp: new Date().toISOString(),
        metric: 'responseTimeP99',
        value: `${stats.responseTimeP99.toFixed(0)}ms`,
        threshold: `${this.thresholds.maxResponseTimeP99}ms`,
      };
      newAlerts.push(alert);
      this.addAlert(alert);
    }

    // Log alerts to console
    newAlerts.forEach((alert) => {
      const emoji = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        critical: '🚨',
      }[alert.severity];

      console.warn(`${emoji} [${alert.severity.toUpperCase()}] ${alert.message}
        현재값: ${alert.value}, 임계값: ${alert.threshold}
        시간: ${new Date(alert.timestamp).toLocaleString('ko-KR')}`);
    });

    return newAlerts;
  }

  /**
   * Add alert to history
   */
  private addAlert(alert: Alert): void {
    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  /**
   * Get alert history
   */
  getAlerts(limit?: number): Alert[] {
    return limit ? this.alerts.slice(-limit) : this.alerts;
  }

  /**
   * Clear alert history
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}

/**
 * Weekly report generator
 */
export class WeeklyReportGenerator {
  /**
   * Generate weekly report
   */
  generateReport(data: {
    syncStats: Array<{
      timestamp: string;
      successRate: number;
      operations: number;
    }>;
    integrityChecks: Array<{
      timestamp: string;
      overallMatch: boolean;
    }>;
    alerts: Alert[];
    performanceMetrics: PerformanceMetrics[];
  }): WeeklyReport {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate total operations
    const totalOperations = data.syncStats.reduce((sum, stat) => sum + stat.operations, 0);

    // Calculate average success rate
    const averageSuccessRate =
      data.syncStats.length > 0
        ? data.syncStats.reduce((sum, stat) => sum + stat.successRate, 0) / data.syncStats.length
        : 100;

    // Calculate integrity score
    const passedChecks = data.integrityChecks.filter((check) => check.overallMatch).length;
    const integrityScore =
      data.integrityChecks.length > 0
        ? (passedChecks / data.integrityChecks.length) * 100
        : 100;

    // Count alerts by severity
    const alertCounts = {
      info: data.alerts.filter((a) => a.severity === 'info').length,
      warning: data.alerts.filter((a) => a.severity === 'warning').length,
      error: data.alerts.filter((a) => a.severity === 'error').length,
      critical: data.alerts.filter((a) => a.severity === 'critical').length,
    };

    // Calculate performance summary
    const avgResponseTime =
      data.performanceMetrics.length > 0
        ? data.performanceMetrics.reduce((sum, m) => sum + m.responseTime.avg, 0) /
          data.performanceMetrics.length
        : 0;

    const avgThroughput =
      data.performanceMetrics.length > 0
        ? data.performanceMetrics.reduce((sum, m) => sum + m.throughput.total, 0) /
          data.performanceMetrics.length
        : 0;

    const avgErrorRate =
      data.performanceMetrics.length > 0
        ? data.performanceMetrics.reduce((sum, m) => sum + m.errorRate, 0) /
          data.performanceMetrics.length
        : 0;

    // Find top issues
    const issueMap = new Map<string, number>();
    data.alerts.forEach((alert) => {
      const count = issueMap.get(alert.message) || 0;
      issueMap.set(alert.message, count + 1);
    });

    const topIssues = Array.from(issueMap.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      period: {
        start: weekAgo.toISOString(),
        end: now.toISOString(),
      },
      totalOperations,
      averageSuccessRate,
      integrityScore,
      alerts: alertCounts,
      performance: {
        avgResponseTime,
        avgThroughput,
        avgErrorRate,
      },
      topIssues,
    };
  }

  /**
   * Format report as text
   */
  formatReport(report: WeeklyReport): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('주간 동기화 리포트');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`기간: ${new Date(report.period.start).toLocaleDateString('ko-KR')} ~ ${new Date(report.period.end).toLocaleDateString('ko-KR')}`);
    lines.push('');
    lines.push('📊 요약 통계');
    lines.push(`  총 동기화 작업: ${report.totalOperations.toLocaleString()}`);
    lines.push(`  평균 성공률: ${report.averageSuccessRate.toFixed(1)}%`);
    lines.push(`  데이터 무결성 점수: ${report.integrityScore.toFixed(1)}%`);
    lines.push('');
    lines.push('⚠️ 알림 통계');
    lines.push(`  정보: ${report.alerts.info}`);
    lines.push(`  경고: ${report.alerts.warning}`);
    lines.push(`  에러: ${report.alerts.error}`);
    lines.push(`  치명적: ${report.alerts.critical}`);
    lines.push('');
    lines.push('⚡ 성능 지표');
    lines.push(`  평균 응답 시간: ${report.performance.avgResponseTime.toFixed(0)}ms`);
    lines.push(`  평균 처리량: ${report.performance.avgThroughput.toFixed(1)} ops/sec`);
    lines.push(`  평균 에러율: ${report.performance.avgErrorRate.toFixed(2)}%`);
    lines.push('');

    if (report.topIssues.length > 0) {
      lines.push('🔝 주요 이슈 Top 5');
      report.topIssues.forEach((issue, index) => {
        lines.push(`  ${index + 1}. ${issue.issue} (${issue.count}회)`);
      });
      lines.push('');
    }

    lines.push('='.repeat(60));

    return lines.join('\n');
  }
}

// Global instances
export const performanceMetricsCollector = new PerformanceMetricsCollector();
export const alertSystem = new AlertSystem();
export const weeklyReportGenerator = new WeeklyReportGenerator();
