import { z } from 'zod'

// 회원가입 스키마
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.')
    .max(255, '이메일은 255자를 초과할 수 없습니다.')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
    .max(128, '비밀번호는 128자를 초과할 수 없습니다.'),

  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 50자를 초과할 수 없습니다.')
    .regex(/^[a-zA-Z가-힣\s]+$/, '이름에 특수문자를 사용할 수 없습니다.')
    .trim()
    .transform((name) => name.replace(/\s+/g, ' ')), // 중복 공백 제거
})

// 로그인 스키마
export const signinSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.')
    .toLowerCase()
    .trim(),

  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})
