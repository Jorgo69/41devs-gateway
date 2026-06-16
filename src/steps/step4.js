import * as ui from '../components/Helpers.js'
import { closeOverlay } from '../overlay/index.js'

/**
 * Affiche l'étape 4 : écran de résultat (succès ✅ ou erreur ❌).
 *
 * @param {Object} ctx - Contexte partagé (modal, palette, finalConfig, onCancel)
 * @param {Object} opts
 * @param {boolean} opts.success - Vrai si paiement confirmé, faux si erreur
 * @param {Object} [opts.result] - Données de la commande confirmée (orderId, orderNumber, total…)
 * @param {string} [opts.error] - Message d'erreur à afficher
 * @param {Function} [opts.onRetry] - Si fourni, un bouton "Réessayer" est ajouté et appelle cette callback
 */
export function renderStep4(ctx, opts = {}) {
  const { modal, palette, finalConfig } = ctx
  const { success, result, error, onRetry } = opts

  modal.innerHTML = ''

  ui.addCloseX(modal, palette, () => {
    ctx.onCancel()
    closeOverlay()
  })
  ui.addLogoRow(modal, {
    logoUrl: finalConfig.logoUrl ?? ctx.baseConfig?.logoUrl,
    merchantLogoUrl: finalConfig.merchantLogoUrl ?? ctx.baseConfig?.merchantLogoUrl,
    useDefault41DevLogo: finalConfig.useDefault41DevLogo ?? ctx.baseConfig?.useDefault41DevLogo ?? true,
  }, palette)

  const center = document.createElement('div')
  center.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:16px 0 8px'

  // Icône résultat
  const icon = document.createElement('div')
  icon.style.cssText = [
    'width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center',
    'margin-bottom:16px;font-size:28px',
    success
      ? 'background:#d1fae5;color:#059669'
      : 'background:#fee2e2;color:#dc2626',
  ].join(';')
  icon.textContent = success ? '✓' : '✕'
  center.appendChild(icon)

  // Titre
  const title = document.createElement('p')
  title.style.cssText = 'margin:0 0 8px;font-size:17px;font-weight:700;color:' + palette.textPrimary
  title.textContent = success ? 'Paiement confirmé !' : 'Paiement échoué'
  center.appendChild(title)

  // Détails succès
  if (success && result) {
    const details = document.createElement('div')
    details.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';text-align:center;line-height:1.6;margin-bottom:8px'

    if (result.orderNumber) {
      const ref = document.createElement('p')
      ref.style.margin = '0 0 4px'
      ref.textContent = `Référence : ${result.orderNumber}`
      details.appendChild(ref)
    }

    if (result.buyerEmail || result.email) {
      const emailLine = document.createElement('p')
      emailLine.style.margin = '0'
      emailLine.textContent = `Ticket envoyé à ${result.buyerEmail ?? result.email}`
      details.appendChild(emailLine)
    }

    center.appendChild(details)
  }

  // Message d'erreur
  if (!success && error) {
    const errMsg = document.createElement('p')
    errMsg.style.cssText = 'margin:0 0 8px;font-size:13px;color:' + palette.textSecondary + ';text-align:center;line-height:1.5'
    errMsg.textContent = error
    center.appendChild(errMsg)
  }

  modal.appendChild(center)

  // Boutons
  const footer = document.createElement('div')
  footer.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-top:16px'

  if (!success && onRetry) {
    const retryBtn = document.createElement('button')
    retryBtn.type = 'button'
    retryBtn.textContent = 'Réessayer'
    retryBtn.style.cssText = 'padding:10px 18px;border-radius:999px;border:1px solid ' + palette.cancelBorder + ';background:' + palette.cancelBg + ';cursor:pointer;font-size:13px;color:' + palette.cancelText
    retryBtn.addEventListener('click', () => onRetry())
    footer.appendChild(retryBtn)
  }

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.textContent = 'Fermer'
  closeBtn.style.cssText = 'padding:10px 18px;border-radius:999px;border:none;background:' + palette.primaryButtonBg + ';color:' + palette.primaryButtonText + ';cursor:pointer;font-size:13px;font-weight:600'
  closeBtn.addEventListener('click', () => closeOverlay())
  footer.appendChild(closeBtn)

  modal.appendChild(footer)
  ui.addSignature(modal, palette)
}
