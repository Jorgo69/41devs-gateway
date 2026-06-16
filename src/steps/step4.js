/**
 * Step 4 — Écran de résultat (succès ✅ ou erreur ❌).
 *
 * Succès : carte de confirmation avec numéro de commande,
 *          détail des billets achetés, info email.
 * Erreur : message + bouton Réessayer.
 */

import { _buildFooter, _computeTotal, _formatTicketType } from './step0-tickets.js'
import { closeOverlay } from '../overlay/index.js'

/**
 * Affiche l'étape de résultat.
 * @param {Object} ctx - Contexte partagé (modal, palette, finalConfig, selectedQuantities, _availableTickets, _event)
 * @param {Object} opts
 * @param {boolean} opts.success
 * @param {Object}  [opts.result]   - Données commande { orderId, orderNumber, buyerEmail, ... }
 * @param {string}  [opts.error]    - Message d'erreur
 * @param {Function}[opts.onRetry]  - Callback bouton Réessayer
 */
export function renderStep4(ctx, opts = {}) {
  const { modal, palette } = ctx
  const { success, result, error, onRetry } = opts

  modal.innerHTML = ''

  const body = document.createElement('div')
  body.style.cssText = 'padding:28px 20px 24px;display:flex;flex-direction:column;align-items:center;text-align:center'

  if (success) {
    _renderSuccess(body, ctx, result, palette)
  } else {
    _renderError(body, ctx, error, onRetry, palette)
  }

  body.appendChild(_buildFooter(palette))
  modal.appendChild(body)
}

// ── Succès ────────────────────────────────────────────────────────

function _renderSuccess(body, ctx, result, palette) {
  // Icône
  const icon = document.createElement('div')
  icon.style.cssText = [
    'width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center',
    'background:rgba(34,197,94,0.12);margin-bottom:12px;font-size:30px',
  ].join(';')
  icon.textContent = '✅'
  body.appendChild(icon)

  // Titre
  const title = document.createElement('h2')
  title.style.cssText = 'font-size:20px;font-weight:800;color:' + palette.textPrimary + ';margin:0 0 4px;letter-spacing:-0.3px'
  title.textContent = 'Paiement confirmé !'
  body.appendChild(title)

  const sub = document.createElement('p')
  sub.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';margin:0 0 20px;line-height:1.5'
  sub.textContent = 'Vos billets ont été enregistrés avec succès.'
  body.appendChild(sub)

  // Card récap
  const card = document.createElement('div')
  card.style.cssText = [
    'width:100%;background:' + palette.surface,
    'border:1px solid ' + palette.border,
    'border-radius:16px;padding:16px;text-align:left;margin-bottom:16px',
    'box-sizing:border-box',
  ].join(';')

  // Numéro de commande
  if (result?.orderNumber || result?.orderId) {
    const numWrap = document.createElement('div')
    numWrap.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px'

    const numLabel = document.createElement('div')
    numLabel.style.cssText = 'font-size:11px;color:' + palette.textMuted + ';text-transform:uppercase;letter-spacing:0.8px;font-weight:600'
    numLabel.textContent = 'N° de commande'

    const numVal = document.createElement('div')
    numVal.style.cssText = [
      'font-size:13px;font-weight:700;color:' + palette.textPrimary,
      'background:' + palette.surface2,
      'padding:5px 12px;border-radius:8px;letter-spacing:0.5px;font-family:monospace',
    ].join(';')
    numVal.textContent = result.orderNumber ?? String(result.orderId).slice(0, 8).toUpperCase()

    numWrap.appendChild(numLabel)
    numWrap.appendChild(numVal)
    card.appendChild(numWrap)

    const sep = document.createElement('div')
    sep.style.cssText = 'height:0.5px;background:' + palette.border + ';margin-bottom:12px'
    card.appendChild(sep)
  }

  // Détail billets
  const available = ctx._availableTickets ?? []
  const quantities = ctx.selectedQuantities ?? {}
  const purchased = available.filter((t) => (quantities[t.id] ?? 0) > 0)

  if (purchased.length > 0) {
    const listWrap = document.createElement('div')
    listWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:12px'

    purchased.forEach((t) => {
      const qty = quantities[t.id]
      const price = parseFloat(t.ticketPrice ?? 0)
      const row = document.createElement('div')
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center'

      const nameEl = document.createElement('div')
      nameEl.style.cssText = 'font-size:14px;color:' + palette.textPrimary + ';font-weight:500'
      nameEl.textContent = `${qty}× ${_formatTicketType(t.ticketType)}`

      const priceEl = document.createElement('div')
      priceEl.style.cssText = 'font-size:14px;font-weight:700;color:' + palette.textPrimary
      priceEl.textContent = price === 0 ? 'Gratuit' : (price * qty).toLocaleString('fr-FR') + ' XOF'

      row.appendChild(nameEl)
      row.appendChild(priceEl)
      listWrap.appendChild(row)
    })

    card.appendChild(listWrap)

    // Total
    const total = _computeTotal(quantities, available)
    if (total > 0) {
      const totalSep = document.createElement('div')
      totalSep.style.cssText = 'height:0.5px;background:' + palette.border + ';margin-bottom:10px'
      card.appendChild(totalSep)

      const totalRow = document.createElement('div')
      totalRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center'
      const totalLbl = document.createElement('div')
      totalLbl.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';font-weight:600'
      totalLbl.textContent = 'Total payé'
      const totalVal = document.createElement('div')
      totalVal.style.cssText = 'font-size:16px;font-weight:800;color:#FF4D00'
      totalVal.textContent = total.toLocaleString('fr-FR') + ' XOF'
      totalRow.appendChild(totalLbl)
      totalRow.appendChild(totalVal)
      card.appendChild(totalRow)
    }
  }

  body.appendChild(card)

  // Info email
  const email = result?.buyerEmail ?? result?.email
  if (email) {
    const emailInfo = document.createElement('p')
    emailInfo.style.cssText = 'font-size:12px;color:' + palette.textSecondary + ';margin:0 0 20px;line-height:1.5'
    emailInfo.innerHTML = 'Un e-mail de confirmation a été envoyé à<br><strong style="color:' + palette.textPrimary + '">' + email + '</strong>'
    body.appendChild(emailInfo)
  }

  // Bouton Fermer
  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.textContent = 'Fermer'
  closeBtn.style.cssText = [
    'width:100%;padding:14px;border-radius:100px;border:none',
    'background:#FF4D00;color:#fff;font-size:15px;font-weight:700;cursor:pointer',
    'letter-spacing:0.2px;margin-bottom:12px;box-sizing:border-box',
  ].join(';')
  closeBtn.addEventListener('click', () => closeOverlay())
  body.appendChild(closeBtn)
}

