'use client';

import React, { useState, useEffect } from 'react';
import { DocumentTemplate } from '../ai-assistant/types';
import DocumentEditor from './DocumentEditor';
import QuotePreview from './QuotePreview';
import { recordTokenUsage } from '@/lib/document-generator/token-tracker';
import { DocumentType, getTemplatesByType } from '@/lib/document-generator/quote-templates';
import Modal from '@/components/ui/Modal';
import ContractTemplateSelector from '@/components/contract-templates/ContractTemplateSelector';
import QuoteTemplateSelector from '@/components/quote-templates/QuoteTemplateSelector';

interface DocumentGeneratorProps {
  onDocumentGenerated?: (document: DocumentTemplate) => void;
  clientData?: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    businessNumber?: string;
  };
  projectData?: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    totalAmount?: number;
    paymentTerms?: string;
    deliverables?: string[];
  };
  className?: string;
}

export default function DocumentGenerator({ 
  onDocumentGenerated,
  clientData: providedClientData,
  projectData: providedProjectData,
  className = ''
}: DocumentGeneratorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DocumentTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('quote');
  const [templateId, setTemplateId] = useState<string>('standard-quote');
  const [availableTemplates, setAvailableTemplates] = useState<Array<{id: string, name: string}>>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentTemplate | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<Record<string, string>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('표준 템플릿');
  
  // 기본 클라이언트 데이터 (제공되지 않은 경우 샘플 데이터 사용)
  const clientData = providedClientData || {
    name: '김철수',
    company: '주식회사 테크스타트',
    email: 'kim@techstart.co.kr',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    businessNumber: '123-45-67890'
  };
  
  // 기본 프로젝트 데이터 (제공되지 않은 경우 샘플 데이터 사용)
  const projectData = providedProjectData || {
    title: '모바일 쇼핑몰 앱 개발',
    description: '온라인 쇼핑몰의 모바일 앱 버전 개발',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    duration: '3개월',
    totalAmount: 15000000,
    paymentTerms: '계약금 30%, 중도금 30%, 잔금 40%',
    deliverables: ['iOS 앱', 'Android 앱', '관리자 페이지', '사용자 매뉴얼']
  };

  // 문서 종류가 변경될 때 템플릿 목록 업데이트
  useEffect(() => {
    const templates = getTemplatesByType(documentType);
    const templateList = templates.map(t => ({ id: t.id, name: t.name }));
    setAvailableTemplates(templateList);
    
    // 첫 번째 템플릿을 기본값으로 설정
    if (templateList.length > 0) {
      setTemplateId(templateList[0].id);
    }
  }, [documentType]);

  // 템플릿 선택 처리
  const handleTemplateSelect = (templateId: string, templateName?: string) => {
    setTemplateId(templateId);
    if (templateName) {
      setSelectedTemplateName(templateName);
    }
    setShowTemplateModal(false);
  };

  // 문서 종류 변경 시 모달 표시
  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    if (type === 'contract' || type === 'quote') {
      setShowTemplateModal(true);
    }
  };

  const generateDocument = async () => {
    if (!prompt.trim()) {
      setError('프로젝트 정보를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskType: 'generate',
          documentType: documentType,
          templateId: templateId,
          prompt,
          clientData,
          projectData,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const document = data.data as DocumentTemplate;
        setResult(document);
        
        // 문서 ID 생성 및 저장
        const docId = `${document.type}_${Date.now()}`;
        setSavedDocuments(prev => ({
          ...prev,
          [docId]: document.content
        }));
        
        // 토큰 사용량 기록
        if (data.tokenUsage) {
          recordTokenUsage({
            inputTokens: data.tokenUsage.inputTokens,
            outputTokens: data.tokenUsage.outputTokens,
            model: data.tokenUsage.model,
            cost: data.tokenUsage.cost,
            timestamp: new Date(),
            taskType: 'generate'
          });
        }
        
        if (onDocumentGenerated) {
          onDocumentGenerated(document);
        }
      } else {
        setError(data.error || '문서 생성 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderGeneratedDocument = (doc: DocumentTemplate) => {
    // 저장된 문서 ID 찾기
    const docId = Object.keys(savedDocuments).find(id => id.startsWith(doc.type));
    const currentContent = docId ? savedDocuments[docId] : doc.content;
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h4 className="font-semibold text-gray-700">{doc.title}</h4>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm font-normal line-clamp-10">{currentContent}</pre>
        </div>
        <div className="pt-2 border-t flex gap-2">
          <button
            onClick={() => {
              const updatedDoc = { ...doc, content: currentContent };
              setEditingDocument(updatedDoc);
              setShowPreview(true);
            }}
            className="text-sm px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            HTML 프리뷰
          </button>
          <button
            onClick={() => {
              const updatedDoc = { ...doc, content: currentContent };
              setEditingDocument(updatedDoc);
              setShowEditor(true);
            }}
            className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            편집기 열기
          </button>
          <button
            onClick={() => {
              const blob = new Blob([currentContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${doc.type}_${new Date().getTime()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            텍스트 다운로드
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">문서 생성</h3>
              <p className="text-sm text-gray-600">
                문서 종류와 템플릿을 선택하고 프로젝트 정보를 입력하면 AI가 문서를 생성합니다.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Gemini 2.5 Flash Lite 모델로 템플릿 기반 생성
              </p>
            </div>

            {/* 문서 종류 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문서 종류
              </label>
              <select
                value={documentType}
                onChange={(e) => handleDocumentTypeChange(e.target.value as DocumentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quote">견적서</option>
                <option value="contract">계약서</option>
                <option value="invoice">청구서</option>
              </select>
            </div>

            {/* 템플릿 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                템플릿 선택
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedTemplateName}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                  onClick={() => setShowTemplateModal(true)}
                />
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  템플릿 선택
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {documentType === 'quote' ? '업종별 다양한 견적서 템플릿을 선택할 수 있습니다' : 
                 documentType === 'contract' ? '계약서 유형별 약식/상세 템플릿을 선택할 수 있습니다' :
                 '청구서 템플릿을 선택할 수 있습니다'}
              </p>
            </div>

            {/* 클라이언트 정보 표시 (읽기 전용) */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                클라이언트 정보
              </label>
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">회사:</span> {clientData.company}</p>
                <p><span className="font-medium">담당자:</span> {clientData.name}</p>
                <p><span className="font-medium">연락처:</span> {clientData.phone}</p>
                <p><span className="font-medium">이메일:</span> {clientData.email}</p>
              </div>
            </div>

            {/* 프로젝트 정보 표시 (읽기 전용) */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 정보
              </label>
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">프로젝트명:</span> {projectData.title}</p>
                <p><span className="font-medium">기간:</span> {projectData.startDate} ~ {projectData.endDate}</p>
                <p><span className="font-medium">예상 금액:</span> {projectData.totalAmount?.toLocaleString()}원</p>
                <p><span className="font-medium">결제 조건:</span> {projectData.paymentTerms}</p>
              </div>
            </div>

            {/* 추가 정보 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 정보 입력
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="세부 작업 내역, 특별 요구사항 등 추가 정보를 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              />
            </div>

            <button
              onClick={generateDocument}
              disabled={!prompt.trim() || isProcessing}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </span>
              ) : (
                '문서 생성하기'
              )}
            </button>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 결과 표시 */}
            {result && !error && renderGeneratedDocument(result)}
          </div>
        </div>
      </div>
      
      {/* 마크다운 에디터 모달 */}
      {showEditor && editingDocument && (
        <DocumentEditor
          document={editingDocument}
          onSave={(content) => {
            // 문서 ID 찾기 또는 생성
            const docId = Object.keys(savedDocuments).find(id => id.startsWith(editingDocument.type)) 
              || `${editingDocument.type}_${Date.now()}`;
            
            // 저장된 문서 업데이트
            setSavedDocuments(prev => ({
              ...prev,
              [docId]: content
            }));
            
            // 편집 중인 문서 업데이트
            setEditingDocument(prev => prev ? { ...prev, content } : null);
            
            // result 상태도 업데이트 (화면 반영)
            if (result) {
              setResult({ ...result, content });
            }
            
            // 편집기 닫고 프리뷰 열기
            setShowEditor(false);
            setShowPreview(true);
          }}
          onClose={() => {
            setShowEditor(false);
            setEditingDocument(null);
          }}
        />
      )}
      
      {/* HTML 프리뷰 모달 */}
      {showPreview && editingDocument && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-[90vh] overflow-auto">
            <QuotePreview
              content={editingDocument.content}
              title={editingDocument.title}
              onClose={() => {
                setShowPreview(false);
                setEditingDocument(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 템플릿 선택 모달 */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={
          documentType === 'quote' ? '견적서 템플릿 선택' : 
          documentType === 'contract' ? '계약서 템플릿 선택' :
          '청구서 템플릿 선택'
        }
        size="xl"
      >
        {documentType === 'quote' ? (
          <QuoteTemplateSelector
            onSelectTemplate={(templateId) => {
              // 템플릿 ID로 이름 찾기
              const templateName = availableTemplates.find(t => t.id === templateId)?.name || templateId;
              handleTemplateSelect(templateId, templateName);
            }}
          />
        ) : documentType === 'contract' ? (
          <ContractTemplateSelector
            onSelectContract={(contractId) => {
              // 계약서 ID로 이름 찾기
              const contractName = availableTemplates.find(t => t.id === contractId)?.name || contractId;
              handleTemplateSelect(contractId, contractName);
            }}
          />
        ) : (
          <div className="p-6">
            <p className="text-gray-600">청구서 템플릿 선택 기능은 준비 중입니다.</p>
          </div>
        )}
      </Modal>
    </>
  );
}