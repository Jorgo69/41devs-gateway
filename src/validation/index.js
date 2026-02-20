/**
 * Fonctions de validation des champs formulaire (email, telephone, carte).
 * Logique pure : pas de DOM, retourne un objet { valid: boolean, error?: string }.
 */

/** Expression reguliere pour valider le format d'une adresse email. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Verifie que la chaine est une adresse email valide et non vide.
 * @param {string} email - La valeur saisie.
 * @returns {{ valid: boolean, error?: string }} valid true si ok, sinon error contient le message.
 */
export function validateEmail(email) {
  if (!email || !email.trim()) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  if (!EMAIL_REGEX.test(email.trim())) return { valid: false, error: 'Veuillez entrer une adresse email valide.' }
  return { valid: true }
}

/**
 * Verifie que le numero de telephone (chiffres uniquement) a une longueur comprise entre min et max du pays.
 * @param {{ minPhoneLength?: number, maxPhoneLength?: number, name: string }} country - Objet pays avec longueurs attendues.
 * @param {string} phoneDigits - Chiffres du numero uniquement (sans espaces ni indicatif).
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePhoneForCountry(country, phoneDigits) {
  if (!country) return { valid: false, error: 'Veuillez choisir un pays.' }
  const minLen = country.minPhoneLength ?? 8
  const maxLen = country.maxPhoneLength ?? 15
  if (phoneDigits.length < minLen || phoneDigits.length > maxLen) {
    return { valid: false, error: `Le numero de telephone pour ${country.name} doit contenir entre ${minLen} et ${maxLen} chiffres.` }
  }
  return { valid: true }
}

/**
 * Verifie que le numero de carte contient entre 12 et 19 chiffres.
 * @param {string} cardNumberRaw - Chiffres uniquement.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCardNumber(cardNumberRaw) {
  if (!cardNumberRaw) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  if (!/^\d{12,19}$/.test(cardNumberRaw)) return { valid: false, error: 'Le numero de carte est invalide.' }
  return { valid: true }
}

/**
 * Verifie le format date d'expiration MM/AA et que le mois est entre 1 et 12.
 * @param {string} expiryRaw - Chaine au format MM/AA.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateExpiry(expiryRaw) {
  if (!expiryRaw || !expiryRaw.trim()) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  const match = expiryRaw.trim().match(/^(\d{2})\/(\d{2})$/)
  if (!match) return { valid: false, error: "La date d'expiration doit etre au format MM/AA." }
  const month = Number(match[1])
  if (month < 1 || month > 12) return { valid: false, error: "Le mois d'expiration est invalide." }
  return { valid: true }
}

/**
 * Verifie que le CVV contient 3 ou 4 chiffres.
 * @param {string} cvvRaw - Valeur saisie.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCvv(cvvRaw) {
  if (!cvvRaw || !cvvRaw.trim()) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  if (!/^\d{3,4}$/.test(cvvRaw.trim())) return { valid: false, error: 'Le CVV est invalide.' }
  return { valid: true }
}
