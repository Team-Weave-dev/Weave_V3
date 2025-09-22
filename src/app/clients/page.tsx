'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/types/business'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  User,
  Mail,
  Phone,
  Building,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    // 테스트 사용자 체크
    const testUser = localStorage.getItem('testUser')
    if (testUser) {
      const userData = JSON.parse(testUser)
      
      // 테스트 데이터 로드
      setClients([
        {
          id: '1',
          name: '김철수',
          email: 'kim@example.com',
          phone: '010-1234-5678',
          company: 'ABC 컴퍼니',
          address: '서울시 강남구',
          notes: 'VIP 클라이언트',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: userData.id
        },
        {
          id: '2',
          name: '이영희',
          email: 'lee@example.com',
          phone: '010-9876-5432',
          company: 'XYZ 코퍼레이션',
          address: '서울시 서초구',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
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
      setClients([
        {
          id: '1',
          name: '김철수',
          email: 'kim@example.com',
          phone: '010-1234-5678',
          company: 'ABC 컴퍼니',
          address: '서울시 강남구',
          notes: 'VIP 클라이언트',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: user.id
        },
        {
          id: '2',
          name: '이영희',
          email: 'lee@example.com',
          phone: '010-9876-5432',
          company: 'XYZ 코퍼레이션',
          address: '서울시 서초구',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
          user_id: user.id
        }
      ])
    } catch (err) {
      router.push('/login')
    }
    
    setLoading(false)
  }

  const handleSubmit = async () => {
    // TODO: 실제 데이터베이스에 저장
    console.log('Saving client:', formData)
    setIsDialogOpen(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      notes: ''
    })
    loadClients()
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">클라이언트 관리</h1>
          <p className="text-muted-foreground mt-1">
            고객 정보를 체계적으로 관리하세요
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 클라이언트
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 클라이언트 추가</DialogTitle>
              <DialogDescription>
                클라이언트 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  이름 *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  전화번호
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  회사
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  메모
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="클라이언트 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 클라이언트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.company && (
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {client.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {client.phone}
                </div>
              )}
              {client.address && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-2 h-4 w-4" />
                  {client.address}
                </div>
              )}
              {client.notes && (
                <CardDescription className="pt-2 text-xs">
                  {client.notes}
                </CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">클라이언트가 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '첫 번째 클라이언트를 추가해보세요.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}