"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { uiText, getSettlementMethodText, getPaymentStatusText } from '@/config/brand'
import type { ProjectTableRow, SettlementMethod, PaymentStatus } from '@/lib/types/project-table.types'

interface ProjectCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreate: (project: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'>) => void
}

interface ProjectCreateFormData {
  name: string
  client: string
  settlementMethod: SettlementMethod
  projectContent: string
  registrationDate: Date
  dueDate: Date
  paymentStatus: PaymentStatus
}

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreate }: ProjectCreateModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProjectCreateFormData>({
    defaultValues: {
      name: '',
      client: '',
      settlementMethod: 'not_set',
      projectContent: '',
      registrationDate: new Date(),
      dueDate: new Date(Date.now() + 1000), // 등록일보다 1초 늦게 설정
      paymentStatus: 'not_started'
    }
  })

  const watchedRegistrationDate = watch('registrationDate')

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: ProjectCreateFormData) => {
    console.log('🔥 ProjectCreateModal: onSubmit 호출됨!', data);

    // 중복 실행 방지 가드
    if (isLoading) {
      console.log('⚠️ 이미 처리 중입니다. 중복 실행을 방지합니다.');
      return;
    }

    setIsLoading(true)

    try {
      // 날짜 검증
      console.log('📅 날짜 검증:', {
        registrationDate: data.registrationDate,
        dueDate: data.dueDate,
        comparison: data.dueDate < data.registrationDate
      });

      if (data.dueDate < data.registrationDate) {
        console.log('❌ 날짜 검증 실패: 마감일이 등록일보다 빠름');
        toast({
          title: uiText.componentDemo.projectPage.createModal.error.title.ko,
          description: uiText.componentDemo.projectPage.createModal.validation.dueDateAfterRegistration.ko,
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      console.log('✅ 날짜 검증 통과');

      // 새 프로젝트 데이터 생성
      const newProject: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'> = {
        name: data.name,
        client: data.client,
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd'),
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
        status: 'planning', // 기본값: 기획단계
        progress: 0, // 초기 진행률 0%
        settlementMethod: data.settlementMethod,
        paymentStatus: data.paymentStatus,
        paymentProgress: data.paymentStatus, // 표시용 필드
        projectContent: data.projectContent || undefined,
        totalAmount: 0, // 기본값
        hasContract: false,
        hasBilling: false,
        hasDocuments: false
      }

      console.log('🔥 ProjectCreateModal: onProjectCreate 콜백 호출!', newProject);
      onProjectCreate(newProject)

      toast({
        title: uiText.componentDemo.projectPage.createModal.success.title.ko,
        description: uiText.componentDemo.projectPage.createModal.success.message.ko
      })

      handleClose()
    } catch (error) {
      console.error('프로젝트 생성 오류:', error)
      toast({
        title: uiText.componentDemo.projectPage.createModal.error.title.ko,
        description: uiText.componentDemo.projectPage.createModal.error.message.ko,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setCurrentDateTime = () => {
    const now = new Date()
    setValue('registrationDate', now)
    setValue('dueDate', new Date(now.getTime() + 1000)) // 등록일보다 1초 늦게 설정
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {uiText.componentDemo.projectPage.createModal.title.ko}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {uiText.componentDemo.projectPage.createModal.subtitle.ko}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* 프로젝트명 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {uiText.componentDemo.projectPage.createModal.fields.projectName.label.ko}
              </Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: uiText.componentDemo.projectPage.createModal.validation.projectNameRequired.ko }}
                render={({ field }) => (
                  <Input
                    id="name"
                    placeholder={uiText.componentDemo.projectPage.createModal.fields.projectName.placeholder.ko}
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* 고객사 */}
            <div className="space-y-2">
              <Label htmlFor="client">
                {uiText.componentDemo.projectPage.createModal.fields.client.label.ko}
              </Label>
              <Controller
                name="client"
                control={control}
                rules={{ required: uiText.componentDemo.projectPage.createModal.validation.clientRequired.ko }}
                render={({ field }) => (
                  <Input
                    id="client"
                    placeholder={uiText.componentDemo.projectPage.createModal.fields.client.placeholder.ko}
                    {...field}
                  />
                )}
              />
              {errors.client && (
                <p className="text-sm text-destructive">{errors.client.message}</p>
              )}
            </div>

            {/* 정산방식 */}
            <div className="space-y-2">
              <Label htmlFor="settlementMethod">
                {uiText.componentDemo.projectPage.createModal.fields.settlementMethod.label.ko}
              </Label>
              <Controller
                name="settlementMethod"
                control={control}
                rules={{
                  required: uiText.componentDemo.projectPage.createModal.validation.settlementMethodRequired.ko,
                  validate: (value) => value !== 'not_set' || uiText.componentDemo.projectPage.createModal.validation.settlementMethodRequired.ko
                }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={uiText.componentDemo.projectPage.createModal.fields.settlementMethod.placeholder.ko} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_set" disabled>
                        {getSettlementMethodText.not_set('ko')}
                      </SelectItem>
                      <SelectItem value="advance_final">
                        {getSettlementMethodText.advance_final('ko')}
                      </SelectItem>
                      <SelectItem value="advance_interim_final">
                        {getSettlementMethodText.advance_interim_final('ko')}
                      </SelectItem>
                      <SelectItem value="post_payment">
                        {getSettlementMethodText.post_payment('ko')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.settlementMethod && (
                <p className="text-sm text-destructive">{errors.settlementMethod.message}</p>
              )}
            </div>

            {/* 수금상태 */}
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">
                {uiText.componentDemo.projectPage.createModal.fields.paymentStatus.label.ko}
              </Label>
              <Controller
                name="paymentStatus"
                control={control}
                rules={{ required: uiText.componentDemo.projectPage.createModal.validation.paymentStatusRequired.ko }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={uiText.componentDemo.projectPage.createModal.fields.paymentStatus.placeholder.ko} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">
                        {getPaymentStatusText.not_started('ko')}
                      </SelectItem>
                      <SelectItem value="advance_completed">
                        {getPaymentStatusText.advance_completed('ko')}
                      </SelectItem>
                      <SelectItem value="interim_completed">
                        {getPaymentStatusText.interim_completed('ko')}
                      </SelectItem>
                      <SelectItem value="final_completed">
                        {getPaymentStatusText.final_completed('ko')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentStatus && (
                <p className="text-sm text-destructive">{errors.paymentStatus.message}</p>
              )}
            </div>

            <div className="border-t my-4" />

            {/* 등록일 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="registrationDate">
                  {uiText.componentDemo.projectPage.createModal.fields.registrationDate.label.ko}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setCurrentDateTime}
                >
                  {uiText.componentDemo.projectPage.createModal.fields.registrationDate.autoFill.ko}
                </Button>
              </div>
              <Controller
                name="registrationDate"
                control={control}
                rules={{ required: uiText.componentDemo.projectPage.createModal.validation.registrationDateRequired.ko }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'yyyy년 MM월 dd일', { locale: ko })
                        ) : (
                          uiText.componentDemo.projectPage.createModal.fields.registrationDate.placeholder.ko
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.registrationDate && (
                <p className="text-sm text-destructive">{errors.registrationDate.message}</p>
              )}
            </div>

            {/* 마감일 */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                {uiText.componentDemo.projectPage.createModal.fields.dueDate.label.ko}
              </Label>
              <Controller
                name="dueDate"
                control={control}
                rules={{
                  required: uiText.componentDemo.projectPage.createModal.validation.dueDateRequired.ko,
                }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'yyyy년 MM월 dd일', { locale: ko })
                        ) : (
                          uiText.componentDemo.projectPage.createModal.fields.dueDate.placeholder.ko
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ko}
                        disabled={(date) => date < watchedRegistrationDate}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="border-t my-4" />

            {/* 프로젝트 내용 */}
            <div className="space-y-2">
              <Label htmlFor="projectContent">
                {uiText.componentDemo.projectPage.createModal.fields.projectContent.label.ko}
              </Label>
              <Controller
                name="projectContent"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="projectContent"
                    placeholder={uiText.componentDemo.projectPage.createModal.fields.projectContent.placeholder.ko}
                    rows={3}
                    {...field}
                  />
                )}
              />
            </div>

            {/* 현재 단계 정보 */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {uiText.componentDemo.projectPage.createModal.fields.currentStage.label.ko}:
                </span>
                <span className="text-muted-foreground">
                  {uiText.componentDemo.projectPage.createModal.fields.currentStage.defaultValue.ko}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {uiText.componentDemo.projectPage.createModal.fields.currentStage.note.ko}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {uiText.componentDemo.projectPage.createModal.buttons.cancel.ko}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  {uiText.buttons.loading.ko}
                </>
              ) : (
                uiText.componentDemo.projectPage.createModal.buttons.create.ko
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}