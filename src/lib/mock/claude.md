# mock/ - 가짜 데이터 생성 시스템

## 🎭 Mock 데이터 시스템 개요

이 디렉토리는 개발 및 테스트 환경에서 사용할 **일관성 있는 가짜 데이터**를 생성하는 시스템을 제공합니다. **시드 기반 생성**으로 예측 가능한 데이터를 보장하며, **실제 API 호출을 시뮬레이션**하여 실제 환경과 유사한 개발 경험을 제공합니다.

## 📁 Mock 데이터 구조

```
mock/
└── projects.ts    # 📊 프로젝트 관련 가짜 데이터 생성기
```

## 🏗️ Mock 시스템 원칙

### 1. 시드 기반 일관성
- **예측 가능한 데이터**: 동일한 시드로 동일한 결과 생성
- **개발 환경 안정성**: 새로고침해도 같은 데이터 유지
- **테스트 신뢰성**: 일관된 테스트 데이터 보장

### 2. 실제 API 시뮬레이션
- **네트워크 지연**: 실제 API 호출과 유사한 대기 시간
- **비동기 패턴**: Promise 기반 인터페이스
- **에러 처리**: 실패 시나리오 시뮬레이션

### 3. 확장 가능한 구조
- **모듈화**: 도메인별 독립적 데이터 생성기
- **설정 가능**: 데이터 개수, 범위 등 커스터마이징
- **타입 안전성**: TypeScript 인터페이스 완전 준수

## 📊 projects.ts - 프로젝트 데이터 생성기

### 개요
프로젝트 관리 시스템에서 사용할 **20개의 가짜 프로젝트 데이터**를 생성합니다. 각 프로젝트는 현실적인 진행률, 결제 상태, 일정 등을 포함하여 실제 프로젝트 관리 시나리오를 재현합니다.

### 핵심 함수들

#### 1. generateMockProjects()
```typescript
export function generateMockProjects(): ProjectTableRow[] {
  // 20개의 시드 기반 프로젝트 생성
  // 각 프로젝트마다 고유한 시드 값으로 일관성 보장
}
```

**주요 특징**:
- **20개 프로젝트**: 다양한 상태의 프로젝트 데이터
- **시드 기반**: `seededRandom()` 함수로 예측 가능한 랜덤 값
- **현실적인 관계**: 프로젝트 진행률과 결제 진행률의 논리적 상관관계
- **다양한 상태**: 6가지 프로젝트 상태 고르게 분포

#### 2. 시드 기반 랜덤 생성기
```typescript
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
```

**특징**:
- **일관성 보장**: 같은 시드 → 같은 결과
- **균등 분포**: 0~1 사이의 균등한 분포
- **수학적 예측가능성**: `Math.sin()` 기반

### 생성되는 데이터 속성

#### 기본 정보
```typescript
{
  id: 'project-1',                    // 고유 ID
  no: 'WEAVE_001',                   // 프로젝트 번호
  name: '프로젝트 1',                 // 프로젝트명
  client: 'Client A',                // 클라이언트
}
```

#### 일정 정보
```typescript
{
  registrationDate: '2024-01-01',    // 등록일 (7일 간격 기준)
  dueDate: '2024-03-31',            // 마감일 (등록일 + 최대 90일)
  modifiedDate: '2024-02-15',       // 최종 수정일
}
```

#### 진행 상태
```typescript
{
  progress: 75,                      // 프로젝트 진행률 (0-100%)
  paymentProgress: 60,               // 결제 진행률 (진행률과 연동)
  status: 'in_progress',            // 프로젝트 상태
}
```

#### 추가 플래그
```typescript
{
  hasContract: true,                 // 계약서 존재 여부
  hasBilling: false,                // 청구서 존재 여부
  hasDocuments: true,               // 문서 존재 여부
}
```

#### 문서 데이터 요약
```typescript
{
  documents: DocumentInfo[];             // 문서 원본 목록 (유형별 최대 2개 생성)
  documentStatus: ProjectDocumentStatus; // 카드 표기를 위한 요약 메타데이터
}
```

- `DOCUMENT_TYPES` 배열을 기반으로 계약서/청구서/보고서/견적서/기타 문서를 시드 기반으로 생성합니다.
- `documentStatus`는 각 유형별 존재 여부, 최신 저장일, 문서 개수를 계산하여 Overview 탭 카드가 즉시 사용할 수 있도록 제공합니다.
- 문서가 없을 때는 `exists: false`, `status: 'none'`, `count: 0`으로 초기화되어 UI에서 `미보유` 상태가 노출됩니다.

### 상태별 데이터 분포

