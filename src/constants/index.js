/**
 * Constantes et donnees par defaut du SDK.
 * Aucune dependance DOM ni reseau.
 */

/** Code d'erreur utilise quand l'utilisateur annule (bouton Annuler ou croix). Exporte pour la version beta. */
export const PAYMENT_CANCELLED_CODE = 'CANCELLED'

/** Logo 41 Devs au format SVG inline. Utilise currentColor pour s'adapter au theme (clair/sombre). */
export const DEFAULT_41DEV_LOGO_SVG =
  '<svg width="406" height="406" viewBox="0 0 406 406" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M135.102 235.245V0H0V405.207H202.604V235.245H135.102Z" fill="currentColor"/><path d="M270.105 170.243V405.207H405.207V7.34329e-05H202.604V170.243H270.105Z" fill="currentColor"/></svg>'

/** Liste des moyens de paiement consideres comme Mobile Money (formulaire avec pays et telephone). */
export const MOBILE_MONEY_METHODS = ['MTN', 'Moov', 'Celtis']

/**
 * Indique si un moyen de paiement est du Mobile Money.
 * @param {string} method - Nom du moyen (ex. MTN, Moov, Carte bancaire).
 * @returns {boolean} True si le moyen est dans MOBILE_MONEY_METHODS.
 */
export function isMobileMoney(method) {
  return MOBILE_MONEY_METHODS.includes(method)
}

/**
 * Liste des pays supportes par defaut.
 * Chaque objet : code ISO, nom, drapeau (emoji), indicatif telephone, longueur min et max du numero.
 */
export const DEFAULT_COUNTRIES = [
  { code: 'BJ', name: 'Benin', flag: 'BJ', dial: '+229', minPhoneLength: 10, maxPhoneLength: 10 },
  { code: 'CI', name: 'Cote d\'Ivoire', flag: 'CI', dial: '+225', minPhoneLength: 8, maxPhoneLength: 8 },
  { code: 'TG', name: 'Togo', flag: 'TG', dial: '+228', minPhoneLength: 8, maxPhoneLength: 8 },
  { code: 'SN', name: 'Senegal', flag: 'SN', dial: '+221', minPhoneLength: 9, maxPhoneLength: 9 },
]

/** Palette de couleurs pour le theme sombre (fond overlay, fond modal, texte, bordures, boutons). */
export const DEFAULT_PALETTE_DARK = {
  overlayBg: 'rgba(15, 23, 42, 0.75)',
  modalBg: '#020617',
  textPrimary: '#e5e7eb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  amountText: '#f9fafb',
  border: '#1f2937',
  methodsTitle: '#9ca3af',
  buttonBg: '#0f172a',
  buttonBgHover: '#1e293b',
  buttonText: '#e5e7eb',
  cancelBg: 'transparent',
  cancelBorder: '#4b5563',
  cancelText: '#e5e7eb',
  inputBg: '#0f172a',
  inputBorder: '#334155',
  inputText: '#e5e7eb',
  inputPlaceholder: '#6b7280',
  primaryButtonBg: '#2563eb',
  primaryButtonText: '#ffffff',
}

/** Palette de couleurs pour le theme clair. */
export const DEFAULT_PALETTE_LIGHT = {
  overlayBg: 'rgba(0, 0, 0, 0.6)',
  modalBg: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  amountText: '#111827',
  border: '#e5e7eb',
  methodsTitle: '#888888',
  buttonBg: '#f8f8f8',
  buttonBgHover: '#eeeeee',
  buttonText: '#111827',
  cancelBg: '#ffffff',
  cancelBorder: '#dddddd',
  cancelText: '#111827',
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputText: '#111827',
  inputPlaceholder: '#9ca3af',
  primaryButtonBg: '#2563eb',
  primaryButtonText: '#ffffff',
}
