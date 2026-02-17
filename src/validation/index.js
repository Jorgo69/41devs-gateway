const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || !email.trim()) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  if (!EMAIL_REGEX.test(email.trim())) return { valid: false, error: 'Veuillez entrer une adresse email valide.' }
  return { valid: true }
}

/**
 * @param {{ minPhoneLength?: number, maxPhoneLength?: number, name: string }} country
 * @param {string} phoneDigits - chiffres uniquement
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePhoneForCountry(country, phoneDigits) {
  if (!country) return { valid: false, error: 'Veuillez choisir un pays.' }
  const minLen = country.minPhoneLength ?? 8
  const maxLen = country.maxPhoneLength ?? 15
  if (phoneDigits.length < minLen || phoneDigits.length > maxLen) {
    return { valid: false, error: `Le numéro de téléphone pour ${country.name} doit contenir entre ${minLen} et ${maxLen} chiffres.` }
  }
  return { valid: true }
}

/**
 * @param {string} cardNumberRaw - chiffres uniquement
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCardNumber(cardNumberRaw) {
  if (!cardNumberRaw) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  if (!/^\d{12,19}$/.test(cardNumberRaw)) return { valid: false, error: 'Le numéro de carte est invalide.' }
  return { valid: true }
}

/**
 * @param {string} expiryRaw - format MM/AA
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateExpiry(expiryRaw) {
  if (!expiryRaw || !expiryRaw.trim()) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  const match = expiryRaw.trim().match(/^(\d{2})\/(\d{2})$/)
  if (!match) return { valid: false, error: "La date d'expiration doit être au format MM/AA." }
  const month = Number(match[1])
  if (month < 1 || month > 12) return { valid: false, error: "Le mois d'expiration est invalide." }
  return { valid: true }
}

/**
 * @param {string} cvvRaw
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCvv(cvvRaw) {
  if (!cvvRaw || !cvvRaw.trim()) return { valid: false, error: 'Tous les champs sont obligatoires.' }
  if (!/^\d{3,4}$/.test(cvvRaw.trim())) return { valid: false, error: 'Le CVV est invalide.' }
  return { valid: true }
}
