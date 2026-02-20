/**
 * Gestion du conteneur overlay plein ecran qui contient le modal.
 * Creation et suppression du DOM (document, body).
 */

/** Identifiant de l'element overlay dans le DOM. */
const OVERLAY_ID = 'fdg-overlay'

/**
 * Retourne l'element overlay s'il existe deja, sinon le cree, l'ajoute au body et le retourne.
 * L'overlay est en position fixed, plein ecran, centré, avec un z-index eleve.
 * @returns {HTMLElement} L'element div overlay.
 */
export function getOrCreateOverlay() {
  let overlay = document.getElementById(OVERLAY_ID)
  if (overlay) return overlay

  overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.background = 'rgba(0, 0, 0, 0.6)'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.zIndex = '9999'

  document.body.appendChild(overlay)
  return overlay
}

/**
 * Supprime l'overlay du DOM s'il existe.
 * Appelee quand l'utilisateur ferme la fenetre (Annuler ou croix).
 */
export function closeOverlay() {
  const overlay = document.getElementById(OVERLAY_ID)
  if (overlay) overlay.remove()
}
