/**
 * Step 1 — Cover + tickets + sélecteurs de quantité.
 *
 * Mode AUTO : fetch event (cover_url, title, city, event_dates, is_free, short_description)
 *             + fetch tickets (ticketType, ticketPrice, quantityAvailable, minPurchase, maxPurchase)
 * Mode GÉNÉRIQUE : finalConfig.event + finalConfig.tickets
 *
 * Stocke ctx._availableTickets pour que le step 2 puisse afficher le total.
 * Met à jour ctx.selectedQuantities { [ticketId]: qty }.
 */
import { skeletonBlock } from '../components/Skeleton.js'
import { DEFAULT_EVENT_COVER_DATA_URI } from '../constants/index.js'

export async function renderStepEvent(ctx) {
  const { modal, finalConfig, palette, onCancel, isAutoMode } = ctx

  // Phase 1 : loading
  _renderLoading(modal, palette, onCancel)

  // Phase 2 : fetch
  let event = null
  let tickets = []

  if (isAutoMode) {
    const eventId = finalConfig.eventId
    const publicKey = finalConfig.publicKey ?? ctx.baseConfig?.publicKey
    const apiBaseUrl = finalConfig.apiBaseUrl ?? ctx.baseConfig?.apiBaseUrl

    const [evRes, tkRes] = await Promise.allSettled([
      _fetchJson(`${apiBaseUrl}/developer/public/events/${eventId}`, publicKey),
      _fetchJson(`${apiBaseUrl}/developer/public/events/${eventId}/tickets`, publicKey),
    ])

    if (evRes.status === 'fulfilled') event = evRes.value
    if (tkRes.status === 'fulfilled') tickets = tkRes.value.items ?? tkRes.value

    if (!event) {
      _renderError(modal, palette, onCancel, evRes.reason?.message ?? 'Événement introuvable.')
      return
    }
  } else {
    event = finalConfig.event ?? {}
    tickets = finalConfig.tickets ?? []
  }

  const availableTickets = tickets.filter((t) => (t.quantityAvailable ?? 1) > 0 && _isOnSale(t))
  ctx._availableTickets = availableTickets
  ctx._event = event

  if (!ctx.selectedQuantities) ctx.selectedQuantities = {}

  // Phase 3 : render UI
  modal.innerHTML = ''
  modal.appendChild(_buildCover(event, palette, onCancel))

  const body = document.createElement('div')
  body.style.cssText = 'padding:16px 20px 22px'

  // Description
  const desc = event.short_description ?? event.shortDescription ?? event.description
  if (desc) {
    const descEl = document.createElement('p')
    descEl.style.cssText = [
      'font-size:13px;color:' + palette.textSecondary,
      'line-height:1.65;margin:0 0 18px',
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden',
    ].join(';')
    descEl.textContent = desc
    body.appendChild(descEl)
  }

  // Section label
  const sectionLabel = document.createElement('p')
  sectionLabel.style.cssText = 'font-size:10px;font-weight:600;color:' + palette.textSecondary + ';text-transform:uppercase;letter-spacing:1px;margin:0 0 10px'
  sectionLabel.textContent = 'Billets disponibles'
  body.appendChild(sectionLabel)

  // Ticket list container
  const ticketListEl = document.createElement('div')
  ticketListEl.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:18px'

  // Divider
  const divider = document.createElement('div')
  divider.style.cssText = 'height:0.5px;background:' + palette.border + ';margin-bottom:14px'

  // Summary — déclarés AVANT le forEach pour éviter la temporal dead zone dans updateUI
  const summaryContainer = document.createElement('div')
  summaryContainer.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px'

  const summaryLeft = document.createElement('div')
  const summaryLbl = document.createElement('div')
  summaryLbl.style.cssText = 'font-size:13px;color:' + palette.textSecondary
  summaryLbl.textContent = 'Total à payer'
  const summaryFee = document.createElement('div')
  summaryFee.style.cssText = 'font-size:11px;color:' + palette.textMuted + ';margin-top:2px;opacity:0.4'
  summaryFee.textContent = 'Commission VEEP incluse'
  summaryLeft.appendChild(summaryLbl)
  summaryLeft.appendChild(summaryFee)

  const totalEl = document.createElement('div')
  totalEl.style.cssText = 'font-size:22px;font-weight:800;color:' + palette.textPrimary

  summaryContainer.appendChild(summaryLeft)
  summaryContainer.appendChild(totalEl)

  // CTA — déclaré AVANT le forEach pour la même raison
  const cta = document.createElement('button')
  cta.type = 'button'
  cta.disabled = true
  cta.textContent = '🎫 Choisir mes billets'
  cta.style.cssText = _ctaStyle(palette, true)
  cta.addEventListener('click', () => { if (!cta.disabled) ctx.onProceed() })

  // updateUI — function declaration → hoistée, mais ses variables capturées (totalEl, cta…)
  // doivent être initialisées (const) avant le premier appel via _buildTicketCard
  function updateUI() {
    const total = _computeTotal(ctx.selectedQuantities, availableTickets)
    totalEl.textContent = total === 0 ? '0 XOF' : total.toLocaleString('fr-FR') + ' XOF'
    const hasSelection = Object.values(ctx.selectedQuantities).some((q) => q > 0)
    summaryFee.style.opacity = hasSelection ? '1' : '0.4'
    cta.disabled = !hasSelection
    cta.style.opacity = hasSelection ? '1' : '0.35'
    cta.style.cursor = hasSelection ? 'pointer' : 'not-allowed'
  }

  // Maintenant on construit les tickets (updateUI peut être appelée en toute sécurité)
  if (availableTickets.length === 0) {
    const emptyEl = document.createElement('p')
    emptyEl.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';text-align:center;margin:16px 0'
    emptyEl.textContent = 'Aucun billet disponible pour cet événement.'
    ticketListEl.appendChild(emptyEl)
  } else {
    availableTickets.forEach((ticket) => {
      ticketListEl.appendChild(_buildTicketCard(ticket, ctx, palette, updateUI))
    })
  }

  // Assemblage final dans le body
  body.appendChild(ticketListEl)
  body.appendChild(divider)
  body.appendChild(summaryContainer)
  body.appendChild(cta)
  body.appendChild(_buildFooter(palette))
  modal.appendChild(body)

  updateUI()
}

