// ====================================
// 비즈니스 타입 정의
// ====================================
// NOTE: Project, Client, Task, Document, User는 storage/types/entities에서 정의됨
// 해당 타입은 @/lib/storage에서 import하여 사용

// 인보이스 관련 타입 (storage 미정의 - 향후 이전 필요)
export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  project_id?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate?: number
  tax_amount?: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

// 인보이스 항목 타입
export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  created_at: string
  updated_at: string
}

// 결제 관련 타입
export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other'
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

// 리마인더 관련 타입 (storage 미정의 - 향후 이전 필요)
export interface Reminder {
  id: string
  title: string
  description?: string
  reminder_date: string
  is_completed: boolean
  priority: 'low' | 'medium' | 'high'
  related_to?: 'project' | 'invoice' | 'task' | 'general'
  related_id?: string
  created_at: string
  updated_at: string
  user_id: string
}