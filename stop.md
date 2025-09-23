<!-- > /sc:implement is running… --ultrathink 내가 생각한 중앙화 개념을 잘못
> 인지하고있는데, 컴포넌트 페이지에 구현된 모든 것들이 작은 단위의 컴포넌트들이고 그것을
> 그대로 가져가서 사용하되 없는 것은 추가하고, 그안에 고정으로 사용되는 텍스트는
> brand.ts에서 관리되는 텍스트를 사용하되 없는 것은 추가하고, 이 조합 + globals.css 규칙을
> 적용해서 페이지가 구현되어야 하는데, 기존에 하드코딩된 것을 그대로 사용하고 변질된
> 중앙화를 적용하고있어. '/var/folders/k8/wlpvht3s1qd8dq37m1n809gm0000gn/T/TemporaryItems/
> NSIRD_screencaptureui_Bur3Qs/스크린샷 2025-09-23 오후 4.07.26.png'이 상태 표시
> 컴포넌트를 컴포넌트 페이지에있는 상태표시 컴포넌트에 추가하고, vivid에 색상을 추가한 뒤
> 페이지에 적용해줘 그리고 디테일뷰에 적용된 상태 배지를 앞서 언급한 배지로 변경해줘
> '/var/folders/k8/wlpvht3s1qd8dq37m1n809gm0000gn/T/TemporaryItems/NSIRD_screencaptureui_O
> kiqtU/스크린샷 2025-09-23 오후 4.09.12.png'
> ⎿ Allowed 8 tools for this command

✻ Thinking…

사용자가 중앙화 개념을 명확히 설명했습니다:

1. components 페이지의 작은 단위 컴포넌트들을 그대로 사용
2. 없는 컴포넌트는 추가
3. 고정 텍스트는 brand.ts에서 관리
4. globals.css 규칙 적용

그리고 두 개의 스크린샷을 제공했습니다:

1. 상태 표시 컴포넌트를 components 페이지에 추가
2. vivid 색상 추가
3. DetailView에 적용된 상태 배지를 새로운 배지로 변경

먼저 스크린샷을 확인해야 합니다.

⏺ 🧠 깊은 분석 모드 (--ultrathink)

중앙화 개념을 정확히 이해했습니다. 스크린샷을 확인하고 올바른 중앙화를
적용하겠습니다.

⏺ Read(/var/folders/k8/wlpvht3s1qd8dq37m1n809gm0000gn/T/TemporaryItems/NSIRD_screencaptu
reui_Bur3Qs/스크린샷 2025-09-23 오후 4.07.26.png)
⎿ Read image (14.9KB)

✻ Thinking…

스크린샷을 보니 여러 상태 배지들이 있습니다:

- 보류 (주황색 계열)
- 취소 (빨간색 계열)
- 검토 (노란색 계열)
- 진행중 (파란색 계열)
- 기획 (보라색 계열)

이제 두 번째 스크린샷도 확인해야 합니다.

⏺ Read(/var/folders/k8/wlpvht3s1qd8dq37m1n809gm0000gn/T/TemporaryItems/NSIRD_screencaptu
reui_OkiqtU/스크린샷 2025-09-23 오후 4.09.12.png)
⎿ Read image (64.9KB)

✻ Thinking…

스크린샷을 분석한 결과:

1. 첫 번째 스크린샷: 프로젝트 상태를 나타내는 다양한 배지들


    - 보류 (주황색)
    - 취소 (빨간색)
    - 검토 (노란색)
    - 진행중 (파란색)
    - 기획 (보라색)

2. 두 번째 스크린샷: 프로젝트 리스트에서 상태 배지가 적용된 모습


    - 보류, 취소됨, 검토중, 진행중 등의 상태가 표시됨

사용자가 원하는 것:

1. components 페이지의 Badge 컴포넌트를 기반으로 상태 표시 컴포넌트 구현
2. vivid 색상 옵션을 Badge 컴포넌트에 추가
3. brand.ts에 관련 텍스트 추가
4. DetailView에 이 새로운 Badge 시스템 적용

올바른 중앙화 접근:

- shadcn/ui의 Badge 컴포넌트를 그대로 사용
- 필요한 variant를 추가 (vivid 색상들)
- brand.ts에 상태 텍스트 추가
- globals.css의 색상 변수 활용

