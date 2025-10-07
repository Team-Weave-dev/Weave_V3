/**
 * Data Integrity Check API Endpoint
 *
 * Validates data consistency between LocalStorage and Supabase.
 * Used for monitoring and debugging data integrity during DualWrite mode.
 */

import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/session';
import { LocalStorageAdapter } from '@/lib/storage/adapters/LocalStorageAdapter';
import { SupabaseAdapter } from '@/lib/storage/adapters/SupabaseAdapter';
import { STORAGE_CONFIG } from '@/lib/storage/config';
import {
  validateDataIntegrity,
  formatValidationReport,
} from '@/lib/storage/validation/dataIntegrityCheck';

/**
 * GET /api/data-integrity
 *
 * Performs data integrity validation across all entities.
 *
 * Query parameters:
 * - deepCheck: boolean - Whether to perform deep equality check (default: true)
 * - format: 'json' | 'text' - Response format (default: 'json')
 *
 * @returns Validation report
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const deepCheck = searchParams.get('deepCheck') !== 'false';
    const format = searchParams.get('format') || 'json';

    // Create adapters
    const localAdapter = new LocalStorageAdapter(STORAGE_CONFIG);
    const supabaseAdapter = new SupabaseAdapter({ userId: user.id });

    // Perform validation
    const report = await validateDataIntegrity(localAdapter, supabaseAdapter, {
      deepCheck,
    });

    // Return formatted response
    if (format === 'text') {
      const textReport = formatValidationReport(report);
      return new NextResponse(textReport, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Data integrity check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform data integrity check',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
