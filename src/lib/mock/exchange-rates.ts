/**
 * 환율 데이터 Mock 시스템
 *
 * USD/KRW 환율 데이터를 제공합니다.
 * 실제 서비스에서는 실시간 환율 API로 대체해야 합니다.
 */

export interface ExchangeRate {
  date: string;
  rates: {
    USD_TO_KRW: number;
    KRW_TO_USD: number;
  };
}

/**
 * Mock 환율 데이터 (2024-2025년 월별)
 * 실제 환율을 참고한 가상 데이터입니다.
 */
const MOCK_EXCHANGE_RATES: Record<string, number> = {
  // 2024년
  '2024-01': 1320,
  '2024-02': 1330,
  '2024-03': 1340,
  '2024-04': 1350,
  '2024-05': 1360,
  '2024-06': 1370,
  '2024-07': 1380,
  '2024-08': 1375,
  '2024-09': 1365,
  '2024-10': 1355,
  '2024-11': 1345,
  '2024-12': 1335,

  // 2025년
  '2025-01': 1325,
  '2025-02': 1315,
  '2025-03': 1305,
  '2025-04': 1295,
  '2025-05': 1285,
  '2025-06': 1275,
  '2025-07': 1265,
  '2025-08': 1270,
  '2025-09': 1280,
  '2025-10': 1290,
  '2025-11': 1300,
  '2025-12': 1310,
};

/**
 * 기본 환율 (현재 시점 기준)
 */
const DEFAULT_RATE = 1300;

/**
 * 특정 날짜의 USD → KRW 환율을 가져옵니다.
 *
 * @param date - 날짜 문자열 (YYYY-MM-DD 또는 YYYY-MM 형식)
 * @returns USD를 KRW로 환산하는 환율
 *
 * @example
 * ```typescript
 * getExchangeRate('2024-03-15')  // 1340
 * getExchangeRate('2024-03')     // 1340
 * ```
 */
export function getExchangeRate(date: string): number {
  // YYYY-MM-DD 형식에서 YYYY-MM 추출
  const yearMonth = date.substring(0, 7);

  return MOCK_EXCHANGE_RATES[yearMonth] || DEFAULT_RATE;
}

/**
 * USD 금액을 KRW로 변환합니다.
 *
 * @param usdAmount - USD 금액
 * @param date - 기준 날짜 (환율 적용)
 * @returns KRW로 변환된 금액
 *
 * @example
 * ```typescript
 * convertUSDToKRW(1000, '2024-03-15')  // 1340000
 * ```
 */
export function convertUSDToKRW(usdAmount: number, date: string): number {
  const rate = getExchangeRate(date);
  return Math.round(usdAmount * rate);
}

/**
 * KRW 금액을 USD로 변환합니다.
 *
 * @param krwAmount - KRW 금액
 * @param date - 기준 날짜 (환율 적용)
 * @returns USD로 변환된 금액
 *
 * @example
 * ```typescript
 * convertKRWToUSD(1340000, '2024-03-15')  // 1000
 * ```
 */
export function convertKRWToUSD(krwAmount: number, date: string): number {
  const rate = getExchangeRate(date);
  return Math.round(krwAmount / rate * 100) / 100;  // 소수점 2자리
}

/**
 * 모든 통화를 KRW 기준으로 통일합니다.
 *
 * @param amount - 금액
 * @param currency - 통화 단위 ('KRW' | 'USD')
 * @param date - 기준 날짜 (환율 적용)
 * @returns KRW로 변환된 금액
 *
 * @example
 * ```typescript
 * normalizeToKRW(50000000, 'KRW', '2024-03-15')  // 50000000
 * normalizeToKRW(50000, 'USD', '2024-03-15')     // 67000000
 * ```
 */
export function normalizeToKRW(
  amount: number,
  currency: 'KRW' | 'USD',
  date: string
): number {
  if (currency === 'USD') {
    return convertUSDToKRW(amount, date);
  }
  return amount;
}

/**
 * 현재 날짜의 환율을 가져옵니다.
 *
 * @returns 현재 USD/KRW 환율
 */
export function getCurrentExchangeRate(): number {
  const today = new Date().toISOString().substring(0, 7);
  return getExchangeRate(today);
}
