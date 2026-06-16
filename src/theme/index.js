/**
 * Palette VEEP — dark orange par défaut.
 * L'intégrateur peut surcharger via colors: { primary, primaryHover, primaryDim }
 */
export function getEffectiveTheme(requestedTheme) {
  return 'dark' // VEEP est toujours dark
}

export function buildPalette(_effectiveTheme, customColors = {}) {
  const primary = customColors.primary ?? '#FF4D00'
  const primaryHover = customColors.primaryHover ?? '#FF6120'
  const primaryDim = customColors.primaryDim ?? 'rgba(255,77,0,0.15)'

  return {
    overlayBg: 'rgba(0,0,0,0.78)',
    modalBg: '#0D0D0D',
    surface: '#1A1A1A',
    surface2: '#242424',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#F5F5F5',
    textSecondary: 'rgba(245,245,245,0.6)',
    textMuted: 'rgba(245,245,245,0.35)',
    primaryButtonBg: primary,
    primaryButtonBgHover: primaryHover,
    primaryButtonText: '#ffffff',
    primaryDim,
    amountText: primary,
    inputBg: '#1A1A1A',
    inputBorder: 'rgba(255,255,255,0.08)',
    inputBorderFocus: primary,
    inputText: '#F5F5F5',
    cancelBg: 'transparent',
    cancelBorder: 'rgba(255,255,255,0.12)',
    cancelText: 'rgba(245,245,245,0.55)',
    buttonBg: '#1A1A1A',
    buttonBgHover: '#242424',
    selectedBorder: primary,
    selectedBg: primaryDim,
  }
}
