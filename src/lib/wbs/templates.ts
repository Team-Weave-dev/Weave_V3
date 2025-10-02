// WBS 템플릿 시스템
import type { WBSTask, WBSTemplateType } from '@/lib/types/project-table.types';

/**
 * WBS 템플릿 타입에 따라 기본 작업 목록을 생성합니다.
 *
 * @param type - 템플릿 타입 ('standard' | 'consulting' | 'education' | 'custom')
 * @returns WBSTask 배열
 *
 * @example
 * ```typescript
 * const tasks = getWBSTemplateByType('standard');
 * // [{ id: 'task-1', name: '기획', status: 'pending', ... }, ...]
 * ```
 */
export function getWBSTemplateByType(type: WBSTemplateType): WBSTask[] {
  const now = new Date().toISOString();

  switch (type) {
    case 'standard':
      // 표준 프로젝트: 기획 → 설계 → 개발 → 테스트 → 배포
      return [
        {
          id: `task-${Date.now()}-1`,
          name: '기획',
          description: '프로젝트 요구사항 분석 및 기획',
          status: 'pending',
          createdAt: now,
          order: 0
        },
        {
          id: `task-${Date.now()}-2`,
          name: '설계',
          description: '시스템 아키텍처 및 상세 설계',
          status: 'pending',
          createdAt: now,
          order: 1
        },
        {
          id: `task-${Date.now()}-3`,
          name: '개발',
          description: '기능 구현 및 코드 작성',
          status: 'pending',
          createdAt: now,
          order: 2
        },
        {
          id: `task-${Date.now()}-4`,
          name: '테스트',
          description: '단위/통합/E2E 테스트 수행',
          status: 'pending',
          createdAt: now,
          order: 3
        },
        {
          id: `task-${Date.now()}-5`,
          name: '배포',
          description: '운영 환경 배포 및 모니터링',
          status: 'pending',
          createdAt: now,
          order: 4
        }
      ];

    case 'consulting':
      // 컨설팅 프로젝트: 착수 → 분석 → 제안 → 실행 → 종료
      return [
        {
          id: `task-${Date.now()}-1`,
          name: '착수',
          description: '프로젝트 킥오프 및 범위 정의',
          status: 'pending',
          createdAt: now,
          order: 0
        },
        {
          id: `task-${Date.now()}-2`,
          name: '분석',
          description: '현황 분석 및 문제점 도출',
          status: 'pending',
          createdAt: now,
          order: 1
        },
        {
          id: `task-${Date.now()}-3`,
          name: '제안',
          description: '개선안 작성 및 발표',
          status: 'pending',
          createdAt: now,
          order: 2
        },
        {
          id: `task-${Date.now()}-4`,
          name: '실행',
          description: '개선안 실행 및 모니터링',
          status: 'pending',
          createdAt: now,
          order: 3
        },
        {
          id: `task-${Date.now()}-5`,
          name: '종료',
          description: '최종 보고 및 프로젝트 종료',
          status: 'pending',
          createdAt: now,
          order: 4
        }
      ];

    case 'education':
      // 교육 프로젝트: 기획 → 자료 제작 → 리허설 → 강의 → 피드백
      return [
        {
          id: `task-${Date.now()}-1`,
          name: '기획',
          description: '교육 과정 설계 및 목표 수립',
          status: 'pending',
          createdAt: now,
          order: 0
        },
        {
          id: `task-${Date.now()}-2`,
          name: '자료 제작',
          description: '교안 및 실습 자료 작성',
          status: 'pending',
          createdAt: now,
          order: 1
        },
        {
          id: `task-${Date.now()}-3`,
          name: '리허설',
          description: '강의 시뮬레이션 및 피드백 반영',
          status: 'pending',
          createdAt: now,
          order: 2
        },
        {
          id: `task-${Date.now()}-4`,
          name: '강의',
          description: '교육 진행 및 질의응답',
          status: 'pending',
          createdAt: now,
          order: 3
        },
        {
          id: `task-${Date.now()}-5`,
          name: '피드백',
          description: '교육 평가 및 개선사항 수집',
          status: 'pending',
          createdAt: now,
          order: 4
        }
      ];

    case 'custom':
      // 커스텀: 빈 배열 (사용자가 직접 추가)
      return [];

    default:
      return [];
  }
}

/**
 * 템플릿 타입에 대한 메타데이터를 반환합니다.
 *
 * @param type - 템플릿 타입
 * @returns 템플릿 이름과 설명
 */
export function getWBSTemplateMetadata(type: WBSTemplateType): { name: string; description: string } {
  switch (type) {
    case 'standard':
      return {
        name: '표준 프로젝트',
        description: '기획, 설계, 개발, 테스트, 배포 단계로 구성된 일반적인 프로젝트'
      };
    case 'consulting':
      return {
        name: '컨설팅 프로젝트',
        description: '착수, 분석, 제안, 실행, 종료 단계로 구성된 컨설팅 프로젝트'
      };
    case 'education':
      return {
        name: '교육 프로젝트',
        description: '기획, 자료 제작, 리허설, 강의, 피드백 단계로 구성된 교육 프로젝트'
      };
    case 'custom':
      return {
        name: '커스텀',
        description: '사용자가 직접 작업을 추가하는 빈 템플릿'
      };
    default:
      return {
        name: '알 수 없음',
        description: '정의되지 않은 템플릿'
      };
  }
}
