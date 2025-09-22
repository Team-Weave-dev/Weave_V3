// ====================================
// 핵심 비즈니스 타입 정의
// ====================================

// 프로젝트 관련 타입
export interface Project {
  id: string
  name: string
  description?: string
  client_id?: string
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  start_date?: string
  end_date?: string
  budget?: number
  created_at: string
  updated_at: string
  user_id: string
}

// 클라이언트 관련 타입
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

// 인보이스 관련 타입
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

// 태스크 관련 타입
export interface Task {
  id: string
  project_id?: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  assigned_to?: string
  created_at: string
  updated_at: string
  user_id: string
}

// 문서 관련 타입
export interface Document {
  id: string
  project_id?: string
  client_id?: string
  title: string
  content?: string
  file_url?: string
  file_type?: string
  file_size?: number
  created_at: string
  updated_at: string
  user_id: string
}

// 사용자 관련 타입
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: 'admin' | 'user' | 'viewer'
  created_at: string
  updated_at: string
}

// 리마인더 관련 타입
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