import { PAYMENT_CANCELLED_CODE, AFRIBAPAY_TO_VEEP_METHOD } from '../constants/index.js'
import { getEffectiveTheme, buildPalette } from '../theme/index.js'
import { getOrCreateOverlay, closeOverlay } from '../overlay/index.js'
import { renderStepEvent } from '../steps/step0-tickets.js'
import { renderStep1 } from '../steps/step1.js'
import { renderStep3 } from '../steps/step3.js'
import { renderStep4 } from '../steps/step4.js'

/**
 * Ouvre la fenêtre de paiement et retourne une Promise.
 *
 * Mode AUTO (SDK gère tout — VEEP + AfribaPay) :
 *   createGateway({ publicKey: 'vp_live_xxx', apiBaseUrl: 'https://...' })
 *   openPayment({ eventId })   → cover event + tickets avec sélecteurs qtés → formulaire → paiement
 *
 * Mode GÉNÉRIQUE (intégrateur contrôle les appels API) :
 *   createGateway({ onSubmit: async (formData) => { orderId }, onPoll: async (orderId) => { status } })
 *   openPayment({ amount, methods: ['MTN', 'Moov'] })
 *
 * @param {Object} baseConfig - Config globale passée à createGateway
 * @param {Object} options    - Options de la session
 * @returns {Promise<Object>}
 */
export function openPayment(baseConfig, options) {
  return new Promise((resolve, reject) => {
    let settled = false
    let isClosed = false

    const finalConfig = { ...baseConfig, ...(options ?? {}) }
    const isAutoMode = !!(finalConfig.apiBaseUrl && finalConfig.publicKey)

    // ── Résolution Promise ────────────────────────────────────────

    function finishWithSuccess(result) {
      if (settled) return
      settled = true
      typeof finalConfig.onComplete === 'function' && finalConfig.onComplete(result)
      resolve(result)
    }

    function finishWithError(err) {
      if (settled) return
      settled = true
      const error = err instanceof Error ? err : new Error(err?.message ?? String(err ?? 'Erreur inconnue'))
      typeof finalConfig.onError === 'function' && finalConfig.onError(error)
      reject(error)
    }

    function finishWithCancel() {
      if (settled) return
      settled = true
      isClosed = true
      typeof finalConfig.onCancel === 'function' && finalConfig.onCancel()
      reject({ code: PAYMENT_CANCELLED_CODE, message: "Paiement annulé par l'utilisateur." })
      closeOverlay()
    }

    // ── Palette + modal ───────────────────────────────────────────

    const effectiveTheme = getEffectiveTheme(finalConfig.theme ?? baseConfig.theme ?? 'auto')
    const palette = buildPalette(effectiveTheme, finalConfig.colors ?? {})

    const overlay = getOrCreateOverlay()
    overlay.style.background = palette.overlayBg
    overlay.innerHTML = ''

    const modal = document.createElement('div')

    // Largeur : 560px pour le mode event (cover plein-bord), 380px pour mode générique sans event
    const hasEventId = !!(isAutoMode && finalConfig.eventId)
    const modalWidth = hasEventId
      ? (finalConfig.eventsModalWidth ?? '560px')
      : (finalConfig.paymentModalWidth ?? '380px')

    // overflow:hidden → clips border-radius ; overflow-y:auto → scroll vertical
    // (overflow-y:auto prend le dessus sur overflow-y:hidden de overflow:hidden)
    modal.style.cssText = [
      'position:relative;border-radius:22px;overflow:hidden;overflow-y:auto',
      'width:' + modalWidth + ';max-width:95vw',
      'background:' + palette.modalBg + ';color:' + palette.textPrimary,
      'box-shadow:0 20px 60px rgba(0,0,0,0.5)',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'max-height:92vh',
      'border:0.5px solid rgba(255,255,255,0.1)',
    ].join(';')
    overlay.appendChild(modal)

    // stepContainer : les steps écrivent ici (innerHTML = '' sur ce container,
    // pas sur modal, pour préserver les éléments persistants comme le close X)
    const stepContainer = document.createElement('div')
    modal.appendChild(stepContainer)

    // En mode générique (sans event), ajouter un close X persistant hors du stepContainer
    if (!hasEventId) {
      const closeX = document.createElement('button')
      closeX.type = 'button'
      closeX.setAttribute('aria-label', 'Fermer')
      closeX.textContent = '×'
      closeX.style.cssText = 'position:absolute;top:12px;right:14px;z-index:10;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:rgba(245,245,245,0.5);font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center'
      closeX.addEventListener('click', () => finishWithCancel())
      modal.appendChild(closeX)
    }

    // ── Contexte partagé ─────────────────────────────────────────

    const ctx = {
      modal: stepContainer,  // les steps écrivent dans stepContainer, pas modal
      finalConfig,
      baseConfig,
      palette,
      isAutoMode,
      selectedOperator: null,
      selectedCountry: null,
      selectedQuantities: {},
      _availableTickets: [],
      _event: null,
      onCancel: finishWithCancel,
    }

    // Navigation : tickets → formulaire
    ctx.onProceed = () => renderStep1(ctx)

    // Navigation : formulaire → retour tickets (event mode) ou annulation (mode générique)
    ctx.onBack = () => {
      if (isAutoMode && finalConfig.eventId) {
        renderStepEvent(ctx)
      } else {
        finishWithCancel()
      }
    }

    // ── Callback formulaire → loading + appel API ─────────────────

    ctx.onFormSubmit = async (formData) => {
      if (isClosed) return
      renderStep3(ctx, { hasPaymentUrl: false })

      try {
        if (isAutoMode) {
          await handleAutoMode(ctx, formData, { finishWithSuccess, finishWithError, isClosed: () => isClosed })
        } else {
          await handleGenericMode(ctx, formData, { finishWithSuccess, finishWithError, isClosed: () => isClosed })
        }
      } catch (err) {
        if (isClosed) return
        renderStep4(ctx, {
          success: false,
          error: err?.message ?? 'Une erreur inattendue est survenue.',
          onRetry: () => {
            if (isAutoMode && finalConfig.eventId) renderStepEvent(ctx)
            else renderStep1(ctx)
          },
        })
        finishWithError(err)
      }
    }

    // ── Première étape ────────────────────────────────────────────

    if (isAutoMode && finalConfig.eventId) {
      renderStepEvent(ctx)
    } else {
      renderStep1(ctx)
    }
  })
}

