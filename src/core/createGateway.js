import { openPayment as openPaymentImpl } from './openPayment.js'

/**
 * Initialise la gateway avec une configuration globale.
 * publicKey / secretKey : secretKey uniquement côté backend.
 *
 * @param {Object} globalConfig - publicKey, environment, theme, logoUrl, etc.
 * @returns {{ openPayment: (options: Object) => Promise<Object> }}
 */
export function createGateway(globalConfig = {}) {
  const baseConfig = {
    environment: 'sandbox',
    ...globalConfig,
  }

  return {
    openPayment(options) {
      return openPaymentImpl(baseConfig, options ?? {})
    },
  }
}

/** Alias pour éviter les conflits avec d'autres SDK. */
export { createGateway as create41DevsGateway }
