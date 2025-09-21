# 🔄 자동 문서 참조 시스템 (Auto-Reference System)

## 🚨 CRITICAL: 이 문서는 Claude의 자동 실행을 보장합니다

### 📋 시스템 개요

이 시스템은 Claude가 **모든 작업 시작 시 자동으로 문서를 참조**하고,
**작업 완료 후 자동으로 문서를 업데이트**하도록 강제합니다.

---

## 🎯 핵심 원칙

### 1️⃣ **강제 실행 원칙 (Mandatory Execution)**
- Claude는 작업 요청을 받으면 즉시 CLAUDE.md를 읽어야 함
- 읽기를 건너뛸 수 없음 - 이는 CRITICAL 규칙임
- 위반 시 작업 실패로 간주됨

### 2️⃣ **계층적 참조 원칙 (Hierarchical Reference)**
```
1. 루트 CLAUDE.md (필수)
   ↓
2. src/claude.md (아키텍처)
   ↓
3. 도메인별 claude.md (작업 특화)
   ↓
4. docs/*.md (워크플로우)
```

### 3️⃣ **자동 업데이트 원칙 (Auto-Update)**
- 모든 변경사항은 문서에 기록되어야 함
- 기록하지 않으면 다음 세션에서 컨텍스트 손실
- 업데이트는 작업의 일부임

---

## 🔨 실행 메커니즘

### 작업 시작 시 자동 실행 코드
```typescript
// Claude가 내부적으로 실행해야 할 로직
async function onTaskStart(task: Task) {
  // 1. 필수: 루트 CLAUDE.md 읽기
  const rootDoc = await Read('./CLAUDE.md');
  if (!rootDoc) throw new Error('CRITICAL: CLAUDE.md 읽기 실패');

  // 2. 작업 유형 분석
  const taskType = analyzeTaskType(task);

  // 3. 관련 문서 자동 읽기
  const relatedDocs = await loadRelatedDocuments(taskType);

  // 4. 컨텍스트 구축
  buildContext(rootDoc, relatedDocs);

  // 5. 작업 실행 허가
  return executeTask(task);
}
```

### 작업 완료 후 자동 업데이트
```typescript
async function onTaskComplete(changes: Changes) {
  // 1. 변경사항 분석
  const affectedDomains = analyzeChanges(changes);

  // 2. 관련 문서 업데이트
  for (const domain of affectedDomains) {
    await updateDocumentation(domain, changes);
  }

  // 3. 검증
  validateDocumentationSync();
}
```

---

## 📊 작업별 필수 참조 매핑

| 작업 유형 | 필수 읽기 파일 | 업데이트 대상 |
|---------|--------------|-------------|
| **컴포넌트 생성** | CLAUDE.md → components/claude.md → ui/claude.md | ui/claude.md (컴포넌트 목록) |
| **페이지 생성** | CLAUDE.md → app/claude.md | app/claude.md (페이지 목록) |
| **훅 생성** | CLAUDE.md → hooks/claude.md | hooks/claude.md (훅 목록) |
| **설정 변경** | CLAUDE.md → config/claude.md | config/claude.md (설정 값) |
| **패턴 변경** | CLAUDE.md → src/claude.md | src/claude.md (아키텍처) |

---

## ⚠️ 위반 감지 및 대응

### 문서 미참조 감지
```
증상: 하드코딩, 패턴 불일치, 중복 구현
대응: 즉시 CLAUDE.md 읽기 후 작업 재시작
```

### 업데이트 누락 감지
```
증상: 다음 세션에서 새 기능 인지 못함
대응: 즉시 관련 claude.md 업데이트
```

---

## 🔗 SuperClaude 통합

이 시스템은 SuperClaude의 output-styles와 연동됩니다:

### 글로벌 설정 연결
```yaml
/Users/a/.claude/output-styles/korean-language.md:
  - 한국어 응답 강제
  - CLAUDE.md 필수 참조 강제
  - 자동 실행 워크플로우 정의
```

### 프로젝트 설정 연결
```yaml
./CLAUDE.md:
  - 프로젝트별 구조 정의
  - 강제 참조 지시사항
  - 작업 후 업데이트 체크리스트
```

---

## ✅ 검증 체크리스트

Claude의 올바른 동작 확인:
- [ ] 작업 시작 시 CLAUDE.md를 읽었는가?
- [ ] 관련 도메인의 claude.md를 읽었는가?
- [ ] 중앙화 시스템을 확인했는가?
- [ ] 작업 후 문서를 업데이트했는가?
- [ ] 변경사항이 문서에 반영되었는가?

**이 체크리스트가 모두 완료되어야 작업이 성공적으로 완료된 것입니다.**