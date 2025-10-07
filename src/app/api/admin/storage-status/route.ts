/**
 * Storage Status API
 *
 * Admin endpoint to get comprehensive storage system status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/session';
import { getCurrentStorageMode } from '@/lib/storage/transition/finalTransition';
import { monitoringService } from '@/lib/storage/monitoring/enhancedMonitoring';
import { performanceMetricsCollector, alertSystem } from '@/lib/storage/monitoring/performanceMetrics';

/**
 * GET /api/admin/storage-status
 * Get comprehensive storage system status
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current storage mode
    const currentMode = getCurrentStorageMode();

    // Collect comprehensive metrics
    const metrics = await monitoringService.collectMetrics(user.id);

    // Get health summary
    const healthSummary = monitoringService.getHealthSummary();

    // Get performance metrics
    const perfMetrics = performanceMetricsCollector.getMetrics();

    // Get recent alerts
    const recentAlerts = alertSystem.getAlerts(10);

    // Get metrics history (last 10 entries)
    const metricsHistory = monitoringService.getMetricsHistory(10);

    // Calculate uptime (simplified - based on metrics history)
    const uptimePercentage = metricsHistory.length > 0
      ? (metricsHistory.filter(m => m.health.status !== 'critical').length / metricsHistory.length) * 100
      : 100;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      storage: {
        mode: currentMode.mode,
        details: currentMode.details
      },
      health: {
        current: {
          status: healthSummary.currentStatus,
          score: healthSummary.score,
          issues: healthSummary.issues
        },
        recommendations: healthSummary.recommendations,
        uptime: `${uptimePercentage.toFixed(1)}%`
      },
      performance: {
        responseTime: {
          p50: perfMetrics.responseTime.p50,
          p95: perfMetrics.responseTime.p95,
          p99: perfMetrics.responseTime.p99,
          avg: perfMetrics.responseTime.avg
        },
        throughput: perfMetrics.throughput,
        errorRate: `${perfMetrics.errorRate.toFixed(2)}%`
      },
      sync: metrics.sync || null,
      integrity: metrics.integrity || null,
      resources: metrics.resources,
      alerts: {
        recent: recentAlerts.map(alert => ({
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp
        })),
        count: {
          total: recentAlerts.length,
          critical: recentAlerts.filter(a => a.severity === 'critical').length,
          error: recentAlerts.filter(a => a.severity === 'error').length,
          warning: recentAlerts.filter(a => a.severity === 'warning').length,
          info: recentAlerts.filter(a => a.severity === 'info').length
        }
      },
      history: {
        entries: metricsHistory.length,
        summary: {
          averageHealthScore: metricsHistory.length > 0
            ? metricsHistory.reduce((sum, m) => sum + m.health.score, 0) / metricsHistory.length
            : 100,
          healthTrend: getHealthTrend(metricsHistory)
        }
      }
    });

  } catch (error) {
    console.error('Failed to get storage status:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to get storage status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate health trend from metrics history
 */
function getHealthTrend(history: any[]): 'improving' | 'stable' | 'declining' | 'unknown' {
  if (history.length < 3) return 'unknown';

  // Compare recent scores with older scores
  const recentScores = history.slice(-3).map(m => m.health.score);
  const olderScores = history.slice(-6, -3).map(m => m.health.score);

  if (olderScores.length === 0) return 'stable';

  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

  const difference = recentAvg - olderAvg;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

/**
 * POST /api/admin/storage-status/reset
 * Reset monitoring metrics
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request for specific action
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      // Reset monitoring service
      monitoringService.reset();

      return NextResponse.json({
        success: true,
        message: 'Monitoring metrics reset successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid action',
        validActions: ['reset']
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Failed to reset metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset metrics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}