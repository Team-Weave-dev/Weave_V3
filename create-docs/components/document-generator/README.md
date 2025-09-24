# 문서 생성 기능 (Document Generator)

AI 기반 견적서, 계약서, 청구서 자동 생성 시스템

## 📋 기능 개요

- **견적서 생성**: 프로젝트별 맞춤형 견적서 (8개 업종별 템플릿)
- **계약서 생성**: 20+ 종류의 전문 계약서 템플릿
- **청구서 생성**: 세금계산서 및 청구서 자동 생성
- **AI 자동 완성**: Gemini 2.5 Pro 모델을 활용한 지능형 문서 작성
- **문서 편집기**: 마크다운 기반 실시간 편집
- **내보내기**: PDF, Word(docx) 형식 지원

## 🚀 빠른 시작

### 1. 필요한 패키지 설치

```bash
npm install @google/generative-ai html-docx-js-typescript jspdf html2canvas
```

### 2. 환경 변수 설정

`.env.local` 파일에 추가:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 파일 복사

다음 폴더와 파일들을 프로젝트에 복사:

```
# 컴포넌트 파일
/components/document-generator/
  - DocumentGenerator.tsx    # 메인 문서 생성 컴포넌트
  - DocumentEditor.tsx       # 마크다운 편집기
  - QuotePreview.tsx        # 문서 미리보기 및 PDF 내보내기
  - index.ts                # Export 관리

# 라이브러리 파일  
/lib/document-generator/
  - quote-templates.ts      # 견적서/계약서 템플릿 시스템
  - token-tracker.ts        # 토큰 사용량 추적
  - contract-categories.ts  # 계약서 카테고리 정의
  - quote-template-categories.ts  # 견적서 카테고리 정의
  - [*-contract-template.ts]  # 20+ 계약서 템플릿 파일들

# API 라우트 (선택사항 - 필수 권장)
/app/api/ai-assistant/route.ts  # API 엔드포인트
```

### 3-1. API 라우트 설정 (중요)

