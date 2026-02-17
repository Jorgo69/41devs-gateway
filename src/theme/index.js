import { DEFAULT_PALETTE_DARK, DEFAULT_PALETTE_LIGHT } from '../constants/index.js'

/**
 * Détermine le thème effectif à partir de la config (auto = préférence système).
 * @param {string} requestedTheme - 'light' | 'dark' | 'auto'
 * @returns {string} 'light' | 'dark'
 */
export function getEffectiveTheme(requestedTheme) {
  if (requestedTheme !== 'auto') return requestedTheme
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * Construit la palette de couleurs (thème + couleur primaire personnalisée).
 * @param {string} effectiveTheme - 'light' | 'dark'
 * @param {Object} customColors - { light?: { primary }, dark?: { primary } }
 * @returns {Object} palette d'applications des couleurs
 */
export function buildPalette(effectiveTheme, customColors = {}) {
  const basePalette = effectiveTheme === 'dark' ? DEFAULT_PALETTE_DARK : DEFAULT_PALETTE_LIGHT
  const customPrimary = effectiveTheme === 'dark' ? customColors.dark?.primary : customColors.light?.primary
  return {
    ...basePalette,
    ...(customPrimary && {
      primaryButtonBg: customPrimary,
      primaryButtonText: '#ffffff',
    }),
  }
}