// ── Erreur ────────────────────────────────────────────────────────

function _renderError(body, ctx, error, onRetry, palette) {
  // Icône
  const icon = document.createElement('div')
  icon.style.cssText = [
    'width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center',
    'background:rgba(249,115,115,0.1);margin-bottom:12px;font-size:30px',
  ].join(';')
  icon.textContent = '❌'
  body.appendChild(icon)

  // Titre
  const title = document.createElement('h2')
  title.style.cssText = 'font-size:20px;font-weight:800;color:' + palette.textPrimary + ';margin:0 0 8px'
  title.textContent = 'Paiement échoué'
  body.appendChild(title)

  if (error) {
    const errMsg = document.createElement('p')
    errMsg.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';margin:0 0 20px;line-height:1.5;max-width:300px'
    errMsg.textContent = error
    body.appendChild(errMsg)
  }

  const btnRow = document.createElement('div')
  btnRow.style.cssText = 'display:flex;gap:10px;width:100%'

  if (onRetry) {
    const retryBtn = document.createElement('button')
    retryBtn.type = 'button'
    retryBtn.textContent = '↩ Réessayer'
    retryBtn.style.cssText = [
      'flex:1;padding:14px;border-radius:100px;cursor:pointer;font-size:14px;font-weight:600',
      'background:transparent;border:1px solid ' + palette.border,
      'color:' + palette.textSecondary + ';box-sizing:border-box',
    ].join(';')
    retryBtn.addEventListener('click', () => onRetry())
    btnRow.appendChild(retryBtn)
  }

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.textContent = 'Fermer'
  closeBtn.style.cssText = [
    'flex:1;padding:14px;border-radius:100px;border:none',
    'background:#FF4D00;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-sizing:border-box',
  ].join(';')
  closeBtn.addEventListener('click', () => closeOverlay())
  btnRow.appendChild(closeBtn)

  body.appendChild(btnRow)
  const mb = document.createElement('div')
  mb.style.marginBottom = '12px'
  body.appendChild(mb)
}
