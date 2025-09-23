'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import { getProjectPageText } from '@/config/brand';

// 페이지네이션 Props
export interface PaginationProps {
  /** 현재 페이지 (1부터 시작) */
  currentPage: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 첫 페이지로 이동 핸들러 */
  onFirstPage?: () => void;
  /** 이전 페이지 핸들러 */
  onPreviousPage?: () => void;
  /** 다음 페이지 핸들러 */
  onNextPage?: () => void;
  /** 마지막 페이지로 이동 핸들러 */
  onLastPage?: () => void;
  /** 이전 페이지 가능 여부 */
  canGoToPreviousPage?: boolean;
  /** 다음 페이지 가능 여부 */
  canGoToNextPage?: boolean;
  /** 페이지당 항목 수 */
  itemsPerPage?: number;
  /** 총 항목 수 */
  totalItems?: number;
  /** 표시할 페이지 번호 개수 */
  visiblePages?: number;
  /** 크기 */
  size?: 'sm' | 'default' | 'lg';
  /** 클래스명 */
  className?: string;
  /** 간단한 모드 (이전/다음만) */
  simple?: boolean;
  /** 정보 텍스트 표시 */
  showInfo?: boolean;
  /** 접근성 라벨 */
  ariaLabel?: string;
  /** 언어 설정 */
  language?: 'ko' | 'en';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  canGoToPreviousPage,
  canGoToNextPage,
  itemsPerPage = 10,
  totalItems,
  visiblePages = 5,
  size = 'default',
  className,
  simple = false,
  showInfo = true,
  ariaLabel,
  language = 'ko',
}) => {
  // 엣지 케이스 처리
  if (totalPages <= 0) return null;
  if (currentPage < 1 || currentPage > totalPages) {
    console.warn(`Invalid currentPage: ${currentPage}. Should be between 1 and ${totalPages}`);
    return null;
  }

  // 페이지 번호 생성 로직
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= visiblePages) {
      // 총 페이지가 적으면 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 복잡한 페이지네이션 로직
      const halfVisible = Math.floor(visiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // 시작/끝 조정
      if (currentPage <= halfVisible) {
        endPage = Math.min(totalPages, visiblePages);
      }
      if (currentPage > totalPages - halfVisible) {
        startPage = Math.max(1, totalPages - visiblePages + 1);
      }

      // 첫 페이지
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis');
        }
      }

      // 중간 페이지들
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // 마지막 페이지
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // 크기별 스타일
  const sizeClasses = {
    sm: 'h-8 min-w-8 px-2 text-sm',
    default: 'h-10 min-w-10 px-3 text-sm',
    lg: 'h-12 min-w-12 px-4 text-base',
  };

  // 기본값 설정
  const effectiveCanGoToPreviousPage = canGoToPreviousPage ?? (currentPage > 1);
  const effectiveCanGoToNextPage = canGoToNextPage ?? (currentPage < totalPages);

  // 페이지 변경 핸들러들
  const goToFirstPage = () => onFirstPage ? onFirstPage() : onPageChange(1);
  const goToPreviousPage = () => onPreviousPage ? onPreviousPage() : onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onNextPage ? onNextPage() : onPageChange(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => onLastPage ? onLastPage() : onPageChange(totalPages);

  // 키보드 지원
  const handleKeyDown = (event: React.KeyboardEvent, page: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPageChange(page);
    }
  };

  // 정보 텍스트 생성
  const getInfoText = () => {
    if (!totalItems) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return `${startItem.toLocaleString()}-${endItem.toLocaleString()} / ${totalItems.toLocaleString()}개`;
  };

  // 간단한 모드
  if (simple) {
    return (
      <nav
        className={cn("flex items-center justify-between", className)}
        aria-label={ariaLabel || `${getProjectPageText.paginationPageOf(language)} ${getProjectPageText.paginationOf(language)}`}
        role="navigation"
      >
        {showInfo && (
          <div className="text-sm text-muted-foreground">
            {getProjectPageText.paginationPageOf(language)} {currentPage} {getProjectPageText.paginationOf(language)} {totalPages}
            {totalItems && ` (${getProjectPageText.totalItems(language)} ${totalItems.toLocaleString()}개)`}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size={size}
            onClick={goToPreviousPage}
            disabled={!effectiveCanGoToPreviousPage}
            aria-label={getProjectPageText.paginationPreviousPage(language)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {getProjectPageText.paginationPreviousPage(language)}
          </Button>

          <Button
            variant="outline"
            size={size}
            onClick={goToNextPage}
            disabled={!effectiveCanGoToNextPage}
            aria-label={getProjectPageText.paginationNextPage(language)}
          >
            {getProjectPageText.paginationNextPage(language)}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={cn("flex items-center justify-between gap-4", className)}
      aria-label={ariaLabel || `${getProjectPageText.paginationPageOf(language)} ${getProjectPageText.paginationOf(language)}`}
      role="navigation"
    >
      {/* 정보 텍스트 */}
      {showInfo && (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {getInfoText()}
        </div>
      )}

      {/* 페이지네이션 컨트롤 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지로 */}
        <Button
          variant="ghost"
          size={size}
          onClick={goToFirstPage}
          disabled={!effectiveCanGoToPreviousPage}
          className={sizeClasses[size]}
          aria-label={getProjectPageText.paginationFirstPage(language)}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* 이전 페이지 */}
        <Button
          variant="ghost"
          size={size}
          onClick={goToPreviousPage}
          disabled={!effectiveCanGoToPreviousPage}
          className={sizeClasses[size]}
          aria-label={getProjectPageText.paginationPreviousPage(language)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* 페이지 번호들 */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={`${page}-${index}`}>
            {page === 'ellipsis' ? (
              <div className={cn("flex items-center justify-center", sizeClasses[size])}>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                onKeyDown={(e) => handleKeyDown(e, page as number)}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  sizeClasses[size],
                  currentPage === page
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-label={`${getProjectPageText.paginationGoToPage(language)} ${page}${currentPage === page ? ` (${getProjectPageText.paginationPageOf(language)})` : ''}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 다음 페이지 */}
        <Button
          variant="ghost"
          size={size}
          onClick={goToNextPage}
          disabled={!effectiveCanGoToNextPage}
          className={sizeClasses[size]}
          aria-label={getProjectPageText.paginationNextPage(language)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* 마지막 페이지로 */}
        <Button
          variant="ghost"
          size={size}
          onClick={goToLastPage}
          disabled={!effectiveCanGoToNextPage}
          className={sizeClasses[size]}
          aria-label={getProjectPageText.paginationLastPage(language)}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
};

export default Pagination;