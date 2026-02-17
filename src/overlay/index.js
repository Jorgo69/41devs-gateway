const OVERLAY_ID = 'fdg-overlay'

/**
 * Crée (si besoin) ou récupère le conteneur d'overlay plein écran.
 * @returns {HTMLElement}
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
 * Ferme et nettoie l'overlay.
 */
export function closeOverlay() {
  const overlay = document.getElementById(OVERLAY_ID)
  if (overlay) overlay.remove()
}
