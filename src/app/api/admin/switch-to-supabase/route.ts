/**
 * Switch to Supabase-only Mode API
 *
 * Admin endpoint to transition from DualWrite mode to Supabase-only mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/session';
import {
  switchToSupabaseOnly,
  clearLocalStorageData,
  getCurrentStorageMode
} from '@/lib/storage/transition/finalTransition';
import { monitoringService } from '@/lib/storage/monitoring/enhancedMonitoring';

/**
 * GET /api/admin/switch-to-supabase
 * Get current storage mode and transition readiness
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

    // Collect monitoring metrics
    const metrics = await monitoringService.collectMetrics(user.id);

    // Check if ready for transition
    const isReady = currentMode.mode === 'dualwrite' &&
                    metrics.health.score >= 80 &&
                    (!metrics.sync || metrics.sync.successRate >= 95);

    return NextResponse.json({
      currentMode: currentMode.mode,
      details: currentMode.details,
      health: metrics.health,
      sync: metrics.sync,
      isReadyForTransition: isReady,
      recommendations: isReady ? [] : [
        'Ensure data sync success rate is above 95%',
        'Verify system health score is above 80',
        'Complete any pending sync operations'
      ]
    });

  } catch (error) {
    console.error('Failed to get transition status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get transition status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/switch-to-supabase
 * Execute transition to Supabase-only mode
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
    const { clearLocalStorage = false, confirmTransition = false } = body;

    // Require explicit confirmation
    if (!confirmTransition) {
      return NextResponse.json(
        {
          error: 'Transition requires explicit confirmation',
          requireConfirmation: true
        },
        { status: 400 }
      );
    }

    // Check current mode
    const currentMode = getCurrentStorageMode();
    if (currentMode.mode === 'supabase') {
      return NextResponse.json({
        success: true,
        message: 'Already in Supabase-only mode',
        mode: 'supabase'
      });
    }

    if (currentMode.mode !== 'dualwrite') {
      return NextResponse.json(
        {
          error: 'Can only transition to Supabase from DualWrite mode',
          currentMode: currentMode.mode
        },
        { status: 400 }
      );
    }

    // Perform transition
    console.log('Starting transition to Supabase-only mode...');
    const result = await switchToSupabaseOnly();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          validation: result.validation,
          errors: result.errors
        },
        { status: 500 }
      );
    }

    // Clear LocalStorage if requested
    let clearResult = null;
    if (clearLocalStorage) {
      console.log('Clearing LocalStorage data...');
      clearResult = await clearLocalStorageData(true);
    }

    // Collect post-transition metrics
    const postMetrics = await monitoringService.collectMetrics(user.id);

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        clearLocalStorage: clearResult
      },
      postTransitionMetrics: {
        mode: postMetrics.storageMode,
        health: postMetrics.health,
        timestamp: postMetrics.timestamp
      }
    });

  } catch (error) {
    console.error('Transition failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to transition to Supabase',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}