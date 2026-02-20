/**
 * API publique du SDK. createGateway retourne un objet avec la methode openPayment.
 */

import { openPayment as openPaymentImpl } from './openPayment.js'

/**
 * Initialise la gateway avec la config globale. Chaque appel a openPayment ouvrira la fenetre avec cette config.
 * @param {Object} globalConfig - publicKey, environment, theme, logoUrl, merchantLogoUrl, colors, etc. Optionnel.
 * @returns {{ openPayment: (options?: Object) => void }} Objet avec une seule methode openPayment. openPayment() ne retourne rien.
 */
export function createGateway(globalConfig = {}) {
  const baseConfig = {
    environment: 'sandbox',
    ...globalConfig,
  }

  return {
    openPayment(options) {
      openPaymentImpl(baseConfig, options ?? {})
    },
  }
}

/** Alias pour eviter les conflits de noms avec d'autres SDK dans le meme projet. */
export { createGateway as create41DevsGateway }
