from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional, Sequence

import re
from collections import defaultdict

# SECTION: Data Model - claude 문서 항목 구조

@dataclass
class Entry:
    title: str
    purpose: list[str]
    responsibilities: list[str]
    structure: list[str]
    centralization: list[str]
    rules: list[str]
    references: list[str]
    file_map_path: Optional[str] = None
    file_map_extensions: Optional[tuple[str, ...]] = None

DOCS: dict[str, Entry] = {}


def add(
    path: str,
    *,
    title: str,
    purpose: Iterable[str],
    responsibilities: Iterable[str] | None = None,
    structure: Iterable[str] | None = None,
    centralization: Iterable[str] | None = None,
    rules: Iterable[str] | None = None,
    references: Iterable[str] | None = None,
    file_map_path: str | None = None,
    file_map_extensions: Sequence[str] | None = None,
) -> None:
    if path in DOCS:
        raise ValueError(f"Duplicate entry for {path}")

    resolved_path = Path(path)
    if file_map_path is None:
        parent = resolved_path.parent
        file_map_path = None if str(parent) in ('', '.') else parent.as_posix()
    else:
        file_map_path = Path(file_map_path).as_posix()

    extensions_tuple: Optional[tuple[str, ...]] = None
    if file_map_extensions:
        extensions_tuple = tuple({ext.lower() for ext in file_map_extensions})

    DOCS[path] = Entry(
        title=title,
        purpose=list(purpose),
        responsibilities=list(responsibilities or []),
        structure=list(structure or []),
        centralization=list(centralization or []),
        rules=list(rules or []),
        references=list(references or []),
        file_map_path=file_map_path,
        file_map_extensions=extensions_tuple,
    )


# ---------------------------------------------------------------------------
# Utility helpers for file section extraction
# ---------------------------------------------------------------------------

# SECTION: Section Extraction Utilities - 파일 섹션 파싱 로직

SECTION_COMMENT_PATTERN = re.compile(r"^\s*//\s*SECTION:\s*(?P<title>[^-]+?)(?:\s*-\s*(?P<desc>.*))?\s*$")
BLOCK_SECTION_PATTERN = re.compile(r"^\s*/\*\s*SECTION:\s*(?P<title>[^-]+?)(?:\s*-\s*(?P<desc>.*?))?\s*\*/")
EXPORT_PATTERN = re.compile(
    r"^\s*export\s+(?:default\s+)?(const|let|var|function|class|interface|type|enum)\s*" r"(?P<name>[A-Za-z0-9_]+)?"
)
MARKDOWN_HEADING_PATTERN = re.compile(r"^\s*##\s+(?P<title>.+?)\s*$")
PY_SECTION_PATTERN = re.compile(r"^\s*#\s*SECTION:\s*(?P<title>[^-]+?)(?:\s*-\s*(?P<desc>.*))?\s*$")


def _clean_comment_line(raw: str) -> str:
    text = raw.strip()
    text = text.lstrip('/*').lstrip('*').lstrip('/').strip()
    text = text.rstrip('*/').strip()
    return text


def _extract_preceding_comment(lines: list[str], start_index: int) -> str:
    idx = start_index - 2  # convert to 0-based
    collected: list[str] = []
    encountered = False

    while idx >= 0:
        line = lines[idx]
        stripped = line.strip()
        if not stripped:
            if not encountered:
                idx -= 1
                continue
            break
        if stripped.startswith('//'):
            collected.insert(0, stripped[2:].strip())
            encountered = True
            idx -= 1
            continue
        if stripped.endswith('*/'):
            block: list[str] = []
            block.insert(0, stripped)
            idx -= 1
            while idx >= 0:
                block.insert(0, lines[idx].strip())
                if lines[idx].strip().startswith('/*') or lines[idx].strip().startswith('/**'):
                    idx -= 1
                    break
                idx -= 1
            cleaned = [
                _clean_comment_line(item)
                for item in block
                if _clean_comment_line(item)
            ]
            return ' '.join(cleaned)
        break
    if collected:
        return ' '.join(collected)
    return ''


def _extract_preceding_python_comment(lines: list[str], start_index: int) -> str:
    idx = start_index - 2
    collected: list[str] = []
    while idx >= 0:
        stripped = lines[idx].strip()
        if not stripped:
            if not collected:
                idx -= 1
                continue
            break
        if stripped.startswith('#'):
            collected.insert(0, stripped.lstrip('#').strip())
            idx -= 1
            continue
        break
    return ' '.join(collected)


def _compute_ranges(markers: list[tuple[int, str, str]], total_lines: int) -> list[tuple[int, int, str, str]]:
    sections: list[tuple[int, int, str, str]] = []
    for idx, (start, title, desc) in enumerate(markers):
        end = markers[idx + 1][0] - 1 if idx + 1 < len(markers) else total_lines
        sections.append((start, end, title.strip(), desc.strip()))
    return sections


def _extract_ts_sections(lines: list[str]) -> list[tuple[int, int, str, str]]:
    markers: list[tuple[int, str, str]] = []
    for index, line in enumerate(lines, start=1):
        section_match = SECTION_COMMENT_PATTERN.match(line)
        if section_match:
            markers.append((index, section_match.group('title'), section_match.group('desc') or ''))
            continue
        block_match = BLOCK_SECTION_PATTERN.match(line)
        if block_match:
            markers.append((index, block_match.group('title'), block_match.group('desc') or ''))
    if markers:
        return _compute_ranges(markers, len(lines))

    exports: list[tuple[int, str]] = []
    for index, line in enumerate(lines, start=1):
        export_match = EXPORT_PATTERN.match(line)
        if export_match:
            name = export_match.group('name') or 'default export'
            exports.append((index, f"export {name}"))
    if exports:
        sections: list[tuple[int, int, str, str]] = []
        for idx, (start, title) in enumerate(exports):
            end = exports[idx + 1][0] - 1 if idx + 1 < len(exports) else len(lines)
            desc = _extract_preceding_comment(lines, start)
            sections.append((start, end, title, desc))
        return sections

    definitions: list[tuple[int, str]] = []
    for index, line in enumerate(lines, start=1):
        class_match = re.match(r'^\s*class\s+([A-Za-z0-9_]+)', line)
        if class_match:
            definitions.append((index, f"class {class_match.group(1)}"))
            continue
        func_match = re.match(r'^\s*function\s+([A-Za-z0-9_]+)', line)
        if func_match:
            definitions.append((index, f"function {func_match.group(1)}"))
            continue
        const_match = re.match(r'^\s*(const|let|var)\s+([A-Za-z0-9_]+)\s*=', line)
        if const_match:
            definitions.append((index, f"{const_match.group(1)} {const_match.group(2)}"))

    if not definitions:
        return []

    fallback_sections: list[tuple[int, int, str, str]] = []
    for idx, (start, title) in enumerate(definitions):
        end = definitions[idx + 1][0] - 1 if idx + 1 < len(definitions) else len(lines)
        desc = _extract_preceding_comment(lines, start)
        fallback_sections.append((start, end, title, desc))
    return fallback_sections


def _extract_python_sections(lines: list[str]) -> list[tuple[int, int, str, str]]:
    markers: list[tuple[int, str, str]] = []
    for index, line in enumerate(lines, start=1):
        match = PY_SECTION_PATTERN.match(line)
        if match:
            markers.append((index, match.group('title'), match.group('desc') or ''))
    if markers:
        return _compute_ranges(markers, len(lines))

    definitions: list[tuple[int, str]] = []
    for index, line in enumerate(lines, start=1):
        class_match = re.match(r'^\s*class\s+([A-Za-z0-9_]+)', line)
        if class_match:
            definitions.append((index, f"class {class_match.group(1)}"))
            continue
        def_match = re.match(r'^\s*def\s+([A-Za-z0-9_]+)', line)
        if def_match:
            definitions.append((index, f"def {def_match.group(1)}"))
            continue
        const_match = re.match(r'^\s*(?:[A-Z_][A-Z0-9_]*)\s*=\s*', line)
        if const_match:
            name = line.split('=')[0].strip()
            definitions.append((index, name))
    if not definitions:
        return []

    sections: list[tuple[int, int, str, str]] = []
    for idx, (start, title) in enumerate(definitions):
        end = definitions[idx + 1][0] - 1 if idx + 1 < len(definitions) else len(lines)
        desc = _extract_preceding_python_comment(lines, start)
        sections.append((start, end, title, desc))
    return sections


def _extract_markdown_sections(lines: list[str]) -> list[tuple[int, int, str, str]]:
    markers: list[tuple[int, str]] = []
    for index, line in enumerate(lines, start=1):
        heading_match = MARKDOWN_HEADING_PATTERN.match(line)
        if heading_match:
            title = heading_match.group('title').strip()
            if title == '라인 가이드':
                continue
            markers.append((index, title))
    if not markers:
        return []

    sections: list[tuple[int, int, str, str]] = []
    for idx, (start, title) in enumerate(markers):
        end = markers[idx + 1][0] - 1 if idx + 1 < len(markers) else len(lines)
        desc = ''
        for probe in range(start, min(end + 1, start + 10)):
            text = lines[probe - 1].strip()
            if not text or text.startswith('#'):
                continue
            if text.startswith('-') or text.startswith('*'):
                desc = text[1:].strip()
            else:
                desc = text
            if desc:
                break
        sections.append((start, end, title, desc))
    return sections


def _extract_css_sections(lines: list[str]) -> list[tuple[int, int, str, str]]:
    markers: list[tuple[int, str, str]] = []
    for index, line in enumerate(lines, start=1):
        block_match = BLOCK_SECTION_PATTERN.match(line)
        if block_match:
            markers.append((index, block_match.group('title'), block_match.group('desc') or ''))
    if markers:
        return _compute_ranges(markers, len(lines))
    return []


