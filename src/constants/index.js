/**
 * Code d'erreur retourné quand l'utilisateur annule le paiement (bouton Annuler ou fermeture par la croix).
 * Permet de distinguer l'annulation d'une vraie erreur dans le .catch().
 */
export const PAYMENT_CANCELLED_CODE = 'CANCELLED'

/**
 * Logo 41dev par défaut (icône carrée, currentColor pour s'adapter au thème).
 */
export const DEFAULT_41DEV_LOGO_SVG =
  '<svg width="406" height="406" viewBox="0 0 406 406" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M135.102 235.245V0H0V405.207H202.604V235.245H135.102Z" fill="currentColor"/><path d="M270.105 170.243V405.207H405.207V7.34329e-05H202.604V170.243H270.105Z" fill="currentColor"/></svg>'

/** Méthodes considérées comme Mobile Money (formulaire pays + téléphone). */
export const MOBILE_MONEY_METHODS = ['MTN', 'Moov', 'Celtis', 'Wave', 'Orange']

export function isMobileMoney(method) {
  return MOBILE_MONEY_METHODS.includes(method)
}

/**
 * Mapping code opérateur AfribaPay (retourné par GET /operators) → enum PaymentMethod VEEP.
 * Utilisé en mode AUTO pour construire le body de POST /developer/public/orders.
 * @type {Record<string, string>}
 */
export const AFRIBAPAY_TO_VEEP_METHOD = {
  orange: 'ORANGE_MONEY',
  mtn: 'MTN_MOMO',
  moov: 'MOOV_MONEY',
  wave: 'WAVE',
  card: 'CARD',
}

/** Codes opérateurs considérés comme carte bancaire (formulaire différent du mobile money). */
export const CARD_OPERATOR_CODES = ['card']

/**
 * URL de l'API VEEP, figée par défaut — l'intégrateur ne fournit que sa publicKey (vp_live_xxx),
 * jamais cette URL. Reste surchargeable (finalConfig.apiBaseUrl) pour les tests locaux/mock.
 */
export const DEFAULT_VEEP_API_BASE_URL = 'https://api.prod.veep.fun/api/v1'

/**
 * Clé publique KKiaPay de VEEP (pas celle de l'intégrateur) — le paiement carte passe toujours
 * par le compte marchand KKiaPay de VEEP, jamais par un compte propre à l'intégrateur.
 * Sûre à exposer côté client (équivalent d'une clé publishable Stripe).
 */
export const VEEP_KKIAPAY_PUBLIC_KEY = '40221256e7280573a1ecaa6167721a91fbdf4bc2'

/** URL du script du widget KKiaPay, chargé dynamiquement uniquement si l'opérateur carte est choisi. */
export const KKIAPAY_SCRIPT_URL = 'https://cdn.kkiapay.me/k.js'

/** Pays supportés par défaut (indicatif, longueur téléphone). */
export const DEFAULT_COUNTRIES = [
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dial: '+229', minPhoneLength: 10, maxPhoneLength: 10 },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dial: '+225', minPhoneLength: 8, maxPhoneLength: 8 },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dial: '+228', minPhoneLength: 8, maxPhoneLength: 8 },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dial: '+221', minPhoneLength: 9, maxPhoneLength: 9 },
]

/** Palette couleurs thème sombre. */
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

/** Palette couleurs thème clair. */
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

/**
 * Cover par défaut affichée quand l'événement n'a pas de cover_url (ou que l'image ne charge
 * pas). Embarquée en base64 (WebP, ~7 Ko) plutôt que chargée depuis une URL distante — évite
 * toute dépendance réseau externe et le risque d'image qui ne s'affiche jamais.
 */
export const DEFAULT_EVENT_COVER_DATA_URI = 'data:image/webp;base64,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'
