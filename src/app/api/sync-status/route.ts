/**
 * Sync Status API Endpoint
 *
 * Provides real-time information about DualWrite synchronization status.
 * Used for monitoring and debugging purposes.
 */

import { NextResponse } from 'next/server';
import { getDualWriteAdapter } from '@/lib/storage';
import { getUser } from '@/lib/auth/session';

/**
 * GET /api/sync-status
 *
 * Returns current synchronization status and statistics.
 *
 * @returns JSON response with sync stats
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get DualWrite adapter
    const dualAdapter = getDualWriteAdapter();

    if (!dualAdapter) {
      return NextResponse.json(
        {
          mode: 'localStorage',
          message: 'DualWrite mode not active',
        },
        { status: 200 }
      );
    }

    // Get sync statistics
    const stats = dualAdapter.getSyncStats();

    // Calculate health metrics
    const successRate =
      stats.totalAttempts > 0 ? (stats.successCount / stats.totalAttempts) * 100 : 100;

    const isHealthy = stats.failureCount < 10 && stats.queueSize < 100 && successRate > 95;

    return NextResponse.json({
      mode: 'dualWrite',
      stats: {
        totalAttempts: stats.totalAttempts,
        successCount: stats.successCount,
        failureCount: stats.failureCount,
        queueSize: stats.queueSize,
        pendingCount: stats.pendingCount,
        lastSyncAt: stats.lastSyncAt,
        successRate: successRate.toFixed(1) + '%',
      },
      health: {
        isHealthy,
        status: isHealthy ? 'healthy' : 'warning',
        issues: [
          stats.queueSize >= 100 && 'High queue size',
          stats.failureCount >= 10 && 'Multiple failures',
          successRate <= 95 && 'Low success rate',
        ].filter(Boolean),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync-status
 *
 * Triggers manual synchronization of queued items.
 *
 * @returns JSON response with sync result
 */
export async function POST() {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get DualWrite adapter
    const dualAdapter = getDualWriteAdapter();

    if (!dualAdapter) {
      return NextResponse.json(
        {
          error: 'DualWrite mode not active',
        },
        { status: 400 }
      );
    }

    // Force sync all queued items
    await dualAdapter.forceSyncAll();

    // Get updated stats
    const stats = dualAdapter.getSyncStats();

    return NextResponse.json({
      success: true,
      message: 'Manual sync triggered successfully',
      stats: {
        queueSize: stats.queueSize,
        pendingCount: stats.pendingCount,
      },
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger manual sync' },
      { status: 500 }
    );
  }
}
