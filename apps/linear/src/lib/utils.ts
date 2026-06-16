import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.replace(/^#/, "")
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized
  if (full.length !== 6) return null
  const num = Number.parseInt(full, 16)
  if (Number.isNaN(num)) return null
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Returns "#ffffff" or "#000000" — whichever yields better contrast against the
 * given background color — so foreground text meets WCAG AA where possible.
 */
export function getContrastTextColor(background: string): string {
  const rgb = hexToRgb(background)
  if (!rgb) return "#ffffff"
  const bgLum = relativeLuminance(rgb)
  const whiteContrast = contrastRatio(1, bgLum)
  const blackContrast = contrastRatio(bgLum, 0)
  return blackContrast > whiteContrast ? "#000000" : "#ffffff"
}
