'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types/business'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  FolderOpen,
  Calendar,
  DollarSign,
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

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    // 테스트 사용자 체크
    const testUser = localStorage.getItem('testUser')
    if (testUser) {
      const userData = JSON.parse(testUser)
      
      // 테스트 데이터 로드
      setProjects([
        {
          id: '1',
          name: '웹사이트 리뉴얼',
          description: '회사 웹사이트 전면 개편',
          status: 'active',
          client_id: '1',
          budget: 5000000,
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: userData.id
        },
        {
          id: '2',
          name: '모바일 앱 개발',
          description: 'iOS/Android 크로스 플랫폼 앱',
          status: 'active',
          client_id: '2',
          budget: 8000000,
          start_date: '2024-02-01',
          end_date: '2024-06-30',
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
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
      // const { data, error } = await supabase
      //   .from('projects')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false })

      // 임시 데이터
      setProjects([
        {
          id: '1',
          name: '웹사이트 리뉴얼',
          description: '회사 웹사이트 전면 개편',
          status: 'active',
          client_id: '1',
          budget: 5000000,
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          user_id: user.id
        },
        {
          id: '2',
          name: '모바일 앱 개발',
          description: 'iOS/Android 크로스 플랫폼 앱',
          status: 'active',
          client_id: '2',
          budget: 8000000,
          start_date: '2024-02-01',
          end_date: '2024-06-30',
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
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
      'active': 'default',
      'completed': 'secondary',
      'on-hold': 'outline',
      'cancelled': 'error'
    }
    
    const labels: Record<string, string> = {
      'active': '진행중',
      'completed': '완료',
      'on-hold': '보류',
      'cancelled': '취소'
    }
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">프로젝트 관리</h1>
          <p className="text-muted-foreground mt-1">
            모든 프로젝트를 한눈에 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            새 프로젝트
          </Link>
        </Button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="프로젝트 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 프로젝트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {getStatusBadge(project.status)}
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
            <CardContent className="space-y-3">
              <CardDescription>{project.description}</CardDescription>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {project.start_date} ~ {project.end_date}
                </div>
                {project.budget && (
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    ₩{project.budget.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/projects/${project.id}`}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    상세 보기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-3">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">프로젝트가 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '첫 번째 프로젝트를 만들어보세요.'}
            </p>
            {!searchQuery && (
              <Button asChild className="mt-4">
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  프로젝트 생성
                </Link>
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}