// ── Helpers ───────────────────────────────────────────────────────

function _buildCover(event, palette, onCancel) {
  const cover = document.createElement('div')
  cover.style.cssText = 'width:100%;height:230px;position:relative;overflow:hidden;background:#111;flex-shrink:0'

  const img = document.createElement('img')
  img.src = event.cover_url ?? event.coverUrl ?? DEFAULT_EVENT_COVER_DATA_URI
  img.alt = event.title ?? ''
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block'
  // Si la cover distante échoue (URL cassée, lente, réseau) → fallback embarqué, jamais de zone vide.
  img.onerror = () => {
    if (img.src === DEFAULT_EVENT_COVER_DATA_URI) { img.onerror = null; return }
    img.src = DEFAULT_EVENT_COVER_DATA_URI
  }
  cover.appendChild(img)

  // Gradient bas → titre lisible
  const grad = document.createElement('div')
  grad.style.cssText = 'position:absolute;inset:0;background:linear-gradient(to top,#0D0D0D 0%,rgba(13,13,13,0.25) 55%,transparent 100%)'
  cover.appendChild(grad)

  // Bouton fermer (haut gauche)
  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Fermer')
  closeBtn.innerHTML = '✕'
  closeBtn.style.cssText = 'position:absolute;top:12px;left:12px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.55);border:0.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:14px;padding:0;line-height:1'
  closeBtn.addEventListener('click', () => onCancel())
  cover.appendChild(closeBtn)

  // Badge (haut droit)
  const badge = document.createElement('span')
  badge.style.cssText = 'position:absolute;top:12px;right:12px;background:' + palette.primaryButtonBg + ';color:#fff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:100px;letter-spacing:0.2px'
  badge.textContent = (event.is_free ?? event.isFree) ? '🎟️ Gratuit' : '🔥 En vente'
  cover.appendChild(badge)

  // Info bas (date · ville + titre)
  const info = document.createElement('div')
  info.style.cssText = 'position:absolute;bottom:14px;left:18px;right:18px'

  const meta = document.createElement('div')
  meta.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap'
  const dates = event.event_dates ?? event.eventDates
  const dateStr = _formatEventDate(dates)
  const city = event.city
  ;[dateStr, city].filter(Boolean).forEach((item, i, arr) => {
    const span = document.createElement('span')
    span.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.72)'
    span.textContent = item
    meta.appendChild(span)
    if (i < arr.length - 1) {
      const dot = document.createElement('span')
      dot.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.35)'
      dot.textContent = '·'
      meta.appendChild(dot)
    }
  })
  info.appendChild(meta)

  const titleEl = document.createElement('h2')
  titleEl.style.cssText = 'font-size:22px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.5px;margin:0'
  titleEl.textContent = event.title ?? ''
  info.appendChild(titleEl)
  cover.appendChild(info)

  return cover
}

