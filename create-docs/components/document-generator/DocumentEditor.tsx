'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { DocumentTemplate } from '../ai-assistant/types';

// 마크다운 에디터를 동적으로 import (SSR 방지)
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface DocumentEditorProps {
  document: DocumentTemplate;
  onSave?: (content: string) => void;
  onClose?: () => void;
}

export default function DocumentEditor({ document, onSave, onClose }: DocumentEditorProps) {
  const [content, setContent] = useState(document.content);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Word 문서로 다운로드
  const downloadAsWord = async () => {
    // 브라우저 환경 체크
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('브라우저 환경이 아닙니다.');
      return;
    }
    
    setIsExporting(true);
    try {
      // html-docx-js-typescript 동적 import
      const { asBlob } = await import('html-docx-js-typescript');
      
      // 마크다운을 HTML로 변환
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; }
              h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              h2 { font-size: 20px; font-weight: bold; margin-top: 20px; margin-bottom: 15px; }
              h3 { font-size: 18px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; }
              p { margin-bottom: 10px; }
              ul, ol { margin-left: 30px; margin-bottom: 10px; }
              li { margin-bottom: 5px; }
              table { border-collapse: collapse; width: 100%; margin: 15px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${convertMarkdownToHtml(content)}
          </body>
        </html>
      `;

      // HTML을 Word 문서로 변환
      const docxBlob = await asBlob(htmlContent, {
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 }
      });

      // Buffer인 경우 Blob으로 변환
      let blob: Blob;
      if (docxBlob instanceof Blob) {
        blob = docxBlob;
      } else {
        // Buffer를 Uint8Array로 변환 후 Blob 생성
        const uint8Array = new Uint8Array(docxBlob as unknown as ArrayBuffer);
        blob = new Blob([uint8Array], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
      }

      // 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${document.title}_${new Date().getTime()}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Word 다운로드 오류:', error);
      alert('Word 문서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 텍스트 파일로 다운로드
  const downloadAsText = () => {
    // 브라우저 환경 체크
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('브라우저 환경이 아닙니다.');
      return;
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}_${new Date().getTime()}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // 마크다운을 HTML로 변환 (간단한 변환기)
  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // 제목 변환
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // 굵은 글씨
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // 기울임
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // 리스트
    html = html.replace(/^\* (.+)/gim, '<li>$1</li>');
    // s 플래그 대신 [\s\S] 사용하여 줄바꿈 포함 매칭
    html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>');
    
    // 숫자 리스트
    html = html.replace(/^\d+\. (.+)/gim, '<li>$1</li>');
    
    // 줄바꿈
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // 테이블 (간단한 처리)
    html = html.replace(/\|(.+)\|/g, (match, p1) => {
      const cells = p1.split('|').map((cell: string) => `<td>${cell.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    });
    
    return html;
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setIsSaved(true);
      // 2초 후 메시지 제거
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {document.metadata?.model}
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 에디터 영역 */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full" data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height="100%"
              preview="live"
              hideToolbar={false}
            />
          </div>
        </div>

        {/* 푸터 - 액션 버튼 */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              글자 수: {content.length} | 
              예상 토큰: ~{Math.ceil(content.length * 0.5)}
            </div>
            {isSaved && (
              <div className="text-sm text-green-600 font-medium animate-fade-in">
                ✓ 저장되었습니다
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadAsText}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              텍스트 다운로드
            </button>
            <button
              onClick={downloadAsWord}
              disabled={isExporting}
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              {isExporting ? '변환 중...' : 'Word 다운로드'}
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                저장 후 프리뷰
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}