def extract_sections(path: Path) -> list[tuple[int, int, str, str]]:
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        return []

    lines = text.splitlines()
    suffix = path.suffix.lower()

    if suffix in {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'}:
        return _extract_ts_sections(lines)
    if suffix == '.md':
        return _extract_markdown_sections(lines)
    if suffix in {'.css', '.scss', '.sass'}:
        return _extract_css_sections(lines)
    if suffix == '.py':
        return _extract_python_sections(lines)
    return []


# SECTION: File Map Builder - 각 파일별 라인 범위 요약
def generate_file_map_lines(entry: Entry) -> list[str]:
    if not entry.file_map_path:
        return ["- 추적 가능한 파일이 없습니다."]

    base = Path(entry.file_map_path)
    if not base.exists() or not base.is_dir():
        return ["- 추적 가능한 파일이 없습니다."]

    extensions = entry.file_map_extensions
    lines: list[str] = []

    for file in sorted(base.iterdir(), key=lambda f: f.name.lower()):
        # Skip root-level documentation files (CLAUDE.md or claude.md)
        if file.name.lower() in ('claude.md', 'CLAUDE.md'):
            continue
        if not file.is_file():
            continue
        if extensions and file.suffix.lower() not in extensions:
            continue

        sections = extract_sections(file)
        if not sections:
            continue

        for start, end, title, desc in sections:
            width = 4 if end >= 1000 else 3 if end >= 100 else 2
            desc_part = f" - {desc}" if desc else ''
            lines.append(f"- {file.name} {start:0{width}d}~{end:0{width}d} {title}{desc_part}")

    if not lines:
        return ["- 추적 가능한 파일이 없습니다."]
    return lines


# SECTION: Root Document Helpers - 루트 claude.md 전용 유틸
def build_directory_tree() -> list[str]:
    claude_paths = [Path(p) for p in DOCS.keys() if p != 'CLAUDE.md']
    extra_files = [Path('scripts/generate_claude_docs.py')]

    file_children: dict[Path, list[str]] = defaultdict(list)
    dir_set = {Path('.')}

    for file_path in claude_paths:
        file_children[file_path.parent].append(file_path.name)
        parent = file_path.parent
        while parent not in dir_set:
            dir_set.add(parent)
            parent = parent.parent
    for extra in extra_files:
        if extra.exists():
            file_children[extra.parent].append(extra.name)
            parent = extra.parent
            while parent not in dir_set:
                dir_set.add(parent)
                parent = parent.parent

    file_children[Path('.')].append('CLAUDE.md')

    dir_children: dict[Path, list[Path]] = defaultdict(list)
    for directory in dir_set:
        if directory == Path('.'):
            continue
        dir_children[directory.parent].append(directory)

    for key in dir_children:
        dir_children[key].sort(key=lambda p: p.name.lower())
    for key in file_children:
        file_children[key].sort(key=lambda name: name.lower())

    lines: list[str] = []

    def walk(directory: Path, prefix: str) -> None:
        entries_dirs = dir_children.get(directory, [])
        entries_files = file_children.get(directory, [])
        total = len(entries_dirs) + len(entries_files)
        for idx, child_dir in enumerate(entries_dirs, start=1):
            connector = '└──' if idx == total and not entries_files else '├──'
            lines.append(f"{prefix}{connector} {child_dir.name}/")
            next_prefix = prefix + ('    ' if connector == '└──' and not entries_files else '│   ')
            walk(child_dir, next_prefix)
        for file_index, file_name in enumerate(entries_files, start=1):
            connector = '└──' if file_index == len(entries_files) else '├──'
            lines.append(f"{prefix}{connector} {file_name}")

    lines.append('Weave_V3/')
    walk(Path('.'), '')
    return lines


def update_line_guide(lines: list[str]) -> list[str]:
    heading_positions: list[tuple[str, int]] = []
    for idx, line in enumerate(lines, start=1):
        if line.startswith('## ') and line.strip() != '## 라인 가이드':
            heading_positions.append((line[3:].strip(), idx))
    if not heading_positions:
        return lines

    ranges: list[tuple[str, int, int]] = []
    for i, (title, start) in enumerate(heading_positions):
        end = heading_positions[i + 1][1] - 1 if i + 1 < len(heading_positions) else len(lines)
        ranges.append((title, start, end))

    guide_index = next((i for i, line in enumerate(lines) if line.strip() == '## 라인 가이드'), None)
    if guide_index is None:
        return lines

    bullet_start = guide_index + 1
    bullet_end = bullet_start
    while bullet_end < len(lines) and lines[bullet_end].startswith('- '):
        bullet_end += 1

    def format_num(value: int) -> str:
        return f"{value:02d}" if value < 100 else str(value)

    new_bullets = [f"- {format_num(start)}~{format_num(end)}: {title}" for title, start, end in ranges]
    return lines[:bullet_start] + new_bullets + lines[bullet_end:]


def update_directory_block(lines: list[str]) -> list[str]:
    try:
        structure_idx = next(i for i, line in enumerate(lines) if line.strip() == '## 전체 디렉토리 구조')
        code_start = next(i for i in range(structure_idx + 1, len(lines)) if lines[i].strip() == '```')
        code_end = next(i for i in range(code_start + 1, len(lines)) if lines[i].strip() == '```')
    except StopIteration:
        return lines

    tree_lines = build_directory_tree()
    new_block = ['```'] + tree_lines + ['```']
    return lines[:code_start] + new_block + lines[code_end + 1:]


def update_root_document() -> None:
    """Update root documentation file (CLAUDE.md or claude.md for backward compatibility)"""
    path = Path('CLAUDE.md')
    if not path.exists():
        # Fallback to lowercase for backward compatibility
        path = Path('claude.md')
        if not path.exists():
            return

    lines = path.read_text(encoding='utf-8').splitlines()
    lines = update_directory_block(lines)
    lines = update_line_guide(lines)
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


# ---------------------------------------------------------------------------
# 루트 및 상위 디렉터리 문서
# ---------------------------------------------------------------------------

add(
    'CLAUDE.md',
    title='CLAUDE.md - 프로젝트 작업 허브',
    purpose=[
        '모든 claude.md 문서의 기준이 되는 중앙 허브입니다.',
        '작업 언어, 문서화 원칙, 디렉토리 흐름, 업데이트 프로토콜을 정의합니다.'
    ],
    responsibilities=[
        '문서 시스템 규칙과 라인 가이드를 제공',
        '디렉토리 지도와 하위 문서 링크를 유지',
        '업데이트 및 싱크 프로세스를 정의',
        '지원 자료와 중앙화 정책을 기록'
    ],
    structure=[
        '문서 시스템 규칙: 언어, 코드 예시 제한, 중앙화 지침을 명시',
        '디렉토리 네비게이션: src/ → src/claude.md, docs/ → docs/claude.md, public/ → public/claude.md, scripts/ → scripts/claude.md, supabase/ → supabase/claude.md',
        '업데이트 프로토콜: 디렉토리 추가·삭제 및 하위 문서 생성 시 갱신 절차',
        '지원 자료: 워크플로·스토리지·Supabase 참고 문서 연결'
    ],
    centralization=[
        '텍스트와 상수는 `@/config/brand.ts` 및 관련 설정을 단일 진실 공급원으로 사용',
        '루트 문서는 모든 하위 claude.md 업데이트 여부를 검증하는 기준 문서'
    ],
    rules=[
        '새 디렉토리를 생성하면 해당 claude.md와 루트 디렉토리 표를 즉시 갱신',
        '문서 변경 후 `npm run docs:update`로 싱크 상태를 확인',
        '중앙화 설정이 바뀌면 루트와 영향받는 문서를 동시에 수정'
    ],
    references=[
        'docs/Claude-Workflow-Framework.md',
        'docs/Claude-Workflow-Checklists.md',
        'docs/Context-Loading-System.md',
        'scripts/update-claude-docs.js'
    ]
)

add(
    'docs/claude.md',
    title='docs - 서술형 레퍼런스 허브',
    purpose=[
        '프로세스와 설계 문서를 모아 개발 의사결정을 지원합니다.',
        '자동 문서화 스크립트가 참조하는 1차 자료 저장소입니다.'
    ],
    responsibilities=[
        '워크플로, 체크리스트, 컨텍스트 로딩 규칙을 유지',
        '스토리지 및 Supabase 설계 자료를 제공',
        '위젯 설계와 목업 파일을 관리'
    ],
    structure=[
        'widget/: 위젯 관련 레퍼런스 및 목업 (→ docs/widget/claude.md)'
    ],
    centralization=[
        '프로세스·정책 문서는 docs/ 경로에서 시작하고 실행 지침은 각 claude.md가 담당'
    ],
    rules=[
        '문서를 추가하거나 갱신하면 루트 claude.md 지원 자료 목록을 업데이트',
        '`npm run docs:update`로 자동 동기화 상태를 확인'
    ],
    references=[
        'CLAUDE.md',
        'scripts/update-claude-docs.js',
        'docs/Auto-Reference-System.md'
    ]
)

add(
    'docs/widget/claude.md',
    title='docs/widget - 위젯 레퍼런스',
    purpose=[
        '대시보드 및 모바일 위젯 설계 자료와 목업을 보관합니다.',
        'UI 구현 전 필요한 정보 구조와 인터랙션 패턴을 정의합니다.'
    ],
    responsibilities=[
        '위젯 인벤토리와 상태를 문서화',
        '목업 파일과 인터랙션 노트를 관리'
    ],
    centralization=[
        '위젯 서술 정보는 docs/widget에 집중하고 실제 구현 세부는 src/components/dashboard에서 관리'
    ],
    rules=[
        '새 위젯을 추가하면 인벤토리 문서와 구현 문서를 함께 업데이트',
        '목업이 변경되면 대시보드 문서에 요약을 남김'
    ],
    references=[
        'src/components/dashboard/claude.md',
        'src/app/dashboard/claude.md',
        'src/config/brand.ts'
    ]
)

add(
    'public/claude.md',
    title='public - 정적 자산 가이드',
    purpose=[
        'Next.js가 직접 서빙하는 정적 파일을 관리합니다.',
        '브랜딩과 접근성 지침을 충족하는 자산을 유지합니다.'
    ],
    responsibilities=[
        '파비콘과 공유 이미지를 관리',
        '정적 자산 경로와 브랜드 설정을 동기화'
    ],
    centralization=[
        '모든 정적 자산은 public/에 저장하고 경로는 `@/config/brand.ts`에서 참조'
    ],
    rules=[
        '자산 추가·교체 시 빌드·캐시 전략과 접근성 텍스트를 검토',
        '불필요한 파일은 삭제하고 참조 문서를 정리'
    ],
    references=[
        'CLAUDE.md',
        'src/components/layout/claude.md',
        'src/config/brand.ts'
    ]
)

add(
    'scripts/claude.md',
    title='scripts - 유지보수 스크립트 허브',
    purpose=[
        '반복 작업과 점검을 자동화하는 스크립트를 모읍니다.',
        '스토리지 검증, 테스트, 문서 싱크를 지원합니다.'
    ],
    responsibilities=[
        'claude.md 자동 갱신과 감시 스크립트를 유지',
        '로컬 스토리지 데이터 검증과 통계 수집',
        '경량 통합 테스트와 시뮬레이션 지원'
    ],
    centralization=[
        '스크립트에서 사용하는 상수는 config 또는 환경 변수에서 주입하여 하드코딩을 방지'
    ],
    rules=[
        '새 스크립트 추가 시 목적, 실행 방법, 의존성을 파일 상단에 기록',
        '파괴적 작업에는 확인 절차와 백업 전략을 포함'
    ],
    references=[
        'CLAUDE.md',
        'docs/Claude-Workflow-Checklists.md',
        'src/lib/storage/claude.md'
    ]
)

add(
    'supabase/claude.md',
    title='supabase - 프로젝트 설정 가이드',
    purpose=[
        'Supabase 프로젝트 설정과 로컬 개발 환경 구성을 관리합니다.',
        '인증, RLS, 데이터 싱크 전략의 기준 정보를 제공합니다.'
    ],
    responsibilities=[
        'config.toml 및 CLI 설정을 유지',
        '마이그레이션 폴더와 연계하여 스키마를 관리',
        '권한 정책과 환경 구성 문서화'
    ],
    structure=[
        'migrations/: SQL 마이그레이션과 정책 문서 (→ supabase/migrations/claude.md)'
    ],
    centralization=[
        'Supabase 관련 설정과 정책은 supabase/와 `src/lib/supabase`에서만 정의'
    ],
    rules=[
        '마이그레이션 추가 시 storage·types 문서를 동기화',
        '환경 변수 변경 시 `.env.local` 예시와 문서를 업데이트'
    ],
    references=[
        'src/lib/supabase/claude.md',
        'src/lib/storage/claude.md',
        'supabase/migrations/claude.md'
    ]
)

add(
    'supabase/migrations/claude.md',
    title='supabase/migrations - SQL 마이그레이션',
    purpose=[
        'Supabase 데이터베이스 스키마 변화를 관리하는 SQL 마이그레이션 모음입니다.',
        'Storage 시스템과 1:1 매핑되는 테이블과 정책을 유지합니다.'
    ],
    responsibilities=[
        '테이블·뷰·정책 마이그레이션 정의',
        '버전 순서와 롤백 전략 기록'
    ],
    centralization=[
        '데이터베이스 스키마 변경은 이 디렉터리에서만 정의하고 수동 변경을 금지'
    ],
    rules=[
        '새 마이그레이션 작성 후 Supabase CLI로 검증',
        'Storage 타입과 구조가 일치하는지 확인',
        'RLS 정책 변경 시 인증 문서와 동기화'
    ],
    references=[
        'src/lib/storage/migrations/claude.md',
        'src/lib/types/claude.md',
        'src/lib/supabase/claude.md'
    ]
)

# ---------------------------------------------------------------------------
# src 루트 및 공용 디렉터리
# ---------------------------------------------------------------------------

add(
    'src/claude.md',
    title='src - 소스 코드 아키텍처',
    purpose=[
        '애플리케이션 실행 코드를 담당하는 루트 디렉터리입니다.',
        '도메인 분리와 중앙화 규칙을 통해 유지보수 가능한 구조를 제공합니다.'
    ],
    responsibilities=[
        'App Router 페이지, 컴포넌트, 서비스 계층을 관리',
        '타입·훅·컨텍스트를 통해 모듈 간 계약을 정의'
    ],
    structure=[
        'app/: Next.js 페이지 및 라우트 (→ src/app/claude.md)',
        'components/: 재사용 UI와 위젯 (→ src/components/claude.md)',
        'config/: 중앙화 설정 (→ src/config/claude.md)',
        'contexts/: 공유 상태 공급자 (→ src/contexts/claude.md)',
        'hooks/: 공용 React 훅 (→ src/hooks/claude.md)',
        'lib/: 서비스와 유틸리티 (→ src/lib/claude.md)',
        'types/: 전역 타입 정의 (→ src/types/claude.md)'
    ],
    centralization=[
        '절대 경로 `@/`를 사용해 의존성 경로를 명확히 유지',
        '브랜드·상수는 config 디렉터리에서만 정의'
    ],
    rules=[
        '새 도메인을 추가하면 구조 요약과 관련 문서를 갱신',
        '컨벤션 변경 시 config 및 하위 claude.md를 함께 수정'
    ],
    references=['CLAUDE.md']
)

add(
    'src/config/claude.md',
    title='src/config - 중앙 설정',
    purpose=[
        '브랜드, 경로, 레이아웃 등 전역 설정을 관리합니다.',
        '하드코딩을 방지하고 일관된 UI·문구 경험을 제공합니다.'
    ],
    responsibilities=[
        'brand.ts로 텍스트·메타데이터 정의',
        'constants.ts로 레이아웃 및 기본값 관리',
        '도메인 전용 설정 파일 유지'
    ],
    centralization=[
        '모든 텍스트·경로는 config에서 시작하여 단일 진실 공급원을 보장'
    ],
    rules=[
        '설정 변경 시 영향을 받는 컴포넌트·서비스·문서를 점검',
        '언어 키 구조(ko, en 등)를 유지'
    ],
    references=['CLAUDE.md', 'src/components/claude.md', 'src/lib/claude.md']
)

add(
    'src/contexts/claude.md',
    title='src/contexts - 컨텍스트 상태',
    purpose=[
        '페이지 간 공유가 필요한 상태를 React Context로 제공합니다.',
        '필수 범위에서만 컨텍스트를 노출해 성능을 최적화합니다.'
    ],
    responsibilities=[
        'CalendarFilterContext 등 공통 필터 상태 제공',
        'Provider와 커스텀 훅을 통해 안전한 접근 규칙 유지'
    ],
    centralization=[
        '컨텍스트 기본값과 라벨은 config 상수를 사용해 일관성을 확보'
    ],
    rules=[
        '새 컨텍스트는 타입·훅과 함께 정의하고 구조 요약을 갱신',
        'Provider 범위를 최소화하여 불필요한 렌더링을 방지'
    ],
    references=['src/claude.md', 'src/hooks/claude.md', 'src/lib/calendar-integration/claude.md']
)

add(
    'src/hooks/claude.md',
    title='src/hooks - 커스텀 훅',
    purpose=[
        'UI와 서비스가 공유하는 상태 및 비즈니스 로직을 훅 형태로 제공합니다.',
        '데이터 변환과 상호작용 패턴을 재사용 가능한 API로 캡슐화합니다.'
    ],
    responsibilities=[
        '프로젝트 테이블 등 도메인별 상태 관리',
        '서비스 데이터 가공과 오류 처리를 반환'
    ],
    centralization=[
        '훅에서 사용하는 텍스트와 상수는 config·lib 설정을 참조'
    ],
    rules=[
        '새 훅 추가 시 사용처와 문서를 동기화',
        '반환 타입과 의존성을 명확히 정의하여 타입 안전성을 유지'
    ],
    references=['src/claude.md', 'src/contexts/claude.md', 'src/lib/claude.md']
)

add(
    'src/lib/claude.md',
    title='src/lib - 서비스·유틸리티 계층',
    purpose=[
        '애플리케이션 전반에서 사용하는 서비스, 스토리지, 유틸리티 로직을 관리합니다.',
        '데이터 소스 추상화와 비즈니스 규칙을 모듈화하여 UI 계층에 제공합니다.'
    ],
    responsibilities=[
        'StorageManager와 Supabase 클라이언트 유지',
        '통합 캘린더, 문서 생성, 대시보드 유틸리티 제공',
        'Mock 데이터와 전역 상태 스토어 관리'
    ],
    structure=[
        'auth/: 인증 유틸리티 (→ src/lib/auth/claude.md)',
        'calendar-integration/: 통합 캘린더 매니저 (→ src/lib/calendar-integration/claude.md)',
        'config/: 서비스 전용 설정 (→ src/lib/config/claude.md)',
        'dashboard/: 대시보드 유틸과 애니메이션 (→ src/lib/dashboard/claude.md)',
        'document-generator/: 문서 템플릿 생성 (→ src/lib/document-generator/claude.md)',
        'hooks/: 서비스 레벨 훅 (→ src/lib/hooks/claude.md)',
        'mock/: 목 데이터 (→ src/lib/mock/claude.md)',
        'storage/: 통합 스토리지 시스템 (→ src/lib/storage/claude.md)',
        'stores/: 전역 상태 스토어 (→ src/lib/stores/claude.md)',
        'supabase/: Supabase 클라이언트 (→ src/lib/supabase/claude.md)',
        'types/: 라이브러리 전용 타입 (→ src/lib/types/claude.md)',
        'utils/: 비즈니스 유틸리티 (→ src/lib/utils/claude.md)',
        'wbs/: 미니 WBS 템플릿 (→ src/lib/wbs/claude.md)'
    ],
    centralization=[
        '외부 서비스 설정은 `.env`와 config에서 주입하고 lib 계층 내부에서 하드코딩하지 않음',
        '모듈 간 의존성은 배럴 파일 또는 명시적 export로 제한'
    ],
    rules=[
        '공통 로직을 추가할 때 기존 모듈과 책임이 중복되지 않는지 확인',
        '서비스 시그니처 변경 시 사용하는 페이지·컴포넌트와 문서를 동시에 업데이트'
    ],
    references=['src/claude.md', 'src/components/claude.md', 'supabase/claude.md']
)

add(
    'src/types/claude.md',
    title='src/types - 전역 타입',
    purpose=[
        '애플리케이션 전반에서 공유하는 TypeScript 타입을 관리합니다.',
        '도메인 엔티티와 공용 유틸 타입을 중앙에서 유지합니다.'
    ],
    responsibilities=[
        '프로젝트·클라이언트 등 도메인 엔티티 정의',
        '서비스와 UI 간 계약을 타입으로 보장'
    ],
    centralization=[
        '엔티티 스키마는 src/types에서 시작하며 다른 파일에서 재정의하지 않음'
    ],
    rules=[
        '타입 변경 시 storage·Supabase·UI 문서를 동시에 검토',
        'PascalCase 네이밍과 명확한 접두사를 유지'
    ],
    references=['src/claude.md', 'src/lib/storage/types/claude.md', 'supabase/migrations/claude.md']
)

# ---------------------------------------------------------------------------
# src/app 하위 디렉터리
# ---------------------------------------------------------------------------

add(
    'src/app/claude.md',
    title='src/app - App Router 페이지',
    purpose=[
        'Next.js 15 App Router 기반 페이지와 레이아웃을 관리합니다.',
        '인증, 대시보드, 프로젝트 등 핵심 UX 흐름을 구성합니다.'
    ],
    responsibilities=[
        '고정 페이지(홈, 로그인, 설정 등)를 렌더링',
        '프로젝트·클라이언트 관리용 마스터-디테일 뷰를 제공',
        'API 라우트와 연계되어 데이터 흐름을 제어'
    ],
    structure=[
        'api/: 서버 기능 라우트 (→ src/app/api/claude.md)',
        'auth/: OAuth 보조 페이지 (→ src/app/auth/claude.md)',
        'clients/: 클라이언트 관리 페이지 (→ src/app/clients/claude.md)',
        'components/: 컴포넌트 데모 페이지 (→ src/app/components/claude.md)',
        'dashboard/: 비즈니스 대시보드 (→ src/app/dashboard/claude.md)',
        'login/: 로그인 페이지 (→ src/app/login/claude.md)',
        'projects/: 프로젝트 관리 (→ src/app/projects/claude.md)',
        'settings/: 사용자 설정 (→ src/app/settings/claude.md)',
        'signup/: 회원가입 페이지 (→ src/app/signup/claude.md)',
        'tax-management/: 세무 일정 관리 (→ src/app/tax-management/claude.md)'
    ],
    centralization=[
        '텍스트와 라벨은 `@/config/brand.ts`에서 로드',
        '공통 UI는 `@/components` 계층에서 재사용'
    ],
    rules=[
        '새 페이지 추가 시 라우팅 구조와 관련 문서를 업데이트',
        'Server/Client 컴포넌트 사용 여부를 명확히 지정'
    ],
    references=['src/claude.md', 'src/lib/supabase/claude.md', 'src/components/claude.md']
)

add(
    'src/app/api/claude.md',
    title='src/app/api - 서버 라우트',
    purpose=[
        'App Router 기반 서버 API를 관리합니다.',
        'Supabase 인증과 데이터 동기화 기능을 노출합니다.'
    ],
    responsibilities=[
        '인증 라우트(`/auth`)를 제공',
        '향후 관리자·동기화 엔드포인트 확장 준비'
    ],
    structure=[
        'auth/: Supabase 인증 라우트 모음 (→ src/app/api/auth/claude.md)'
    ],
    centralization=[
        '응답 메시지와 상태 코드는 brand 설정과 상수를 사용'
    ],
    rules=[
        '새 API 추가 시 HTTP 메서드 책임을 문서화',
        '응답 스키마 변경 시 프런트엔드 사용처와 타입을 동기화'
    ],
    references=['src/app/claude.md', 'src/lib/supabase/claude.md', 'src/lib/storage/claude.md']
)

add(
    'src/app/api/auth/claude.md',
    title='src/app/api/auth - 인증 API',
    purpose=[
        'Supabase 기반 인증 흐름을 API 라우트로 제공합니다.',
        '로그인, 로그아웃, 회원가입, OAuth 콜백을 처리합니다.'
    ],
    responsibilities=[
        '이메일 로그인과 마이그레이션 상태 확인',
        'OAuth 콜백 및 오류 대응',
        '세션 종료와 후속 안내'
    ],
    structure=[
        'google/: Google OAuth 콜백 (→ src/app/api/auth/google/claude.md)',
        'signin/: 로그인 처리 (→ src/app/api/auth/signin/claude.md)',
        'signout/: 로그아웃 처리 (→ src/app/api/auth/signout/claude.md)',
        'signup/: 회원가입 처리 (→ src/app/api/auth/signup/claude.md)'
    ],
    centralization=[
        '응답 문구와 리디렉션 경로는 brand 설정과 상수를 사용'
    ],
    rules=[
        '오류 메시지 변경 시 UI와 문서를 업데이트',
        'OAuth 공급자 추가 시 config·UI와 동기화'
    ],
    references=['src/app/api/claude.md', 'src/lib/supabase/claude.md', 'src/app/login/claude.md']
)

add(
    'src/app/api/auth/google/claude.md',
    title='src/app/api/auth/google - Google OAuth',
    purpose=[
        'Google OAuth 콜백을 처리하여 Supabase 세션을 확정합니다.',
        '성공·실패에 따른 리디렉션과 로그를 관리합니다.'
    ],
    responsibilities=[
        'OAuth 응답 검증과 사용자 정보 추출',
        '오류 로깅 및 재시도 안내 제공'
    ],
    centralization=[
        '리디렉션 경로와 메시지는 brand 설정을 재사용'
    ],
    rules=[
        'Supabase OAuth 설정 변경 시 콜백 URL과 문서를 점검',
        '오류 경로가 `src/app/auth/auth-code-error`와 일치하는지 확인'
    ],
    references=['src/app/api/auth/claude.md', 'src/app/auth/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/app/api/auth/signin/claude.md',
    title='src/app/api/auth/signin - 로그인 API',
    purpose=[
        '이메일·비밀번호 로그인을 Supabase와 연동합니다.',
        '스토리지 마이그레이션 필요 여부를 계산해 응답합니다.'
    ],
    responsibilities=[
        '입력 검증과 오류 응답 처리',
        'migration_status 조회로 마이그레이션 플래그 반환'
    ],
    centralization=['응답 메시지는 brand 텍스트와 일치시킴'],
    rules=[
        '마이그레이션 로직 변경 시 storage 문서와 동기화',
        '로그 기록 시 민감 정보가 포함되지 않도록 주의'
    ],
    references=['src/app/api/auth/claude.md', 'src/app/login/claude.md', 'src/lib/storage/migrations/claude.md']
)

add(
    'src/app/api/auth/signout/claude.md',
    title='src/app/api/auth/signout - 로그아웃 API',
    purpose=['Supabase 세션을 종료하고 후속 UX를 안내합니다.'],
    responsibilities=['세션 종료와 오류 처리', '로컬 상태 초기화 안내 제공'],
    centralization=['메시지와 경로는 brand 설정을 사용'],
    rules=[
        '로그아웃 후 필요한 데이터 정리 절차를 UI와 일치시킴',
        '정책 변화 시 Supabase 설정과 문서를 업데이트'
    ],
    references=['src/app/api/auth/claude.md', 'src/components/layout/claude.md']
)

add(
    'src/app/api/auth/signup/claude.md',
    title='src/app/api/auth/signup - 회원가입 API',
    purpose=['Supabase 회원가입을 처리하고 확인 절차를 안내합니다.'],
    responsibilities=['입력 검증과 Supabase signUp 호출', '성공 메시지와 리디렉션 경로 제공'],
    centralization=['안내 문구는 brand.ts 구조와 동기화'],
    rules=[
        '필수 필드 변경 시 타입과 UI를 업데이트',
        '이메일 확인 정책이 바뀌면 문구와 후속 페이지를 수정'
    ],
    references=['src/app/api/auth/claude.md', 'src/app/signup/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/app/auth/claude.md',
    title='src/app/auth - 인증 보조 페이지',
    purpose=[
        'OAuth와 이메일 인증에 필요한 보조 UI를 제공합니다.',
        '콜백, 오류 안내, 로딩 상태를 관리합니다.'
    ],
    responsibilities=[
        'OAuth 콜백 경로에서 성공·실패 분기 처리',
        '오류 상황에 대한 재시도·지원 안내 제공'
    ],
    structure=[
        'auth-code-error/: 인증 오류 안내 (→ src/app/auth/auth-code-error/claude.md)',
        'callback/: OAuth 콜백 뷰 (→ src/app/auth/callback/claude.md)'
    ],
    centralization=['안내 문구와 버튼 텍스트는 brand 설정 사용'],
    rules=[
        'API 응답 구조가 변하면 조건문과 문서를 업데이트',
        '새 OAuth 공급자 추가 시 콜백 분기를 확장'
    ],
    references=['src/app/claude.md', 'src/app/api/auth/claude.md']
)

add(
    'src/app/auth/auth-code-error/claude.md',
    title='src/app/auth/auth-code-error - 인증 오류 페이지',
    purpose=[
        'OAuth 또는 이메일 인증 오류 시 사용자에게 원인을 안내합니다.',
        '재시도와 지원 경로를 제공하여 이탈을 줄입니다.'
    ],
    responsibilities=[
        '오류 코드 매핑과 사용자 친화적 메시지 표시',
        '재시도·지원 행동 버튼 제공'
    ],
    centralization=['문구와 연락처는 brand 설정과 동기화'],
    rules=[
        '오류 코드가 추가되면 brand.ts와 문서를 업데이트',
        '지원 채널 변경 시 즉시 반영'
    ],
    references=['src/app/auth/claude.md', 'src/app/api/auth/google/claude.md']
)

add(
    'src/app/auth/callback/claude.md',
    title='src/app/auth/callback - OAuth 콜백 페이지',
    purpose=[
        'OAuth 완료 후 사용자를 애플리케이션으로 되돌립니다.',
        '성공·실패 상태에 따른 피드백과 리디렉션을 처리합니다.'
    ],
    responsibilities=[
        'Supabase OAuth 응답 확인',
        '성공 시 대시보드, 실패 시 오류 페이지로 이동',
        '로딩 상태 안내 제공'
    ],
    centralization=['문구와 버튼 텍스트는 brand 설정을 사용'],
    rules=[
        '리디렉션 경로 변경 시 API 응답과 문서를 동기화',
        '애니메이션·타이밍 조정 시 접근성을 검토'
    ],
    references=['src/app/auth/claude.md', 'src/app/api/auth/google/claude.md']
)

add(
    'src/app/clients/claude.md',
    title='src/app/clients - 클라이언트 관리',
    purpose=[
        '클라이언트 목록과 상태를 관리하는 페이지입니다.',
        '프로젝트 데이터와 연동된 고객 정보를 제공합니다.'
    ],
    responsibilities=[
        '클라이언트 목록과 필터링을 제공',
        '프로젝트 상세로 이동하는 링크를 노출',
        '전역 텍스트와 레이아웃 상수를 적용'
    ],
    centralization=['라벨과 수치는 brand 및 config 상수를 사용'],
    rules=[
        '데이터 소스 변경 시 storage/서비스 문서를 갱신',
        '새 필터 추가 시 브랜드 상수와 타입을 동기화'
    ],
    references=['src/app/claude.md', 'src/components/projects/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/app/components/claude.md',
    title='src/app/components - 컴포넌트 데모 페이지',
    purpose=[
        'shadcn/ui 컴포넌트와 커스텀 요소를 시연하는 페이지입니다.',
        '디자인 시스템 검증과 QA·교육용으로 활용됩니다.'
    ],
    responsibilities=[
        '섹션별 컴포넌트 데모를 제공',
        '중앙화 텍스트와 상수 사용 상태를 검증'
    ],
    centralization=['모든 라벨·설명은 brand 설정을 사용'],
    rules=[
        '새 컴포넌트를 소개하면 관련 src/components 문서를 동기화',
        '데모 데이터는 목 데이터를 활용하여 실제 API에 영향이 없도록 유지'
    ],
    references=['src/app/claude.md', 'src/components/claude.md', 'src/config/brand.ts']
)

add(
    'src/app/dashboard/claude.md',
    title='src/app/dashboard - 비즈니스 대시보드',
    purpose=[
        '주요 지표, 일정, 할 일 등 업무 위젯을 한 화면에서 제공합니다.',
        '통합 캘린더와 스토리지 데이터를 조합합니다.'
    ],
    responsibilities=[
        '카드·차트·테이블 기반 위젯을 배치',
        '캘린더·투두 위젯과 데이터를 연동',
        '중앙화된 텍스트와 레이아웃 상수를 적용'
    ],
    centralization=['위젯 라벨은 brand 설정을 사용하고 데이터는 lib 계층에서 주입'],
    rules=[
        '위젯 추가 시 컴포넌트·서비스 문서를 업데이트',
        '레이아웃 변경 후 반응형·접근성을 검증'
    ],
    references=['src/components/dashboard/claude.md', 'src/lib/calendar-integration/claude.md', 'src/lib/storage/claude.md']
)

add(
    'src/app/login/claude.md',
    title='src/app/login - 로그인 페이지',
    purpose=[
        '이메일·비밀번호, OAuth 로그인을 위한 UI를 제공합니다.',
        'Supabase 인증 API와 상호작용합니다.'
    ],
    responsibilities=[
        '입력 폼과 검증 메시지를 관리',
        'OAuth 버튼과 비밀번호 재설정 경로를 제공'
    ],
    centralization=['라벨·오류 문구는 brand 설정 사용'],
    rules=[
        '인증 흐름 변경 시 API 문서와 UI를 동기화',
        '접근성을 위한 레이블·포커스 상태를 점검'
    ],
    references=['src/app/claude.md', 'src/app/api/auth/signin/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/app/projects/claude.md',
    title='src/app/projects - 프로젝트 관리',
    purpose=[
        '프로젝트 목록과 상세 정보를 제공하는 마스터-디테일 페이지입니다.',
        '문서 생성, 탭 기반 상세 뷰, 모달을 통해 업무 흐름을 지원합니다.'
    ],
    responsibilities=[
        '리스트·상세·헤더 구성 유지',
        'ProjectDetail 탭과 문서 생성 기능 연동',
        '중앙화 텍스트와 데이터 서비스를 활용'
    ],
    structure=[
        '[id]/: 프로젝트 상세 동적 페이지 (→ src/app/projects/[id]/claude.md)',
        'components/: 프로젝트 전용 컴포넌트 (→ src/app/projects/components/claude.md)'
    ],
    centralization=['프로젝트 관련 텍스트는 brand 설정, 데이터는 storage 서비스 사용'],
    rules=[
        '새 기능 추가 시 관련 컴포넌트·서비스 문서를 동기화',
        '동적 라우트 구조 변경 시 링크와 타입을 업데이트'
    ],
    references=['src/app/claude.md', 'src/components/projects/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/document-generator/claude.md']
)

add(
    'src/app/projects/[id]/claude.md',
    title='src/app/projects/[id] - 프로젝트 상세',
    purpose=[
        '프로젝트 ID 기반으로 상세 정보를 렌더링합니다.',
        'ProjectDetail 컴포넌트와 탭 구조를 사용합니다.'
    ],
    responsibilities=[
        'URL 파라미터로 프로젝트 데이터를 로딩',
        '탭 기반 상세 콘텐츠를 렌더링',
        '예외 상황과 리디렉션을 관리'
    ],
    centralization=['텍스트는 brand 설정, 열 정의는 lib/config/project-columns에서 사용'],
    rules=[
        '데이터 소스 변경 시 서비스 호출부와 타입을 업데이트',
        '탭 구조 변경 시 ProjectDetail 문서를 갱신'
    ],
    references=['src/app/projects/claude.md', 'src/components/projects/ProjectDetail/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/app/projects/components/claude.md',
    title='src/app/projects/components - 페이지 전용 컴포넌트',
    purpose=[
        '프로젝트 페이지에 특화된 상위 컴포넌트를 모읍니다.',
        '리스트, 헤더, 모달을 통해 사용자 흐름을 제어합니다.'
    ],
    responsibilities=[
        'ProjectsView 레이아웃 컨테이너 유지',
        'ProjectHeader 필터와 액션 제공',
        'ProjectCreateModal 생성 플로우 처리'
    ],
    structure=[
        'ProjectCreateModal/: 생성 모달 (→ src/app/projects/components/ProjectCreateModal/claude.md)',
        'ProjectHeader/: 헤더 컴포넌트 (→ src/app/projects/components/ProjectHeader/claude.md)',
        'ProjectsView/: 마스터-디테일 컨테이너 (→ src/app/projects/components/ProjectsView/claude.md)'
    ],
    centralization=['라벨과 옵션은 brand 설정, 데이터 타입은 lib/types 사용'],
    rules=[
        '컴포넌트 책임이 바뀌면 상위·하위 문서를 동기화',
        '데이터 구조 변경 시 storage 서비스와 타입을 업데이트'
    ],
    references=['src/app/projects/claude.md', 'src/components/projects/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/app/projects/components/ProjectCreateModal/claude.md',
    title='src/app/projects/components/ProjectCreateModal - 생성 모달',
    purpose=['신규 프로젝트 생성을 위한 모달과 상태 로직을 캡슐화합니다.'],
    responsibilities=['입력 검증과 제출 처리', '스토리지 또는 Supabase 서비스 호출', '성공·실패 토스트 메시지 제공'],
    centralization=['라벨과 버튼 텍스트는 brand 설정 사용'],
    rules=[
        '필드 추가 시 타입·서비스와 문서를 업데이트',
        '유효성 규칙 변경 시 안내 문구와 테스트를 갱신'
    ],
    references=['src/app/projects/components/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/document-generator/claude.md']
)

add(
    'src/app/projects/components/ProjectHeader/claude.md',
    title='src/app/projects/components/ProjectHeader - 헤더',
    purpose=['프로젝트 헤더 영역에서 필터와 액션을 제공합니다.'],
    responsibilities=['필터·정렬 옵션 노출', '생성 모달 등 CTA 트리거', '요약 지표를 표시'],
    centralization=['버튼과 통계 라벨은 brand 설정을 사용'],
    rules=[
        '액션 또는 필터가 추가되면 타입·브랜드 문구를 동기화',
        '반응형 구성 변경 시 접근성을 검토'
    ],
    references=['src/app/projects/components/claude.md', 'src/components/projects/claude.md', 'src/config/brand.ts']
)

add(
    'src/app/projects/components/ProjectsView/claude.md',
    title='src/app/projects/components/ProjectsView - 뷰 컨테이너',
    purpose=[
        '프로젝트 리스트와 상세 패널을 배치하는 컨테이너입니다.',
        '페이지네이션과 선택 상태를 조정합니다.'
    ],
    responsibilities=[
        '마스터-디테일 레이아웃을 유지',
        '페이지네이션과 선택 상태를 관리',
        '반응형 모드에서 패널 토글을 제공'
    ],
    centralization=['빈 상태와 라벨은 brand 설정을 사용'],
    rules=[
        '페이지네이션 정책 변경 시 UI와 서비스 문서를 업데이트',
        '레이아웃 수정 후 접근성과 테스트를 검증'
    ],
    references=['src/app/projects/components/claude.md', 'src/components/projects/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/app/settings/claude.md',
    title='src/app/settings - 사용자 설정',
    purpose=[
        '사용자 환경설정, 알림, 계정 정보를 관리하는 페이지입니다.'
    ],
    responsibilities=[
        '설정 섹션별 UI 구성',
        '중앙화 설정과 스토리지 연동',
        '향후 Supabase 프로필 동기화 기반 마련'
    ],
    structure=['components/: 설정 섹션 컴포넌트 (→ src/app/settings/components/claude.md)'],
    centralization=['설정 키와 기본값은 config 상수를 사용'],
    rules=[
        '새 설정 추가 시 컴포넌트·서비스·문서를 동기화',
        '데이터 저장 방식 변경 시 storage·supabase 문서를 검토'
    ],
    references=['src/app/claude.md', 'src/app/settings/components/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/app/settings/components/claude.md',
    title='src/app/settings/components - 설정 섹션',
    purpose=['설정 페이지에서 사용하는 섹션별 UI 컴포넌트를 제공합니다.'],
    responsibilities=['토글·입력·카드 등 섹션 요소 렌더링', '저장 결과를 상위에 전달'],
    centralization=['라벨과 설명은 brand 설정 사용'],
    rules=[
        '새 섹션 추가 시 관련 서비스와 문서를 작성',
        '저장 로직 변경 시 storage·supabase 문서를 갱신'
    ],
    references=['src/app/settings/claude.md', 'src/components/ui/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/app/signup/claude.md',
    title='src/app/signup - 회원가입 페이지',
    purpose=['이메일 기반 회원가입 UI와 확인 안내를 제공합니다.'],
    responsibilities=['입력 폼과 약관 동의를 관리', '성공·실패 메시지 및 추가 안내 제공'],
    centralization=['문구는 brand 설정과 동기화'],
    rules=[
        '필수 필드 변경 시 API·타입을 업데이트',
        '접근성 요소(레이블, 오류 메시지)를 검증'
    ],
    references=['src/app/claude.md', 'src/app/api/auth/signup/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/app/tax-management/claude.md',
    title='src/app/tax-management - 세무 일정 관리',
    purpose=[
        '세무 일정과 마감일을 관리하는 페이지입니다.',
        '통합 캘린더와 스토리지 데이터를 활용해 일정을 표시합니다.'
    ],
    responsibilities=[
        '세무 마감일 목록과 상태 필터를 제공',
        '캘린더 위젯과의 연동을 유지',
        '알림과 진행 상태를 시각화'
    ],
    centralization=['라벨과 상태 텍스트는 brand 설정을 사용'],
    rules=[
        '새 세무 항목을 추가하면 타입과 서비스 문서를 업데이트',
        '데이터 소스 변경 시 테스트 스크립트를 갱신'
    ],
    references=['src/app/claude.md', 'src/lib/calendar-integration/claude.md', 'src/lib/storage/services/claude.md', 'src/components/dashboard/claude.md']
)

# ---------------------------------------------------------------------------
# src/components 디렉터리
# ---------------------------------------------------------------------------

add(
    'src/components/claude.md',
    title='src/components - 재사용 UI 시스템',
    purpose=[
        'shadcn/ui 기반 컴포넌트와 맞춤형 위젯을 모아 재사용 가능한 UI 계층을 제공합니다.',
        '레이아웃, 대시보드, 프로젝트 전문 컴포넌트를 모듈화합니다.'
    ],
    responsibilities=[
        '기본 UI 프리미티브 제공',
        '대시보드·프로젝트 등 도메인 특화 컴포넌트 관리',
        '디자인 시스템과 접근성 규칙 집행'
    ],
    structure=[
        'dashboard/: 대시보드 위젯 (→ src/components/dashboard/claude.md)',
        'layout/: 전역 레이아웃 컴포넌트 (→ src/components/layout/claude.md)',
        'projects/: 프로젝트 도메인 컴포넌트 (→ src/components/projects/claude.md)',
        'ui/: shadcn/ui 확장 컴포넌트 (→ src/components/ui/claude.md)'
    ],
    centralization=['텍스트, 색상, 크기는 config 설정을 사용해 일관성 유지'],
    rules=[
        '새 컴포넌트를 추가하면 props 타입과 접근성 준수를 문서화',
        '구조 변경 시 사용하는 페이지가 깨지지 않는지 점검'
    ],
    references=['src/claude.md', 'src/app/claude.md', 'src/config/brand.ts']
)

add(
    'src/components/dashboard/claude.md',
    title='src/components/dashboard - 대시보드 컴포넌트',
    purpose=[
        '대시보드 페이지에서 사용하는 핵심 레이아웃과 위젯 컴포넌트를 제공합니다.',
        '위젯 선택, 정렬, 애니메이션을 캡슐화합니다.'
    ],
    responsibilities=[
        'ImprovedDashboard 레이아웃과 데이터 결합 유지',
        '위젯 컨테이너 및 선택 모달 제공',
        'iOS 스타일 애니메이션 적용'
    ],
    centralization=['위젯 라벨은 brand 설정, 애니메이션은 lib/dashboard를 사용'],
    rules=[
        '새 위젯 추가 시 인벤토리·문서를 함께 업데이트',
        '애니메이션 변경 시 ios-animations 문서를 갱신'
    ],
    references=['src/components/claude.md', 'src/app/dashboard/claude.md', 'src/lib/dashboard/claude.md', 'docs/widget/claude.md']
)

add(
    'src/components/layout/claude.md',
    title='src/components/layout - 레이아웃 컴포넌트',
    purpose=[
        '애플리케이션 공통 레이아웃과 네비게이션을 제공합니다.',
        '헤더, 사이드바, 푸터 등 기본 구조를 캡슐화합니다.'
    ],
    responsibilities=[
        'AppLayout을 통해 글로벌 영역을 배치',
        '브랜드 로고와 사용자 메뉴를 포함'
    ],
    centralization=['메뉴 텍스트와 로고 경로는 brand 설정 사용'],
    rules=[
        '네비게이션 구조 변경 시 모든 페이지와 문서를 검토',
        '반응형 동작과 접근성을 테스트'
    ],
    references=['src/components/claude.md', 'src/app/claude.md', 'public/claude.md']
)

add(
    'src/components/projects/claude.md',
    title='src/components/projects - 프로젝트 UI',
    purpose=[
        '프로젝트 도메인에서 재사용되는 UI 컴포넌트를 제공합니다.',
        '카드, 상세 탭, 공유 요소를 캡슐화해 페이지 간 일관성을 보장합니다.'
    ],
    responsibilities=[
        'ProjectDetail 탭 구조 제공',
        '공용 카드·정보 렌더러 관리'
    ],
    structure=[
        'ProjectDetail/: 프로젝트 상세 컴포넌트 (→ src/components/projects/ProjectDetail/claude.md)',
        'shared/: 공용 프로젝트 컴포넌트 (→ src/components/projects/shared/claude.md)'
    ],
    centralization=['텍스트는 brand 설정, 데이터 포맷은 lib 유틸을 사용'],
    rules=[
        '새 컴포넌트 추가 시 페이지와 문서를 동기화',
        '데이터 구조 변경 시 타입·서비스를 검토'
    ],
    references=['src/components/claude.md', 'src/app/projects/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/document-generator/claude.md']
)

add(
    'src/components/projects/ProjectDetail/claude.md',
    title='src/components/projects/ProjectDetail - 프로젝트 상세 컴포넌트',
    purpose=[
        '프로젝트 상세 패널의 탭 구조와 콘텐츠 렌더링을 제공합니다.',
        '계약, 청구, 문서, 설정 등 섹션을 모듈화합니다.'
    ],
    responsibilities=[
        '탭 네비게이션과 섹션 콘텐츠 렌더링',
        '문서 생성·삭제 등 액션 연동',
        '프로젝트 상태와 진행률 표시'
    ],
    centralization=['탭 이름과 콘텐츠 설명은 brand 설정을 사용'],
    rules=[
        '탭 추가·삭제 시 브랜드 텍스트, 타입, 페이지 문서를 업데이트',
        '문서 액션 로직 변경 시 document-generator와 서비스 계층을 동기화'
    ],
    references=['src/components/projects/claude.md', 'src/app/projects/[id]/claude.md', 'src/lib/document-generator/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/components/projects/shared/claude.md',
    title='src/components/projects/shared - 공용 프로젝트 컴포넌트',
    purpose=[
        '프로젝트 카드, 정보 렌더러 등 여러 페이지에서 재사용되는 UI를 제공합니다.',
        '리스트와 상세 뷰가 공유하는 시각 요소를 캡슐화합니다.'
    ],
    responsibilities=[
        'ProjectCardCustom 관리',
        'ProjectInfoRenderer 관리'
    ],
    structure=[
        'ProjectCardCustom/: 프로젝트 카드 (→ src/components/projects/shared/ProjectCardCustom/claude.md)',
        'ProjectInfoRenderer/: 정보 렌더러 (→ src/components/projects/shared/ProjectInfoRenderer/claude.md)'
    ],
    centralization=['텍스트와 배지 라벨은 brand 설정을 사용'],
    rules=[
        '카드 구조 변경 시 사용 중인 모든 페이지를 업데이트',
        '데이터 속성이 추가되면 타입과 서비스 레이어를 검토'
    ],
    references=['src/components/projects/claude.md', 'src/app/projects/claude.md', 'src/lib/storage/services/claude.md']
)

add(
    'src/components/projects/shared/ProjectCardCustom/claude.md',
    title='src/components/projects/shared/ProjectCardCustom - 프로젝트 카드',
    purpose=['프로젝트 요약 정보를 카드 형태로 표시하는 컴포넌트를 제공합니다.'],
    responsibilities=['제목·상태·금액 등 핵심 정보 렌더링', '선택 상태와 액션 버튼 지원'],
    centralization=['표시 텍스트와 색상은 brand 설정과 상수를 사용'],
    rules=[
        '데이터 필드 변경 시 타입과 서비스 레이어를 동기화',
        '스타일 변경 후 접근성과 대비를 확인'
    ],
    references=['src/components/projects/shared/claude.md', 'src/app/projects/claude.md', 'src/app/dashboard/claude.md']
)

add(
    'src/components/projects/shared/ProjectInfoRenderer/claude.md',
    title='src/components/projects/shared/ProjectInfoRenderer - 정보 렌더러',
    purpose=['프로젝트 속성을 텍스트, 배지, 아이콘으로 일관되게 렌더링합니다.'],
    responsibilities=['상태·라벨·수치 데이터 포맷팅', 'null 데이터를 안전하게 처리'],
    centralization=['텍스트와 색상 맵은 brand 설정과 상수를 사용'],
    rules=[
        '새 속성이 추가되면 타입과 매핑 로직을 업데이트',
        '색상/아이콘 정책 변경 시 브랜드 상수와 문서를 수정'
    ],
    references=['src/components/projects/shared/claude.md', 'src/components/projects/ProjectDetail/claude.md', 'src/config/brand.ts']
)

add(
    'src/components/ui/claude.md',
    title='src/components/ui - UI 프리미티브',
    purpose=[
        'shadcn/ui 기반 공통 컴포넌트와 확장 위젯을 제공합니다.',
        '버튼, 입력, 테이블 등 기본 요소를 프로젝트 스타일에 맞게 커스터마이즈합니다.'
    ],
    responsibilities=[
        '기본 UI 컴포넌트 스타일 확장',
        '접근성과 반응형 규칙 유지',
        '고급 위젯의 기반 구성 제공'
    ],
    structure=['widgets/: 복합 위젯 컬렉션 (→ src/components/ui/widgets/claude.md)'],
    centralization=['텍스트와 스타일 상수는 config에서 가져와 일관성을 유지'],
    rules=[
        '컴포넌트를 추가·수정하면 사용하는 페이지와 회귀 여부를 확인',
        '위젯 구조 변경 시 widgets 하위 문서를 동기화'
    ],
    references=['src/components/claude.md', 'src/config/brand.ts', 'src/app/components/claude.md']
)

add(
    'src/components/ui/widgets/claude.md',
    title='src/components/ui/widgets - 위젯 컬렉션',
    purpose=[
        '대시보드와 페이지에서 사용하는 복합 위젯을 모듈 단위로 제공합니다.',
        '캘린더, 투두 등 데이터 집약형 UI를 캡슐화합니다.'
    ],
    responsibilities=[
        '캘린더 위젯 구성 요소 관리',
        '투두 리스트 위젯 모듈화',
        '공통 위젯 패턴 공유'
    ],
    structure=[
        'calendar/: 캘린더 위젯 (→ src/components/ui/widgets/calendar/claude.md)',
        'todo-list/: 할 일 위젯 (→ src/components/ui/widgets/todo-list/claude.md)'
    ],
    centralization=['위젯 라벨, 날짜 포맷, 상태 텍스트는 brand 설정과 상수를 사용'],
    rules=[
        '새 위젯 추가 시 하위 claude.md를 작성하고 구조를 기록',
        '데이터 소스 변경 시 관련 서비스 문서를 동기화'
    ],
    references=['src/components/ui/claude.md', 'src/app/dashboard/claude.md', 'src/lib/calendar-integration/claude.md', 'src/lib/storage/claude.md']
)

add(
    'src/components/ui/widgets/calendar/claude.md',
    title='src/components/ui/widgets/calendar - 통합 캘린더 위젯',
    purpose=[
        '월·주·일·Agenda 뷰를 제공하는 통합 캘린더 위젯을 구성합니다.',
        '이벤트 생성, 설정, 동기화를 담당합니다.'
    ],
    responsibilities=[
        '다양한 뷰 컴포넌트 제공',
        '이벤트 상세/생성 모달과 설정 모달 관리',
        '캘린더 이벤트 훅과 서비스 연동'
    ],
    structure=[
        'components/: 캘린더 UI 구성 요소 (→ src/components/ui/widgets/calendar/components/claude.md)',
        'hooks/: 캘린더 상태 훅 (→ src/components/ui/widgets/calendar/hooks/claude.md)',
        'services/: 외부 서비스 연동 (→ src/components/ui/widgets/calendar/services/claude.md)',
        'views/: 뷰 컴포넌트 (→ src/components/ui/widgets/calendar/views/claude.md)'
    ],
    centralization=['날짜 포맷과 텍스트는 brand 및 config 상수를 사용'],
    rules=[
        '새 기능 추가 시 해당 디렉터리와 구조 요약을 갱신',
        '데이터 업데이트 로직 변경 시 calendar-integration 문서를 동기화'
    ],
    references=['src/components/ui/widgets/claude.md', 'src/lib/calendar-integration/claude.md', 'src/app/dashboard/claude.md']
)

add(
    'src/components/ui/widgets/calendar/components/claude.md',
    title='src/components/ui/widgets/calendar/components - 캘린더 UI 컴포넌트',
    purpose=['이벤트 카드, 디테일 모달, 설정 모달 등 위젯 구성 요소를 제공합니다.'],
    responsibilities=['MiniEvent, EventDetailModal, EventForm, CalendarSettingsModal 관리', '접근성과 반응형 레이아웃 유지'],
    centralization=['텍스트와 포맷은 brand 설정을 사용'],
    rules=[
        '컴포넌트 추가·삭제 시 뷰와 훅 문서를 업데이트',
        '모달 접근성(포커스 트랩, ESC 처리)을 검증'
    ],
    references=['src/components/ui/widgets/calendar/claude.md', 'src/components/ui/widgets/calendar/views/claude.md', 'src/components/ui/widgets/calendar/hooks/claude.md']
)

add(
    'src/components/ui/widgets/calendar/hooks/claude.md',
    title='src/components/ui/widgets/calendar/hooks - 캘린더 훅',
    purpose=['캘린더 위젯이 사용하는 상태 관리와 데이터 동기화 훅을 제공합니다.'],
    responsibilities=['useCalendarEvents, useCalendarSettings 등 이벤트·설정 노출', '통합 캘린더 매니저 및 Storage 이벤트 구독'],
    centralization=['필터 키와 기본 설정은 config 상수를 사용'],
    rules=[
        '이벤트 소스 변경 시 calendar-integration과 동기화',
        '훅 반환 값이 변하면 뷰·컴포넌트와 타입을 업데이트'
    ],
    references=['src/components/ui/widgets/calendar/claude.md', 'src/lib/calendar-integration/claude.md', 'src/app/dashboard/claude.md']
)

add(
    'src/components/ui/widgets/calendar/services/claude.md',
    title='src/components/ui/widgets/calendar/services - 캘린더 서비스',
    purpose=['캘린더 위젯과 외부 데이터 소스를 연결하는 서비스 모음을 제공합니다.'],
    responsibilities=['googleCalendarService 등 API 연동 로직 유지', '이벤트 동기화·삭제·업데이트 헬퍼 제공'],
    centralization=['API 키와 설정은 환경 변수와 config에서 주입'],
    rules=[
        'API 스키마 변경 시 통합 매니저와 훅·컴포넌트를 업데이트',
        '재시도·오류 처리 전략을 문서화'
    ],
    references=['src/components/ui/widgets/calendar/claude.md', 'src/lib/calendar-integration/claude.md', 'src/lib/storage/claude.md']
)

add(
    'src/components/ui/widgets/calendar/views/claude.md',
    title='src/components/ui/widgets/calendar/views - 캘린더 뷰',
    purpose=['월, 주, 일, Agenda 보기 등 캘린더 뷰 컴포넌트를 제공합니다.'],
    responsibilities=['날짜 범위 계산과 이벤트 그룹화', '스크롤 동기화 및 접근성 고려'],
    centralization=['날짜 포맷과 라벨은 config와 brand 텍스트를 사용'],
    rules=[
        '뷰 추가·삭제 시 상위 문서와 훅·서비스를 업데이트',
        '성능 문제가 발생하면 가상 스크롤 등 최적화를 검토'
    ],
    references=['src/components/ui/widgets/calendar/claude.md', 'src/components/ui/widgets/calendar/hooks/claude.md', 'src/lib/calendar-integration/claude.md']
)

add(
    'src/components/ui/widgets/todo-list/claude.md',
    title='src/components/ui/widgets/todo-list - 할 일 위젯',
    purpose=[
        '대시보드와 프로젝트 페이지에서 사용하는 할 일 위젯을 제공합니다.',
        '태스크 생성, 상태 변경, 통계를 캡슐화합니다.'
    ],
    responsibilities=[
        '태스크 목록·섹션·우선순위 관리',
        '생성·삭제·완료 처리',
        '상태 필터와 통계 표시'
    ],
    structure=[
        'components/: 할 일 컴포넌트 (→ src/components/ui/widgets/todo-list/components/claude.md)',
        'constants/: 위젯 상수 (→ src/components/ui/widgets/todo-list/constants/claude.md)',
        'hooks/: 상태 훅 (→ src/components/ui/widgets/todo-list/hooks/claude.md)',
        'types/: 위젯 타입 (→ src/components/ui/widgets/todo-list/types/claude.md)',
        'utils/: 유틸리티 함수 (→ src/components/ui/widgets/todo-list/utils/claude.md)'
    ],
    centralization=['텍스트와 상태 라벨은 brand 설정과 상수를 사용'],
    rules=[
        '태스크 구조 변경 시 타입·상수·유틸을 동시에 업데이트',
        '서비스 호출 변경 시 storage 서비스 문서를 동기화'
    ],
    references=['src/components/ui/widgets/claude.md', 'src/lib/storage/services/claude.md', 'src/app/dashboard/claude.md']
)

add(
    'src/components/ui/widgets/todo-list/components/claude.md',
    title='src/components/ui/widgets/todo-list/components - 할 일 컴포넌트',
    purpose=['할 일 목록, 항목, 헤더, 통계 카드 등 UI 컴포넌트를 제공합니다.'],
    responsibilities=['태스크 아이템 렌더링과 액션 메뉴 제공', '섹션 헤더와 통계 요약 구성'],
    centralization=['라벨과 상태 텍스트는 brand 설정을 사용'],
    rules=[
        '컴포넌트 추가 시 훅과 타입, 상수를 검토',
        '스타일 변경 후 접근성과 반응형 동작을 확인'
    ],
    references=['src/components/ui/widgets/todo-list/claude.md', 'src/components/ui/widgets/todo-list/hooks/claude.md']
)

add(
    'src/components/ui/widgets/todo-list/constants/claude.md',
    title='src/components/ui/widgets/todo-list/constants - 할 일 상수',
    purpose=['할 일 위젯에서 사용하는 상태, 필터, 컬러, 텍스트 상수를 정의합니다.'],
    responsibilities=['상태 라벨, 아이콘 매핑, 색상 팔레트 유지', '기본 섹션과 우선순위 설정 관리'],
    centralization=['텍스트는 brand 설정과 동기화하고 상수는 이 디렉터리에만 존재'],
    rules=[
        '상태·색상 정책 변경 시 UI·문서·서비스를 업데이트',
        '상수 추가 시 타입과 훅 반환값을 검토'
    ],
    references=['src/components/ui/widgets/todo-list/claude.md', 'src/components/ui/widgets/todo-list/hooks/claude.md', 'src/config/brand.ts']
)

add(
    'src/components/ui/widgets/todo-list/hooks/claude.md',
    title='src/components/ui/widgets/todo-list/hooks - 할 일 훅',
    purpose=['할 일 위젯 상태 관리, 데이터 동기화, 통계 계산을 담당하는 훅을 제공합니다.'],
    responsibilities=['태스크 로딩과 상태 업데이트', '통계 계산과 배치 업데이트 로직'],
    centralization=['상수와 타입은 constants/ 및 types/에서 가져옴'],
    rules=[
        '서비스 API 변경 시 반환 타입과 오류 처리 로직을 업데이트',
        '메모이제이션과 구독 해제가 올바르게 적용되었는지 확인'
    ],
    references=['src/components/ui/widgets/todo-list/claude.md', 'src/lib/storage/services/claude.md', 'src/components/ui/widgets/todo-list/types/claude.md']
)

add(
    'src/components/ui/widgets/todo-list/types/claude.md',
    title='src/components/ui/widgets/todo-list/types - 할 일 타입',
    purpose=['할 일 위젯에 필요한 TypeScript 타입과 인터페이스를 정의합니다.'],
    responsibilities=['태스크·섹션·통계 타입 정의', 'API/스토리지 변환을 위한 타입 도우미 제공'],
    centralization=['위젯 전용 타입은 이 디렉터리에 모아 유지'],
    rules=[
        '데이터 구조 변경 시 서비스·훅·컴포넌트를 동시에 업데이트',
        '타입 변경 후 `npm run type-check`로 검증'
    ],
    references=['src/components/ui/widgets/todo-list/claude.md', 'src/lib/storage/services/claude.md', 'src/types/claude.md']
)

add(
    'src/components/ui/widgets/todo-list/utils/claude.md',
    title='src/components/ui/widgets/todo-list/utils - 할 일 유틸리티',
    purpose=['할 일 위젯에서 사용하는 데이터 변환, 정렬, 통계 계산 유틸리티를 제공합니다.'],
    responsibilities=['태스크 필터링·그룹핑·진행률 계산', '날짜 변환과 상태 정렬 헬퍼 제공'],
    centralization=['기준 값과 라벨은 constants/와 config에서 가져옴'],
    rules=[
        '유틸 변경 시 사용하는 훅과 컴포넌트 동작을 검증',
        '복잡한 계산은 테스트 또는 예시 시나리오를 문서화'
    ],
    references=['src/components/ui/widgets/todo-list/claude.md', 'src/components/ui/widgets/todo-list/hooks/claude.md', 'src/lib/storage/services/claude.md']
)

# ---------------------------------------------------------------------------
# src/lib 하위 디렉터리
# ---------------------------------------------------------------------------

add(
    'src/lib/auth/claude.md',
    title='src/lib/auth - 인증 유틸리티',
    purpose=['인증 관련 공통 유틸리티와 세션 관리 로직을 제공합니다.'],
    responsibilities=['세션 검사와 사용자 정보 추출', '리디렉션 로직과 에러 처리 제공'],
    centralization=['인증 메시지와 경로는 brand 설정과 상수를 사용'],
    rules=[
        '세션 구조 변경 시 API·페이지·문서를 동기화',
        '보안 정책 변경 시 brand와 supabase 문서를 업데이트'
    ],
    references=['src/lib/claude.md', 'src/app/api/auth/claude.md', 'src/app/login/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/lib/calendar-integration/claude.md',
    title='src/lib/calendar-integration - 통합 캘린더 매니저',
    purpose=[
        '캘린더, 세무, 할 일 데이터를 통합 이벤트 스트림으로 관리합니다.',
        'Storage 이벤트와 CustomEvent를 구독해 실시간 동기화를 제공합니다.'
    ],
    responsibilities=[
        'IntegratedCalendarManager로 캐시·인덱싱·구독 관리',
        'events 모듈을 통해 위젯 간 동기화 구현',
        '어댑터와 데이터 소스를 통해 저장소 추상화'
    ],
    structure=[
        'adapters/: 도메인별 어댑터 (→ src/lib/calendar-integration/adapters/claude.md)',
        'data-sources/: 데이터 소스 정의 (→ src/lib/calendar-integration/data-sources/claude.md)'
    ],
    centralization=['이벤트 키와 스토리지 키는 상수로 관리하여 위젯과 일관성 유지'],
    rules=[
        '새 데이터 소스를 추가하면 어댑터와 문서를 함께 작성',
        '캐시 정책을 수정하면 영향 범위를 정리하고 테스트를 실행'
    ],
    references=['src/lib/claude.md', 'src/components/ui/widgets/calendar/claude.md', 'src/app/dashboard/claude.md', 'src/lib/storage/claude.md']
)

add(
    'src/lib/calendar-integration/adapters/claude.md',
    title='src/lib/calendar-integration/adapters - 캘린더 어댑터',
    purpose=['다양한 데이터 소스를 통합 캘린더 포맷으로 변환합니다.'],
    responsibilities=['캘린더·세무·투두 데이터를 통합 이벤트로 매핑', '저장소·API 응답을 통일된 구조로 변환'],
    centralization=['필드 이름과 매핑 규칙은 types와 상수를 기준으로 유지'],
    rules=[
        '엔티티 구조 변경 시 어댑터와 타입 정의를 업데이트',
        '새 도메인을 추가하면 어댑터 파일과 테스트를 작성'
    ],
    references=['src/lib/calendar-integration/claude.md', 'src/lib/calendar-integration/data-sources/claude.md', 'src/components/ui/widgets/calendar/claude.md', 'src/types/claude.md']
)

add(
    'src/lib/calendar-integration/data-sources/claude.md',
    title='src/lib/calendar-integration/data-sources - 데이터 소스',
    purpose=['통합 캘린더가 사용하는 데이터 소스 의존성을 정의합니다.'],
    responsibilities=['LocalStorageDataSource로 이벤트·세무·태스크 데이터를 로딩', '확장을 위한 인터페이스 기반 구조 제공'],
    centralization=['스토리지 키와 구조는 src/lib/storage 정의를 사용'],
    rules=[
        '스토리지 구조 변경 시 데이터 소스와 문서를 업데이트',
        '새 소스를 추가하면 인증·오류 처리 전략을 정의'
    ],
    references=['src/lib/calendar-integration/claude.md', 'src/lib/storage/claude.md', 'src/components/ui/widgets/calendar/claude.md']
)

add(
    'src/lib/config/claude.md',
    title='src/lib/config - 서비스 설정',
    purpose=['라이브러리 계층에서 사용하는 도메인별 설정과 매핑을 정의합니다.'],
    responsibilities=['project-columns 등 도메인 구성 유지'],
    centralization=['설정 값은 lib/config에서 관리하고 외부에서 재정의하지 않음'],
    rules=['설정 변경 시 UI와 서비스가 일치하는지 확인'],
    references=['src/lib/claude.md', 'src/app/projects/claude.md', 'src/config/claude.md']
)

add(
    'src/lib/dashboard/claude.md',
    title='src/lib/dashboard - 대시보드 서비스',
    purpose=['대시보드 위젯을 위한 데이터 헬퍼, 레이아웃 유틸, 애니메이션 프리셋을 제공합니다.'],
    responsibilities=['grid-utils로 반응형 레이아웃 계산', 'widget-defaults로 초깃값 제공', 'ios-animations로 모션 프리셋 노출'],
    structure=['ios-animations/: 애니메이션 설정 (→ src/lib/dashboard/ios-animations/claude.md)'],
    centralization=['레이아웃과 애니메이션 상수는 이 디렉터리에서만 정의'],
    rules=[
        '위젯 레이아웃 변경 시 grid 유틸과 기본값을 검토',
        '애니메이션 추가 시 ios-animations와 컴포넌트 문서를 업데이트'
    ],
    references=['src/lib/claude.md', 'src/components/dashboard/claude.md', 'src/app/dashboard/claude.md']
)

add(
    'src/lib/dashboard/ios-animations/claude.md',
    title='src/lib/dashboard/ios-animations - 대시보드 애니메이션',
    purpose=['대시보드에서 사용하는 iOS 스타일 애니메이션 설정과 시퀀스를 관리합니다.'],
    responsibilities=['타이밍, easing, keyframe 설정 제공', '위젯 전환·등장 애니메이션 정의'],
    centralization=['애니메이션 상수는 ios-animations 디렉터리에 집중'],
    rules=[
        '애니메이션 변경 후 UI 회귀 테스트를 수행',
        '성능 영향을 모니터링하고 필요 시 경량 옵션을 제공'
    ],
    references=['src/lib/dashboard/claude.md', 'src/components/dashboard/claude.md', 'src/config/brand.ts']
)

add(
    'src/lib/document-generator/claude.md',
    title='src/lib/document-generator - 문서 생성기',
    purpose=['프로젝트 문서(계약, 견적, 청구 등)를 생성하는 헬퍼를 제공합니다.'],
    responsibilities=['템플릿 카테고리 매핑과 데이터 주입', '생성 결과를 UI와 서비스에서 재사용 가능하게 반환'],
    centralization=['템플릿 메타데이터는 문서 생성기에서 정의하고 문자열은 brand 설정과 동기화'],
    rules=[
        '템플릿 추가 시 카테고리 매핑과 브랜드 텍스트를 업데이트',
        '생성 결과 구조가 변경되면 UI와 서비스 문서를 수정'
    ],
    references=['src/lib/claude.md', 'src/app/projects/claude.md', 'src/components/projects/ProjectDetail/claude.md']
)

add(
    'src/lib/hooks/claude.md',
    title='src/lib/hooks - 라이브러리 훅',
    purpose=['서비스 계층에서 사용하는 커스텀 훅을 정의합니다.'],
    responsibilities=['프로젝트 테이블 데이터 변환', '서비스 통합 로직을 재사용 가능한 API로 제공'],
    centralization=['텍스트와 설정은 lib/config와 brand를 사용'],
    rules=['새 훅 추가 시 상위 문서 구조를 갱신하고 사용처를 점검'],
    references=['src/lib/claude.md', 'src/app/projects/claude.md', 'src/lib/config/claude.md']
)

add(
    'src/lib/mock/claude.md',
    title='src/lib/mock - 목 데이터',
    purpose=['개발·테스트 중 사용할 목 데이터와 생성기를 제공합니다.'],
    responsibilities=['프로젝트·클라이언트·문서 등 도메인별 목 데이터를 생성', 'UI 검증을 위한 샘플 데이터를 유지'],
    centralization=['목 데이터는 src/lib/mock에서 관리하여 중복 생성을 방지'],
    rules=[
        '실제 데이터 스키마가 변경되면 목 데이터도 동일하게 업데이트',
        '민감 정보가 포함되지 않도록 주의'
    ],
    references=['src/lib/claude.md', 'src/app/projects/claude.md', 'src/components/ui/claude.md']
)

add(
    'src/lib/storage/claude.md',
    title='src/lib/storage - 통합 스토리지 시스템',
    purpose=['LocalStorage와 향후 Supabase 동기화를 위한 통합 스토리지 레이어를 제공합니다.',
             'StorageManager, 서비스, 어댑터, 타입, 마이그레이션을 한 체계로 관리합니다.'],
    responsibilities=['StorageManager와 이벤트 시스템 유지', '도메인 서비스 및 마이그레이션 관리', '성능 모니터링 유틸 제공'],
    structure=[
        '__tests__/: 통합 테스트 (→ src/lib/storage/__tests__/claude.md)',
        'adapters/: 스토리지 어댑터 (→ src/lib/storage/adapters/claude.md)',
        'core/: StorageManager 코어 (→ src/lib/storage/core/claude.md)',
        'migrations/: 버전 관리 (→ src/lib/storage/migrations/claude.md)',
        'migrations/__tests__/: 마이그레이션 테스트 (→ src/lib/storage/migrations/__tests__/claude.md)',
        'monitoring/: 성능 모니터링 (→ src/lib/storage/monitoring/claude.md)',
        'services/: 도메인 서비스 (→ src/lib/storage/services/claude.md)',
        'services/__tests__/: 서비스 테스트 (→ src/lib/storage/services/__tests__/claude.md)',
        'types/: 엔티티 타입 (→ src/lib/storage/types/claude.md)',
        'types/entities/: 엔티티 세부 타입 (→ src/lib/storage/types/entities/claude.md)',
        'utils/: 성능 유틸 (→ src/lib/storage/utils/claude.md)'
    ],
    centralization=['스토리지 키·버전·엔티티 스키마는 storage 계층에서만 정의'],
    rules=[
        '엔티티 구조 변경 시 types·services·migrations를 함께 업데이트',
        '새 어댑터 추가 시 문서와 테스트를 작성'
    ],
    references=['src/lib/claude.md', 'src/lib/supabase/claude.md', 'src/app/projects/claude.md', 'supabase/migrations/claude.md']
)

add(
    'src/lib/storage/__tests__/claude.md',
    title='src/lib/storage/__tests__ - 스토리지 테스트',
    purpose=['StorageManager와 서비스 시나리오를 검증하는 테스트를 보관합니다.'],
    responsibilities=['CRUD·버전 업그레이드·이벤트 브로드캐스트 테스트', '성능·페일오버 회귀 방지'],
    centralization=['테스트 시나리오는 이 디렉터리에서 관리'],
    rules=['새 서비스·어댑터 추가 시 대응 테스트 작성', '마이그레이션 변경 후 회귀 테스트 실행'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/storage/migrations/claude.md']
)

add(
    'src/lib/storage/adapters/claude.md',
    title='src/lib/storage/adapters - 스토리지 어댑터',
    purpose=['StorageManager가 다양한 저장소를 사용할 수 있도록 추상화합니다.'],
    responsibilities=['LocalStorageAdapter로 브라우저 CRUD 지원', '향후 Supabase 등 확장 지점 마련'],
    centralization=['스토리지 키와 버전은 core와 types 정의를 사용'],
    rules=['새 어댑터 추가 시 인터페이스 구현·테스트·문서를 작성', '스토리지 API 변경 시 어댑터와 코어를 동기화'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/core/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/supabase/claude.md']
)

add(
    'src/lib/storage/core/claude.md',
    title='src/lib/storage/core - StorageManager 코어',
    purpose=['StorageManager, 이벤트 시스템, 캐시, 트랜잭션 등 핵심 로직을 제공합니다.'],
    responsibilities=['CRUD·구독·트랜잭션 처리', '이벤트 브로드캐스트와 캐시·인덱싱 유지'],
    centralization=['스토리지 키·버전·이벤트 이름은 상수로 정의'],
    rules=['API 시그니처 변경 시 서비스·어댑터·테스트를 업데이트', '캐시·트랜잭션 수정 후 성능과 레이스 컨디션을 검토'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/adapters/claude.md', 'src/lib/storage/services/claude.md', 'src/lib/storage/monitoring/claude.md']
)

add(
    'src/lib/storage/migrations/claude.md',
    title='src/lib/storage/migrations - 스토리지 마이그레이션',
    purpose=['StorageManager 버전 업그레이드와 Supabase 이전을 위한 마이그레이션 로직을 제공합니다.'],
    responsibilities=['MigrationManager로 실행 순서를 관리', 'SafeMigrationManager로 롤백과 백업 수행'],
    structure=['__tests__/: 마이그레이션 테스트 (→ src/lib/storage/migrations/__tests__/claude.md)'],
    centralization=['버전 번호와 마이그레이션 매핑은 migrations에서만 정의'],
    rules=['새 마이그레이션 추가 시 버전과 등록 정보를 업데이트', 'Supabase 스키마 변경 시 v2-to-supabase와 SQL 마이그레이션을 동기화'],
    references=['src/lib/storage/claude.md', 'supabase/migrations/claude.md', 'src/lib/storage/types/claude.md']
)

add(
    'src/lib/storage/migrations/__tests__/claude.md',
    title='src/lib/storage/migrations/__tests__ - 마이그레이션 테스트',
    purpose=['마이그레이션 단계가 의도한 대로 작동하는지 검증합니다.'],
    responsibilities=['업그레이드·롤백 시나리오 테스트', '실패 케이스와 복구 절차 검증'],
    centralization=['마이그레이션 테스트는 이 디렉터리에서 관리'],
    rules=['새 마이그레이션 추가 시 대응 테스트 작성', '테스트 실행 후 데이터 상태를 검증'],
    references=['src/lib/storage/migrations/claude.md', 'src/lib/storage/core/claude.md', 'supabase/migrations/claude.md']
)

add(
    'src/lib/storage/monitoring/claude.md',
    title='src/lib/storage/monitoring - 스토리지 모니터링',
    purpose=['스토리지 성능과 상태를 추적하는 모니터링 유틸리티를 제공합니다.'],
    responsibilities=['히트율·응답 시간·오류 카운터 등을 측정'],
    centralization=['메트릭 키와 로깅 전략은 monitoring 디렉터리에서 정의'],
    rules=['새 메트릭 추가 시 대시보드나 로깅 시스템과 연계를 검토', '성능 개선 후 지표 변화를 문서화'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/utils/claude.md', 'src/components/dashboard/claude.md']
)

add(
    'src/lib/storage/services/claude.md',
    title='src/lib/storage/services - 도메인 서비스',
    purpose=['StorageManager 위에서 동작하는 도메인별 CRUD 서비스를 제공합니다.'],
    responsibilities=['BaseService 패턴으로 공통 로직 제공', 'User·Project·Client 등 도메인 서비스 구현'],
    structure=['__tests__/: 서비스 테스트 (→ src/lib/storage/services/__tests__/claude.md)'],
    centralization=['서비스명과 스토리지 키는 types·core 정의를 따름'],
    rules=['도메인 스키마 변경 시 서비스·타입·마이그레이션·문서를 동기화', '성능 최적화 후 모니터링·테스트를 업데이트'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/types/claude.md', 'src/lib/storage/core/claude.md', 'src/app/projects/claude.md']
)

add(
    'src/lib/storage/services/__tests__/claude.md',
    title='src/lib/storage/services/__tests__ - 서비스 테스트',
    purpose=['도메인 서비스의 CRUD·필터·동기화 로직을 검증하는 테스트를 제공합니다.'],
    responsibilities=['서비스별 생성·업데이트·삭제·동기화 시나리오 테스트', '이벤트 브로드캐스트와 구독 처리 검증'],
    centralization=['서비스 테스트는 이 디렉터리에서 관리'],
    rules=['서비스 로직 변경 시 대응 테스트를 업데이트', '테스트 데이터는 목 데이터를 활용'],
    references=['src/lib/storage/services/claude.md', 'src/lib/storage/__tests__/claude.md', 'src/lib/storage/types/claude.md']
)

add(
    'src/lib/storage/types/claude.md',
    title='src/lib/storage/types - 스토리지 타입 시스템',
    purpose=['스토리지 엔티티와 서비스가 공유하는 타입 선언과 검증 스키마를 제공합니다.'],
    responsibilities=['엔티티 스키마와 DTO·필터·응답 타입 정의', 'entities/ 하위에서 도메인별 타입 관리'],
    structure=['entities/: 엔티티 세부 타입 (→ src/lib/storage/types/entities/claude.md)'],
    centralization=['엔티티 구조와 검증 규칙은 storage types에서만 정의'],
    rules=['엔티티 변경 시 서비스·마이그레이션·UI 문서를 갱신', '런타임 검증과 타입이 일치하는지 확인'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/services/claude.md', 'supabase/migrations/claude.md', 'src/types/claude.md']
)

add(
    'src/lib/storage/types/entities/claude.md',
    title='src/lib/storage/types/entities - 엔티티 타입',
    purpose=['각 도메인 엔티티(User, Project, Client 등)의 타입과 스키마를 정의합니다.'],
    responsibilities=['엔티티별 타입·검증 스키마·기본값 정의', 'Supabase와 StorageManager가 호환되는 구조 제공'],
    centralization=['엔티티 구조는 entities 디렉터리에서만 정의하고 외부에서 재정의하지 않음'],
    rules=['엔티티 필드 변경 시 서비스·마이그레이션·UI 문서를 업데이트', 'Supabase 스키마와 구조가 일치하는지 검증'],
    references=['src/lib/storage/types/claude.md', 'src/lib/storage/services/claude.md', 'supabase/migrations/claude.md']
)

add(
    'src/lib/storage/utils/claude.md',
    title='src/lib/storage/utils - 스토리지 유틸리티',
    purpose=['스토리지 시스템의 성능 최적화와 공통 연산을 담당하는 유틸리티를 제공합니다.'],
    responsibilities=['캐시·인덱스·압축 등 성능 개선 유틸 유지', '이벤트 브리지와 에러 헨들링 헬퍼 제공'],
    centralization=['성능 관련 상수와 정책은 utils 디렉터리에서 정의'],
    rules=['유틸 변경 후 서비스와 테스트를 업데이트', '성능 개선 수치를 문서화하고 모니터링과 비교'],
    references=['src/lib/storage/claude.md', 'src/lib/storage/monitoring/claude.md', 'src/lib/storage/core/claude.md']
)

add(
    'src/lib/stores/claude.md',
    title='src/lib/stores - 전역 스토어',
    purpose=['위젯과 페이지에서 공유하는 전역 상태 스토어를 정의합니다.'],
    responsibilities=['useImprovedDashboardStore 등 전역 상태 관리', '로컬 스토리지 동기화와 UI 업데이트 지원'],
    centralization=['상태 기본값과 상수는 config에서 가져와 일관성 유지'],
    rules=['상태 구조 변경 시 사용하는 컴포넌트와 문서를 동시에 업데이트', '퍼시스턴스 전략 변경 시 storage 서비스와 동기화'],
    references=['src/lib/claude.md', 'src/components/dashboard/claude.md', 'src/lib/calendar-integration/claude.md', 'src/config/brand.ts']
)

add(
    'src/lib/supabase/claude.md',
    title='src/lib/supabase - Supabase 클라이언트',
    purpose=['Supabase 인증 및 데이터 접근을 위한 클라이언트를 제공합니다.', '서버·클라이언트 런타임 맞춤 헬퍼와 미들웨어를 관리합니다.'],
    responsibilities=['client.ts로 브라우저 클라이언트 생성', 'server.ts로 서버용 클라이언트 제공', 'middleware.ts로 보호 라우트 구현'],
    centralization=['Supabase URL과 키는 환경 변수로 주입하고 코드에 하드코딩하지 않음'],
    rules=['Supabase 버전 업데이트 시 클라이언트 설정을 우선 조정', '인증 정책 변경 시 middleware와 페이지·문서를 동기화'],
    references=['src/lib/claude.md', 'supabase/claude.md', 'src/app/api/auth/claude.md', 'src/lib/storage/claude.md']
)

add(
    'src/lib/types/claude.md',
    title='src/lib/types - 라이브러리 타입',
    purpose=['라이브러리 계층에서 사용하는 도메인별 타입을 정의합니다.'],
    responsibilities=['project-table, settings, theme 타입 정의'],
    centralization=['라이브러리 전용 타입은 src/lib/types에서 관리'],
    rules=['타입 변경 시 사용 중인 서비스와 컴포넌트를 동기화', '새 타입 추가 시 상위 문서를 갱신'],
    references=['src/lib/claude.md', 'src/app/projects/claude.md', 'src/lib/config/claude.md']
)

add(
    'src/lib/utils/claude.md',
    title='src/lib/utils - 비즈니스 유틸리티',
    purpose=['비즈니스 계산과 공통 로직을 담당하는 유틸리티 함수를 제공합니다.'],
    responsibilities=['revenue-calculator 등 재무 지표 계산', '공통 연산 로직 재사용'],
    centralization=['계산에 필요한 상수는 config에서 주입하여 하드코딩을 방지'],
    rules=['유틸 변경 시 사용하는 컴포넌트와 서비스를 업데이트', '입력·출력 타입을 명확히 정의'],
    references=['src/lib/claude.md', 'src/components/dashboard/claude.md', 'src/config/brand.ts']
)

add(
    'src/lib/wbs/claude.md',
    title='src/lib/wbs - 미니 WBS 템플릿',
    purpose=['프로젝트 미니 WBS 템플릿을 제공합니다.', '문서 생성과 프로젝트 계획 기능에서 재사용할 구조를 정의합니다.'],
    responsibilities=['섹션·태스크·마일스톤 기본 구조 제공'],
    centralization=['WBS 텍스트와 구조는 wbs 디렉터리에서 정의하고 brand 텍스트와 동기화'],
    rules=['템플릿 변경 시 문서 생성기와 프로젝트 페이지 문서를 업데이트', '새 템플릿 추가 시 상위 문서를 갱신'],
    references=['src/lib/claude.md', 'src/lib/document-generator/claude.md', 'src/app/projects/claude.md']
)



# SECTION: Document Builder - claude.md 템플릿 생성
def build_lines(entry: Entry) -> list[str]:
    file_map_lines = generate_file_map_lines(entry)
    sections = [
        ("디렉토리 목적", [*entry.purpose]),
        ("핵심 책임", [f"- {item}" for item in entry.responsibilities] if entry.responsibilities else ["- 현재 정의된 책임이 없습니다."] ),
        ("구조 요약", [f"- {item}" for item in entry.structure] if entry.structure else ["- 하위 디렉토리가 없습니다."]),
        ("파일 라인 맵", file_map_lines),
        ("중앙화·모듈화·캡슐화", [f"- {item}" for item in entry.centralization] if entry.centralization else ["- 각 모듈은 기존 중앙화 규칙을 따릅니다."]),
        ("작업 규칙", [f"- {item}" for item in entry.rules] if entry.rules else ["- 변경 시 관련 claude.md와 설정을 함께 점검합니다."]),
        ("관련 문서", [f"- {item}" for item in entry.references] if entry.references else ["- claude.md"]),
    ]

    lines: list[str] = []
    lines.append(f"# {entry.title}")
    lines.append("")
    lines.append("## 라인 가이드")
    placeholder_keys: list[str] = []
    for idx, (heading, _) in enumerate(sections):
        token = f"__LG{idx}__"
        placeholder_keys.append(token)
        lines.append(f"- {token}: {heading}")
    lines.append("")

    for heading, body in sections:
        lines.append(f"## {heading}")
        lines.extend(body)
        lines.append("")

    while lines and lines[-1] == "":
        lines.pop()
    lines.append("")

    # Compute line ranges
    heading_positions: list[int] = []
    for idx, line in enumerate(lines, start=1):
        if line.startswith("## ") and line != "## 라인 가이드":
            heading_positions.append(idx)
    total_lines = len(lines)
    ranges: list[tuple[int, int]] = []
    for i, start in enumerate(heading_positions):
        end = heading_positions[i + 1] - 1 if i + 1 < len(heading_positions) else total_lines
        ranges.append((start, end))

    width = 2 if total_lines < 100 else 3 if total_lines < 1000 else 4
    replacements = [f"{start:0{width}d}~{end:0{width}d}" for start, end in ranges]

    for token, value in zip(placeholder_keys, replacements):
        for idx, line in enumerate(lines):
            if token in line:
                lines[idx] = line.replace(token, value)
    return lines


# SECTION: File Writer - claude.md 파일 저장
def write_entry(path: Path, entry: Entry) -> None:
    lines = build_lines(entry)
    text = "\n".join(lines)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')


# SECTION: CLI Entry Point - 스크립트 실행 지점
def main() -> None:
    for path_str in sorted(DOCS.keys()):
        if path_str == 'CLAUDE.md':
            continue
        write_entry(Path(path_str), DOCS[path_str])
    update_root_document()


if __name__ == "__main__":
    main()
