'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Folder, Trash2, Download } from 'lucide-react'
import { useImprovedDashboardStore } from '@/lib/stores/useImprovedDashboardStore'
import { DashboardPresetMeta } from '@/types/improved-dashboard'
import { cn } from '@/lib/utils'

interface PresetManagerProps {
  className?: string
}

export function PresetManager({ className }: PresetManagerProps) {
  const [presets, setPresets] = useState<DashboardPresetMeta[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { savePreset, loadPreset, deletePreset, listPresets } = useImprovedDashboardStore()

  // 프리셋 목록 로드
  const loadPresetList = async () => {
    const list = await listPresets()
    setPresets(list)
  }

  useEffect(() => {
    loadPresetList()
  }, [])

  // 프리셋 저장
  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert('프리셋 이름을 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      await savePreset(presetName, presetDescription)
      alert(`프리셋 "${presetName}"이(가) 저장되었습니다.`)
      setPresetName('')
      setPresetDescription('')
      setSaveDialogOpen(false)
      await loadPresetList()
    } catch (error) {
      console.error('Failed to save preset:', error)
      alert('프리셋 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 프리셋 로드
  const handleLoadPreset = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    const confirmed = confirm(
      `"${preset.name}" 프리셋을 불러오시겠습니까?\n현재 레이아웃이 대체됩니다.`
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await loadPreset(presetId)
      alert(`프리셋 "${preset.name}"을(를) 불러왔습니다.`)
    } catch (error) {
      console.error('Failed to load preset:', error)
      alert('프리셋 불러오기에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 프리셋 삭제
  const handleDeletePreset = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (!preset) return

    const confirmed = confirm(
      `"${preset.name}" 프리셋을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await deletePreset(presetId)
      alert(`프리셋 "${preset.name}"이(가) 삭제되었습니다.`)
      await loadPresetList()
    } catch (error) {
      console.error('Failed to delete preset:', error)
      alert('프리셋 삭제에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* 프리셋 드롭다운 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className={cn("w-full md:w-auto", className)}
            disabled={isLoading}
          >
            <Folder className="h-4 w-4 mr-2" />
            프리셋
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* 프리셋 저장 */}
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
            <Save className="h-4 w-4 mr-2" />
            현재 레이아웃 저장
          </DropdownMenuItem>

          {presets.length > 0 && (
            <>
              <DropdownMenuSeparator />

              {/* 프리셋 목록 */}
              {presets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className="flex flex-col items-start"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {preset.widgetCount}개
                    </span>
                  </div>
                  {preset.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {preset.description}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              {/* 프리셋 관리 */}
              <DropdownMenuItem onClick={() => setManageDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                프리셋 관리
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 프리셋 저장 다이얼로그 */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>레이아웃 프리셋 저장</DialogTitle>
            <DialogDescription>
              현재 대시보드 레이아웃을 프리셋으로 저장합니다. 최대 3개까지 저장 가능합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="preset-name">프리셋 이름 *</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="예: 일일 업무 레이아웃"
                maxLength={50}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preset-description">설명 (선택)</Label>
              <Textarea
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="프리셋에 대한 간단한 설명을 입력하세요."
                rows={3}
                maxLength={200}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false)
                setPresetName('')
                setPresetDescription('')
              }}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button onClick={handleSavePreset} disabled={isLoading || !presetName.trim()}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 프리셋 관리 다이얼로그 */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>프리셋 관리</DialogTitle>
            <DialogDescription>
              저장된 레이아웃 프리셋을 관리합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {presets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                저장된 프리셋이 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{preset.name}</h4>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          위젯 {preset.widgetCount}개
                        </span>
                      </div>
                      {preset.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(preset.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setManageDialogOpen(false)
                          handleLoadPreset(preset.id)
                        }}
                        disabled={isLoading}
                      >
                        불러오기
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePreset(preset.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
