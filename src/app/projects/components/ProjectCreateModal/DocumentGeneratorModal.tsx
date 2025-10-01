"use client"

import React, { useState, useEffect } from 'react'
import { FileText, Eye, Edit, Trash2, Plus, Save, X } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

import { uiText } from '@/config/brand'
import {
  type ProjectDocumentCategory,
  type DocumentTemplate,
  type GeneratedDocument,
  type ProjectCreateFormData,
  getTemplatesByCategory,
  getAllTemplates,
  generateDocumentFromTemplate
} from '@/lib/document-generator/templates'

interface DocumentGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  projectData: Partial<ProjectCreateFormData>
  generatedDocuments: GeneratedDocument[]
  onDocumentGenerated: (document: GeneratedDocument) => void
  onDocumentDeleted: (documentId: string) => void
}

export default function DocumentGeneratorModal({
  isOpen,
  onClose,
  projectData,
  generatedDocuments,
  onDocumentGenerated,
  onDocumentDeleted
}: DocumentGeneratorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectDocumentCategory | ''>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [previewContent, setPreviewContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 편집 모드 관련 상태
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState<string>('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 선택된 카테고리의 템플릿 목록
  const availableTemplates = selectedCategory
    ? getTemplatesByCategory(selectedCategory)
    : []

  // 선택된 템플릿
  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId)

  // 카테고리 변경 시 템플릿과 미리보기 초기화
  const handleCategoryChange = (category: ProjectDocumentCategory | '') => {
    setSelectedCategory(category)
    setSelectedTemplateId('')
    setPreviewContent('')
  }

  // 미리보기 생성 함수
  const generatePreview = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId)
    if (!template) {
      setPreviewContent('')
      return
    }

    try {
      // 기본값을 포함한 프로젝트 데이터 생성
      const mockProjectData: ProjectCreateFormData = {
        name: projectData.name || '[프로젝트명]',
        client: projectData.client || '[클라이언트명]',
        totalAmount: projectData.totalAmount || 1000000,
        dueDate: projectData.dueDate || new Date(),
        projectContent: projectData.projectContent || '[프로젝트 내용을 입력하세요]'
      }

      const generated = generateDocumentFromTemplate(template, mockProjectData)
      setPreviewContent(generated.content)
    } catch (error) {
      console.error('미리보기 생성 오류:', error)
      setPreviewContent('미리보기를 생성할 수 없습니다. 템플릿을 확인해주세요.')
    }
  }

  // 템플릿 선택 시 미리보기 생성
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    generatePreview(templateId)
  }

  // 편집 모드 관련 함수들
  const enterEditMode = () => {
    setEditedContent(previewContent)
    setIsEditMode(true)
    setHasUnsavedChanges(false)
  }

  const exitEditMode = () => {
    setIsEditMode(false)
    setEditedContent('')
    setHasUnsavedChanges(false)
  }

  const saveChanges = () => {
    setPreviewContent(editedContent)
    setHasUnsavedChanges(false)
    setIsEditMode(false)
  }

  const cancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm(uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.confirmCancel.ko)
      if (!confirmed) return
    }
    exitEditMode()
  }

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent)
    setHasUnsavedChanges(newContent !== previewContent)
  }

  // 문서 생성
  const handleGenerate = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      let documentContent: string

      // 편집된 내용이 있으면 그것을 사용, 없으면 기본 생성
      if (isEditMode && editedContent) {
        documentContent = editedContent
      } else if (previewContent) {
        documentContent = previewContent
      } else {
        // 기본 템플릿 생성 로직
        const mockProjectData: ProjectCreateFormData = {
          name: projectData.name || '[프로젝트명]',
          client: projectData.client || '[클라이언트명]',
          totalAmount: projectData.totalAmount || 1000000,
          dueDate: projectData.dueDate || new Date(),
          projectContent: projectData.projectContent || '[프로젝트 내용]'
        }
        const generated = generateDocumentFromTemplate(selectedTemplate, mockProjectData)
        documentContent = generated.content
      }

      // 편집된 내용으로 문서 생성
      const generatedDocument: GeneratedDocument = {
        id: 'doc-' + Date.now(),
        title: selectedTemplate.name + (hasUnsavedChanges ? ' (편집됨)' : ''),
        content: documentContent,
        templateId: selectedTemplate.id,
        category: selectedTemplate.category,
        createdAt: new Date()
      }

      onDocumentGenerated(generatedDocument)

      // 생성 후 초기화
      setSelectedCategory('')
      setSelectedTemplateId('')
      setPreviewContent('')
      exitEditMode()
    } catch (error) {
      console.error('문서 생성 오류:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 문서 삭제
  const handleDeleteDocument = (documentId: string) => {
    onDocumentDeleted(documentId)
  }

  // 프로젝트 데이터 변경 시 미리보기 업데이트
  useEffect(() => {
    if (selectedTemplateId) {
      generatePreview(selectedTemplateId)
    }
  }, [projectData, selectedTemplateId])

  // 모달 닫기
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm(uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.confirmCancel.ko)
      if (!confirmed) return
    }

    setSelectedCategory('')
    setSelectedTemplateId('')
    setPreviewContent('')
    exitEditMode()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col border-2 border-primary w-[95vw] sm:w-full p-0">
        <DialogHeader className="flex-shrink-0 pb-3 pt-4 px-6">
          <DialogTitle className="text-xl font-semibold">
            {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.title.ko}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.subtitle.ko}
          </DialogDescription>
        </DialogHeader>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 px-6">
            {/* 왼쪽: 템플릿 선택 및 생성된 문서 목록 */}
            <div className="flex flex-col gap-4 min-h-0 overflow-y-auto p-2 flex-1">
              {/* 템플릿 선택 섹션 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">템플릿 선택</h3>

                {/* 카테고리 선택 */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.categorySelect.label.ko}
                  </Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.categorySelect.placeholder.ko} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">
                        {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories.contract.ko}
                      </SelectItem>
                      <SelectItem value="invoice">
                        {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories.invoice.ko}
                      </SelectItem>
                      <SelectItem value="estimate">
                        {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories.estimate.ko}
                      </SelectItem>
                      <SelectItem value="report">
                        {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories.report.ko}
                      </SelectItem>
                      <SelectItem value="others">
                        {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories.others.ko}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 템플릿 선택 */}
                {availableTemplates.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="template">
                      {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.templateSelect.label.ko}
                    </Label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.templateSelect.placeholder.ko} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>
                )}

                {/* 생성 버튼 */}
                {selectedTemplate && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !projectData.name || !projectData.client}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isGenerating ? '생성 중...' : uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.buttons.generate.ko}
                    </Button>

                    {/* 비활성화 이유 표시 */}
                    {!projectData.name || !projectData.client ? (
                      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border">
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                          <div>
                            {!projectData.name && !projectData.client
                              ? uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.validation.missingBoth.ko
                              : !projectData.name
                              ? uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.validation.missingProjectName.ko
                              : uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.validation.missingClient.ko
                            }
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <Separator className="flex-shrink-0" />

              {/* 생성된 문서 목록 */}
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.title.ko}
                  </h3>
                  <Badge variant="secondary">
                    {generatedDocuments.length} {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.count.ko}
                  </Badge>
                </div>

                <ScrollArea className="h-64">
                  {generatedDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>{uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatedList.empty.ko}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {generatedDocuments.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-3 bg-card">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.categories[doc.category].ko}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.createdAt.toLocaleString('ko-KR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewContent(doc.content)}
                                className="h-7 w-7 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* 오른쪽: 미리보기/편집 */}
            <div className="flex flex-col gap-4 min-h-0 flex-1">
              {/* 헤더와 토글 버튼 */}
              <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-medium">
                  {isEditMode
                    ? uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.editMode.ko
                    : uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.title.ko
                  }
                </h3>

                {previewContent && (
                  <div className="flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.cancelButton.ko}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveChanges}
                          disabled={!hasUnsavedChanges}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.saveButton.ko}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={enterEditMode}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.editButton.ko}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* 편집 상태 안내 */}
              {isEditMode && hasUnsavedChanges && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border flex-shrink-0">
                  {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.unsavedChanges.ko}
                </div>
              )}

              {isEditMode && (
                <div className="text-sm text-muted-foreground flex-shrink-0">
                  {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.editDescription.ko}
                </div>
              )}

              {/* 미리보기/편집 영역 */}
              <div className={`rounded-lg flex-1 min-h-0 bg-muted/50 ${isEditMode ? 'border-2 border-primary' : 'border'}`}>
                {previewContent ? (
                  isEditMode ? (
                    // 편집 모드: Textarea
                    <Textarea
                      value={editedContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="h-full w-full resize-none font-mono text-sm leading-relaxed bg-background border-0 focus:ring-0"
                      placeholder="문서 내용을 편집하세요..."
                    />
                  ) : (
                    // 미리보기 모드: 읽기 전용
                    <ScrollArea className="h-full p-4">
                      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                        {previewContent}
                      </pre>
                    </ScrollArea>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>{uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.preview.noTemplate.ko}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex-shrink-0 flex justify-end gap-2 pt-3 pb-4 px-6 bg-background border-t shadow-sm relative z-10">
          <Button type="button" variant="outline" onClick={handleClose} className="gap-2">
            <X className="h-4 w-4" />
            {uiText.componentDemo.projectPage.createModal.fields.documentGeneration.generatorModal.buttons.close.ko}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}