/**
 * 색상 팔레트 시스템
 * 사용자가 선택할 수 있는 다양한 색상 테마를 제공합니다.
 */

export type ColorPalette = {
  name: string
  description: string
  colors: {
    // 시맨틱 상태 색상
    success: { hsl: string; foreground: string }
    warning: { hsl: string; foreground: string }
    error: { hsl: string; foreground: string }
    info: { hsl: string; foreground: string }

    // 프로젝트 상태 색상
    projectReview: { hsl: string; foreground: string }
    projectComplete: { hsl: string; foreground: string }
    projectCancelled: { hsl: string; foreground: string }
    projectPlanning: { hsl: string; foreground: string }
    projectOnhold: { hsl: string; foreground: string }
    projectInprogress: { hsl: string; foreground: string }
  }
}

// 연한 팔레트 (기본)
export const softPalette: ColorPalette = {
  name: 'soft',
  description: '부드럽고 연한 파스텔 톤의 색상',
  colors: {
    // 시맨틱 상태 색상
    success: { hsl: '142 50% 68%', foreground: '0 0% 20%' },
    warning: { hsl: '38 65% 70%', foreground: '0 0% 20%' },
    error: { hsl: '0 60% 75%', foreground: '0 0% 100%' },
    info: { hsl: '210 60% 75%', foreground: '0 0% 20%' },

    // 프로젝트 상태 색상
    projectReview: { hsl: '48 65% 75%', foreground: '0 0% 20%' },
    projectComplete: { hsl: '142 50% 68%', foreground: '0 0% 20%' },
    projectCancelled: { hsl: '0 60% 75%', foreground: '0 0% 100%' },
    projectPlanning: { hsl: '0 0% 82%', foreground: '0 0% 30%' },
    projectOnhold: { hsl: '25 65% 72%', foreground: '0 0% 20%' },
    projectInprogress: { hsl: '217 60% 75%', foreground: '0 0% 20%' }
  }
}

// 선명한 팔레트
export const vividPalette: ColorPalette = {
  name: 'vivid',
  description: '선명하고 강렬한 색상',
  colors: {
    // 시맨틱 상태 색상
    success: { hsl: '142 76% 36%', foreground: '0 0% 100%' },
    warning: { hsl: '38 92% 50%', foreground: '0 0% 100%' },
    error: { hsl: '0 84% 60%', foreground: '0 0% 100%' },
    info: { hsl: '210 100% 50%', foreground: '0 0% 100%' },

    // 프로젝트 상태 색상
    projectReview: { hsl: '48 100% 50%', foreground: '0 0% 0%' },
    projectComplete: { hsl: '142 76% 36%', foreground: '0 0% 100%' },
    projectCancelled: { hsl: '0 84% 60%', foreground: '0 0% 100%' },
    projectPlanning: { hsl: '0 0% 70%', foreground: '0 0% 100%' },
    projectOnhold: { hsl: '25 95% 53%', foreground: '0 0% 100%' },
    projectInprogress: { hsl: '217 91% 60%', foreground: '0 0% 100%' }
  }
}

// 모노톤 팔레트
export const monochromePalette: ColorPalette = {
  name: 'monochrome',
  description: '흑백 계열의 미니멀한 색상',
  colors: {
    // 시맨틱 상태 색상
    success: { hsl: '0 0% 70%', foreground: '0 0% 20%' },
    warning: { hsl: '0 0% 60%', foreground: '0 0% 100%' },
    error: { hsl: '0 0% 50%', foreground: '0 0% 100%' },
    info: { hsl: '0 0% 80%', foreground: '0 0% 20%' },

    // 프로젝트 상태 색상
    projectReview: { hsl: '0 0% 85%', foreground: '0 0% 20%' },
    projectComplete: { hsl: '0 0% 70%', foreground: '0 0% 20%' },
    projectCancelled: { hsl: '0 0% 50%', foreground: '0 0% 100%' },
    projectPlanning: { hsl: '0 0% 90%', foreground: '0 0% 30%' },
    projectOnhold: { hsl: '0 0% 75%', foreground: '0 0% 20%' },
    projectInprogress: { hsl: '0 0% 65%', foreground: '0 0% 100%' }
  }
}