function _buildTicketCard(ticket, ctx, palette, onUpdate) {
  const price = parseFloat(ticket.ticketPrice ?? ticket.price ?? 0)
  const priceLabel = price === 0 ? 'Gratuit' : price.toLocaleString('fr-FR') + ' XOF'
  const maxQty = Math.min(ticket.maxPurchase ?? 10, ticket.quantityAvailable ?? 999)
  const minQty = 0

  const card = document.createElement('div')
  card.style.cssText = [
    'background:' + palette.surface,
    'border:1.5px solid ' + palette.border,
    'border-radius:14px;padding:12px 14px',
    'display:flex;align-items:center;justify-content:space-between',
    'transition:border-color 0.15s,background 0.15s',
  ].join(';')

  // Gauche : type + infos
  const left = document.createElement('div')
  left.style.overflow = 'hidden'

  const nameEl = document.createElement('div')
  nameEl.style.cssText = 'font-size:14px;font-weight:600;color:' + palette.textPrimary + ';margin-bottom:2px'
  nameEl.textContent = _formatTicketType(ticket.ticketType)
  left.appendChild(nameEl)

  const infoText = [
    ticket.description ?? null,
    ticket.quantityAvailable != null && ticket.quantityAvailable <= 10
      ? ticket.quantityAvailable + ' restant' + (ticket.quantityAvailable > 1 ? 's' : '')
      : null,
  ].filter(Boolean).join(' · ')

  if (infoText) {
    const infoEl = document.createElement('div')
    infoEl.style.cssText = 'font-size:12px;color:' + palette.textSecondary + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px'
    infoEl.textContent = infoText
    left.appendChild(infoEl)
  }

  card.appendChild(left)

  // Droite : prix + sélecteur quantité
  const right = document.createElement('div')
  right.style.cssText = 'display:flex;align-items:center;gap:12px;flex-shrink:0'

  const priceEl = document.createElement('span')
  priceEl.style.cssText = 'font-size:15px;font-weight:700;white-space:nowrap;color:' + (price === 0 ? '#22c55e' : palette.textPrimary)
  priceEl.textContent = priceLabel
  right.appendChild(priceEl)

  // Qty container
  const qtyWrap = document.createElement('div')
  qtyWrap.style.cssText = 'display:flex;align-items:center;background:' + palette.surface2 + ';border:0.5px solid ' + palette.border + ';border-radius:8px;overflow:hidden'

  const minusBtn = _qtyBtn('−', palette)
  const qtySpan = document.createElement('span')
  qtySpan.style.cssText = 'font-size:13px;font-weight:600;color:' + palette.textPrimary + ';min-width:22px;text-align:center'
  const plusBtn = _qtyBtn('+', palette)

  qtyWrap.appendChild(minusBtn)
  qtyWrap.appendChild(qtySpan)
  qtyWrap.appendChild(plusBtn)
  right.appendChild(qtyWrap)
  card.appendChild(right)

  function setQty(newQty) {
    newQty = Math.max(minQty, Math.min(maxQty, newQty))
    ctx.selectedQuantities[ticket.id] = newQty
    qtySpan.textContent = newQty
    const selected = newQty > 0
    card.style.borderColor = selected ? palette.selectedBorder : palette.border
    card.style.background = selected ? palette.selectedBg : palette.surface
    minusBtn.disabled = newQty <= 0
    minusBtn.style.opacity = newQty <= 0 ? '0.3' : '1'
    plusBtn.disabled = newQty >= maxQty
    plusBtn.style.opacity = newQty >= maxQty ? '0.3' : '1'
    onUpdate()
  }

  minusBtn.addEventListener('click', (e) => { e.stopPropagation(); setQty((ctx.selectedQuantities[ticket.id] ?? 0) - 1) })
  plusBtn.addEventListener('click', (e) => { e.stopPropagation(); setQty((ctx.selectedQuantities[ticket.id] ?? 0) + 1) })
  card.addEventListener('click', () => setQty((ctx.selectedQuantities[ticket.id] ?? 0) + 1))

  setQty(ctx.selectedQuantities[ticket.id] ?? 0)

  return card
}

function _qtyBtn(label, palette) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = label
  btn.style.cssText = 'width:30px;height:30px;background:none;border:none;color:' + palette.textPrimary + ';font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0'
  return btn
}

// ── Shared exports ────────────────────────────────────────────────

export function _ctaStyle(palette, disabled = false) {
  return [
    'width:100%;padding:15px;background:' + palette.primaryButtonBg,
    'color:#fff;border:none;border-radius:100px',
    'font-size:15px;font-weight:700;cursor:' + (disabled ? 'not-allowed' : 'pointer'),
    'display:flex;align-items:center;justify-content:center;gap:8px',
    'transition:background 0.15s;letter-spacing:0.2px;box-sizing:border-box',
    'opacity:' + (disabled ? '0.35' : '1'),
  ].join(';')
}

