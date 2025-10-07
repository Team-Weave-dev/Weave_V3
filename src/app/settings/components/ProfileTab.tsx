"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { uiText } from '@/config/brand'
import type { UserProfile, BusinessType } from '@/lib/types/settings.types'

/**
 * 프로필 탭 컴포넌트
 * 사용자 정보 관리
 */
export default function ProfileTab() {
  const lang = 'ko' as const
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  // Mock 데이터 (실제로는 API에서 가져옴)
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: '홍길동',
    email: 'hong@weave.com',
    phone: '010-1234-5678',
    businessNumber: '123-45-67890',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '101동 1001호',
    businessType: 'freelancer',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  })

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

  const handleSave = () => {
    // TODO: API 호출로 저장
    setProfile(editedProfile)
    setIsEditing(false)
    toast({
      title: uiText.settings.profile.messages.saveSuccess[lang],
    })
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const updateField = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
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
            />
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
            />
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
            />
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
            />
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
