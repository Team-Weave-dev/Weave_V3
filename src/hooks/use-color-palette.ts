import { useState, useEffect } from 'react'
import { ColorPalette, colorPalettes, getPalette, generateCSSVariables } from '@/config/color-palette'

const PALETTE_STORAGE_KEY = 'ui-color-palette'

export function useColorPalette() {
  const [currentPalette, setCurrentPalette] = useState<keyof typeof colorPalettes>('soft')

  // localStorage에서 저장된 팔레트 가져오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
      if (stored && stored in colorPalettes) {
        setCurrentPalette(stored as keyof typeof colorPalettes)
      }
    } catch (error) {
      // localStorage를 사용할 수 없는 환경 처리
      console.warn('localStorage is not available:', error)
    }
  }, [])

  // 팔레트 변경 시 CSS 변수 업데이트
  useEffect(() => {
    const palette = getPalette(currentPalette)
    const cssVariables = generateCSSVariables(palette)

    // CSS 변수를 style 태그로 주입
    const styleId = 'color-palette-variables'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = `:root { ${cssVariables} }`
  }, [currentPalette])

  const changePalette = (paletteName: keyof typeof colorPalettes) => {
    setCurrentPalette(paletteName)
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, paletteName)
    } catch (error) {
      console.warn('Failed to save palette preference:', error)
    }
  }

  return {
    currentPalette,
    changePalette,
    availablePalettes: Object.keys(colorPalettes) as (keyof typeof colorPalettes)[],
    getPaletteInfo: (name: keyof typeof colorPalettes) => getPalette(name)
  }
}