⏺ sequential-thinking - sequentialthinking (MCP)(thought: "스크린샷을 분석한 결과,
프로젝트 상태를 표시하는 Badge가
필요합니다:\n1. 보류 (주황색), 취소
(빨간색), 검토 (노란색), 진행중
(파란색), 완료 (녹색), 기획 (회색)\n2.
Badge 컴포넌트에 vivid variant를
추가해야 함\n3. brand.ts에 상태 텍스트
중앙화\n4. DetailView와 ProjectDetail에
적용\n\n올바른 중앙화란:\n- shadcn/ui
컴포넌트를 그대로 사용\n- 필요한 variant
추가\n- 텍스트는 brand.ts에서 관리\n-
색상은 globals.css의 CSS 변수 활용",
nextThoughtNeeded: true, thoughtNumber:
1, totalThoughts: 5)
⎿ {
 "thoughtNumber": 1,
"totalThoughts": 5,
… +4 lines (ctrl+o to expand)

✻ Thinking…

사용자가 지적한 핵심 포인트:

1. 중앙화의 올바른 개념 = shadcn/ui 컴포넌트를 그대로 사용 + brand.ts 텍스트 관리 +
   globals.css 색상 규칙
2. 스크린샷에서 보이는 상태 Badge들 (보류, 취소, 검토, 진행중, 완료, 기획)을 Badge
   컴포넌트에 추가
3. vivid variant 추가 필요
4. 프로젝트 상태에 맞는 색상 적용

할 일:

1. TodoWrite로 작업 계획 업데이트
2. Badge 컴포넌트에 vivid variants 추가
3. globals.css에 프로젝트 상태 색상 확인/추가
4. brand.ts에 상태 텍스트 추가
5. components 페이지에 상태 Badge 데모 추가
6. DetailView와 ProjectDetail에서 새로운 Badge variant 사용

✻ Thinking…

먼저 Badge 컴포넌트를 확인하고 vivid variant를 추가해야 합니다.

✻ Thinking…

먼저 Badge 컴포넌트 파일을 읽어서 구조를 확인하고 vivid variant를 추가해야 합니다.

⏺ Read(src/components/ui/badge.tsx)
⎿ Read 56 lines (ctrl+o to expand)
⎿ src/components/CLAUDE.md
⎿ src/components/ui/CLAUDE.md

✻ Thinking…

Badge 컴포넌트를 확인한 결과, 이미 프로젝트 상태를 위한 variant들이 정의되어 있습니다:

- project-review
- project-complete
- project-cancelled
- project-planning
- project-onhold
- project-inprogress

이제 필요한 작업:

1. 이 variant들을 제대로 사용하도록 수정
2. brand.ts에 상태 텍스트가 이미 있는지 확인
3. components 페이지에 프로젝트 상태 Badge 데모 추가
4. DetailView와 ProjectDetail에서 올바른 variant 사용

⏺ sequential-thinking - sequentialthinking (MCP)(thought: "Badge 컴포넌트를 확인한 결과
이미 프로젝트 상태를 위한 variant가
정의되어 있습니다:\n- project-review
(검토)\n- project-complete (완료) \n-
project-cancelled (취소)\n-
project-planning (기획)\n-
project-onhold (보류)\n-
project-inprogress (진행중)\n\n이제 이
variant들을 제대로 사용하도록
DetailView와 ProjectDetail을 수정하고,
components 페이지에 상태 Badge 데모를
추가해야 합니다.", nextThoughtNeeded:
true, thoughtNumber: 2, totalThoughts: 5)
⎿ {
 "thoughtNumber": 2,
"totalThoughts": 5,
… +4 lines (ctrl+o to expand)

✻ Thinking…

사용자가 요청한 것을 정리하면:

1. Badge 컴포넌트에 이미 project variant들이 있는 것을 확인함
2. 이제 DetailView와 ProjectDetail에서 이 Badge variant들을 제대로 사용하도록 수정
3. components 페이지에 프로젝트 상태 Badge 데모 추가
4. brand.ts에 상태 텍스트 중앙화

먼저 brand.ts를 확인하고 수정해야 함.

⏺ sequential-thinking - sequentialthinking (MCP)(thought: "이제 작업을
시작하겠습니다:\n1. brand.ts에 프로젝트
상태 텍스트 추가\n2. DetailView와
ProjectDetail에서 Badge variant 올바르게
사용\n3. components 페이지에 프로젝트
상태 Badge 데모 추가\n\n스크린샷에서 본
상태들:\n- 보류 (주황색)\n- 취소
(빨간색) \n- 검토 (노란색)\n- 진행중
(파란색)\n- 완료 (녹색)\n- 기획 (회색)",
nextThoughtNeeded: false,
thoughtNumber: 3, totalThoughts: 3)

⎿ {
 "thoughtNumber": 3,
"totalThoughts": 3,
… +4 lines (ctrl+o to expand)

✻ Thinking…

사용자가 중앙화 개념을 정확히 지적했습니다. 올바른 중앙화란:

1. shadcn/ui 컴포넌트를 그대로 사용
2. Badge 컴포넌트에 이미 정의된 project-\* variant 사용
3. 텍스트는 brand.ts에서 관리
4. components 페이지에 데모 추가

현재 Badge 컴포넌트에 이미 project-\* variant가 정의되어 있으므로 이를 활용해야 합니다.

⏺ 🎨 올바른 중앙화 구현 시작

이제 중앙화 개념을 정확히 적용하여 Badge 컴포넌트를 올바르게 사용하겠습니다.

✻ Thinking…

brand.ts에서 프로젝트 상태 텍스트를 중앙화해야 합니다. 스크린샷에서 본 상태들:

- 보류
- 취소
- 검토
- 진행중
- 완료
- 기획

현재 DetailView와 ProjectDetail에서 getStatusText라는 함수를 사용하고 있는데, 이를
brand.ts로 이동시켜야 합니다.

⏺ Read(src/config/brand.ts)
⎿ Read 50 lines (ctrl+o to expand)
⎿ src/config/CLAUDE.md

✻ Thinking…

brand.ts를 확인했습니다. 이제 프로젝트 상태 텍스트를 추가해야 합니다.

현재 DetailView와 ProjectDetail에서 사용하는 getStatusText 함수를 brand.ts로
이동시켜야 합니다.

⏺ Update(src/config/brand.ts)
⎿ Error editing file

✻ Thinking…

brand.ts 파일을 더 읽어서 정확한 위치를 찾아야겠습니다.

⏺ Read(src/config/brand.ts)
⎿ Read 0 lines

✻ Thinking…

파일이 946줄까지 있다고 하니, 900줄 부근을 읽어야겠습니다.

⏺ Read(src/config/brand.ts)
⎿ Read 97 lines (ctrl+o to expand)

✻ Thinking…

이제 brand.ts 파일의 마지막 부분을 확인했습니다. 프로젝트 상태 텍스트를 추가해야 하고,
getProjectStatusText 헬퍼 함수도 추가해야 합니다.

⏺ Update(src/config/brand.ts)
⎿ Updated src/config/brand.ts with 52 additions
 623 ko: "날짜 관리와 데이터 시각화를 위한 고급 컴포넌트들",
624 en: "Advanced components for date management and data
visualization"
625 }
626 + },
627 +
 628 + // 프로젝트 상태 텍스트
629 + projectStatus: {
630 + planning: {
631 + ko: "기획",
632 + en: "Planning"
633 + },
634 + in_progress: {
635 + ko: "진행중",
636 + en: "In Progress"
637 + },
638 + review: {
639 + ko: "검토",
640 + en: "Review"
641 + },
642 + completed: {
643 + ko: "완료",
644 + en: "Completed"
645 + },
646 + on_hold: {
647 + ko: "보류",
648 + en: "On Hold"
649 + },
650 + cancelled: {
651 + ko: "취소",
652 + en: "Cancelled"
653 + },
654 + title: {
655 + ko: "프로젝트 상태",
656 + en: "Project Status"
657 + },
658 + description: {
659 + ko: "프로젝트의 현재 진행 상태를 나타냅니다",
660 + en: "Indicates the current progress status of the project"
661 + }
662 }
663 } as const
664
 ...