// ── Mode AUTO ────────────────────────────────────────────────────

/**
 * Construit les items depuis selectedQuantities et appelle POST /orders.
 * Puis poll jusqu'à confirmation.
 */
async function handleAutoMode(ctx, formData, handlers) {
  const { finalConfig } = ctx
  const { finishWithSuccess, finishWithError, isClosed } = handlers

  const apiBaseUrl = finalConfig.apiBaseUrl ?? ctx.baseConfig?.apiBaseUrl
  const publicKey = finalConfig.publicKey ?? ctx.baseConfig?.publicKey

  const method = AFRIBAPAY_TO_VEEP_METHOD[ctx.selectedOperator?.code]

  // Construire les items depuis les sélections de quantité
  const items = Object.entries(ctx.selectedQuantities ?? {})
    .filter(([, qty]) => qty > 0)
    .map(([ticketId, quantity]) => ({ ticketId, quantity }))

  // Fallback si pas de sélection (mode sans étape tickets)
  const resolvedItems = items.length > 0
    ? items
    : (finalConfig.items ?? [{ ticketId: finalConfig.ticketId, quantity: finalConfig.quantity ?? 1 }])

  const orderBody = {
    eventId: finalConfig.eventId,
    items: resolvedItems,
    buyerPhone: formData.fullPhone,
    buyerEmail: formData.email,
    buyerFirstname: formData.prenom,
    buyerLastname: formData.nom,
    country: formData.countryCode ?? ctx.selectedCountry?.code ?? 'BJ',
  }
  if (method) orderBody.method = method

  const orderResp = await fetchApi(`${apiBaseUrl}/developer/public/orders`, {
    method: 'POST',
    publicKey,
    body: JSON.stringify(orderBody),
  })

  const { orderId, paymentUrl, isFree, status } = orderResp

  if (paymentUrl) {
    window.open(paymentUrl, '_blank')
    if (!isClosed()) renderStep3(ctx, { hasPaymentUrl: true })
  }

  if (isFree || status === 'CONFIRMED' || status === 'SUCCESS') {
    if (isClosed()) return
    renderStep4(ctx, { success: true, result: { ...orderResp, email: formData.email } })
    finishWithSuccess(orderResp)
    return
  }

  const pollResult = await pollUntilConfirmed(
    `${apiBaseUrl}/developer/public/orders/${orderId}`,
    publicKey,
    isClosed,
  )

  if (isClosed()) return

  if (pollResult.success) {
    renderStep4(ctx, { success: true, result: { ...pollResult.data, email: formData.email } })
    finishWithSuccess(pollResult.data)
  } else {
    renderStep4(ctx, {
      success: false,
      error: pollResult.error,
      onRetry: () => renderStepEvent(ctx),
    })
    finishWithError(new Error(pollResult.error))
  }
}

