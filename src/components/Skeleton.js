/**
 * Blocs "skeleton" (shimmer) pour les écrans de chargement dont on connaît déjà la forme
 * finale (cover + billets, liste d'opérateurs) — évite le texte "Chargement..." brut et
 * le saut de layout une fois le contenu réel affiché.
 */

let styleInjected = false

function ensureStyle() {
  if (styleInjected || typeof document === 'undefined') return
  if (document.getElementById('fdg-skeleton-style')) { styleInjected = true; return }
  const style = document.createElement('style')
  style.id = 'fdg-skeleton-style'
  style.textContent = '@keyframes fdg-shimmer{0%{background-position:-200px 0}100%{background-position:calc(200px + 100%) 0}}'
  document.head.appendChild(style)
  styleInjected = true
}

/**
 * @param {Object} palette
 * @param {{ width?: string, height: string, radius?: string }} opts
 * @returns {HTMLElement}
 */
export function skeletonBlock(palette, { width = '100%', height, radius = '8px' } = {}) {
  ensureStyle()
  const el = document.createElement('div')
  const base = palette.surface2 ?? palette.surface ?? 'rgba(255,255,255,0.06)'
  const shine = palette.border ?? 'rgba(255,255,255,0.14)'
  el.style.cssText = [
    'width:' + width + ';height:' + height + ';border-radius:' + radius,
    'background:linear-gradient(90deg,' + base + ' 25%,' + shine + ' 37%,' + base + ' 63%)',
    'background-size:400px 100%',
    'animation:fdg-shimmer 1.4s ease infinite',
    'flex-shrink:0',
  ].join(';')
  return el
}

/** Ligne d'opérateur skeleton — même gabarit que _operatorBtn (icône + 2 lignes de texte). */
export function skeletonOperatorRow(palette) {
  const row = document.createElement('div')
  row.style.cssText = 'width:100%;display:flex;align-items:center;gap:12px;background:' + palette.surface + ';border:1.5px solid ' + palette.border + ';border-radius:12px;padding:11px 14px;box-sizing:border-box'
  row.appendChild(skeletonBlock(palette, { width: '34px', height: '34px', radius: '8px' }))
  const textCol = document.createElement('div')
  textCol.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:6px'
  textCol.appendChild(skeletonBlock(palette, { width: '60%', height: '10px' }))
  row.appendChild(textCol)
  return row
}
