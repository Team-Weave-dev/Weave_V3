// 토큰 사용량 추적 시스템

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
  cost: number;
  timestamp: Date;
  taskType: 'extract' | 'generate';
}

export interface TokenStats {
  total: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    count: number;
  };
  byModel: Record<string, {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    count: number;
  }>;
  history: TokenUsage[];
}

// 로컬 스토리지 키
const STORAGE_KEY = 'weave-token-usage';

// 토큰 사용량 기록
export function recordTokenUsage(usage: TokenUsage) {
  try {
    const existing = getTokenHistory();
    existing.push(usage);
    
    // 최대 100개 기록 유지
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('토큰 사용량 기록 실패:', error);
  }
}

// 토큰 사용 히스토리 가져오기
export function getTokenHistory(): TokenUsage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Date 객체 복원
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('토큰 사용량 히스토리 가져오기 실패:', error);
    return [];
  }
}

// 토큰 통계 계산
export function calculateTokenStats(): TokenStats {
  const history = getTokenHistory();
  
  const stats: TokenStats = {
    total: {
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      count: 0
    },
    byModel: {},
    history: history.slice(-10) // 최근 10개만 표시
  };
  
  history.forEach(usage => {
    // 전체 통계
    stats.total.inputTokens += usage.inputTokens;
    stats.total.outputTokens += usage.outputTokens;
    stats.total.cost += usage.cost;
    stats.total.count += 1;
    
    // 모델별 통계
    if (!stats.byModel[usage.model]) {
      stats.byModel[usage.model] = {
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        count: 0
      };
    }
    
    stats.byModel[usage.model].inputTokens += usage.inputTokens;
    stats.byModel[usage.model].outputTokens += usage.outputTokens;
    stats.byModel[usage.model].cost += usage.cost;
    stats.byModel[usage.model].count += 1;
  });
  
  return stats;
}

// 토큰 히스토리 초기화
export function clearTokenHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('토큰 히스토리 초기화 실패:', error);
  }
}