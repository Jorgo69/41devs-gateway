import { openPayment as openPaymentImpl } from './openPayment.js'
import { DEFAULT_VEEP_API_BASE_URL } from '../constants/index.js'

/**
 * Initialise la gateway avec une configuration globale.
 * publicKey / secretKey : secretKey uniquement côté backend.
 * apiBaseUrl est figée sur l'API VEEP par défaut — à ne surcharger que pour du test local (mock).
 *
 * @param {Object} globalConfig - publicKey, environment, theme, logoUrl, etc.
 * @returns {{ openPayment: (options: Object) => Promise<Object> }}
 */
export function createGateway(globalConfig = {}) {
  const baseConfig = {
    environment: 'sandbox',
    apiBaseUrl: DEFAULT_VEEP_API_BASE_URL,
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
