/**
 * Sync From Supabase API Endpoint
 *
 * Syncs data from Supabase to LocalStorage with automatic snake_case → camelCase transformation.
 * Useful when LocalStorage is missing data that exists in Supabase.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/session';
import { getDualWriteAdapter } from '@/lib/storage';

/**
 * POST /api/sync-from-supabase
 *
 * Body (optional): { entity?: string }
 * - If entity is provided, syncs only that entity
 * - If entity is not provided, syncs all entities
 *
 * @returns JSON response with sync result
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // DualWrite adapter 확인
    const dualAdapter = getDualWriteAdapter();
    if (!dualAdapter) {
      return NextResponse.json(
        { error: 'DualWrite mode not active' },
        { status: 400 }
      );
    }

    // 요청 본문 파싱 (optional)
    const body = await request.json().catch(() => ({}));
    const { entity } = body;

    if (entity) {
      // 특정 엔티티만 동기화
      await dualAdapter.syncFromSupabase(entity);

      return NextResponse.json({
        success: true,
        message: `"${entity}" synced from Supabase to LocalStorage`,
        entity,
      });
    } else {
      // 모든 엔티티 동기화
      await dualAdapter.syncAllFromSupabase();

      return NextResponse.json({
        success: true,
        message: 'All entities synced from Supabase to LocalStorage',
        entities: ['projects', 'tasks', 'events', 'clients', 'documents', 'todo_sections'],
      });
    }
  } catch (error) {
    console.error('Sync from Supabase error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync from Supabase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
