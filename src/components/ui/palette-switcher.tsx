"use client"

import * as React from "react"
import { Check, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useColorPalette } from "@/hooks/use-color-palette"
import { colorPalettes } from "@/config/color-palette"

export interface PaletteSwitcherProps {
  className?: string
  align?: 'start' | 'center' | 'end'
  showCurrentName?: boolean
}

export function PaletteSwitcher({
  className,
  align = 'end',
  showCurrentName = false
}: PaletteSwitcherProps) {
  const { currentPalette, changePalette, availablePalettes } = useColorPalette()

  // 팔레트별 프리뷰 색상 샘플
  const getPreviewColors = (paletteName: keyof typeof colorPalettes) => {
    const palette = colorPalettes[paletteName]
    return [
      palette.colors.success.hsl,
      palette.colors.warning.hsl,
      palette.colors.error.hsl,
      palette.colors.info.hsl,
    ]
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={showCurrentName ? "default" : "icon"}
          className={cn("gap-2", className)}
        >
          <Palette className="h-4 w-4" />
          {showCurrentName && (
            <span className="text-sm">{colorPalettes[currentPalette].name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-[240px]">
        <DropdownMenuLabel>색상 팔레트 선택</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availablePalettes.map((paletteName) => {
          const palette = colorPalettes[paletteName]
          const isActive = paletteName === currentPalette
          const colors = getPreviewColors(paletteName)

          return (
            <DropdownMenuItem
              key={paletteName}
              onClick={() => changePalette(paletteName)}
              className={cn(
                "flex flex-col items-start gap-2 p-3 cursor-pointer",
                isActive && "bg-muted"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{palette.name}</span>
                  {isActive && <Check className="h-3 w-3" />}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {palette.description}
              </span>
              <div className="flex gap-1">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                ))}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 간단한 팔레트 뷰어 컴포넌트
export function PaletteViewer() {
  const { currentPalette } = useColorPalette()
  const palette = colorPalettes[currentPalette]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">현재 팔레트: {palette.name}</h3>
        <p className="text-sm text-muted-foreground">{palette.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">시맨틱 상태 색상</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">성공</Badge>
              <span className="text-xs text-muted-foreground">success</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">경고</Badge>
              <span className="text-xs text-muted-foreground">warning</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="error">오류</Badge>
              <span className="text-xs text-muted-foreground">error</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">정보</Badge>
              <span className="text-xs text-muted-foreground">info</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">프로젝트 상태 색상</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="status-soft-review">검토</Badge>
              <span className="text-xs text-muted-foreground">review</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status-soft-completed">완료</Badge>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status-soft-cancelled">취소</Badge>
              <span className="text-xs text-muted-foreground">cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status-soft-planning">기획</Badge>
              <span className="text-xs text-muted-foreground">planning</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status-soft-onhold">보류</Badge>
              <span className="text-xs text-muted-foreground">onhold</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="status-soft-inprogress">진행중</Badge>
              <span className="text-xs text-muted-foreground">inprogress</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-medium">사용 예시</h4>
        <div className="bg-muted rounded-lg p-3">
          <code className="text-xs text-muted-foreground">
            {`// 색상 팔레트 Hook 사용\n`}
            {`import { useColorPalette } from '@/hooks/use-color-palette'\n\n`}
            {`const { currentPalette, changePalette } = useColorPalette()\n\n`}
            {`// 팔레트 전환\n`}
            {`changePalette('vivid')`}
          </code>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <code className="text-xs text-muted-foreground">
            {`// 팔레트 전환 UI 컴포넌트\n`}
            {`import { PaletteSwitcher } from '@/components/ui/palette-switcher'\n\n`}
            {`<PaletteSwitcher showCurrentName={true} />`}
          </code>
        </div>
      </div>
    </div>
  )
}
