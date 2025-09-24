'use client';

import React, { useEffect, useState } from 'react';

interface QuotePreviewProps {
  content: string;
  title?: string;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onClose?: () => void;
}

export default function QuotePreview({ content, title = '견적서', onPrint, onExportPDF, onClose }: QuotePreviewProps) {
  const [formattedContent, setFormattedContent] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    setFormattedContent(renderContent());
  }, [content]);
  
  // 마크다운을 HTML로 변환하고 스타일 적용
  const renderContent = () => {
    let html = content;
    
    // 테이블 처리를 먼저 수행 (더 정확한 변환을 위해)
    const tableLines: string[] = [];
    let inTable = false;
    let tableContent = '';
    
    const lines = html.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('|') && !line.includes('---')) {
        if (!inTable) {
          inTable = true;
          tableContent = '<table class="w-full mb-6 border-collapse">\n';
        }
        
        const cells = line.split('|').filter(cell => cell.trim()).map((cell, idx) => {
          const trimmed = cell.trim();
          // 첫 번째 행이거나 헤더 키워드가 있으면 th로 처리
          if (i === 0 || trimmed.includes('항목') || trimmed.includes('내용') || trimmed.includes('수량') || trimmed.includes('단가') || trimmed.includes('금액')) {
            return `<th class="px-4 py-3 bg-blue-50 font-semibold text-left border border-gray-300 text-gray-800">${trimmed}</th>`;
          }
          // 금액 셀 스타일링
          if (trimmed.match(/[\d,]+원/) || trimmed.match(/₩[\d,]+/)) {
            return `<td class="px-4 py-3 border border-gray-300 text-right font-medium">${trimmed}</td>`;
          }
          return `<td class="px-4 py-3 border border-gray-300">${trimmed}</td>`;
        }).join('');
        
        tableContent += `  <tr>${cells}</tr>\n`;
      } else if (line.includes('---') && line.includes('|')) {
        // 테이블 구분선 무시
        continue;
      } else {
        if (inTable) {
          inTable = false;
          tableContent += '</table>';
          processedLines.push(tableContent);
          tableContent = '';
        }
        processedLines.push(line);
      }
    }
    
    if (inTable) {
      tableContent += '</table>';
      processedLines.push(tableContent);
    }
    
    html = processedLines.join('\n');
    
    // 제목 변환 (계층별 스타일)
    html = html.replace(/^### (.*$)/gim, (match, p1) => {
      return `<h3 class="text-base font-semibold text-gray-700 mt-6 mb-2 pb-1 border-b border-gray-200">${p1}</h3>`;
    });
    
    html = html.replace(/^## (.*$)/gim, (match, p1) => {
      return `<h2 class="text-lg font-bold text-gray-800 mt-8 mb-4 pb-2 border-b-2 border-blue-500">${p1}</h2>`;
    });
    
    html = html.replace(/^# (.*$)/gim, (match, p1) => {
      return `<h1 class="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-4 border-blue-600">${p1}</h1>`;
    });
    
    // 굵은 글씨와 레이블 처리
    html = html.replace(/\*\*([^:]+?):\*\*/g, '<strong class="inline-block min-w-[120px] font-semibold text-gray-700">$1:</strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
    
    // 리스트 처리
    let listItems: string[] = [];
    const finalLines: string[] = [];
    
    html.split('\n').forEach(line => {
      if (line.match(/^\s*[-•]\s+(.+)/)) {
        const match = line.match(/^\s*[-•]\s+(.+)/);
        if (match) {
          listItems.push(`<li class="ml-4 mb-1 text-gray-700">${match[1]}</li>`);
        }
      } else {
        if (listItems.length > 0) {
          finalLines.push(`<ul class="list-disc list-inside mb-4 space-y-1">${listItems.join('')}</ul>`);
          listItems = [];
        }
        finalLines.push(line);
      }
    });
    
    if (listItems.length > 0) {
      finalLines.push(`<ul class="list-disc list-inside mb-4 space-y-1">${listItems.join('')}</ul>`);
    }
    
    html = finalLines.join('\n');
    
    // 일반 단락 처리
    html = html.split('\n').map(line => {
      if (line.trim() && !line.includes('<')) {
        // 정보 라인 (콜론이 있는 경우)
        if (line.includes(':') && !line.includes('http')) {
          const [label, ...value] = line.split(':');
          if (value.length > 0) {
            return `<p class="mb-2 flex items-start"><span class="inline-block min-w-[120px] font-medium text-gray-700">${label}:</span><span class="text-gray-800">${value.join(':')}</span></p>`;
          }
        }
        return `<p class="mb-2 text-gray-700">${line}</p>`;
      }
      return line;
    }).join('\n');
    
    // 금액 강조
    html = html.replace(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*원/g, '<span class="font-bold text-blue-600">$1원</span>');
    html = html.replace(/₩\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g, '<span class="font-bold text-blue-600">₩$1</span>');
    
    // 날짜 강조
    html = html.replace(/(\d{4}[-./]\d{1,2}[-./]\d{1,2})/g, '<span class="font-medium text-gray-800">$1</span>');
    
    // 구분선
    html = html.replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-200">');
    
    return html;
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  
  const handleExportPDF = async () => {
    if (onExportPDF) {
      onExportPDF();
      return;
    }
    
    setIsExporting(true);
    try {
      // 동적 import로 jsPDF와 html2canvas 로드
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      // 문서 요소 가져오기
      const element = document.querySelector('.quote-document') as HTMLElement;
      if (!element) {
        throw new Error('문서 요소를 찾을 수 없습니다.');
      }
      
      // 복제된 요소 생성 (원본 요소를 수정하지 않기 위해)
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // lab() 색상을 처리하기 위한 함수 (html2canvas 호환성)
      const convertLabColors = (el: HTMLElement) => {
        // 먼저 엘리먼트 자체 처리
        const processElement = (htmlElem: HTMLElement) => {
          try {
            const computedStyle = window.getComputedStyle(htmlElem);
            
            // CSS 속성별로 lab() 색상 확인 및 변환
            const properties = [
              'backgroundColor',
              'color', 
              'borderColor',
              'borderTopColor',
              'borderRightColor', 
              'borderBottomColor',
              'borderLeftColor',
              'outlineColor',
              'textDecorationColor',
              'fill',
              'stroke'
            ];
            
            properties.forEach(prop => {
              const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
              if (value && (value.includes('lab') || value.includes('lch') || value.includes('oklch'))) {
                // Tailwind 클래스 기반 색상 매핑
                const className = htmlElem.className || '';
                let newColor = '#000000';
                
                if (prop.includes('background')) {
                  if (className.includes('blue-50')) newColor = '#eff6ff';
                  else if (className.includes('blue-100')) newColor = '#dbeafe';
                  else if (className.includes('blue-500')) newColor = '#3b82f6';
                  else if (className.includes('blue-600')) newColor = '#2563eb';
                  else if (className.includes('gray-50')) newColor = '#f9fafb';
                  else if (className.includes('gray-100')) newColor = '#f3f4f6';
                  else if (className.includes('gray-200')) newColor = '#e5e7eb';
                  else newColor = '#ffffff';
                } else if (prop.includes('color') || prop === 'fill' || prop === 'stroke') {
                  if (className.includes('blue-600')) newColor = '#2563eb';
                  else if (className.includes('blue-700')) newColor = '#1d4ed8';
                  else if (className.includes('blue-800')) newColor = '#1e40af';
                  else if (className.includes('gray-600')) newColor = '#4b5563';
                  else if (className.includes('gray-700')) newColor = '#374151';
                  else if (className.includes('gray-800')) newColor = '#1f2937';
                  else if (className.includes('gray-900')) newColor = '#111827';
                  else if (className.includes('white')) newColor = '#ffffff';
                  else newColor = '#000000';
                } else if (prop.includes('border')) {
                  if (className.includes('blue-')) newColor = '#3b82f6';
                  else if (className.includes('gray-200')) newColor = '#e5e7eb';
                  else if (className.includes('gray-300')) newColor = '#d1d5db';
                  else newColor = '#d1d5db';
                }
                
                // 인라인 스타일로 설정
                htmlElem.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), newColor, 'important');
              }
            });
            
            // background gradient에서 lab() 제거
            const bgImage = computedStyle.backgroundImage;
            if (bgImage && (bgImage.includes('lab') || bgImage.includes('lch') || bgImage.includes('oklch'))) {
              htmlElem.style.backgroundImage = 'none';
              htmlElem.style.backgroundColor = '#ffffff';
            }
          } catch (e) {
            // 에러 무시하고 계속 진행
            console.warn('Color conversion error:', e);
          }
        };
        
        // 루트 엘리먼트 처리
        processElement(el);
        
        // 모든 자식 엘리먼트 처리
        const allElements = el.querySelectorAll('*');
        allElements.forEach((elem) => {
          processElement(elem as HTMLElement);
        });
      };
      
      // 임시로 DOM에 추가 (계산된 스타일을 얻기 위해)
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);
      
      // lab() 색상 변환
      convertLabColors(clonedElement);
      
      // HTML을 캔버스로 변환
      const canvas = await html2canvas(clonedElement, {
        scale: 2, // 고품질을 위해 2배 스케일
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // 임시 요소 제거
      document.body.removeChild(clonedElement);
      
      // PDF 생성
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 크기 계산
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 여러 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // PDF 다운로드
      pdf.save(`${title}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white h-full">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 20mm;
          }
          
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          html {
            height: auto;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-size: 11pt;
            height: auto;
          }
          
          .no-print {
            display: none !important;
          }
          
          .quote-document {
            width: auto !important;
            min-height: auto !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            position: relative !important;
          }
          
          /* 테이블 인쇄 최적화 */
          table {
            width: 100%;
            page-break-inside: avoid;
            border-collapse: collapse;
          }
          
          thead {
            display: table-header-group;
          }
          
          tr {
            page-break-inside: avoid;
          }
          
          td, th {
            padding: 6px 8px;
            font-size: 10pt;
          }
          
          /* 제목 페이지 분리 방지 */
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          h1 {
            font-size: 16pt;
            margin: 8pt 0;
          }
          
          h2 {
            font-size: 12pt;
            margin: 6pt 0;
          }
          
          h3 {
            font-size: 11pt;
            margin: 4pt 0;
          }
          
          p, li {
            font-size: 9pt;
            line-height: 1.3;
            margin: 2pt 0;
          }
          
          /* 서명란 페이지 분리 방지 */
          .signature-area {
            page-break-inside: avoid;
            margin-top: 15pt;
          }
          
          /* 페이지 푸터 위치 고정 */
          .page-footer {
            display: none !important;
          }
          
          /* 배경색 및 테두리 유지 */
          .bg-blue-50, .bg-gray-50 {
            background-color: #f0f4f8 !important;
          }
          
          .border, .border-gray-300 {
            border-color: #d1d5db !important;
          }
        }
        
        .quote-document {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 25mm;
          margin: 0 auto 20px;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        @media screen and (max-width: 210mm) {
          .quote-document {
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
      
      {/* 액션 버튼 (인쇄 시 숨김) */}
      <div className="no-print sticky top-0 z-10 bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">견적서 미리보기</h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            인쇄
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PDF 생성 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF 저장
              </>
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </button>
          )}
        </div>
      </div>
      
      {/* A4 문서 영역 */}
      <div className="quote-document" id="quote-content">
        {/* 회사 로고/헤더 영역 */}
        <div className="mb-8 pb-4 border-b-2 border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="w-32 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-2 flex items-center justify-center">
                <span className="text-white font-bold text-xl">WEAVE</span>
              </div>
              <p className="text-sm text-gray-600">프리랜서를 위한 통합 비즈니스 플랫폼</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{title}</h1>
              <p className="text-sm text-gray-500">문서번호: WV-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</p>
              <p className="text-sm text-gray-500">발행일: {new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </div>
        
        {/* 문서 내용 */}
        <div 
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
        
        {/* 서명 영역 */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200 signature-area print:mt-8 print:pt-4">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 print:text-xs">공급자</p>
              <div className="h-16 border-b-2 border-gray-300 mb-2 print:h-12"></div>
              <p className="text-sm text-gray-600 print:text-xs">(서명/날인)</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2 print:text-xs">수신자</p>
              <div className="h-16 border-b-2 border-gray-300 mb-2 print:h-12"></div>
              <p className="text-sm text-gray-600 print:text-xs">(서명/날인)</p>
            </div>
          </div>
        </div>
        
        {/* 페이지 푸터 */}
        <div className="page-footer mt-auto pt-8 text-center">
          <p className="text-xs text-gray-400">Weave - Professional Business Platform for Freelancers</p>
          <p className="text-xs text-gray-400 mt-1">www.weave.co.kr | support@weave.co.kr | 02-1234-5678</p>
        </div>
      </div>
    </div>
  );
}