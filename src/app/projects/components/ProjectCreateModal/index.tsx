"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, X, Plus, Eye, Trash2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import { cn, formatCurrency } from '@/lib/utils'

import { uiText, getSettlementMethodText, getPaymentStatusText, getCurrencyText, getLoadingText, getProjectPageText, getWBSTemplateText, getWBSTemplateDescription } from '@/config/brand'
import type { ProjectTableRow, SettlementMethod, PaymentStatus, Currency, WBSTemplateType } from '@/lib/types/project-table.types'
import type { ProjectDocumentCategory, GeneratedDocument } from '@/lib/document-generator/templates'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import DocumentGeneratorModal from './DocumentGeneratorModal'
import DocumentDeleteDialog from '@/components/projects/DocumentDeleteDialog'
import { getWBSTemplateByType } from '@/lib/wbs/templates'

interface ProjectCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreate: (project: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'>) => void
}

interface ProjectCreateFormData {
  name: string
  client: string
  settlementMethod: SettlementMethod
  currency: Currency
  projectContent: string
  registrationDate: Date
  dueDate: Date
  paymentStatus: PaymentStatus
  totalAmount: number
  wbsTemplate: WBSTemplateType  // WBS 템플릿 선택
  generateDocuments: ProjectDocumentCategory[]
}

/**
 * 문자열에서 숫자만 추출하는 헬퍼 함수
 * @param value - 입력 문자열 (예: "₩50,000" 또는 "$1,234.56")
 * @returns 추출된 숫자 (예: 50000 또는 123456)
 */
