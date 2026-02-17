import { describe, it, expect } from 'vitest'
import { getEffectiveTheme, buildPalette } from '../src/theme/index.js'

describe('theme', () => {
  describe('getEffectiveTheme', () => {
    it('returns "light" when requested "light"', () => {
      expect(getEffectiveTheme('light')).toBe('light')
    })
    it('returns "dark" when requested "dark"', () => {
      expect(getEffectiveTheme('dark')).toBe('dark')
    })
    it('returns "light" or "dark" when requested "auto" (depends on env)', () => {
      const theme = getEffectiveTheme('auto')
      expect(['light', 'dark']).toContain(theme)
    })
  })

  describe('buildPalette', () => {
    it('returns palette with expected keys for light', () => {
      const palette = buildPalette('light', {})
      expect(palette.modalBg).toBe('#ffffff')
      expect(palette.textPrimary).toBe('#111827')
      expect(palette.primaryButtonBg).toBe('#2563eb')
    })
    it('returns palette with expected keys for dark', () => {
      const palette = buildPalette('dark', {})
      expect(palette.modalBg).toBe('#020617')
      expect(palette.textPrimary).toBe('#e5e7eb')
      expect(palette.primaryButtonBg).toBe('#2563eb')
    })
    it('applies custom primary for light', () => {
      const palette = buildPalette('light', { light: { primary: '#ff0000' } })
      expect(palette.primaryButtonBg).toBe('#ff0000')
      expect(palette.primaryButtonText).toBe('#ffffff')
    })
    it('applies custom primary for dark', () => {
      const palette = buildPalette('dark', { dark: { primary: '#00ff00' } })
      expect(palette.primaryButtonBg).toBe('#00ff00')
      expect(palette.primaryButtonText).toBe('#ffffff')
    })
  })
})
