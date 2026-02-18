import { openPayment as openPaymentImpl } from './openPayment.js'

/**
 * Initialise la gateway. Retourne un objet avec openPayment(options).
 * Au clic, openPayment ouvre la fenêtre (logo, Propulsé par 41 Devs, Annuler, X).
 *
 * @param {Object} globalConfig - publicKey, environment, theme, logoUrl, etc.
 * @returns {{ openPayment: (options: Object) => void }}
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

/** Alias pour éviter les conflits avec d'autres SDK. */
export { createGateway as create41DevsGateway }
