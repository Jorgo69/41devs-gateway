import { PAYMENT_CANCELLED_CODE, DEFAULT_COUNTRIES, AFRIBAPAY_TO_VEEP_METHOD } from '../constants/index.js'
import { getEffectiveTheme, buildPalette } from '../theme/index.js'
import { getOrCreateOverlay, closeOverlay } from '../overlay/index.js'
import { renderStep1 } from '../steps/step1.js'
import { renderStep2 } from '../steps/step2.js'
import { renderStep3 } from '../steps/step3.js'
import { renderStep4 } from '../steps/step4.js'

/**
 * Ouvre la fenêtre de paiement et retourne une Promise.
 *
 * Deux modes supportés :
 *
 * Mode AUTO (SDK gère tout — VEEP + AfribaPay) :
 *   createGateway({ publicKey: 'vp_live_xxx', apiBaseUrl: 'https://...' })
 *   openPayment({ eventId, ticketId, quantity, amount, currency })
 *
 * Mode GÉNÉRIQUE (intégrateur contrôle les appels API) :
 *   createGateway({ onSubmit: async (formData) => { orderId }, onPoll: async (orderId) => { status } })
 *   openPayment({ amount, currency, methods: ['MTN', 'Moov'] })
 *
 * @param {Object} baseConfig - Config globale passée à createGateway
 * @param {Object} options - Options de la session (amount, currency, ticketId, eventId, callbacks…)
 * @returns {Promise<Object>}
 */
export function openPayment(baseConfig, options) {
  return new Promise((resolve, reject) => {
    let settled = false
    let isClosed = false

    const finalConfig = { ...baseConfig, ...(options ?? {}) }
    const isAutoMode = !!(finalConfig.apiBaseUrl && finalConfig.publicKey)

    // ── Résolution de la Promise ──────────────────────────────────

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

    // ── Setup modal ───────────────────────────────────────────────

    const requestedTheme = finalConfig.theme ?? baseConfig.theme ?? 'auto'
    const effectiveTheme = getEffectiveTheme(requestedTheme)
    const palette = buildPalette(effectiveTheme, finalConfig.colors ?? {})
    const countries = finalConfig.countries ?? DEFAULT_COUNTRIES

    const overlay = getOrCreateOverlay()
    overlay.style.background = palette.overlayBg
    overlay.innerHTML = ''

    const modal = document.createElement('div')
    modal.style.cssText = [
      'position:relative;border-radius:12px;padding:24px;width:380px;max-width:92%',
      'background:' + palette.modalBg + ';color:' + palette.textPrimary,
      'box-shadow:0 10px 30px rgba(0,0,0,0.25)',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'max-height:90vh;overflow-y:auto',
    ].join(';')
    overlay.appendChild(modal)

    // ── Contexte partagé entre les steps ─────────────────────────

    const ctx = {
      modal,
      finalConfig,
      baseConfig,
      palette,
      countries,
      isAutoMode,
      selectedOperator: null,
      selectedCountry: null,
      onCancel: finishWithCancel,
    }

    ctx.onBack = () => renderStep1(ctx)
    ctx.onMethodSelect = (methodLabel, operator) => {
      ctx.selectedOperator = operator
      renderStep2(ctx, methodLabel)
    }

    // ── Callback step2 → step3 + appel API ───────────────────────

    ctx.onFormSubmit = async (formData) => {
      if (isClosed) return
      renderStep3(ctx, { hasPaymentUrl: false })

      try {
        if (isAutoMode) {
          await handleAutoMode(ctx, formData, {
            finishWithSuccess,
            finishWithError,
            isClosed: () => isClosed,
          })
        } else {
          await handleGenericMode(ctx, formData, {
            finishWithSuccess,
            finishWithError,
            isClosed: () => isClosed,
          })
        }
      } catch (err) {
        if (isClosed) return
        renderStep4(ctx, {
          success: false,
          error: err?.message ?? 'Une erreur inattendue est survenue.',
          onRetry: () => renderStep1(ctx),
        })
        finishWithError(err)
      }
    }

    renderStep1(ctx)
  })
}

// ── Mode AUTO ────────────────────────────────────────────────────

/**
 * Appelle POST /orders sur VEEP puis lance le polling.
 * @param {Object} ctx
 * @param {Object} formData - Données du formulaire step2
 * @param {{ finishWithSuccess, finishWithError, isClosed }} handlers
 */
async function handleAutoMode(ctx, formData, handlers) {
  const { finalConfig } = ctx
  const { finishWithSuccess, finishWithError, isClosed } = handlers

  const apiBaseUrl = finalConfig.apiBaseUrl ?? ctx.baseConfig?.apiBaseUrl
  const publicKey = finalConfig.publicKey ?? ctx.baseConfig?.publicKey

  const method = AFRIBAPAY_TO_VEEP_METHOD[ctx.selectedOperator?.code]
  const orderBody = {
    eventId: finalConfig.eventId,
    items: finalConfig.items ?? [{ ticketId: finalConfig.ticketId, quantity: finalConfig.quantity ?? 1 }],
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
    renderStep4(ctx, { success: false, error: pollResult.error, onRetry: () => renderStep1(ctx) })
    finishWithError(new Error(pollResult.error))
  }
}

// ── Mode GÉNÉRIQUE ───────────────────────────────────────────────

/**
 * Délègue les appels API à onSubmit/onPoll fournis par l'intégrateur.
 * @param {Object} ctx
 * @param {Object} formData
 * @param {{ finishWithSuccess, finishWithError, isClosed }} handlers
 */
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

/**
 * Interroge l'endpoint de statut VEEP toutes les 2s jusqu'à CONFIRMED, FAILED ou timeout (2 min).
 * @param {string} url
 * @param {string} publicKey
 * @param {() => boolean} isClosed
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
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
      // Erreur réseau temporaire — on continue le polling
    }
  }
  return { success: false, error: 'Délai dépassé (2 min). Vérifiez votre email si le paiement a été débité.' }
}

/**
 * Polling via callback onPoll fourni par l'intégrateur.
 * @param {Function} onPoll - async (orderId) => { status, success? }
 * @param {string} orderId
 * @param {() => boolean} isClosed
 */
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

/**
 * Fetch JSON avec Authorization: Bearer.
 * Unwrap la réponse VEEP { statusCode, data } si présente.
 */
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