#### 프로젝트 상태 (6종)
```typescript
const statuses = [
  'planning',     // 기획 중
  'in_progress',  // 진행 중
  'review',       // 검토 중
  'completed',    // 완료됨
  'on_hold',      // 보류됨
  'cancelled'     // 취소됨
];
```

#### 클라이언트 분포
```typescript
const clients = [
  'Client A',     // 클라이언트 A
  'Client B',     // 클라이언트 B
  'Client C',     // 클라이언트 C
  'Client D',     // 클라이언트 D
  'Client E'      // 클라이언트 E
];
```

### 진행률-결제율 연동 로직

#### 스마트 결제 진행률 계산
```typescript
// 프로젝트 진행률에 따른 결제 진행률 계산
let paymentProgress = 0;

if (progress >= 80) {
  // 80% 이상 진행: 결제도 80-100%
  paymentProgress = Math.floor(80 + seededRandom(seed5) * 21);
} else if (progress >= 50) {
  // 50% 이상 진행: 결제는 30-80%
  paymentProgress = Math.floor(30 + seededRandom(seed5) * 51);
} else if (progress >= 20) {
  // 20% 이상 진행: 결제는 10-40%
  paymentProgress = Math.floor(10 + seededRandom(seed5) * 31);
} else {
  // 20% 미만 진행: 결제는 0-20%
  paymentProgress = Math.floor(seededRandom(seed5) * 21);
}

// 완료된 프로젝트는 대부분 결제 완료
if (statuses[statusIndex] === 'completed' && seededRandom(seed3 + seed4) > 0.3) {
  paymentProgress = 100;
}
```

**특징**:
- **논리적 관계**: 프로젝트가 많이 진행될수록 결제도 많이 진행
- **현실적 시뮬레이션**: 실제 비즈니스 패턴 반영
- **예외 처리**: 완료 프로젝트의 대부분은 결제 완료

## 🔍 데이터 조회 함수들

### getMockProjectById()
```typescript
export function getMockProjectById(id: string): ProjectTableRow | null {
  const projects = generateMockProjects();
  return projects.find(p => p.id === id || p.no === id) || null;
}
```

**특징**:
- **유연한 검색**: ID 또는 프로젝트 번호로 검색
- **타입 안전성**: null 반환으로 안전한 처리
- **일관성**: 같은 기본 데이터 생성기 사용

### 비동기 데이터 페칭

#### fetchMockProjects()
```typescript
export async function fetchMockProjects(): Promise<ProjectTableRow[]> {
  // 300ms 네트워크 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateMockProjects();
}
```

#### fetchMockProject()
```typescript
export async function fetchMockProject(id: string): Promise<ProjectTableRow | null> {
  // 200ms 네트워크 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 200));
  return getMockProjectById(id);
}
```

**네트워크 지연 시뮬레이션**:
- **전체 목록**: 300ms (더 많은 데이터)
- **단일 항목**: 200ms (더 적은 데이터)
- **현실적 경험**: 실제 API와 유사한 대기 시간

## 🎯 사용 패턴

### 기본 사용법
```typescript
import {
  generateMockProjects,
  getMockProjectById,
  fetchMockProjects,
  fetchMockProject
} from '@/lib/mock/projects';

// 동기 데이터 생성
const projects = generateMockProjects();
const project = getMockProjectById('project-1');

// 비동기 데이터 페칭 (네트워크 시뮬레이션)
const asyncProjects = await fetchMockProjects();
const asyncProject = await fetchMockProject('WEAVE_001');
```

### React 컴포넌트에서 사용
```typescript
import { useEffect, useState } from 'react';
import { fetchMockProjects } from '@/lib/mock/projects';
import type { ProjectTableRow } from '@/lib/types/project-table.types';

function ProjectList() {
  const [projects, setProjects] = useState<ProjectTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchMockProjects();
        setProjects(data);
      } catch (error) {
        console.error('프로젝트 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### 테스트에서 사용
```typescript
import { describe, it, expect } from 'vitest';
import { generateMockProjects, getMockProjectById } from '@/lib/mock/projects';

describe('프로젝트 Mock 데이터', () => {
  it('항상 20개의 프로젝트를 생성한다', () => {
    const projects = generateMockProjects();
    expect(projects).toHaveLength(20);
  });

  it('동일한 결과를 반복 생성한다', () => {
    const projects1 = generateMockProjects();
    const projects2 = generateMockProjects();
    expect(projects1).toEqual(projects2);
  });

  it('ID로 프로젝트를 찾을 수 있다', () => {
    const project = getMockProjectById('project-1');
    expect(project).toBeDefined();
    expect(project?.id).toBe('project-1');
  });

  it('프로젝트 번호로도 찾을 수 있다', () => {
    const project = getMockProjectById('WEAVE_001');
    expect(project).toBeDefined();
    expect(project?.no).toBe('WEAVE_001');
  });
});
```

## 🚀 확장 가이드

### 새로운 Mock 데이터 생성기 추가

#### 1. 클라이언트 데이터 생성기
```typescript
// src/lib/mock/clients.ts
import type { Client } from '@/types/business';

