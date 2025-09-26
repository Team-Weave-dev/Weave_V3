'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calculator,
  Copy,
  RotateCcw,
  History,
  DollarSign,
  Receipt,
  Coins,
  TrendingDown,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import { 
  TaxType, 
  CalculationMode
} from '@/types/dashboard';
import type { 
  TaxCalculatorWidgetProps, 
  TaxCalculation 
} from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

// 세금 계산기 클래스
class TaxCalculator {
  // ID 생성 헬퍼
  private static generateId(): string {
    return `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 공급가액 기준 계산
  static calculateFromSupply(
    supplyAmount: number,
    taxType: TaxType
  ): TaxCalculation {
    let taxRate = 0;
    let taxAmount = 0;
    let totalAmount = 0;
    let netAmount = 0;

    switch (taxType) {
      case TaxType.VAT:
        taxRate = 10;
        taxAmount = supplyAmount * 0.1;
        totalAmount = supplyAmount + taxAmount;
        break;

      case TaxType.WITHHOLDING_3_3:
        taxRate = 3.3;
        taxAmount = supplyAmount * 0.033;
        netAmount = supplyAmount - taxAmount;
        totalAmount = supplyAmount;
        break;

      case TaxType.WITHHOLDING_8_8:
        taxRate = 8.8;
        taxAmount = supplyAmount * 0.088;
        netAmount = supplyAmount - taxAmount;
        totalAmount = supplyAmount;
        break;

      default:
        break;
    }

    return {
      id: this.generateId(),
      timestamp: new Date(),
      inputAmount: supplyAmount,
      taxType,
      taxRate,
      calculationMode: CalculationMode.FROM_SUPPLY,
      supplyAmount,
      taxAmount: Math.round(taxAmount),
      totalAmount: Math.round(totalAmount),
      netAmount: netAmount ? Math.round(netAmount) : undefined
    };
  }

  // 총액 기준 역산
  static calculateFromTotal(
    totalAmount: number,
    taxType: TaxType
  ): TaxCalculation {
    let taxRate = 0;
    let supplyAmount = 0;
    let taxAmount = 0;
    let netAmount = 0;

    switch (taxType) {
      case TaxType.VAT:
        taxRate = 10;
        supplyAmount = totalAmount / 1.1;
        taxAmount = totalAmount - supplyAmount;
        break;

      case TaxType.WITHHOLDING_3_3:
        taxRate = 3.3;
        // 총액 기준일 때 총액 = 실수령액
        netAmount = totalAmount;
        supplyAmount = totalAmount / (1 - 0.033);
        taxAmount = supplyAmount - netAmount;
        totalAmount = supplyAmount;
        break;

      case TaxType.WITHHOLDING_8_8:
        taxRate = 8.8;
        // 총액 기준일 때 총액 = 실수령액
        netAmount = totalAmount;
        supplyAmount = totalAmount / (1 - 0.088);
        taxAmount = supplyAmount - netAmount;
        totalAmount = supplyAmount;
        break;

      default:
        break;
    }

    // 원천세의 경우 입력값이 실수령액이므로 inputAmount 조정
    const inputAmountValue = (taxType === TaxType.WITHHOLDING_3_3 || taxType === TaxType.WITHHOLDING_8_8) 
      ? netAmount 
      : totalAmount;

    return {
      id: this.generateId(),
      timestamp: new Date(),
      inputAmount: inputAmountValue,
      taxType,
      taxRate,
      calculationMode: CalculationMode.FROM_TOTAL,
      supplyAmount: Math.round(supplyAmount),
      taxAmount: Math.round(taxAmount),
      totalAmount: Math.round(totalAmount),
      netAmount: netAmount ? Math.round(netAmount) : undefined
    };
  }

  // 숫자 포맷팅 (천 단위 구분)
  static formatNumber(num: number): string {
    return num.toLocaleString('ko-KR');
  }
}

const TaxCalculatorWidget: React.FC<TaxCalculatorWidgetProps> = ({
  title,
  defaultTaxType = TaxType.VAT,
  calculationMode: defaultMode = CalculationMode.FROM_SUPPLY,
  showHistory = true,
  maxHistoryItems = 5,
  onCalculate,
  lang = 'ko'
}) => {
  const displayTitle = title || getWidgetText.taxCalculator.title(lang);
  const { toast } = useToast();
  
  // 상태 관리
  const [taxType, setTaxType] = useState<TaxType>(defaultTaxType);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>(defaultMode);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<TaxCalculation | null>(null);
  const [history, setHistory] = useState<TaxCalculation[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  // 결과 섹션 ref
  const resultRef = React.useRef<HTMLDivElement>(null);

  // 세금 타입별 아이콘 매핑
  const getTaxIcon = (type: TaxType) => {
    switch (type) {
      case TaxType.VAT:
        return <Receipt className="h-4 w-4" />;
      case TaxType.WITHHOLDING_3_3:
      case TaxType.WITHHOLDING_8_8:
        return <Coins className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // 세금 타입별 라벨
  const getTaxTypeLabel = (type: TaxType) => {
    switch (type) {
      case TaxType.VAT:
        return getWidgetText.taxCalculator.vat(lang);
      case TaxType.WITHHOLDING_3_3:
        return getWidgetText.taxCalculator.withholding33(lang);
      case TaxType.WITHHOLDING_8_8:
        return getWidgetText.taxCalculator.withholding88(lang);
      default:
        return '';
    }
  };

  // 계산 모드 라벨
  const getModeLabel = (mode: CalculationMode) => {
    return mode === CalculationMode.FROM_SUPPLY
      ? getWidgetText.taxCalculator.fromSupply(lang)
      : getWidgetText.taxCalculator.fromTotal(lang);
  };

  // 계산 실행
  const handleCalculate = () => {
    const amount = parseFloat(inputAmount.replace(/,/g, ''));
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "올바른 금액을 입력해주세요",
      });
      return;
    }

    let result: TaxCalculation;
    
    if (calculationMode === CalculationMode.FROM_SUPPLY) {
      result = TaxCalculator.calculateFromSupply(amount, taxType);
    } else {
      result = TaxCalculator.calculateFromTotal(amount, taxType);
    }

    setCurrentResult(result);
    
    // 히스토리에 추가
    if (showHistory) {
      setHistory(prev => [result, ...prev.slice(0, maxHistoryItems - 1)]);
    }
    
    // 콜백 실행
    onCalculate?.(result);
    
    // 결과 섹션으로 스크롤
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest'
      });
    }, 100);
  };

  // 초기화
  const handleReset = () => {
    setInputAmount('');
    setCurrentResult(null);
  };

  // 결과 복사
  const handleCopyResult = () => {
    if (!currentResult) return;

    const text = `
[세금 계산 결과]
계산 방식: ${getModeLabel(calculationMode)}
세금 종류: ${getTaxTypeLabel(taxType)}
공급가액: ${TaxCalculator.formatNumber(currentResult.supplyAmount)}원
세금액: ${TaxCalculator.formatNumber(currentResult.taxAmount)}원
총액: ${TaxCalculator.formatNumber(currentResult.totalAmount)}원
${currentResult.netAmount ? `실수령액: ${TaxCalculator.formatNumber(currentResult.netAmount)}원` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: "계산 결과가 클립보드에 복사되었습니다",
    });
  };

  // 히스토리 삭제
  const handleClearHistory = () => {
    setHistory([]);
    toast({
      title: "기록 삭제",
      description: "계산 기록이 삭제되었습니다",
    });
  };

  // Enter 키로 계산
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={typography.widget.title}>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                {displayTitle}
              </div>
            </CardTitle>
            <CardDescription className={typography.text.description}>
              {getWidgetText.taxCalculator.description(lang)}
            </CardDescription>
          </div>
          {showHistory && history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            >
              <History className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-1">
        <div className="flex flex-col h-full px-2">
          {!showHistoryPanel ? (
            <>
              {/* 입력 영역 */}
              <div className="space-y-3">
                {/* 세금 종류 선택 */}
                <div className="space-y-1.5">
                  <Label htmlFor="tax-type">세금 종류</Label>
                  <Select value={taxType} onValueChange={(value) => setTaxType(value as TaxType)}>
                    <SelectTrigger id="tax-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaxType.VAT}>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-3 w-3" />
                          {getWidgetText.taxCalculator.vat(lang)}
                        </div>
                      </SelectItem>
                      <SelectItem value={TaxType.WITHHOLDING_3_3}>
                        <div className="flex items-center gap-2">
                          <Coins className="h-3 w-3" />
                          {getWidgetText.taxCalculator.withholding33(lang)}
                        </div>
                      </SelectItem>
                      <SelectItem value={TaxType.WITHHOLDING_8_8}>
                        <div className="flex items-center gap-2">
                          <Coins className="h-3 w-3" />
                          {getWidgetText.taxCalculator.withholding88(lang)}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 계산 모드 선택 */}
                <div className="space-y-1.5">
                  <Label htmlFor="calc-mode">계산 방식</Label>
                  <Select value={calculationMode} onValueChange={(value) => setCalculationMode(value as CalculationMode)}>
                    <SelectTrigger id="calc-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CalculationMode.FROM_SUPPLY}>
                        {getWidgetText.taxCalculator.fromSupply(lang)}
                      </SelectItem>
                      <SelectItem value={CalculationMode.FROM_TOTAL}>
                        {getWidgetText.taxCalculator.fromTotal(lang)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 금액 입력 */}
                <div className="space-y-1.5">
                  <Label htmlFor="amount">
                    {calculationMode === CalculationMode.FROM_SUPPLY 
                      ? getWidgetText.taxCalculator.supplyAmount(lang)
                      : (taxType === TaxType.WITHHOLDING_3_3 || taxType === TaxType.WITHHOLDING_8_8)
                        ? getWidgetText.taxCalculator.netAmount(lang)
                        : getWidgetText.taxCalculator.totalAmount(lang)}
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    placeholder={getWidgetText.taxCalculator.placeholder(lang)}
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg"
                  />
                </div>

                {/* 버튼 그룹 */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCalculate}
                    className="flex-1"
                    disabled={!inputAmount}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {getWidgetText.taxCalculator.calculate(lang)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="px-3"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 계산 결과 */}
              {currentResult && (
                <div ref={resultRef} className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">계산 결과</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyResult}
                      className="h-7 px-2"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      복사
                    </Button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-sm text-muted-foreground">
                        {getWidgetText.taxCalculator.supplyAmount(lang)}
                      </span>
                      <span className="font-medium">
                        {TaxCalculator.formatNumber(currentResult.supplyAmount)}원
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-sm text-muted-foreground">
                        {getWidgetText.taxCalculator.taxAmount(lang)}
                      </span>
                      <span className="font-medium text-orange-500">
                        {TaxCalculator.formatNumber(currentResult.taxAmount)}원
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-0.5 pt-1.5 border-t">
                      <span className="text-sm font-medium">
                        {getWidgetText.taxCalculator.totalAmount(lang)}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {TaxCalculator.formatNumber(currentResult.totalAmount)}원
                      </span>
                    </div>
                    
                    {currentResult.netAmount !== undefined && (
                      <div className="flex justify-between items-center py-0.5 pt-1.5 border-t">
                        <span className="text-sm font-medium">
                          {getWidgetText.taxCalculator.netAmount(lang)}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {TaxCalculator.formatNumber(currentResult.netAmount)}원
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 세율 정보 */}
                  <div className="flex items-center gap-2 pt-1">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {getTaxTypeLabel(currentResult.taxType)} · 세율 {currentResult.taxRate}%
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 히스토리 패널 */
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">
                  {getWidgetText.taxCalculator.history(lang)}
                </h4>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-7 px-2 text-xs"
                  >
                    {getWidgetText.taxCalculator.clearHistory(lang)}
                  </Button>
                )}
              </div>
              
              <ScrollArea className="flex-1">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mb-2" />
                    <p className="text-sm">계산 기록이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((calc) => (
                      <div
                        key={calc.id}
                        className="p-3 bg-muted/30 rounded-lg space-y-1 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setCurrentResult(calc);
                          setShowHistoryPanel(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {getTaxTypeLabel(calc.taxType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(calc.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">공급가액</span>
                            <span>{TaxCalculator.formatNumber(calc.supplyAmount)}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">세금</span>
                            <span className="text-orange-500">
                              {TaxCalculator.formatNumber(calc.taxAmount)}원
                            </span>
                          </div>
                          {calc.netAmount !== undefined && (
                            <div className="flex justify-between font-medium">
                              <span>실수령액</span>
                              <span className="text-green-600">
                                {TaxCalculator.formatNumber(calc.netAmount)}원
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxCalculatorWidget;
export { TaxCalculatorWidget };