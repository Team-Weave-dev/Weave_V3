"use client"

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/useSettings'
import { settingsService, userService, storage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import { uiText } from '@/config/brand'
import { validators } from '@/lib/utils'
import type { User, BusinessType } from '@/lib/storage/types/entities/user'
import type { Language, TimeFormat } from '@/lib/storage/types/entities/settings'

/**
 * 프로필 탭 컴포넌트
 * 사용자 정보 및 환경설정 관리
 */
export default function ProfileTab() {
  const lang = 'ko' as const
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof Pick<User, 'name' | 'email' | 'phone' | 'businessNumber'>, string>>>({})

  // Supabase 인증된 사용자 ID
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 인증된 사용자 ID 가져오기
  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Failed to get user:', error)
          toast({
            title: '인증 오류',
            description: '사용자 정보를 가져올 수 없습니다',
            variant: 'destructive'
          })
          return
        }

        if (user) {
          setUserId(user.id)
        } else {
          toast({
            title: '인증 필요',
            description: '로그인이 필요합니다',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setAuthLoading(false)
      }
    }

    getAuthUser()
  }, [toast])

  // Settings 훅 (환경설정) - userId가 있을 때만 호출
  const {
    settings,
    loading: settingsLoading,
    refresh,
  } = useSettings(userId || '')

  // 빈 프로필로 시작
  const [profile, setProfile] = useState<User>({
    id: '',
    name: '',
    email: '',
    phone: '',
    businessNumber: '',
    address: '',
    addressDetail: '',
    businessType: 'freelancer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  const [editedProfile, setEditedProfile] = useState<User>(profile)
  const [profileLoading, setProfileLoading] = useState(true)

  // 환경설정 로컬 상태
  const [editedPreferences, setEditedPreferences] = useState({
    language: settings?.preferences.language || 'ko' as Language,
    timezone: settings?.preferences.timezone || 'Asia/Seoul',
    timeFormat: settings?.preferences.timeFormat || '24' as TimeFormat,
    currency: settings?.preferences.currency || 'KRW',
  })

  // Storage에서 프로필 로드 (userId 있을 때만)
  useEffect(() => {
    if (!userId) return

    const loadProfile = async () => {
      try {
        setProfileLoading(true)

        // UserService로 프로필 조회
        const storedProfile = await userService.getById(userId)

        if (storedProfile) {
          setProfile(storedProfile)
          setEditedProfile(storedProfile)
        } else {
          // Storage에 없으면 userId로 초기화
          const newProfile: User = {
            id: userId,
            name: '',
            email: '',
            phone: '',
            businessNumber: '',
            address: '',
            addressDetail: '',
            businessType: 'freelancer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setProfile(newProfile)
          setEditedProfile(newProfile)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast({
          title: '프로필 로드 실패',
          description: '프로필 정보를 불러올 수 없습니다',
          variant: 'destructive'
        })
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [userId, toast])

  // Settings 로드 완료 시 editedPreferences 업데이트 (편집 중이 아닐 때만)
  useEffect(() => {
    if (settings && !isEditing) {
      setEditedPreferences({
        language: settings.preferences.language,
        timezone: settings.preferences.timezone,
        timeFormat: settings.preferences.timeFormat || '24',
        currency: settings.preferences.currency || 'KRW',
      })
    }
  }, [settings, isEditing])

  /**
   * 입력값 검증
   */
  const validateProfile = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof Pick<User, 'name' | 'email' | 'phone' | 'businessNumber'>, string>> = {}

    // 이름 검증
    if (!validators.required(editedProfile.name)) {
      newErrors.name = '이름을 입력해주세요'
    }

    // 이메일 검증
    if (!validators.required(editedProfile.email)) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!validators.email(editedProfile.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요'
    }

    // 전화번호 검증
    if (editedProfile.phone && !validators.phone(editedProfile.phone)) {
      newErrors.phone = '유효한 전화번호를 입력해주세요 (예: 010-1234-5678)'
    }

    // 사업자등록번호 검증
    if (editedProfile.businessNumber && !validators.businessNumber(editedProfile.businessNumber)) {
      newErrors.businessNumber = '유효한 사업자등록번호를 입력해주세요 (예: 123-45-67890)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [editedProfile])

  const handleSave = useCallback(async () => {
    try {
      // userId 체크
      if (!userId) {
        toast({
          title: '인증 오류',
          description: '사용자 인증이 필요합니다',
          variant: 'destructive'
        })
        return
      }

      // 입력값 검증
      if (!validateProfile()) {
        toast({
          title: '입력 오류',
          description: '입력값을 확인해주세요',
          variant: 'destructive'
        })
        return
      }

      // 트랜잭션으로 프로필 + 설정을 원자적으로 저장
      await storage.transaction(async () => {
        // 1. 프로필 업데이트 또는 생성
        const existingUser = await userService.getById(userId)

        if (existingUser) {
          // 기존 사용자 업데이트
          await userService.updateProfile(userId, {
            name: editedProfile.name,
            email: editedProfile.email,
            phone: editedProfile.phone,
            businessNumber: editedProfile.businessNumber,
            address: editedProfile.address,
            addressDetail: editedProfile.addressDetail,
            businessType: editedProfile.businessType,
          })
        } else {
          // 새 사용자 생성
          await userService.create({
            name: editedProfile.name,
            email: editedProfile.email,
            phone: editedProfile.phone,
            businessNumber: editedProfile.businessNumber,
            address: editedProfile.address,
            addressDetail: editedProfile.addressDetail,
            businessType: editedProfile.businessType,
          })
        }

        // 2. 환경설정 저장
        await settingsService.update(userId, {
          preferences: {
            language: editedPreferences.language,
            timezone: editedPreferences.timezone,
            timeFormat: editedPreferences.timeFormat,
            currency: editedPreferences.currency,
          }
        })
      })

      // 3. 성공 후 상태 업데이트
      const updatedUser = await userService.getById(userId)
      if (updatedUser) {
        setProfile(updatedUser)
      }

      // 4. Settings 훅 상태 새로고침
      await refresh()

      setIsEditing(false)
      setErrors({})
      toast({
        title: uiText.settings.profile.messages.saveSuccess[lang],
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        variant: 'destructive'
      })
    }
  }, [editedProfile, editedPreferences, lang, toast, validateProfile, refresh, userId])

  const handleCancel = useCallback(() => {
    setEditedProfile(profile)
    if (settings) {
      setEditedPreferences({
        language: settings.preferences.language,
        timezone: settings.preferences.timezone,
        timeFormat: settings.preferences.timeFormat || '24',
        currency: settings.preferences.currency || 'KRW',
      })
    }
    setIsEditing(false)
    setErrors({})
  }, [profile, settings])

  const updateField = useCallback((field: keyof User, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
    // 해당 필드의 에러 제거
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof typeof errors]
        return newErrors
      })
    }
  }, [errors])

  // 로딩 중일 때
  if (authLoading || !userId || profileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{uiText.settings.profile.title[lang]}</CardTitle>
          <CardDescription>
            {authLoading ? '사용자 정보를 불러오는 중...' :
             !userId ? '사용자 인증이 필요합니다' :
             '프로필 정보를 불러오는 중...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <CardTitle>{uiText.settings.profile.title[lang]}</CardTitle>
            <CardDescription>{uiText.settings.profile.description[lang]}</CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                {uiText.settings.profile.actions.edit[lang]}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  {uiText.settings.profile.actions.cancel[lang]}
                </Button>
                <Button onClick={handleSave}>
                  {uiText.settings.profile.actions.save[lang]}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">{uiText.settings.profile.fields.name[lang]}</Label>
            <Input
              id="name"
              value={isEditing ? editedProfile.name : profile.name}
              onChange={(e) => updateField('name', e.target.value)}
              disabled={!isEditing}
              placeholder={uiText.settings.profile.placeholders.name[lang]}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">{uiText.settings.profile.fields.email[lang]}</Label>
            <Input
              id="email"
              type="email"
              value={isEditing ? editedProfile.email : profile.email}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={!isEditing}
              placeholder={uiText.settings.profile.placeholders.email[lang]}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div className="space-y-2">
            <Label htmlFor="phone">{uiText.settings.profile.fields.phone[lang]}</Label>
            <Input
              id="phone"
              value={isEditing ? editedProfile.phone : profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              disabled={!isEditing}
              placeholder={uiText.settings.profile.placeholders.phone[lang]}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* 사업자등록번호 */}
          <div className="space-y-2">
            <Label htmlFor="businessNumber">{uiText.settings.profile.fields.businessNumber[lang]}</Label>
            <Input
              id="businessNumber"
              value={isEditing ? editedProfile.businessNumber : profile.businessNumber}
              onChange={(e) => updateField('businessNumber', e.target.value)}
              disabled={!isEditing}
              placeholder={uiText.settings.profile.placeholders.businessNumber[lang]}
              className={errors.businessNumber ? 'border-destructive' : ''}
            />
            {errors.businessNumber && (
              <p className="text-sm text-destructive">{errors.businessNumber}</p>
            )}
          </div>
        </div>

        {/* 사업자 유형 */}
        <div className="space-y-2">
          <Label htmlFor="businessType">{uiText.settings.profile.fields.businessType[lang]}</Label>
          <Select
            value={isEditing ? editedProfile.businessType : profile.businessType}
            onValueChange={(value: BusinessType) => updateField('businessType', value)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freelancer">{uiText.settings.profile.businessTypes.freelancer[lang]}</SelectItem>
              <SelectItem value="individual">{uiText.settings.profile.businessTypes.individual[lang]}</SelectItem>
              <SelectItem value="corporation">{uiText.settings.profile.businessTypes.corporation[lang]}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 주소 */}
        <div className="space-y-2">
          <Label htmlFor="address">{uiText.settings.profile.fields.address[lang]}</Label>
          <Input
            id="address"
            value={isEditing ? editedProfile.address : profile.address}
            onChange={(e) => updateField('address', e.target.value)}
            disabled={!isEditing}
            placeholder={uiText.settings.profile.placeholders.address[lang]}
          />
        </div>

        {/* 상세주소 */}
        <div className="space-y-2">
          <Label htmlFor="addressDetail">{uiText.settings.profile.fields.addressDetail[lang]}</Label>
          <Input
            id="addressDetail"
            value={isEditing ? editedProfile.addressDetail : profile.addressDetail}
            onChange={(e) => updateField('addressDetail', e.target.value)}
            disabled={!isEditing}
            placeholder={uiText.settings.profile.placeholders.addressDetail[lang]}
          />
        </div>

        <Separator className="my-6" />

        {/* 환경설정 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">환경설정</h3>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 언어 */}
            <div className="space-y-2">
              <Label htmlFor="language">언어</Label>
              <Select
                value={isEditing ? editedPreferences.language : settings?.preferences.language || 'ko'}
                onValueChange={(value: Language) => setEditedPreferences(prev => ({ ...prev, language: value }))}
                disabled={!isEditing || settingsLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 시간 형식 */}
            <div className="space-y-2">
              <Label htmlFor="timeFormat">시간 형식</Label>
              <Select
                value={isEditing ? editedPreferences.timeFormat : settings?.preferences.timeFormat || '24'}
                onValueChange={(value: TimeFormat) => setEditedPreferences(prev => ({ ...prev, timeFormat: value }))}
                disabled={!isEditing || settingsLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12시간 (AM/PM)</SelectItem>
                  <SelectItem value="24">24시간</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 타임존 */}
            <div className="space-y-2">
              <Label htmlFor="timezone">타임존</Label>
              <Input
                id="timezone"
                value={isEditing ? editedPreferences.timezone : settings?.preferences.timezone || 'Asia/Seoul'}
                onChange={(e) => setEditedPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                disabled={!isEditing || settingsLoading}
                placeholder="Asia/Seoul"
              />
            </div>

            {/* 통화 */}
            <div className="space-y-2">
              <Label htmlFor="currency">통화</Label>
              <Select
                value={isEditing ? editedPreferences.currency : settings?.preferences.currency || 'KRW'}
                onValueChange={(value) => setEditedPreferences(prev => ({ ...prev, currency: value }))}
                disabled={!isEditing || settingsLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">₩ KRW (원)</SelectItem>
                  <SelectItem value="USD">$ USD (달러)</SelectItem>
                  <SelectItem value="EUR">€ EUR (유로)</SelectItem>
                  <SelectItem value="JPY">¥ JPY (엔)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