935 close: (lang: 'ko' | 'en' = defaultLanguage) =>
uiText.componentDemo.projectPage.actions.close[lang]
936 }
937
 938 + // 프로젝트 상태 텍스트 헬퍼 함수
939 + export const getProjectStatusText = (status: string, lang: 'ko' | + 'en' = defaultLanguage) => {
940 + const statusMap = {
941 + planning: uiText.projectStatus.planning[lang],
942 + in_progress: uiText.projectStatus.in_progress[lang],
943 + review: uiText.projectStatus.review[lang],
944 + completed: uiText.projectStatus.completed[lang],
945 + on_hold: uiText.projectStatus.on_hold[lang],
946 + cancelled: uiText.projectStatus.cancelled[lang]
947 + };
948 + return statusMap[status as keyof typeof statusMap] || status;
949 + };
950 +
 951 + export const getProjectStatusTitle = (lang: 'ko' | 'en' = + defaultLanguage) => uiText.projectStatus.title[lang];
952 + export const getProjectStatusDescription = (lang: 'ko' | 'en' = + defaultLanguage) => uiText.projectStatus.description[lang];
953 +
 954 // 뷰 모드 텍스트 접근 함수
955 export const getViewModeText = {
956 title: (lang: 'ko' | 'en' = defaultLanguage) =>
uiText.componentDemo.viewMode.title[lang],

✻ Thinking…

이제 brand.ts에 프로젝트 상태 텍스트를 추가했습니다. 이제 DetailView와 ProjectDetail
컴포넌트를 수정해서 올바른 Badge variant를 사용하도록 해야 합니다.

✻ Thinking…

이제 components 페이지에 프로젝트 상태 Badge 데모를 추가해야 합니다. 이를 위해 먼저
components 페이지 파일을 읽어야 합니다.

⏺ Read(src/app/components/page.tsx)
⎿ Read 100 lines (ctrl+o to expand)

✻ Thinking…

components 페이지에서 Badge 컴포넌트를 표시하는 부분을 찾아야 합니다. 더
읽어보겠습니다.

⏺ Read(src/app/components/page.tsx)
⎿ Read 100 lines (ctrl+o to expand)

✻ Thinking…

좋습니다! 이미 components 페이지에 프로젝트 상태 Badge 데모가 404-418 줄에 있습니다.
하지만 텍스트 헬퍼 함수들이 제대로 연결되지 않은 것 같습니다. 이를 수정해야 합니다.

⏺ Read(src/app/components/page.tsx)
⎿ Read 20 lines (ctrl+o to expand)

✻ Thinking…

getProjectStatusText와 getProjectStatusTitle 등을 import해야 합니다. 또한 components
페이지에서 사용하는 텍스트 헬퍼 함수가 잘못된 것 같습니다.

⏺ Update(src/app/components/page.tsx)
⎿ Updated src/app/components/page.tsx with 12 additions and 9 removals
 48 getButtonText,
49 getComponentDemoText,
50 getPaletteText,
51 - getViewModeText
51 + getViewModeText,
52 + getProjectStatusText,
53 + getProjectStatusTitle,
54 + getProjectStatusDescription
55 } from "@/config/brand"
56 import { defaults, layout, chart, typography } from
"@/config/constants"
57
 ...
