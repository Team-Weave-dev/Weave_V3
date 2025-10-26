/**
 * Plan Service
 *
 * 요금제 정보를 조회하는 서비스
 * 읽기 전용 서비스 (요금제 정보는 시드 데이터로만 관리)
 */

import { createClient } from '@/lib/supabase/client';
import type { Plan, PlanType } from '../types/entities/plan';
import { isPlan } from '../types/entities/plan';
import { plans as planConfigs } from '@/config/constants';

/**
 * Plan service class
 *
 * **특징**:
 * - Supabase 전용 (LocalStorage 사용하지 않음)
 * - 읽기 전용 (요금제 정보는 시스템 관리)
 * - 모든 사용자가 동일한 데이터 공유
 */
export class PlanService {
  /**
   * 모든 요금제 조회
   *
   * Supabase에서 요금제 정보를 가져옵니다.
   * 실패 시 config/constants.ts의 fallback 데이터 사용
   *
   * @returns 요금제 배열
   */
  async getAll(): Promise<Plan[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.warn('Failed to fetch plans from Supabase:', error);
        return this.getFallbackPlans();
      }

      if (!data || data.length === 0) {
        return this.getFallbackPlans();
      }

      // Supabase 데이터를 Plan 형식으로 변환
      const plans: Plan[] = data.map((row) => ({
        id: row.id as PlanType,
        name: row.name,
        price: row.price,
        limits: {
          projects: row.limits_projects,
          widgets: row.limits_widgets,
          storage: row.limits_storage,
          aiService: row.limits_ai_service
        },
        features: row.features || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      // 타입 검증
      const validPlans = plans.filter(isPlan);
      return validPlans;
    } catch (err) {
      console.error('Error fetching plans:', err);
      return this.getFallbackPlans();
    }
  }

  /**
   * ID로 특정 요금제 조회
   *
   * @param id - 요금제 ID ('free', 'basic', 'pro')
   * @returns 요금제 또는 null
   */
  async getById(id: PlanType): Promise<Plan | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.warn(`Failed to fetch plan '${id}' from Supabase:`, error);
        return this.getFallbackPlan(id);
      }

      const plan: Plan = {
        id: data.id as PlanType,
        name: data.name,
        price: data.price,
        limits: {
          projects: data.limits_projects,
          widgets: data.limits_widgets,
          storage: data.limits_storage,
          aiService: data.limits_ai_service
        },
        features: data.features || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return isPlan(plan) ? plan : this.getFallbackPlan(id);
    } catch (err) {
      console.error(`Error fetching plan '${id}':`, err);
      return this.getFallbackPlan(id);
    }
  }

  /**
   * Fallback: config/constants.ts에서 모든 요금제 가져오기
   */
  private getFallbackPlans(): Plan[] {
    const now = new Date().toISOString();
    return Object.values(planConfigs).map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      limits: plan.limits,
      features: [...plan.features],
      createdAt: now,
      updatedAt: now
    }));
  }

  /**
   * Fallback: config/constants.ts에서 특정 요금제 가져오기
   */
  private getFallbackPlan(id: PlanType): Plan | null {
    const planConfig = planConfigs[id];
    if (!planConfig) return null;

    const now = new Date().toISOString();
    return {
      id: planConfig.id,
      name: planConfig.name,
      price: planConfig.price,
      limits: planConfig.limits,
      features: [...planConfig.features],
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * 요금제 제한 정보만 조회
   *
   * @param id - 요금제 ID
   * @returns 제한 정보
   */
  async getLimits(id: PlanType) {
    const plan = await this.getById(id);
    return plan?.limits || planConfigs[id].limits;
  }
}

/**
 * Export singleton instance
 */
export const planService = new PlanService();
