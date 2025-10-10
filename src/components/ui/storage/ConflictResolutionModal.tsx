'use client'

/**
 * Conflict Resolution Modal - 동기화 충돌 해결 UI
 *
 * 로컬과 원격 버전의 차이를 표시하고 사용자가 해결 방법을 선택할 수 있습니다.
 */

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { getConflictText } from '@/config/brand'
import type {
  ConflictData,
  ResolutionStrategy,
  ConflictResolution,
  FieldDifference,
} from '@/lib/storage/types/conflict'
import type { JsonValue } from '@/lib/storage/types/base'
import { AlertCircle, CheckCircle2, Clock, Merge, X } from 'lucide-react'

interface ConflictResolutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflict: ConflictData | null
  onResolve: (resolution: ConflictResolution) => void | Promise<void>
}

export function ConflictResolutionModal({
  open,
  onOpenChange,
  conflict,
  onResolve,
}: ConflictResolutionModalProps) {
  const { toast } = useToast()
  const [strategy, setStrategy] = useState<ResolutionStrategy>('merge_auto')
  const [manualSelections, setManualSelections] = useState<Record<string, 'local' | 'remote'>>({})
  const [isResolving, setIsResolving] = useState(false)

  // 충돌이 있는 필드만 필터링
  const conflictingFields = useMemo(() => {
    if (!conflict) return []
    return conflict.differences.filter(diff => diff.hasConflict)
  }, [conflict])

  // 타임스탬프 포맷팅
  const formatTimestamp = (timestamp?: number, isoString?: string): string => {
    if (isoString) {
      return new Date(isoString).toLocaleString('ko-KR')
    }
    if (timestamp) {
      return new Date(timestamp).toLocaleString('ko-KR')
    }
    return '알 수 없음'
  }

  // 충돌 타입 아이콘
  const getConflictIcon = () => {
    if (!conflict) return null

    switch (conflict.conflictType) {
      case 'local_newer':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'remote_newer':
        return <Clock className="h-5 w-5 text-green-500" />
      case 'both_modified':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  // 충돌 타입 설명
  const getConflictDescription = () => {
    if (!conflict) return ''

    const lang = 'ko' // 기본 언어 설정

    switch (conflict.conflictType) {
      case 'local_newer':
        return getConflictText.localNewer(lang)
      case 'remote_newer':
        return getConflictText.remoteNewer(lang)
      case 'both_modified':
        return getConflictText.bothModified(lang)
      default:
        return getConflictText.unknown(lang)
    }
  }

  // 해결 처리
  const handleResolve = async () => {
    if (!conflict) return

    setIsResolving(true)

    try {
      let resolvedData: JsonValue

      if (strategy === 'keep_local') {
        resolvedData = conflict.localVersion
      } else if (strategy === 'keep_remote') {
        resolvedData = conflict.remoteVersion
      } else if (strategy === 'merge_manual') {
        // 수동 선택 필드 병합
        const manualData: Record<string, JsonValue> = {}

        conflictingFields.forEach(diff => {
          const selection = manualSelections[diff.field]
          if (selection === 'remote') {
            manualData[diff.field] = diff.remoteValue
          }
          // 'local' 또는 선택 없음은 로컬 유지 (기본)
        })

        // 로컬 버전이 객체인 경우에만 spread 연산 가능
        if (typeof conflict.localVersion === 'object' && conflict.localVersion !== null && !Array.isArray(conflict.localVersion)) {
          resolvedData = {
            ...conflict.localVersion,
            ...manualData,
            updatedAt: new Date().toISOString(),
          } as JsonValue
        } else {
          // 원시값이면 manualData 사용
          resolvedData = manualData as JsonValue
        }
      } else {
        // merge_auto는 ConflictResolver에서 처리
        resolvedData = conflict.localVersion  // 임시, 실제는 resolver가 처리
      }

      // manualData 변수를 여기서 선언하여 스코프 확장
      const manualDataForResolution = strategy === 'merge_manual' ? (
        conflictingFields.reduce((acc, diff) => {
          const selection = manualSelections[diff.field]
          if (selection === 'remote') {
            acc[diff.field] = diff.remoteValue
          }
          return acc
        }, {} as Record<string, JsonValue>)
      ) : undefined

      const resolution: ConflictResolution = {
        strategy,
        resolvedData,
        appliedAt: Date.now(),
        manualChanges: manualDataForResolution,
      }

      await onResolve(resolution)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      const lang = 'ko'
      toast({
        variant: 'destructive',
        title: getConflictText.failureTitle(lang),
        description: getConflictText.failureDesc(lang),
      })
    } finally {
      setIsResolving(false)
    }
  }

  // 필드 선택 토글
  const toggleFieldSelection = (field: string, currentValue: 'local' | 'remote') => {
    setManualSelections(prev => ({
      ...prev,
      [field]: currentValue,
    }))
  }

  // JSON 값 렌더링
  const renderValue = (value: JsonValue): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  if (!conflict) return null

  const lang = 'ko' // 기본 언어 설정

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getConflictIcon()}
            <DialogTitle>{getConflictText.title(lang)}</DialogTitle>
          </div>
          <DialogDescription>
            {getConflictDescription()}
            <br />
            <span className="text-sm text-muted-foreground">
              {getConflictText.entityLabel(lang)} <strong>{conflict.entity}</strong>
              {conflict.id && ` / ${getConflictText.idLabel(lang)} ${conflict.id}`}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 해결 전략 선택 */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{getConflictText.strategyLabel(lang)}</Label>
            <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as ResolutionStrategy)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent">
                  <RadioGroupItem value="keep_local" id="keep_local" />
                  <Label htmlFor="keep_local" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getConflictText.keepLocal(lang)}</span>
                      <Badge variant="secondary">
                        {formatTimestamp(conflict.localTimestamp, conflict.localUpdatedAt)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{getConflictText.keepLocalDesc(lang)}</p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent">
                  <RadioGroupItem value="keep_remote" id="keep_remote" />
                  <Label htmlFor="keep_remote" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getConflictText.keepRemote(lang)}</span>
                      <Badge variant="secondary">
                        {formatTimestamp(conflict.remoteTimestamp, conflict.remoteUpdatedAt)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{getConflictText.keepRemoteDesc(lang)}</p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent">
                  <RadioGroupItem value="merge_auto" id="merge_auto" />
                  <Label htmlFor="merge_auto" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Merge className="h-4 w-4" />
                      <span className="font-medium">{getConflictText.mergeAuto(lang)}</span>
                      <Badge variant="outline">{getConflictText.recommended(lang)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getConflictText.mergeAutoDesc(lang)}
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent">
                  <RadioGroupItem value="merge_manual" id="merge_manual" />
                  <Label htmlFor="merge_manual" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getConflictText.mergeManual(lang)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getConflictText.mergeManualDesc(lang)}
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* 수동 병합 시 필드별 선택 */}
          {strategy === 'merge_manual' && conflictingFields.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                {getConflictText.fieldSelectionLabel(lang)} ({conflictingFields.length}{getConflictText.fieldSelectionCount(lang)})
              </Label>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                  {conflictingFields.map(diff => {
                    const selection = manualSelections[diff.field] || 'local'

                    return (
                      <div key={diff.field} className="border-b pb-4 last:border-b-0">
                        <div className="font-medium text-sm mb-2">
                          {getConflictText.fieldLabel(lang)} <code className="text-primary">{diff.field}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* 로컬 선택 */}
                          <button
                            type="button"
                            onClick={() => toggleFieldSelection(diff.field, 'local')}
                            className={`p-3 rounded-md border text-left transition-colors ${
                              selection === 'local'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {selection === 'local' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                              <span className="text-xs font-medium">{getConflictText.localLabel(lang)}</span>
                            </div>
                            <pre className="text-xs text-muted-foreground overflow-x-auto">
                              {renderValue(diff.localValue)}
                            </pre>
                          </button>

                          {/* 원격 선택 */}
                          <button
                            type="button"
                            onClick={() => toggleFieldSelection(diff.field, 'remote')}
                            className={`p-3 rounded-md border text-left transition-colors ${
                              selection === 'remote'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {selection === 'remote' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                              <span className="text-xs font-medium">{getConflictText.remoteLabel(lang)}</span>
                            </div>
                            <pre className="text-xs text-muted-foreground overflow-x-auto">
                              {renderValue(diff.remoteValue)}
                            </pre>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isResolving}>
            <X className="h-4 w-4 mr-2" />
            {getConflictText.cancel(lang)}
          </Button>
          <Button onClick={handleResolve} disabled={isResolving}>
            {isResolving ? (
              <>{getConflictText.resolving(lang)}</>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {getConflictText.resolve(lang)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
