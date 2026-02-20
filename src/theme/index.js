/**
 * Calcul du theme effectif (clair ou sombre) et construction de la palette de couleurs.
 * En mode "auto", utilise la preference systeme (prefers-color-scheme).
 */

import { DEFAULT_PALETTE_DARK, DEFAULT_PALETTE_LIGHT } from '../constants/index.js'

/**
 * Retourne le theme effectif a utiliser pour l'affichage.
 * Si requestedTheme vaut "auto", on lit la preference systeme du navigateur.
 * @param {string} requestedTheme - "light", "dark" ou "auto".
 * @returns {string} "light" ou "dark".
 */
export function getEffectiveTheme(requestedTheme) {
  if (requestedTheme !== 'auto') return requestedTheme
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * Construit l'objet palette utilise pour styliser le modal (couleurs de fond, texte, boutons).
 * Si customColors contient une couleur primaire pour le theme actuel, elle remplace primaryButtonBg.
 * @param {string} effectiveTheme - "light" ou "dark".
 * @param {Object} customColors - Objet optionnel avec light.primary et/ou dark.primary.
 * @returns {Object} Objet palette avec toutes les cles (modalBg, textPrimary, cancelBorder, etc.).
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
