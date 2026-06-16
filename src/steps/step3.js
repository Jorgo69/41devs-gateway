/**
 * Step 3 — Spinner "Traitement en cours..."
 * Apparaît pendant l'appel API et le polling AfribaPay.
 * Si un paymentUrl a été ouvert, le message l'indique.
 */

import { _buildFooter } from './step0-tickets.js'

let spinnerStyleInjected = false

function ensureSpinnerStyle() {
  if (spinnerStyleInjected || typeof document === 'undefined') return
  if (document.getElementById('fdg-spinner-style')) { spinnerStyleInjected = true; return }
  const style = document.createElement('style')
  style.id = 'fdg-spinner-style'
  style.textContent = '@keyframes fdg-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'
  document.head.appendChild(style)
  spinnerStyleInjected = true
}

/**
 * @param {Object} ctx  - Contexte partagé (modal, palette, onCancel)
 * @param {Object} opts
 * @param {boolean} [opts.hasPaymentUrl=false]
 */
export function renderStep3(ctx, opts = {}) {
  const { modal, palette } = ctx
  const { hasPaymentUrl = false } = opts

  ensureSpinnerStyle()
  modal.innerHTML = ''

  // Bouton fermer (position:absolute — ancêtre positionné = modal outer div)
  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Fermer')
  closeBtn.textContent = '×'
  closeBtn.style.cssText = 'position:absolute;top:12px;right:14px;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:' + palette.textSecondary + ';font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center'
  closeBtn.addEventListener('click', () => ctx.onCancel())
  modal.appendChild(closeBtn)

  const body = document.createElement('div')
  body.style.cssText = 'padding:52px 24px 28px;display:flex;flex-direction:column;align-items:center'

  const spinner = document.createElement('div')
  spinner.style.cssText = [
    'width:48px;height:48px;border-radius:50%',
    'border:3px solid rgba(255,255,255,0.1)',
    'border-top-color:#FF4D00',
    'animation:fdg-spin 0.8s linear infinite',
    'margin-bottom:22px',
  ].join(';')
  body.appendChild(spinner)

  const title = document.createElement('p')
  title.style.cssText = 'margin:0 0 8px;font-size:16px;font-weight:700;color:' + palette.textPrimary + ';text-align:center'
  title.textContent = 'Traitement en cours...'
  body.appendChild(title)

  const sub = document.createElement('p')
  sub.style.cssText = 'margin:0 0 28px;font-size:13px;color:' + palette.textSecondary + ';text-align:center;line-height:1.6;max-width:280px;white-space:pre-line'
  sub.textContent = hasPaymentUrl
    ? 'Complétez votre paiement dans la page ouverte.\nNe fermez pas cette fenêtre.'
    : 'Veuillez patienter, votre paiement est en cours de traitement.'
  body.appendChild(sub)

  body.appendChild(_buildFooter(palette))
  modal.appendChild(body)
}