// ── Mode GÉNÉRIQUE ───────────────────────────────────────────────

async function handleGenericMode(ctx, formData, handlers) {
  const { finalConfig } = ctx
  const { finishWithSuccess, finishWithError, isClosed } = handlers

  if (typeof finalConfig.onSubmit !== 'function') {
    throw new Error('Mode GÉNÉRIQUE : `onSubmit` doit être une fonction async.')
  }

  const submitResult = await finalConfig.onSubmit(formData)
  const { orderId, paymentUrl, status, success } = submitResult ?? {}

  if (paymentUrl) {
    window.open(paymentUrl, '_blank')
    if (!isClosed()) renderStep3(ctx, { hasPaymentUrl: true })
  }

  if (status === 'CONFIRMED' || success === true || typeof finalConfig.onPoll !== 'function') {
    if (isClosed()) return
    renderStep4(ctx, { success: true, result: submitResult })
    finishWithSuccess(submitResult)
    return
  }

  const pollResult = await pollGeneric(finalConfig.onPoll, orderId, isClosed)

  if (isClosed()) return

  if (pollResult.success) {
    renderStep4(ctx, { success: true, result: pollResult.data })
    finishWithSuccess(pollResult.data)
  } else {
    renderStep4(ctx, { success: false, error: pollResult.error, onRetry: () => renderStep1(ctx) })
    finishWithError(new Error(pollResult.error))
  }
}

// ── Polling ──────────────────────────────────────────────────────

async function pollUntilConfirmed(url, publicKey, isClosed, maxMs = 120000, intervalMs = 2000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    if (isClosed()) return { success: false, error: 'Annulé' }
    await sleep(intervalMs)
    if (isClosed()) return { success: false, error: 'Annulé' }
    try {
      const data = await fetchApi(url, { publicKey })
      if (data.status === 'CONFIRMED') return { success: true, data }
      if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        return { success: false, data, error: "Paiement échoué ou annulé par l'opérateur." }
      }
    } catch {
      // Erreur réseau temporaire — on continue
    }
  }
  return { success: false, error: 'Délai dépassé (2 min). Vérifiez votre email si le paiement a été débité.' }
}

async function pollGeneric(onPoll, orderId, isClosed, maxMs = 120000, intervalMs = 2000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    if (isClosed()) return { success: false, error: 'Annulé' }
    await sleep(intervalMs)
    if (isClosed()) return { success: false, error: 'Annulé' }
    try {
      const result = await onPoll(orderId)
      if (result.status === 'CONFIRMED' || result.success === true) return { success: true, data: result }
      if (result.status === 'FAILED' || result.status === 'CANCELLED') {
        return { success: false, data: result, error: result.message ?? 'Paiement échoué.' }
      }
    } catch {
      // Continue
    }
  }
  return { success: false, error: "Délai d'attente dépassé." }
}

// ── Utilitaires ──────────────────────────────────────────────────

async function fetchApi(url, opts = {}) {
  const { method = 'GET', publicKey, body } = opts
  const headers = {}
  if (publicKey) headers['Authorization'] = `Bearer ${publicKey}`
  if (body) headers['Content-Type'] = 'application/json'
  const resp = await fetch(url, { method, headers, body })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.message ?? json.data?.message ?? `Erreur HTTP ${resp.status}`)
  return json.data ?? json
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
