import { PAYMENT_CANCELLED_CODE, DEFAULT_COUNTRIES } from '../constants/index.js'
import { getEffectiveTheme, buildPalette } from '../theme/index.js'
import { getOrCreateOverlay, closeOverlay } from '../overlay/index.js'
import { renderStep1 } from '../steps/step1.js'
import { renderStep2 } from '../steps/step2.js'

/**
 * Ouvre la fenêtre de paiement et retourne une Promise.
 * Résolue avec le résultat du paiement, rejetée en cas d'annulation (code PAYMENT_CANCELLED_CODE).
 *
 * @param {Object} baseConfig - Config globale de la gateway
 * @param {Object} options - Options de la session (amount, currency, customerName, etc.)
 * @returns {Promise<Object>}
 */
export function openPayment(baseConfig, options) {
  return new Promise((resolve, reject) => {
    let settled = false
    const finalConfig = { ...baseConfig, ...options }

    function finishWithSuccess(result) {
      if (settled) return
      settled = true
      resolve(result)
      closeOverlay()
    }

    function finishWithCancel() {
      if (settled) return
      settled = true
      reject({ code: PAYMENT_CANCELLED_CODE, message: 'Paiement annulé par l\'utilisateur.' })
      closeOverlay()
    }

    const requestedTheme = finalConfig.theme ?? baseConfig.theme ?? 'auto'
    const effectiveTheme = getEffectiveTheme(requestedTheme)
    const customColors = finalConfig.colors ?? {}
    const palette = buildPalette(effectiveTheme, customColors)
    const countries = finalConfig.countries ?? DEFAULT_COUNTRIES

    const overlay = getOrCreateOverlay()
    overlay.style.background = palette.overlayBg
    overlay.innerHTML = ''

    const modal = document.createElement('div')
    modal.style.cssText = 'position:relative;background:' + palette.modalBg + ';color:' + palette.textPrimary + ';border-radius:12px;padding:24px;width:360px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.25);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    overlay.appendChild(modal)

    const ctx = {
      modal,
      finalConfig,
      baseConfig,
      palette,
      countries,
      onSuccess: finishWithSuccess,
      onCancel: finishWithCancel,
    }
    ctx.onBack = () => renderStep1(ctx)
    ctx.onMethodSelect = (methodLabel) => renderStep2(ctx, methodLabel)

    renderStep1(ctx)
  })
}
