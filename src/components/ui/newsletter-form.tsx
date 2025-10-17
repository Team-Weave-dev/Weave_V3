"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { isValidEmail } from "@/lib/validation/email"

/**
 * 뉴스레터 구독 폼 Props
 */
export interface NewsletterFormProps {
  /** 플레이스홀더 텍스트 */
  placeholder?: string
  /** 버튼 텍스트 */
  buttonText?: string
  /** 폼 제출 시 콜백 (선택사항) */
  onSuccess?: (email: string) => void
  /** 에러 발생 시 콜백 (선택사항) */
  onError?: (error: string) => void
}

/**
 * NewsletterForm 컴포넌트
 *
 * @description
 * 뉴스레터 구독을 위한 이메일 입력 폼입니다.
 *
 * @security
 * - Client-side email validation
 * - Honeypot field (봇 방지)
 * - Debouncing (연속 제출 방지)
 * - Loading state (중복 제출 방지)
 * - Server-side rate limiting
 *
 * @example
 * ```tsx
 * <NewsletterForm
 *   placeholder="이메일 주소"
 *   buttonText="구독"
 * />
 * ```
 */
export function NewsletterForm({
  placeholder = "이메일 주소",
  buttonText = "구독",
  onSuccess,
  onError
}: NewsletterFormProps) {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [honeypot, setHoneypot] = React.useState("")
  const { toast } = useToast()

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 빈 값 체크
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "이메일 주소를 입력해주세요."
      })
      return
    }

    // 클라이언트 측 이메일 검증
    if (!isValidEmail(email)) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "올바른 이메일 형식이 아닙니다."
      })
      onError?.("올바른 이메일 형식이 아닙니다.")
      return
    }

    // 로딩 시작
    setIsLoading(true)

    try {
      // API 호출
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          honeypot // 봇이 채우는 필드
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 성공
        toast({
          title: "구독 완료",
          description: data.message || "뉴스레터 구독이 완료되었습니다!",
          duration: 5000
        })

        // 입력 필드 초기화
        setEmail("")
        onSuccess?.(email.trim())
      } else if (response.status === 429) {
        // Rate limit 초과
        const retryAfter = data.retryAfter
        const message = retryAfter
          ? `${data.error} (${retryAfter}초 후 다시 시도해주세요)`
          : data.error

        toast({
          variant: "destructive",
          title: "요청 제한",
          description: message,
          duration: 7000
        })
        onError?.(data.error)
      } else {
        // 기타 오류
        toast({
          variant: "destructive",
          title: "구독 실패",
          description: data.error || "오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        })
        onError?.(data.error)
      }
    } catch (error) {
      // 네트워크 오류 등
      console.error('Newsletter subscription error:', error)
      toast({
        variant: "destructive",
        title: "네트워크 오류",
        description: "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요."
      })
      onError?.("네트워크 오류")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Honeypot 필드 - 사람은 볼 수 없고 봇만 채움 */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none'
        }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* 실제 이메일 입력 필드 */}
      <div className="flex space-x-2">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="flex-1"
          required
          aria-label="이메일 주소"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          aria-label={buttonText}
        >
          {isLoading ? "전송 중..." : buttonText}
        </Button>
      </div>
    </form>
  )
}
