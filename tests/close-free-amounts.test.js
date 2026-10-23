/**
 * @ Author: Ibrahim Djalilou BABA KOBI
 * @ Email: djalilou.baba@41devs.co
 * @ Github: https://github.com/Jorgo69
 * @ Gitlab: https://gitlab.com/Jorgo69
 * @ Create Time: 2026-10-22
 * @ Description: Retours de Jorgo (page Développeurs de VEEP) : la fenêtre se ferme par la croix à chaque étape, par un
 *   clic sur le fond et par Échap ; un billet gratuit ne demande pas de moyen de paiement ; montants « 1 000 FCFA » ;
 *   nom du billet (pas son type) ; e-mail de l'acheteur affiché en texte.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createGateway, PAYMENT_CANCELLED_CODE } from '../index.js'
import { _formatAmount, _ticketLabel } from '../src/steps/step0-tickets.js'

const API = 'https://api.test/api/v1'
const EVENT = { id: 'e1', title: 'Concert', city: 'Cotonou', eventDates: [{ sessionDate: '2026-11-08' }] }

/**
 * Faux serveur VEEP : évènement, billets (prix au choix), opérateurs, commande.
 * @param {string} price prix des billets (« 0.00 » = gratuit)
 * @returns {{ calls: {url: string, body?: any}[] }}
 */
function mockApi(price) {
  const calls = []
  vi.stubGlobal('fetch', vi.fn(async (url, init = {}) => {
    calls.push({ url, body: init.body ? JSON.parse(init.body) : undefined })
    const ok = (data) => ({ ok: true, status: 200, json: async () => ({ data }) })
    if (url.endsWith('/events/e1')) return ok(EVENT)
    if (url.endsWith('/events/e1/tickets')) return ok({ items: [
      { id: 't1', ticketName: 'Pass VIP', ticketType: 'STANDARD', ticketPrice: price, quantityAvailable: 50, maxPurchase: 10 },
      { id: 't2', ticketName: 'Pass Étudiant', ticketType: 'STANDARD', ticketPrice: price, quantityAvailable: 50, maxPurchase: 10 },
    ] })
    if (url.includes('/operators')) return ok([{ code: 'mtn', name: 'MTN Mobile Money' }])
    if (url.endsWith('/orders')) return ok({ orderId: 'o1', orderNumber: 'VEEP-1', isFree: price === '0.00', status: 'CONFIRMED', total: 0 })
    return { ok: false, status: 404, json: async () => ({ message: 'introuvable' }) }
  }))
  return { calls }
}

const overlay = () => document.getElementById('fdg-overlay')
const buttons = () => [...(overlay()?.querySelectorAll('button') ?? [])]
const byText = (re) => buttons().find((b) => re.test(b.textContent))
const tick = () => new Promise((r) => setTimeout(r, 0))

/** Ouvre la fenêtre en mode AUTO et attend l'affichage des billets. */
async function openEvent(price) {
  const api = mockApi(price)
  const promise = createGateway({ publicKey: 'vp_live_x', apiBaseUrl: API }).openPayment({ eventId: 'e1' })
  promise.catch(() => {})
  for (let i = 0; i < 10 && !byText(/Choisir mes billets/); i++) await tick()
  return { api, promise }
}

/** Ajoute un billet puis passe au formulaire. */
async function goToForm() {
  buttons().filter((b) => b.textContent.trim() === '+')[0].click()
  byText(/Choisir mes billets/).click()
  await tick()
}

afterEach(() => {
  overlay()?.remove()
  vi.unstubAllGlobals()
})

describe('fermeture de la fenêtre', () => {
  it('clic sur le fond → annulée, fenêtre retirée', async () => {
    const { promise } = await openEvent('1000.00')
    overlay().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await expect(promise).rejects.toMatchObject({ code: PAYMENT_CANCELLED_CODE })
    expect(overlay()).toBeNull()
  })

  it('clic DANS la fenêtre → reste ouverte', async () => {
    await openEvent('1000.00')
    overlay().firstElementChild.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(overlay()).not.toBeNull()
  })

  it('Échap → annulée', async () => {
    const { promise } = await openEvent('1000.00')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await expect(promise).rejects.toMatchObject({ code: PAYMENT_CANCELLED_CODE })
    expect(overlay()).toBeNull()
  })

  it('étape formulaire (mode évènement) : une croix « Fermer » existe et annule', async () => {
    const { promise } = await openEvent('1000.00')
    await goToForm()
    const close = buttons().find((b) => b.getAttribute('aria-label') === 'Fermer')
    expect(close).toBeTruthy()
    close.click()
    await expect(promise).rejects.toMatchObject({ code: PAYMENT_CANCELLED_CODE })
  })
})

describe('billet gratuit', () => {
  it('pas de « Moyen de paiement », bouton Confirmer, commande envoyée sans méthode', async () => {
    const { api, promise } = await openEvent('0.00')
    await goToForm()
    expect(overlay().textContent).not.toContain('Moyen de paiement')
    expect(api.calls.some((c) => c.url.includes('/operators'))).toBe(false)
    const inputs = [...overlay().querySelectorAll('input')]
    const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('input')) }
    set(inputs[0], 'Awa'); set(inputs[1], 'Diallo'); set(inputs[2], 'awa@example.com')
    set(inputs.find((i) => i.type === 'tel') ?? inputs[3], '0161000000')
    const cta = byText(/Confirmer/)
    expect(cta.disabled).toBe(false)
    cta.click()
    const result = await promise
    expect(result.orderNumber).toBe('VEEP-1')
    const order = api.calls.find((c) => c.url.endsWith('/orders'))
    expect(order.body.method).toBeUndefined()
    expect(overlay().textContent).toContain('Réservation confirmée')
  })

  it('billet payant : le moyen de paiement reste demandé', async () => {
    await openEvent('1000.00')
    await goToForm()
    await tick()
    expect(overlay().textContent).toContain('Moyen de paiement')
  })
})

describe('affichage', () => {
  it('montants entiers « 1 000 FCFA » (même si l’API renvoie « 1000.00 »)', () => {
    expect(_formatAmount('1000.00')).toBe('1 000 FCFA')
    expect(_formatAmount(0)).toBe('0 FCFA')
  })

  it('nom du billet saisi par l’organisateur, sinon son type', () => {
    expect(_ticketLabel({ ticketName: 'Pass VIP', ticketType: 'STANDARD' })).toBe('Pass VIP')
    expect(_ticketLabel({ ticketName: '  ', ticketType: 'VIP' })).toBe('VIP')
  })

  it('les billets de la fenêtre portent leur nom, plus deux « Standard »', async () => {
    await openEvent('1000.00')
    expect(overlay().textContent).toContain('Pass VIP')
    expect(overlay().textContent).toContain('Pass Étudiant')
    expect(overlay().textContent).toContain('1 000 FCFA')
    expect(overlay().textContent).not.toContain('XOF')
  })
})
