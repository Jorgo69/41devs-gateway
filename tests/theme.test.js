import { describe, it, expect } from 'vitest'
import { getEffectiveTheme, buildPalette } from '../src/theme/index.js'

describe('theme', () => {
  describe('getEffectiveTheme', () => {
    it('returns "dark" when requested "light"', () => {
      expect(getEffectiveTheme('light')).toBe('dark')
    })
    it('returns "dark" when requested "dark"', () => {
      expect(getEffectiveTheme('dark')).toBe('dark')
    })
    it('returns "dark" when requested "auto" (VEEP is always dark)', () => {
      const theme = getEffectiveTheme('auto')
      expect(theme).toBe('dark')
    })
  })

  describe('buildPalette', () => {
    it('returns VEEP dark palette with expected keys', () => {
      const palette = buildPalette('dark', {})
      expect(palette.modalBg).toBe('#0D0D0D')
      expect(palette.textPrimary).toBe('#F5F5F5')
      expect(palette.primaryButtonBg).toBe('#FF4D00')
    })
    it('same palette regardless of theme argument', () => {
      const paletteDark = buildPalette('dark', {})
      const paletteLight = buildPalette('light', {})
      expect(paletteDark.modalBg).toBe(paletteLight.modalBg)
      expect(paletteDark.primaryButtonBg).toBe(paletteLight.primaryButtonBg)
    })
    it('applies custom primary (flat object)', () => {
      const palette = buildPalette('dark', { primary: '#ff0000' })
      expect(palette.primaryButtonBg).toBe('#ff0000')
      expect(palette.primaryButtonText).toBe('#ffffff')
    })
    it('applies custom primary hover', () => {
      const palette = buildPalette('dark', { primary: '#00ff00', primaryHover: '#00cc00' })
      expect(palette.primaryButtonBg).toBe('#00ff00')
      expect(palette.primaryButtonBgHover).toBe('#00cc00')
    })
  })
})