// 고대비 팔레트 (접근성 최적화)
export const highContrastPalette: ColorPalette = {
  name: 'highContrast',
  description: '고대비 색상으로 접근성 향상',
  colors: {
    // 시맨틱 상태 색상
    success: { hsl: '142 90% 25%', foreground: '0 0% 100%' },
    warning: { hsl: '38 100% 35%', foreground: '0 0% 100%' },
    error: { hsl: '0 100% 40%', foreground: '0 0% 100%' },
    info: { hsl: '210 100% 35%', foreground: '0 0% 100%' },

    // 프로젝트 상태 색상
    projectReview: { hsl: '48 100% 35%', foreground: '0 0% 0%' },
    projectComplete: { hsl: '142 90% 25%', foreground: '0 0% 100%' },
    projectCancelled: { hsl: '0 100% 40%', foreground: '0 0% 100%' },
    projectPlanning: { hsl: '0 0% 40%', foreground: '0 0% 100%' },
    projectOnhold: { hsl: '25 100% 35%', foreground: '0 0% 100%' },
    projectInprogress: { hsl: '217 100% 35%', foreground: '0 0% 100%' }
  }
}

// 네이처 팔레트 (자연 색상)
export const naturePalette: ColorPalette = {
  name: 'nature',
  description: '자연에서 영감받은 편안한 색상',
  colors: {
    // 시맨틱 상태 색상
    success: { hsl: '88 45% 55%', foreground: '0 0% 20%' },      // 올리브 그린
    warning: { hsl: '30 70% 60%', foreground: '0 0% 20%' },      // 따뜻한 갈색
    error: { hsl: '15 65% 60%', foreground: '0 0% 100%' },       // 테라코타
    info: { hsl: '200 35% 60%', foreground: '0 0% 20%' },        // 스카이 블루

    // 프로젝트 상태 색상
    projectReview: { hsl: '45 55% 70%', foreground: '0 0% 20%' },       // 모래색
    projectComplete: { hsl: '88 45% 55%', foreground: '0 0% 20%' },     // 올리브 그린
    projectCancelled: { hsl: '15 65% 60%', foreground: '0 0% 100%' },   // 테라코타
    projectPlanning: { hsl: '30 15% 75%', foreground: '0 0% 30%' },     // 베이지
    projectOnhold: { hsl: '30 70% 60%', foreground: '0 0% 20%' },       // 따뜻한 갈색
    projectInprogress: { hsl: '200 35% 60%', foreground: '0 0% 20%' }   // 스카이 블루
  }
}

// 팔레트 컬렉션
export const colorPalettes = {
  soft: softPalette,
  vivid: vividPalette,
  monochrome: monochromePalette,
  highContrast: highContrastPalette,
  nature: naturePalette
}

// 기본 팔레트
export const defaultPalette = softPalette

// 팔레트 선택 함수
export function getPalette(name: keyof typeof colorPalettes): ColorPalette {
  return colorPalettes[name] || defaultPalette
}

// CSS 변수 생성 함수
export function generateCSSVariables(palette: ColorPalette): string {
  const { colors } = palette

  return `
    /* 시맨틱 상태 색상 */
    --success: ${colors.success.hsl};
    --success-foreground: ${colors.success.foreground};
    --warning: ${colors.warning.hsl};
    --warning-foreground: ${colors.warning.foreground};
    --error: ${colors.error.hsl};
    --error-foreground: ${colors.error.foreground};
    --info: ${colors.info.hsl};
    --info-foreground: ${colors.info.foreground};

    /* 프로젝트 상태 색상 */
    --project-review: ${colors.projectReview.hsl};
    --project-review-foreground: ${colors.projectReview.foreground};
    --project-complete: ${colors.projectComplete.hsl};
    --project-complete-foreground: ${colors.projectComplete.foreground};
    --project-cancelled: ${colors.projectCancelled.hsl};
    --project-cancelled-foreground: ${colors.projectCancelled.foreground};
    --project-planning: ${colors.projectPlanning.hsl};
    --project-planning-foreground: ${colors.projectPlanning.foreground};
    --project-onhold: ${colors.projectOnhold.hsl};
    --project-onhold-foreground: ${colors.projectOnhold.foreground};
    --project-inprogress: ${colors.projectInprogress.hsl};
    --project-inprogress-foreground: ${colors.projectInprogress.foreground};
  `.trim()
}