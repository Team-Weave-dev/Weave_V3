/**
 * Rollback API
 *
 * Admin endpoints for rolling back storage mode changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/session';
import {
  rollbackToDualWrite,
  emergencyFallbackToLocalStorage,
  getCurrentStorageMode
} from '@/lib/storage/transition/finalTransition';
import { monitoringService } from '@/lib/storage/monitoring/enhancedMonitoring';

/**
 * POST /api/admin/rollback
 * Rollback to DualWrite mode
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { mode = 'dualwrite', reason = 'Manual rollback' } = body;

    // Get current mode
    const currentMode = getCurrentStorageMode();

    if (mode === 'dualwrite') {
      // Rollback to DualWrite mode
      if (currentMode.mode === 'dualwrite') {
        return NextResponse.json({
          success: true,
          message: 'Already in DualWrite mode',
          mode: 'dualwrite'
        });
      }

      console.log(`Rolling back to DualWrite mode. Reason: ${reason}`);
      const result = await rollbackToDualWrite();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.message,
            errors: result.errors
          },
          { status: 500 }
        );
      }

      // Collect post-rollback metrics
      const metrics = await monitoringService.collectMetrics(user.id);

      return NextResponse.json({
        success: true,
        result,
        postRollbackMetrics: {
          mode: metrics.storageMode,
          health: metrics.health,
          sync: metrics.sync,
          timestamp: metrics.timestamp
        },
        reason
      });

    } else if (mode === 'localStorage') {
      // Emergency fallback to LocalStorage
      console.warn(`🚨 Emergency fallback to LocalStorage mode. Reason: ${reason}`);
      const result = await emergencyFallbackToLocalStorage();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.message,
            errors: result.errors
          },
          { status: 500 }
        );
      }

      // Note: Can't collect user-specific metrics in localStorage mode
      const metrics = await monitoringService.collectMetrics();

      return NextResponse.json({
        success: true,
        result,
        postFallbackMetrics: {
          mode: metrics.storageMode,
          health: metrics.health,
          timestamp: metrics.timestamp
        },
        reason,
        warning: 'Emergency fallback mode - limited functionality'
      });

    } else {
      return NextResponse.json(
        {
          error: 'Invalid rollback mode',
          validModes: ['dualwrite', 'localStorage']
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Rollback failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform rollback',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/rollback
 * Get rollback readiness status
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current mode
    const currentMode = getCurrentStorageMode();

    // Get health summary
    const healthSummary = monitoringService.getHealthSummary();

    // Determine available rollback options
    const availableRollbacks = [];

    if (currentMode.mode === 'supabase') {
      availableRollbacks.push({
        target: 'dualwrite',
        recommended: true,
        reason: 'Safe rollback to dual-write mode'
      });
      availableRollbacks.push({
        target: 'localStorage',
        recommended: false,
        reason: 'Emergency fallback - use only if Supabase is unavailable'
      });
    } else if (currentMode.mode === 'dualwrite') {
      availableRollbacks.push({
        target: 'localStorage',
        recommended: healthSummary.currentStatus === 'critical',
        reason: 'Fallback to localStorage if sync issues persist'
      });
    }

    return NextResponse.json({
      currentMode: currentMode.mode,
      modeDetails: currentMode.details,
      health: {
        status: healthSummary.currentStatus,
        score: healthSummary.score,
        issues: healthSummary.issues
      },
      availableRollbacks,
      recommendations: healthSummary.recommendations
    });

  } catch (error) {
    console.error('Failed to get rollback status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get rollback status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}