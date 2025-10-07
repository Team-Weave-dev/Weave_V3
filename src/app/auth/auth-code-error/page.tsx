'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState({
    error: '',
    error_code: '',
    error_description: '',
  })

  useEffect(() => {
    // URL 해시에서 에러 정보 추출
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    setErrorDetails({
      error: params.get('error') || '알 수 없는 오류',
      error_code: params.get('error_code') || '',
      error_description: params.get('error_description') || '인증 중 문제가 발생했습니다.',
    })

    console.error('🔐 [AUTH ERROR]', {
      error: params.get('error'),
      error_code: params.get('error_code'),
      error_description: params.get('error_description'),
    })
  }, [])

  const handleRetry = () => {
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">인증 오류</CardTitle>
          <CardDescription className="text-center">
            로그인 처리 중 문제가 발생했습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {errorDetails.error_description.replace(/\+/g, ' ')}
            </AlertDescription>
          </Alert>

          {errorDetails.error_code && (
            <div className="text-sm text-muted-foreground">
              <p><strong>오류 코드:</strong> {errorDetails.error_code}</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>가능한 원인:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>데이터베이스 연결 문제</li>
              <li>사용자 계정 생성 실패</li>
              <li>권한 설정 문제</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleRetry} className="w-full">
            로그인 페이지로 돌아가기
          </Button>
          <div className="text-xs text-center text-muted-foreground">
            문제가 계속되면 관리자에게 문의하세요
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
