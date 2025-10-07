"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { uiText } from '@/config/brand'
import { validators } from '@/lib/utils'
import type { UserProfile, BusinessType } from '@/lib/types/settings.types'

/**
 * 프로필 탭 컴포넌트
 * 사용자 정보 관리
 */
export default function ProfileTab() {
  const lang = 'ko' as const
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({})

  // 빈 프로필로 시작 (실제로는 Storage에서 로드)
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: '',
    email: '',
    phone: '',
    businessNumber: '',
    address: '',
    addressDetail: '',
    businessType: 'freelancer',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  })

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

  /**
   * 입력값 검증
   */
  const validateProfile = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {}

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
      // 입력값 검증
      if (!validateProfile()) {
        toast({
          title: '입력 오류',
          description: '입력값을 확인해주세요',
          variant: 'destructive'
        })
        return
      }

      // TODO: API 호출로 저장
      // await settingsService.updateUserPreferences(userId, editedProfile)

      setProfile(editedProfile)
      setIsEditing(false)
      setErrors({})
      toast({
        title: uiText.settings.profile.messages.saveSuccess[lang],
      })
    } catch (error) {
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        variant: 'destructive'
      })
    }
  }, [editedProfile, lang, toast, validateProfile])

  const handleCancel = useCallback(() => {
    setEditedProfile(profile)
    setIsEditing(false)
    setErrors({})
  }, [profile])

  const updateField = useCallback((field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

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
      </CardContent>
    </Card>
  )
}
