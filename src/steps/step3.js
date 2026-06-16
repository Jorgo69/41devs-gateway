import * as ui from '../components/Helpers.js'

/**
 * Injecte l'animation CSS du spinner une seule fois dans le document.
 * Aucun effet si le style est déjà présent.
 */
function ensureSpinnerStyle() {
  if (typeof document === 'undefined' || document.getElementById('fdg-spinner-style')) return
  const style = document.createElement('style')
  style.id = 'fdg-spinner-style'
  style.textContent = '@keyframes fdg-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'
  document.head.appendChild(style)
}

/**
 * Affiche l'étape 3 : spinner "Traitement en cours...".
 * Si un paymentUrl a été ouvert dans un nouvel onglet, le message l'indique.
 *
 * @param {Object} ctx - Contexte partagé (modal, palette, finalConfig, onCancel)
 * @param {Object} [opts] - Options optionnelles
 * @param {boolean} [opts.hasPaymentUrl=false] - Vrai si AfribaPay a ouvert une page externe
 */
export function renderStep3(ctx, opts = {}) {
  const { modal, palette, finalConfig } = ctx
  const { hasPaymentUrl = false } = opts

  ensureSpinnerStyle()
  modal.innerHTML = ''

  ui.addCloseX(modal, palette, ctx.onCancel)
  ui.addLogoRow(modal, {
    logoUrl: finalConfig.logoUrl ?? ctx.baseConfig?.logoUrl,
    merchantLogoUrl: finalConfig.merchantLogoUrl ?? ctx.baseConfig?.merchantLogoUrl,
    useDefault41DevLogo: finalConfig.useDefault41DevLogo ?? ctx.baseConfig?.useDefault41DevLogo ?? true,
  }, palette)

  const center = document.createElement('div')
  center.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:24px 0 8px'

  const spinner = document.createElement('div')
  spinner.style.cssText = [
    'width:44px;height:44px;border-radius:50%',
    'border:3px solid ' + palette.border,
    'border-top-color:' + palette.primaryButtonBg,
    'animation:fdg-spin 0.8s linear infinite',
    'margin-bottom:20px',
  ].join(';')
  center.appendChild(spinner)

  const title = document.createElement('p')
  title.style.cssText = 'margin:0 0 8px;font-size:15px;font-weight:600;color:' + palette.textPrimary
  title.textContent = 'Traitement en cours...'
  center.appendChild(title)

  const sub = document.createElement('p')
  sub.style.cssText = 'margin:0;font-size:13px;color:' + palette.textSecondary + ';text-align:center;line-height:1.5'
  sub.textContent = hasPaymentUrl
    ? 'Complétez votre paiement dans la page ouverte.\nNe fermez pas cette fenêtre.'
    : 'Veuillez patienter, votre paiement est en cours de traitement.'
  sub.style.whiteSpace = 'pre-line'
  center.appendChild(sub)

  modal.appendChild(center)
  ui.addSignature(modal, palette)
}