402
 403 <Card>
404 <CardHeader>
405 - <CardTitle>{getComponentDemoText. - getProjectStatusTitle('ko')}</CardTitle>
406 - <CardDescription>{getComponentDemoText. - getProjectStatusDescription('ko')}</CardDescription>
405 + <CardTitle>{ + getProjectStatusTitle('ko')}</CardTitle>
406 + <CardDescription>{ + getProjectStatusDescription('ko')}</CardDescription>
407 </CardHeader>
408 <CardContent>
409 <div className="flex flex-wrap gap-2">
410 - <Badge variant="project-review">{ - getComponentDemoText.getProjectStatus('review', 'ko')}</Badge>
411 - <Badge variant="project-complete">{getCompo - nentDemoText.getProjectStatus('complete', 'ko')}</Badge>
412 - <Badge variant="project-cancelled">{ - getComponentDemoText.getProjectStatus('cancelled', 'ko')}</Badge>
413 - <Badge variant="project-planning">{ - getComponentDemoText.getProjectStatus('planning', 'ko')}</Badge>
414 - <Badge variant="project-onhold">{ - getComponentDemoText.getProjectStatus('onHold', 'ko')}</Badge>
415 - <Badge variant="project-inprogress">{getCom - ponentDemoText.getProjectStatus('inProgress', 'ko')}</Badge>
410 + <Badge variant="project-planning">{ + getProjectStatusText('planning', 'ko')}</Badge>
411 + <Badge + variant="project-inprogress">{getProjectStatusText('in_progress', + 'ko')}</Badge>
412 + <Badge variant="project-review">{ + getProjectStatusText('review', 'ko')}</Badge>
413 + <Badge variant="project-complete">{ + getProjectStatusText('completed', 'ko')}</Badge>
414 + <Badge variant="project-onhold">{ + getProjectStatusText('on_hold', 'ko')}</Badge>
415 + <Badge + variant="project-cancelled">{getProjectStatusText('cancelled', + 'ko')}</Badge>
416 </div>
417 </CardContent>
418 </Card>