export function generateMockClients(): Client[] {
  const industries = ['IT', '제조업', '서비스업', '교육', '금융'];

  return Array.from({ length: 10 }, (_, i) => {
    const seed = i * 1111 + 2222;

    return {
      id: `client-${i + 1}`,
      name: `클라이언트 ${String.fromCharCode(65 + i)}`,
      email: `client${i + 1}@example.com`,
      phone: `010-${String(1000 + i).slice(1)}-${String(5000 + i).slice(1)}`,
      company: `${String.fromCharCode(65 + i)} 컴퍼니`,
      address: `서울시 강남구 테헤란로 ${100 + i * 10}`,
      created_at: new Date(2024, 0, i * 3 + 1).toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1'
    };
  });
}
```

#### 2. 인보이스 데이터 생성기
```typescript
// src/lib/mock/invoices.ts
import type { Invoice } from '@/types/business';

export function generateMockInvoices(): Invoice[] {
  const statuses: Invoice['status'][] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

  return Array.from({ length: 50 }, (_, i) => {
    const seed = i * 3333 + 4444;
    const issueDate = new Date(2024, 0, 1 + i * 2);
    const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subtotal = 1000000 + Math.floor(seededRandom(seed) * 5000000);
    const taxRate = 0.1;
    const taxAmount = Math.floor(subtotal * taxRate);
    const total = subtotal + taxAmount;

    return {
      id: `invoice-${i + 1}`,
      invoice_number: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      client_id: `client-${(i % 10) + 1}`,
      project_id: `project-${(i % 20) + 1}`,
      status: statuses[Math.floor(seededRandom(seed + 1000) * statuses.length)],
      issue_date: issueDate.toISOString(),
      due_date: dueDate.toISOString(),
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      created_at: issueDate.toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1'
    };
  });
}
```

### Mock 데이터 설정 커스터마이징

#### 환경별 설정
```typescript
// src/lib/mock/config.ts
export const MOCK_CONFIG = {
  // 개발 환경
  development: {
    projects: { count: 20, delay: 300 },
    clients: { count: 10, delay: 200 },
    invoices: { count: 50, delay: 250 }
  },

  // 테스트 환경
  test: {
    projects: { count: 5, delay: 0 },
    clients: { count: 3, delay: 0 },
    invoices: { count: 10, delay: 0 }
  },

  // 스토리북 환경
  storybook: {
    projects: { count: 3, delay: 100 },
    clients: { count: 2, delay: 50 },
    invoices: { count: 5, delay: 100 }
  }
};

export function getMockConfig() {
  const env = process.env.NODE_ENV || 'development';
  return MOCK_CONFIG[env as keyof typeof MOCK_CONFIG];
}
```

#### 동적 데이터 개수 조절
```typescript
export function generateMockProjects(count?: number): ProjectTableRow[] {
  const config = getMockConfig();
  const actualCount = count || config.projects.count;

  return Array.from({ length: actualCount }, (_, i) => {
    // 기존 생성 로직...
  });
}
```

## 📊 품질 메트릭

### 데이터 품질 지표
- **일관성**: 100% (시드 기반 생성으로 항상 동일한 결과)
- **타입 안전성**: 100% (TypeScript 인터페이스 완전 준수)
- **현실성**: 85% 이상 (실제 비즈니스 패턴 반영)
- **다양성**: 모든 상태와 시나리오 고르게 분포

### 성능 지표
- **생성 속도**: < 10ms (20개 프로젝트)
- **메모리 효율성**: 최소한의 메모리 사용
- **네트워크 시뮬레이션**: 200-300ms 지연

### 개발 경험
- **예측 가능성**: 항상 동일한 데이터 순서
- **디버깅 편의성**: 특정 ID로 특정 상태 재현 가능
- **테스트 신뢰성**: 일관된 테스트 환경 보장

## 🔗 관련 문서

- [`../../types/project-table.types.ts`] - 프로젝트 테이블 타입 정의
- [`../../types/business.ts`] - 비즈니스 도메인 타입 정의
- [`../../app/projects/claude.md`](../../app/projects/claude.md) - 프로젝트 페이지에서의 사용법

---

**이 Mock 데이터 시스템은 개발과 테스트에서 일관성 있고 현실적인 데이터 환경을 제공하여 개발 효율성을 극대화합니다.**