const extractNumber = (value: string): number => {
  const numericOnly = value.replace(/[^\d]/g, '')
  return numericOnly === '' ? 0 : Number(numericOnly)
}

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreate }: ProjectCreateModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([])
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false)
  const [isTotalAmountFocused, setIsTotalAmountFocused] = useState(false)
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    documentId: string | null;
    documentTitle: string | null;
  }>({ open: false, documentId: null, documentTitle: null })
  const [previewDocument, setPreviewDocument] = useState<GeneratedDocument | null>(null)

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProjectCreateFormData>({
    defaultValues: {
      name: '',
      client: '',
      settlementMethod: 'not_set',
      currency: 'KRW',
      projectContent: '',
      registrationDate: new Date(),
      dueDate: new Date(Date.now() + 1000), // 등록일보다 1초 늦게 설정
      paymentStatus: 'not_started',
      totalAmount: 0,
      wbsTemplate: 'standard',  // 기본 템플릿: 표준 프로젝트
      generateDocuments: []
    }
  })

  const watchedRegistrationDate = watch('registrationDate')
  const watchedCurrency = watch('currency')
  const watchedSettlementMethod = watch('settlementMethod')

  /**
   * 정산방식에 따라 사용 가능한 수금상태 옵션 반환
   */
  const getAvailablePaymentStatuses = (settlementMethod: SettlementMethod): PaymentStatus[] => {
    switch (settlementMethod) {
      case 'not_set':
        // 미설정 → 미시작만
        return ['not_started']

      case 'advance_final':
        // 선금+잔금 → 미시작, 선금 완료, 잔금 완료
        return ['not_started', 'advance_completed', 'final_completed']

      case 'advance_interim_final':
        // 선금+중도금+잔금 → 미시작, 선금 완료, 중도금 완료, 잔금 완료
        return ['not_started', 'advance_completed', 'interim_completed', 'final_completed']

      case 'post_payment':
        // 후불 → 미시작, 잔금 완료
        return ['not_started', 'final_completed']

      default:
        return ['not_started']
    }
  }

  // 정산방식 변경 시 수금상태 자동 리셋
  React.useEffect(() => {
    const availableStatuses = getAvailablePaymentStatuses(watchedSettlementMethod)
    const currentPaymentStatus = watch('paymentStatus')

    // 현재 선택된 수금상태가 허용되지 않으면 '미시작'으로 리셋
    if (!availableStatuses.includes(currentPaymentStatus)) {
      setValue('paymentStatus', 'not_started')
    }
  }, [watchedSettlementMethod, watch, setValue])

  const handleClose = () => {
    reset()
    setGeneratedDocuments([])
    setShowDocumentGenerator(false)
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
      // 🎯 초기 상태: 항상 기획(planning)으로 시작
      // 이후 ProjectStatus 컴포넌트의 자동 상태 결정 로직이 적용됨:
      // - 계약서 없음 + 금액 없음 → 기획 유지
      // - 계약서 없음 + 금액 있음 → 검토
      // - 계약서 있음 + 금액 없음 → 기획
      // - 계약서 있음 + 금액 있음 → 진행중
      // - 보류/취소/완료는 수동 선택 시 자동 변경되지 않음
      const initialStatus: ProjectTableRow['status'] = 'planning';

      const newProject: Omit<ProjectTableRow, 'id' | 'no' | 'modifiedDate'> = {
        name: data.name,
        client: data.client,
        registrationDate: format(data.registrationDate, 'yyyy-MM-dd'),
        dueDate: format(data.dueDate, 'yyyy-MM-dd'),
        status: initialStatus,
        progress: 0, // 초기 진행률 0% (WBS 기반 자동 계산됨)
        settlementMethod: data.settlementMethod,
        paymentStatus: data.paymentStatus,
        paymentProgress: data.paymentStatus, // 표시용 필드
        projectContent: data.projectContent || undefined,
        totalAmount: data.totalAmount,
        hasContract: false,
        hasBilling: false,
        hasDocuments: generatedDocuments.length > 0,
        generateDocuments: [...new Set(generatedDocuments.map(doc => doc.category))],
        generatedDocuments: generatedDocuments.length > 0 ? [...generatedDocuments] : undefined,
        wbsTasks: getWBSTemplateByType(data.wbsTemplate) // 선택된 템플릿에 따라 기본 작업 목록 생성
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

  // 문서 생성 관련 핸들러
  const handleDocumentGenerated = (document: GeneratedDocument) => {
    setGeneratedDocuments(prev => [...prev, document])
  }

  const handleDocumentDeleteRequest = (document: GeneratedDocument) => {
    setDeleteDialogState({
      open: true,
      documentId: document.id,
      documentTitle: document.title
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialogState.documentId) {
      setGeneratedDocuments(prev => prev.filter(doc => doc.id !== deleteDialogState.documentId))
    }
    setDeleteDialogState({ open: false, documentId: null, documentTitle: null })
  }

  const handleDeleteCancel = () => {
    setDeleteDialogState({ open: false, documentId: null, documentTitle: null })
  }

  // 문서 미리보기 핸들러
  const handleDocumentPreview = (document: GeneratedDocument) => {
    setPreviewDocument(document)
  }

  // 현재 폼 데이터 가져오기 (문서 생성기에 전달용)
  const getCurrentProjectData = (): Partial<ProjectCreateFormData> => {
    const currentValues = watch()
    return {
      name: currentValues.name,
      client: currentValues.client,
      totalAmount: currentValues.totalAmount,
      dueDate: currentValues.dueDate,
      projectContent: currentValues.projectContent
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-primary w-[95vw] sm:w-full p-0">
        <DialogHeader className="flex-shrink-0 pb-4 pt-6 px-6">
          <DialogTitle className="text-xl font-semibold">
            {uiText.componentDemo.projectPage.createModal.title.ko}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {uiText.componentDemo.projectPage.createModal.subtitle.ko}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6">
          <form id="project-create-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-4">
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

            {/* 통화 단위 */}
            <div className="space-y-2">
              <Label htmlFor="currency">
                {uiText.componentDemo.projectPage.createModal.fields.currency.label.ko}
              </Label>
              <Controller
                name="currency"
                control={control}
                rules={{ required: "통화 단위를 선택하세요" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={uiText.componentDemo.projectPage.createModal.fields.currency.placeholder.ko} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">
                        {getCurrencyText.KRW('ko')}
                      </SelectItem>
                      <SelectItem value="USD">
                        {getCurrencyText.USD('ko')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>

            {/* 총 금액 */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">
                총 금액
              </Label>
              <Controller
                name="totalAmount"
                control={control}
                rules={{
                  required: "총 금액을 입력해주세요.",
                  min: { value: 0, message: "총 금액은 0원 이상이어야 합니다." }
                }}
                render={({ field }) => (
                  <Input
                    id="totalAmount"
                    type="text"
                    value={
                      isTotalAmountFocused
                        ? (field.value > 0 ? field.value.toString() : '')
                        : (field.value > 0 ? formatCurrency(field.value, watchedCurrency) : '')
                    }
                    onChange={(e) => {
                      const numericValue = extractNumber(e.target.value)
                      field.onChange(numericValue)
                    }}
                    onFocus={(e) => {
                      setIsTotalAmountFocused(true)
                      e.target.select()
                    }}
                    onBlur={() => setIsTotalAmountFocused(false)}
                    placeholder={
                      isTotalAmountFocused
                        ? "숫자만 입력하세요"
                        : `예: ${watchedCurrency === 'KRW' ? '₩50,000,000' : '$50,000.00'}`
                    }
                  />
                )}
              />
              {errors.totalAmount && (
                <p className="text-sm text-destructive">{errors.totalAmount.message}</p>
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
                render={({ field }) => {
                  const availableStatuses = getAvailablePaymentStatuses(watchedSettlementMethod)
                  return (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={uiText.componentDemo.projectPage.createModal.fields.paymentStatus.placeholder.ko} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.includes('not_started') && (
                          <SelectItem value="not_started">
                            {getPaymentStatusText.not_started('ko')}
                          </SelectItem>
                        )}
                        {availableStatuses.includes('advance_completed') && (
                          <SelectItem value="advance_completed">
                            {getPaymentStatusText.advance_completed('ko')}
                          </SelectItem>
                        )}
                        {availableStatuses.includes('interim_completed') && (
                          <SelectItem value="interim_completed">
                            {getPaymentStatusText.interim_completed('ko')}
                          </SelectItem>
                        )}
                        {availableStatuses.includes('final_completed') && (
                          <SelectItem value="final_completed">
                            {getPaymentStatusText.final_completed('ko')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )
                }}
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

            <div className="border-t my-4" />

            {/* WBS 템플릿 선택 */}
            <div className="space-y-2">
              <Label htmlFor="wbsTemplate">
                {getProjectPageText.wbsTemplateSelectLabel('ko')}
              </Label>
              <Controller
                name="wbsTemplate"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="wbsTemplate">
                      <SelectValue placeholder={getProjectPageText.wbsTemplateSelectPlaceholder('ko')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        <div className="flex flex-col">
                          <span className="font-medium">{getWBSTemplateText('standard', 'ko')}</span>
                          <span className="text-xs text-muted-foreground">{getWBSTemplateDescription('standard', 'ko')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="consulting">
                        <div className="flex flex-col">
                          <span className="font-medium">{getWBSTemplateText('consulting', 'ko')}</span>
                          <span className="text-xs text-muted-foreground">{getWBSTemplateDescription('consulting', 'ko')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="education">
                        <div className="flex flex-col">
                          <span className="font-medium">{getWBSTemplateText('education', 'ko')}</span>
                          <span className="text-xs text-muted-foreground">{getWBSTemplateDescription('education', 'ko')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex flex-col">
                          <span className="font-medium">{getWBSTemplateText('custom', 'ko')}</span>
                          <span className="text-xs text-muted-foreground">{getWBSTemplateDescription('custom', 'ko')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-sm text-muted-foreground">
                {getProjectPageText.wbsTemplateSelectHelp('ko')}
              </p>
            </div>

            <div className="border-t my-4" />

            {/* 문서 생성 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.label.ko}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.optional.ko}
                </p>
              </div>

              {/* 문서 생성기 버튼 */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDocumentGenerator(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.buttons.openGenerator.ko}
              </Button>

              {/* 생성된 문서 목록 */}
              {generatedDocuments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.title.ko}
                    </h4>
                    <Badge variant="secondary">
                      {generatedDocuments.length} {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.count.ko}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {generatedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories[doc.category].ko}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDocumentPreview(doc)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            title={uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.actions.viewTooltip.ko}
                            aria-label={uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.actions.ariaPreview.ko}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDocumentDeleteRequest(doc)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            title={uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.actions.deleteTooltip.ko}
                            aria-label={uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.actions.ariaDelete.ko}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t my-4" />

            {/* 현재 단계 정보 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  {uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.title.ko}
                </h4>
                <span className="text-xs font-medium text-primary">
                  {uiText.componentDemo.projectPage.createModal.fields.currentStage.defaultValue.ko}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.summary.ko}
              </p>

              <div className="space-y-1.5 border-t pt-2">
                <div className="text-xs text-muted-foreground">
                  • {uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.planning.ko}
                </div>
                <div className="text-xs text-muted-foreground">
                  • {uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.review.ko}
                </div>
                <div className="text-xs text-muted-foreground">
                  • {uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.inProgress.ko}
                </div>
                <div className="text-xs text-muted-foreground">
                  • {uiText.componentDemo.projectPage.createModal.fields.currentStage.explanation.rules.manual.ko}
                </div>
                <div className="text-xs text-muted-foreground">
                  • {uiText.componentDemo.projectPage.projectDetails.statusFlowExplanation.rules.autoComplete.ko}
                </div>
              </div>
            </div>
          </div>

          </form>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 pb-6 px-6 gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            {uiText.componentDemo.projectPage.createModal.buttons.cancel.ko}
          </Button>
          <Button type="submit" form="project-create-form" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                {getLoadingText.pleaseWait('ko')}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {uiText.componentDemo.projectPage.createModal.buttons.create.ko}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 문서 생성기 하위 모달 */}
      <DocumentGeneratorModal
        isOpen={showDocumentGenerator}
        onClose={() => setShowDocumentGenerator(false)}
        projectData={getCurrentProjectData()}
        generatedDocuments={generatedDocuments}
        onDocumentGenerated={handleDocumentGenerated}
        onDocumentDeleted={(documentId) => setGeneratedDocuments(prev => prev.filter(doc => doc.id !== documentId))}
      />

      {/* 문서 삭제 확인 모달 */}
      <DocumentDeleteDialog
        open={deleteDialogState.open}
        mode="single"
        targetName={deleteDialogState.documentTitle || undefined}
        onOpenChange={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {/* 문서 미리보기 모달 */}
      <Dialog
        open={!!previewDocument}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDocument(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl border-2 border-primary">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title ?? '문서 미리보기'}</DialogTitle>
            <DialogDescription>
              생성된 문서의 내용을 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {previewDocument?.content ?? '문서 내용이 없습니다.'}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}