'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Invoice } from '@/types/business'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  DollarSign,
  Download,
  Send,
  Eye
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    // 테스트 사용자 체크
    const testUser = localStorage.getItem('testUser')
    if (testUser) {
      const userData = JSON.parse(testUser)
      
      // 테스트 데이터 로드
      setInvoices([
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          client_id: '1',
          project_id: '1',
          status: 'paid',
          issue_date: '2024-01-01',
          due_date: '2024-01-31',
          subtotal: 5000000,
          tax_rate: 10,
          tax_amount: 500000,
          total: 5500000,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: userData.id
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          client_id: '2',
          status: 'sent',
          issue_date: '2024-02-01',
          due_date: '2024-02-29',
          subtotal: 3000000,
          tax_rate: 10,
          tax_amount: 300000,
          total: 3300000,
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
          user_id: userData.id
        },
        {
          id: '3',
          invoice_number: 'INV-2024-003',
          client_id: '1',
          status: 'draft',
          issue_date: '2024-03-01',
          due_date: '2024-03-31',
          subtotal: 2000000,
          tax_rate: 10,
          tax_amount: 200000,
          total: 2200000,
          created_at: '2024-03-01',
          updated_at: '2024-03-01',
          user_id: userData.id
        }
      ])
      
      setLoading(false)
      return
    }

    // 실제 Supabase 사용자 체크
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // TODO: 실제 데이터베이스에서 로드
      // 임시 데이터
      setInvoices([
        {
          id: '1',
          invoice_number: 'INV-2024-001',
          client_id: '1',
          project_id: '1',
          status: 'paid',
          issue_date: '2024-01-01',
          due_date: '2024-01-31',
          subtotal: 5000000,
          tax_rate: 10,
          tax_amount: 500000,
          total: 5500000,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: user.id
        },
        {
          id: '2',
          invoice_number: 'INV-2024-002',
          client_id: '2',
          status: 'sent',
          issue_date: '2024-02-01',
          due_date: '2024-02-29',
          subtotal: 3000000,
          tax_rate: 10,
          tax_amount: 300000,
          total: 3300000,
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
          user_id: user.id
        },
        {
          id: '3',
          invoice_number: 'INV-2024-003',
          client_id: '1',
          status: 'draft',
          issue_date: '2024-03-01',
          due_date: '2024-03-31',
          subtotal: 2000000,
          tax_rate: 10,
          tax_amount: 200000,
          total: 2200000,
          created_at: '2024-03-01',
          updated_at: '2024-03-01',
          user_id: user.id
        }
      ])
    } catch (err) {
      router.push('/login')
    }
    
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'error'> = {
      'draft': 'outline',
      'sent': 'secondary',
      'paid': 'default',
      'overdue': 'error',
      'cancelled': 'error'
    }
    
    const labels: Record<string, string> = {
      'draft': '초안',
      'sent': '발송됨',
      'paid': '결제완료',
      'overdue': '연체',
      'cancelled': '취소'
    }
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">인보이스 관리</h1>
          <p className="text-muted-foreground mt-1">
            청구서를 생성하고 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            새 인보이스
          </Link>
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 인보이스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">미결제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {invoices.filter(i => i.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">결제완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(i => i.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{invoices
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="인보이스 번호로 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 인보이스 테이블 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>인보이스 번호</TableHead>
                <TableHead>클라이언트</TableHead>
                <TableHead>발행일</TableHead>
                <TableHead>만기일</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>클라이언트 {invoice.client_id}</TableCell>
                  <TableCell>{invoice.issue_date}</TableCell>
                  <TableCell>{invoice.due_date}</TableCell>
                  <TableCell>₩{invoice.total.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredInvoices.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">인보이스가 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '첫 번째 인보이스를 생성해보세요.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}