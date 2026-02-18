import { getEffectiveTheme, buildPalette } from '../theme/index.js'
import { getOrCreateOverlay, closeOverlay } from '../overlay/index.js'
import * as ui from '../components/Helpers.js'

/**
 * Ouvre une fenêtre vide : logo 41 Devs, « Propulsé par 41 Devs », bouton Annuler, X pour fermer.
 * Aucun formulaire, aucun champ. Au clic sur Annuler ou X, la fenêtre se ferme.
 *
 * @param {Object} baseConfig - Config globale (publicKey, theme, logoUrl, etc.)
 * @param {Object} options - Options de la session (optionnel)
 */
export function openPayment(baseConfig, options) {
  const finalConfig = { ...baseConfig, ...(options ?? {}) }

  const requestedTheme = finalConfig.theme ?? baseConfig.theme ?? 'auto'
  const effectiveTheme = getEffectiveTheme(requestedTheme)
  const customColors = finalConfig.colors ?? {}
  const palette = buildPalette(effectiveTheme, customColors)

  const overlay = getOrCreateOverlay()
  overlay.style.background = palette.overlayBg
  overlay.innerHTML = ''

  const modal = document.createElement('div')
  modal.style.cssText = 'position:relative;background:' + palette.modalBg + ';color:' + palette.textPrimary + ';border-radius:12px;padding:24px;width:360px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.25);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
  overlay.appendChild(modal)

  ui.addCloseX(modal, palette, closeOverlay)
  ui.addLogoRow(modal, {
    logoUrl: finalConfig.logoUrl ?? baseConfig.logoUrl,
    merchantLogoUrl: finalConfig.merchantLogoUrl ?? baseConfig.merchantLogoUrl,
    useDefault41DevLogo: finalConfig.useDefault41DevLogo ?? baseConfig.useDefault41DevLogo ?? true,
  }, palette)
  ui.addSignature(modal, palette)

  const footer = document.createElement('div')
  footer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:16px'
  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.textContent = 'Annuler'
  cancelBtn.style.cssText = 'padding:8px 14px;border-radius:999px;border:1px solid ' + palette.cancelBorder + ';background:' + palette.cancelBg + ';cursor:pointer;font-size:13px;color:' + palette.cancelText
  cancelBtn.addEventListener('click', closeOverlay)
  footer.appendChild(cancelBtn)
  modal.appendChild(footer)
}