✻ Thinking…

이제 DetailView와 ProjectDetail 컴포넌트에서 Badge variant를 올바르게 사용하도록
수정해야 합니다.

✻ Thinking…

이제 DetailView와 ProjectDetail 컴포넌트를 수정하여 올바른 Badge variant를 사용하도록
해야 합니다. project- prefix가 붙은 variant를 사용해야 합니다.

⏺ Update(src/app/projects/components/ProjectsView/DetailView.tsx)
⎿ Error editing file

✻ Thinking…

getStatusText 함수가 현재 파일에서 다른 형태로 존재할 수 있습니다. 파일을 다시
읽어보겠습니다.

⏺ Read(src/app/projects/components/ProjectsView/DetailView.tsx)
⎿ Read 30 lines (ctrl+o to expand)

✻ Thinking…

이제 올바른 한글 텍스트를 확인했습니다. 계획중, 진행중, 검토중, 완료, 보류, 취소됨
이렇게 되어 있습니다.

⏺ Update(src/app/projects/components/ProjectsView/DetailView.tsx)
⎿ Updated src/app/projects/components/ProjectsView/DetailView.tsx with 12
 additions and 30 removals
4 import Typography from '@/components/ui/typography';
5 import ProjectDetail from '@/components/projects/ProjectDetail';
6 import type { ProjectTableRow } from
'@/lib/types/project-table.types';
7 - import { getProjectPageText } from '@/config/brand';
7 + import { getProjectPageText, getProjectStatusText + } from '@/config/brand';
8 import { Card, CardContent, CardHeader } from
'@/components/ui/card';
9 import { Badge } from '@/components/ui/badge';
10 import ProjectProgress from '@/components/projects/ProjectProgress';
...
52 };
53
 54 const getStatusVariant = (status: ProjectTableRow['status']):