`/app/api/ai-assistant/route.ts` 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const formData = await request.formData();
    const action = formData.get('action') as string;
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    if (action === 'generate') {
      // 문서 생성 로직
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp' // 또는 'gemini-2.5-pro'
      });
      
      const documentType = formData.get('documentType') as string;
      const template = formData.get('template') as string;
      const clientData = JSON.parse(formData.get('clientData') as string);
      const projectData = JSON.parse(formData.get('projectData') as string);
      const prompt = formData.get('prompt') as string;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedContent = response.text();

      return NextResponse.json({
        success: true,
        content: generatedContent,
        usage: {
          promptTokens: 0, // Gemini API는 토큰 수를 직접 제공하지 않음
          completionTokens: 0,
          totalTokens: 0
        }
      });
    }

    return NextResponse.json(
      { error: '지원하지 않는 액션입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 4. 기본 사용법

```tsx
import { DocumentGenerator } from '@/components/document-generator';

export default function Page() {
  return (
    <div className="p-8">
      <DocumentGenerator />
    </div>
  );
}
```

## 📁 프로젝트 구조

```
document-generator/
├── components/
│   ├── DocumentGenerator.tsx   # 메인 컴포넌트
│   ├── DocumentEditor.tsx      # 마크다운 편집기
│   ├── QuotePreview.tsx       # 미리보기 & PDF
│   └── index.ts                # Exports
│
├── lib/
│   ├── quote-templates.ts     # 템플릿 시스템
│   ├── token-tracker.ts       # 토큰 관리
│   ├── contract-categories.ts # 카테고리 정의
│   └── templates/             # 템플릿 파일들
│       ├── freelance-contract-template.ts
│       ├── nda-contract-template.ts
│       ├── web-contract-template.ts
│       └── ... (20+ 템플릿)
│
└── api/
    └── ai-assistant/
        └── route.ts           # API 엔드포인트
```

## 🎯 주요 컴포넌트

### DocumentGenerator
메인 문서 생성 컴포넌트로 다음 기능을 제공:
- 문서 종류 선택 (견적서/계약서/청구서)
- 템플릿 선택 UI
- 클라이언트/프로젝트 정보 입력
- AI 문서 생성 실행

### DocumentEditor
마크다운 기반 문서 편집기:
- 실시간 마크다운 편집
- Word(docx) 파일 내보내기
- 자동 저장 기능

### QuotePreview
문서 미리보기 및 내보내기:
- A4 사이즈 미리보기
- PDF 내보내기 (html2canvas + jsPDF)
- 인쇄 기능
- 프로페셔널한 문서 레이아웃

## 📝 템플릿 종류

### 견적서 템플릿 (8개 카테고리)
- **IT/개발**: 웹, 모바일 앱, 소프트웨어 개발
- **디자인/창작**: 그래픽, UI/UX, 브랜딩
- **마케팅/광고**: 디지털 마케팅, SNS, 광고
- **컨설팅/교육**: 비즈니스 컨설팅, 교육 서비스
- **미디어/콘텐츠**: 영상, 사진, 콘텐츠 제작
- **번역/라이팅**: 번역, 카피라이팅
- **이벤트/기획**: 행사 기획, 프로모션
- **유지보수/지원**: 기술 지원, 유지보수

### 계약서 템플릿 (20+ 종류)
- **개발 계약서**: 소프트웨어, 웹, 앱 개발
- **프리랜서 계약서**: 일반 프리랜서 용역
- **NDA**: 비밀유지계약서
- **서비스 계약서**: 일반 서비스 제공
- **디자인 계약서**: 그래픽, UI/UX 디자인
- **컨설팅 계약서**: 경영, 기술 컨설팅
- **교육 계약서**: 강의, 교육 서비스
- **광고 계약서**: 광고, 마케팅 서비스
- **영상 제작 계약서**: 영상 촬영 및 편집
- **사진 촬영 계약서**: 사진 촬영 서비스
- **번역 계약서**: 번역 서비스
- **출판 계약서**: 출판 및 저작권
- **라이선스 계약서**: 소프트웨어 라이선스
- **유지보수 계약서**: 시스템 유지보수
- **공연 계약서**: 공연, 행사 출연
- **인플루언서 계약서**: SNS 마케팅
- 기타 다수...

## 🔧 커스터마이징

### 새로운 템플릿 추가하기

1. `/lib/document-generator/` 폴더에 새 템플릿 파일 생성:

```typescript
// my-custom-template.ts
import { QuoteTemplate } from './quote-templates';

export const MY_CUSTOM_TEMPLATE: QuoteTemplate = {
  id: 'my-custom-template',
  name: '내 맞춤 템플릿',
  documentType: 'quote', // 또는 'contract', 'invoice'
  category: 'custom',
  description: '맞춤형 템플릿 설명',
  variables: ['CLIENT_NAME', 'PROJECT_TITLE', ...],
  template: `
# 문서 제목

## 고객 정보
- **고객명**: {{CLIENT_NAME}}
- **프로젝트**: {{PROJECT_TITLE}}

... 템플릿 내용 ...
`
};
```

2. `quote-templates.ts` 파일에 import 및 등록:

```typescript
import { MY_CUSTOM_TEMPLATE } from './my-custom-template';

export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  // ... 기존 템플릿들
  MY_CUSTOM_TEMPLATE
];
```

### AI 프롬프트 커스터마이징

`DocumentGenerator.tsx` 파일의 `generateDocument` 함수에서 프롬프트 수정:

```typescript
const prompt = `
당신은 전문 비즈니스 문서 작성 어시스턴트입니다.
// ... 프롬프트 커스터마이징
`;
```

## 🔐 보안 고려사항

- **API 키 보호**: 환경 변수를 통해 API 키 관리
- **클라이언트 데이터**: 민감한 정보는 서버 사이드에서만 처리
- **토큰 사용량**: 토큰 추적 시스템으로 비용 관리
- **로컬 스토리지**: 임시 데이터만 저장, 민감 정보 제외

## 💰 비용 정보

Gemini 2.5 Pro 모델 사용 비용:
- Input: $1.25 / 1M tokens
- Output: $5.00 / 1M tokens
- 평균 문서 생성: 약 2,000~5,000 토큰 사용

## 🐛 문제 해결

### PDF 내보내기 오류
Tailwind CSS v4의 `lab()` 색상 함수 관련 오류 발생 시:
- `QuotePreview.tsx`의 `convertLabColors` 함수가 자동으로 처리
- 필요시 추가 색상 매핑 추가

### Word 파일 다운로드 실패
브라우저 환경 체크 로직 확인:
```typescript
if (typeof window === 'undefined') {
  console.error('브라우저 환경이 아닙니다.');
  return;
}
```

### API 호출 실패
- 환경 변수 확인: `GEMINI_API_KEY`
- API 라우트 경로 확인: `/api/ai-assistant`
- 네트워크 연결 상태 확인

## 📚 의존성

### 필수 패키지
- `@google/generative-ai`: Gemini AI 모델 연동
- `html-docx-js-typescript`: Word 파일 생성
- `jspdf`: PDF 생성
- `html2canvas`: HTML to Canvas 변환

### 개발 환경
- Next.js 15+ (App Router)
- React 19+
- TypeScript 5+
- Tailwind CSS 4+

## 📞 지원

통합 과정에서 문제가 있으시면 다음을 확인해주세요:
1. 환경 변수가 올바르게 설정되었는지
2. 모든 필요한 파일이 복사되었는지
3. API 라우트 경로가 올바른지

추가 도움이 필요하시면 이슈를 생성해주세요.