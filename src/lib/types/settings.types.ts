/**
 * 설정 페이지 타입 정의
 * 2025-10-07 추가
 */

// 사업자 유형
export type BusinessType = 'freelancer' | 'individual' | 'corporation';

// 사용자 프로필
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessNumber: string;
  address: string;
  addressDetail: string;
  businessType: BusinessType;
  createdAt: string;
  updatedAt: string;
}

// 요금제 타입
export type PlanType = 'free' | 'basic' | 'pro';

// 요금제 정보
export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  priceMonthly: number;
  limits: {
    projects: number; // -1 = unlimited
    widgets: number; // -1 = unlimited
    storage: number; // MB
    aiService: boolean;
  };
  features: string[];
}

// 사용량 정보
export interface Usage {
  projects: {
    current: number;
    limit: number; // -1 = unlimited
  };
  widgets: {
    current: number;
    limit: number; // -1 = unlimited
  };
  storage: {
    used: number; // MB
    total: number; // MB
    percentage: number; // 0-100
  };
  aiService: {
    available: boolean;
  };
}

// 결제 수단
export interface PaymentMethod {
  id: string;
  cardNumber: string; // 마스킹된 카드 번호 (예: **** **** **** 1234)
  expiryDate: string; // MM/YY
  cardHolder: string;
  isDefault: boolean;
  createdAt: string;
}

// 결제 상태
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

// 결제 내역
export interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  plan: PlanType;
  status: PaymentStatus;
  invoiceUrl?: string;
  description: string;
}

// 설정 페이지 전체 상태
export interface SettingsState {
  profile: UserProfile;
  currentPlan: PlanType;
  usage: Usage;
  paymentMethod?: PaymentMethod;
  billingHistory: BillingHistory[];
}

// 프로필 업데이트 DTO
export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  phone?: string;
  businessNumber?: string;
  address?: string;
  addressDetail?: string;
  businessType?: BusinessType;
}

// 요금제 변경 DTO
export interface ChangePlanDTO {
  newPlan: PlanType;
  paymentMethodId?: string;
}
