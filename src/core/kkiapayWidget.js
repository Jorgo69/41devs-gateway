/**
 * Widget de paiement carte KKiaPay.
 * Charge le script officiel à la demande (uniquement si l'opérateur "card" est choisi),
 * puis ouvre le widget et résout avec le transactionId retourné au succès.
 *
 * La carte est intégralement gérée par KKiaPay côté client (saisie, 3D Secure) — le SDK
 * ne voit et ne stocke jamais de numéro de carte, expiration ou CVV.
 */
import { VEEP_KKIAPAY_PUBLIC_KEY, KKIAPAY_SCRIPT_URL } from '../constants/index.js'

let scriptLoadPromise = null

function loadKkiapayScript() {
  if (typeof window.openKkiapayWidget === 'function') return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = KKIAPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossible de charger le widget de paiement carte.'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

/**
 * Ouvre le widget carte KKiaPay pour le montant donné et résout au succès du paiement.
 * name/email/phone pré-remplissent le widget (déjà saisis dans le formulaire précédent) —
 * évite à l'acheteur de retaper les mêmes informations.
 * @param {{ amount: number, orderId: string, name?: string, email?: string, phone?: string }} params
 * @returns {Promise<{ transactionId: string }>} rejette si le paiement est refusé/échoue
 */
export async function payWithKkiapay({ amount, orderId, name, email, phone }) {
  await loadKkiapayScript()

  return new Promise((resolve, reject) => {
    try { window.removeKkiapayListener?.('success') } catch { /* pas de listener précédent */ }
    try { window.removeKkiapayListener?.('failed') } catch { /* pas de listener précédent */ }

    window.addSuccessListener((response) => {
      resolve({ transactionId: response.transactionId })
    })
    window.addFailedListener(() => {
      reject(new Error('Paiement par carte refusé.'))
    })

    window.openKkiapayWidget({
      amount,
      key: VEEP_KKIAPAY_PUBLIC_KEY,
      data: JSON.stringify({ orderId }),
      sandbox: false,
      paymentmethod: 'card',
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
    })
  })
}

/** Ferme le widget KKiaPay s'il est ouvert — appelé quand l'utilisateur annule le paiement. */
export function closeKkiapayWidget() {
  try { window.closeKkiapayWidget?.() } catch { /* widget jamais ouvert */ }
}