string => {
55 - // components 페이지 스타일을 따르는 Badge variant
56 - switch (status) {
57 - case 'completed':
58 - return 'default'; // 기본 primary 색상
59 - case 'in_progress':
60 - return 'secondary';
61 - case 'review':
62 - return 'outline';
63 - case 'planning':
64 - return 'outline';
65 - case 'on_hold':
66 - return 'secondary';
67 - case 'cancelled':
68 - return 'destructive';
69 - default:
70 - return 'secondary';
71 - }
72 - };
73 -
 74 - const getStatusText = (status: ProjectTableRow['status']) => {
75 - const statusMap = {
76 - planning: '계획중',
77 - in_progress: '진행중',
78 - review: '검토중',
79 - completed: '완료',
80 - on_hold: '보류',
81 - cancelled: '취소됨'
55 + // 프로젝트 상태별 Badge variant
56 + const variantMap: Record<ProjectTableRow['status'], string> = {
57 + 'completed': 'project-complete',
58 + 'in_progress': 'project-inprogress',
59 + 'review': 'project-review',
60 + 'planning': 'project-planning',
61 + 'on_hold': 'project-onhold',
62 + 'cancelled': 'project-cancelled'
63 };
64 - return statusMap[status] || status;
64 + return variantMap[status] || 'secondary';
65 };
66
 67 +
 68 if (loading) {
69 return (
70 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
...
148 </p>
149 </div>
150 <Badge
variant={getStatusVariant(project.status) as any} className="ml-2">
151 - {getStatusText(project.status)}
151 + {getProjectStatusText(project.status + , 'ko')}
152 </Badge>
153 </div>
154
╭───────────────────────────────────────────────────╮
│ ✻ Welcome to Claude Code! │
│ │
│ /help for help, /status for your current setup │
│ │
│ cwd: /Users/a/Documents/Team-jane/Weave_V3 │
╰───────────────────────────────────────────────────╯

Tips for getting started:

Use Claude to help with file analysis, editing, bash commands and git
Be as specific as you would with another engineer for the best results
✔ Run /init to create a CLAUDE.md file with instructions for Claude
✔ Run /terminal-setup to set up terminal integration
══════════════════════ Conversation compacted · ctrl+o for history ═════════════════════
⎿ Read src/app/projects/components/ProjectsView/DetailView.tsx (183 lines)
⎿ Referenced file src/app/components/page.tsx
⎿ Referenced file src/config/brand.ts
⎿ Read src/config/CLAUDE.md (226 lines)
⎿ Read src/components/CLAUDE.md (286 lines)
⎿ Todo list read (6 items)

✻ Thinking…

Looking at the conversation summary, I need to continue with the last task that was in
progress. According to the todo list and summary:

1. DetailView has been completed - I've applied the new Badge variants there
2. ProjectDetail still needs the same Badge variant corrections applied
3. After that, I need to do build validation and testing

The current todo shows:

- "DetailView와 ProjectDetail에 새 Badge 적용" is marked as "in_progress"
- DetailView part is done, need to complete ProjectDetail part

Let me first read the ProjectDetail component to understand its current state and
apply the same corrections I did to DetailView.

⏺ ProjectDetail 컴포넌트에도 동일한 Badge variant 수정을 적용하겠습니다. 먼저 파일을
확인해보겠습니다.

⏺ Read(src/components/projects/ProjectDetail/index.tsx)
⎿ Read 342 lines (ctrl+o to expand)
⎿ src/CLAUDE.md
⎿ src/app/CLAUDE.md

✻ Thinking…

I can see the ProjectDetail component still has the old implementation with:

1. A custom getStatusVariant function that returns generic variant names
2. A hardcoded getStatusText function instead of using the centralized text from
   brand.ts

I need to update it to use:

1. The proper project-specific badge variants (project-planning, project-inprogress,
   etc.)
2. The centralized getProjectStatusText function from brand.ts

Let me apply the same fixes I did to DetailView.

⏺ ProjectDetail 컴포넌트에도 동일한 Badge variant 수정을 적용하겠습니다.

⏺ Update(src/components/projects/ProjectDetail/index.tsx)
⎿ Updated src/components/projects/ProjectDetail/index.tsx with 1 addition and 1
removal
6 import { Badge } from '@/components/ui/badge';
7 import { Button } from '@/components/ui/button';
8 import ProjectProgress from '@/components/projects/ProjectProgress';
9 - import { getProjectPageText } from '@/config/brand';
9 + import { getProjectPageText, getProjectStatusText + } from '@/config/brand';
10 import type { ProjectTableRow } from
'@/lib/types/project-table.types';
11 import { CalendarIcon, FileTextIcon, CreditCardIcon, BriefcaseIcon,
CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
12

✻ Thinking…

Now I need to:

1. Replace the custom getStatusVariant function with the proper variant mapping
2. Remove the hardcoded getStatusText function

Let me do this:

⏺ Update(src/components/projects/ProjectDetail/index.tsx)
⎿ Updated src/components/projects/ProjectDetail/index.tsx with 9 additions and 2
removals
36 }: ProjectDetailProps) {
37 const lang = 'ko'; // TODO: 나중에 언어 설정과 연동
38
 39 - // Status badge variant for consistent styling
39 + // 프로젝트 상태별 Badge variant
40 const getStatusVariant = (status: ProjectTableRow['status']):
string => {
41 - switch (status) {
42 - case 'completed':
43 - return 'default';
44 - case 'in_progress':
45 - return 'secondary';
46 - case 'review':
47 - return 'outline';
48 - case 'planning':
49 - return 'outline';
50 - case 'on_hold':
51 - return 'secondary';
52 - case 'cancelled':
53 - return 'destructive';
54 - default:
55 - return 'secondary';
56 - }
57 - };
58 -
 59 - const getStatusText = (status: ProjectTableRow['status']) => {
60 - const statusMap = {
61 - planning: '계획중',
62 - in_progress: '진행중',
63 - review: '검토중',
64 - completed: '완료',
65 - on_hold: '보류',
66 - cancelled: '취소됨'
41 + const variantMap: Record<ProjectTableRow['status'], string> = {
42 + 'completed': 'project-complete',
43 + 'in_progress': 'project-inprogress',
44 + 'review': 'project-review',
45 + 'planning': 'project-planning',
46 + 'on_hold': 'project-onhold',
47 + 'cancelled': 'project-cancelled'
48 };
49 - return statusMap[status] || status;
49 + return variantMap[status] || 'secondary';
50 };
51
 52 return (
⎿ 5-hour limit reached ∙ resets 8pm
/upgrade to increase your usage limit. -->
