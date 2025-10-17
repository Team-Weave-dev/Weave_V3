/**
 * 이메일 검증 유틸리티
 *
 * @description
 * 이메일 주소의 형식과 유효성을 검증합니다.
 * - RFC 5322 표준을 따르는 이메일 형식 검증
 * - 일반적인 이메일 패턴 확인
 * - 입력값 정규화 (공백 제거, 소문자 변환)
 */

/**
 * 이메일 형식 검증을 위한 정규식
 * - 일반적인 이메일 패턴을 검증합니다
 * - 100% RFC 5322 준수는 아니지만 대부분의 실용적인 케이스를 커버합니다
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * 이메일 주소를 정규화합니다
 *
 * @param email - 정규화할 이메일 주소
 * @returns 정규화된 이메일 주소 (소문자, 공백 제거)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * 이메일 형식이 유효한지 검증합니다
 *
 * @param email - 검증할 이메일 주소
 * @returns 유효한 이메일이면 true, 아니면 false
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const normalized = normalizeEmail(email)

  // 길이 체크
  if (normalized.length < 3 || normalized.length > 254) {
    return false
  }

  // @ 기호가 정확히 하나 있는지 체크
  const atCount = (normalized.match(/@/g) || []).length
  if (atCount !== 1) {
    return false
  }

  // 정규식 검증
  if (!EMAIL_REGEX.test(normalized)) {
    return false
  }

  // 로컬 파트와 도메인 파트 분리
  const [localPart, domainPart] = normalized.split('@')

  // 로컬 파트 검증 (@ 앞부분)
  if (!localPart || localPart.length > 64) {
    return false
  }

  // 도메인 파트 검증 (@ 뒷부분)
  if (!domainPart || domainPart.length > 253) {
    return false
  }

  // 도메인에 최소 하나의 점이 있어야 함
  if (!domainPart.includes('.')) {
    return false
  }

  // 도메인의 각 레이블 검증
  const domainLabels = domainPart.split('.')
  for (const label of domainLabels) {
    if (!label || label.length > 63) {
      return false
    }
    // 레이블은 하이픈으로 시작하거나 끝날 수 없음
    if (label.startsWith('-') || label.endsWith('-')) {
      return false
    }
  }

  return true
}

/**
 * 이메일 검증 결과 타입
 */
export interface EmailValidationResult {
  valid: boolean
  normalized?: string
  error?: string
}

/**
 * 이메일을 검증하고 상세한 결과를 반환합니다
 *
 * @param email - 검증할 이메일 주소
 * @returns 검증 결과 객체
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: '이메일 주소를 입력해주세요'
    }
  }

  const trimmed = email.trim()
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: '이메일 주소를 입력해주세요'
    }
  }

  if (trimmed.length > 254) {
    return {
      valid: false,
      error: '이메일 주소가 너무 깁니다'
    }
  }

  const normalized = normalizeEmail(email)

  if (!isValidEmail(normalized)) {
    return {
      valid: false,
      error: '올바른 이메일 형식이 아닙니다'
    }
  }

  return {
    valid: true,
    normalized
  }
}

/**
 * 일회용 이메일 도메인 목록
 * 필요시 확장 가능합니다
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org'
])

/**
 * 일회용 이메일인지 확인합니다
 *
 * @param email - 확인할 이메일 주소
 * @returns 일회용 이메일이면 true
 */
export function isDisposableEmail(email: string): boolean {
  const normalized = normalizeEmail(email)
  const domain = normalized.split('@')[1]
  return DISPOSABLE_EMAIL_DOMAINS.has(domain)
}