export function _buildFooter(palette) {
  const footer = document.createElement('div')
  footer.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:5px;margin-top:12px;font-size:11px;color:' + palette.textMuted
  footer.innerHTML = 'Propulsé par <strong style="color:' + palette.primaryButtonBg + ';font-weight:800;letter-spacing:0.5px;margin-left:3px">VEEP</strong>'
  return footer
}

export function _computeTotal(selectedQuantities, tickets) {
  return tickets.reduce((sum, t) => {
    const qty = selectedQuantities[t.id] ?? 0
    return sum + parseFloat(t.ticketPrice ?? 0) * qty
  }, 0)
}

export function _formatTicketType(type) {
  const map = {
    STANDARD: 'Standard', VIP: 'VIP', VVIP: 'VVIP',
    EARLY_BIRD: 'Early Bird', GROUP: 'Groupe',
    STUDENT: 'Étudiant', FREE: 'Gratuit', GRATUIT: 'Gratuit', TABLE: 'Table',
  }
  return map[String(type ?? '').toUpperCase()] ?? type ?? 'Billet'
}

/**
 * Un billet hors de sa fenêtre de vente (startSale/endSale) est rejeté par le backend
 * à la création de commande — on le filtre déjà côté SDK pour éviter de faire remplir
 * tout le formulaire à l'acheteur pour rien.
 */
function _isOnSale(ticket) {
  const now = new Date()
  if (ticket.startSale && now < new Date(ticket.startSale)) return false
  if (ticket.endSale && now > new Date(ticket.endSale)) return false
  return true
}

export function _formatEventDate(eventDates) {
  if (!Array.isArray(eventDates) || eventDates.length === 0) return ''
  const first = eventDates[0]
  const d = new Date(first.startDate ?? first.sessionDate)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Skeleton respectant le gabarit final (cover + description + billets) — évite le texte
 * "Chargement..." brut et le saut de layout quand le contenu réel arrive. Garde un bouton
 * fermer utilisable pendant le chargement (absent auparavant).
 */
function _renderLoading(modal, palette, onCancel) {
  modal.innerHTML = ''

  const coverWrap = document.createElement('div')
  coverWrap.style.cssText = 'position:relative;width:100%;height:230px;overflow:hidden;flex-shrink:0'
  coverWrap.appendChild(skeletonBlock(palette, { height: '230px', radius: '0' }))
  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Fermer')
  closeBtn.innerHTML = '✕'
  closeBtn.style.cssText = 'position:absolute;top:12px;left:12px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.55);border:0.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:14px;padding:0;line-height:1'
  closeBtn.addEventListener('click', () => onCancel())
  coverWrap.appendChild(closeBtn)
  modal.appendChild(coverWrap)

  const body = document.createElement('div')
  body.style.cssText = 'padding:16px 20px 22px;display:flex;flex-direction:column;gap:10px'
  body.appendChild(skeletonBlock(palette, { height: '13px', width: '85%' }))
  body.appendChild(skeletonBlock(palette, { height: '13px', width: '55%' }))

  const ticketsWrap = document.createElement('div')
  ticketsWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:8px'
  ticketsWrap.appendChild(skeletonBlock(palette, { height: '58px', radius: '14px' }))
  ticketsWrap.appendChild(skeletonBlock(palette, { height: '58px', radius: '14px' }))
  body.appendChild(ticketsWrap)

  body.appendChild(skeletonBlock(palette, { height: '48px', radius: '100px' }))
  modal.appendChild(body)
}

function _renderError(modal, palette, onCancel, msg) {
  modal.innerHTML = ''
  const body = document.createElement('div')
  body.style.cssText = 'padding:52px 20px 28px;display:flex;flex-direction:column;align-items:center;text-align:center'

  const icon = document.createElement('div')
  icon.style.cssText = 'width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(249,115,115,0.1);margin-bottom:12px;font-size:30px'
  icon.textContent = '❌'
  body.appendChild(icon)

  const title = document.createElement('h2')
  title.style.cssText = 'font-size:20px;font-weight:800;color:' + palette.textPrimary + ';margin:0 0 8px'
  title.textContent = "Impossible de charger l'événement"
  body.appendChild(title)

  const p = document.createElement('p')
  p.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';margin:0 0 20px;line-height:1.5;max-width:300px'
  p.textContent = msg
  body.appendChild(p)

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = 'Fermer'
  btn.style.cssText = 'width:100%;padding:14px;border-radius:100px;border:none;background:#FF4D00;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-sizing:border-box'
  btn.addEventListener('click', () => onCancel())
  body.appendChild(btn)

  body.appendChild(_buildFooter(palette))
  modal.appendChild(body)
}

async function _fetchJson(url, publicKey) {
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${publicKey}` } })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.message ?? json.data?.message ?? `HTTP ${resp.status}`)
  return json.data ?? json
}
