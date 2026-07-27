/**
 * Step 2 — Formulaire coordonnées + sélection opérateur.
 *
 * Layout :
 *  - Header compact (nom event + total calculé depuis ctx.selectedQuantities)
 *  - Back button
 *  - Prénom / Nom (grid 2 colonnes)
 *  - Email
 *  - Téléphone avec sélecteur pays intégré (flag + dial code inline)
 *  - Zone opérateurs (chargés dynamiquement sur sélection pays)
 *  - Bouton Payer (désactivé jusqu'à form valide + opérateur sélectionné)
 *  - Footer VEEP
 *
 * Mode AUTO : opérateurs depuis GET /developer/public/operators?country=XX
 * Mode GÉNÉRIQUE : liste statique finalConfig.methods
 */

import { _ctaStyle, _buildFooter, _computeTotal, _formatTicketType } from './step0-tickets.js'
import * as validation from '../validation/index.js'
import { skeletonOperatorRow } from '../components/Skeleton.js'

const COUNTRIES = [
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dial: '+229', prefix: '229' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dial: '+225', prefix: '225' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dial: '+221', prefix: '221' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dial: '+228', prefix: '228' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dial: '+223', prefix: '223' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dial: '+226', prefix: '226' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', dial: '+224', prefix: '224' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dial: '+227', prefix: '227' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dial: '+237', prefix: '237' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dial: '+33', prefix: '33' },
]

/**
 * Affiche le formulaire de coordonnées + opérateurs.
 * @param {Object} ctx - Contexte partagé
 */
export function renderStep1(ctx) {
  const { modal, finalConfig, palette, isAutoMode, onCancel } = ctx
  const event = ctx._event ?? {}
  const tickets = ctx._availableTickets ?? []

  modal.innerHTML = ''

  const body = document.createElement('div')
  body.style.cssText = 'padding:20px 20px 24px;display:flex;flex-direction:column;gap:0'

  // Back + header
  body.appendChild(_buildHeader(ctx, palette, event, tickets))

  // Form
  const form = document.createElement('form')
  form.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-top:16px'
  form.noValidate = true

  const errorBox = document.createElement('p')
  errorBox.style.cssText = 'margin:0;font-size:12px;color:#f97373;display:none;padding:8px 12px;background:rgba(249,115,115,0.08);border-radius:8px'
  form.appendChild(errorBox)

  const showError = (msg) => { errorBox.textContent = msg; errorBox.style.display = 'block' }
  const clearError = () => { errorBox.style.display = 'none' }

  // Prénom / Nom
  const nameGrid = document.createElement('div')
  nameGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px'
  const { wrapper: wPrenom, input: iPrenom } = _createInput(palette, 'Prénom', { placeholder: 'Jean', autocomplete: 'given-name' })
  const { wrapper: wNom, input: iNom } = _createInput(palette, 'Nom', { placeholder: 'Dupont', autocomplete: 'family-name' })
  nameGrid.appendChild(wPrenom)
  nameGrid.appendChild(wNom)
  form.appendChild(nameGrid)

  // Email
  const { wrapper: wEmail, input: iEmail } = _createInput(palette, 'Email', { type: 'email', placeholder: 'exemple@email.com', autocomplete: 'email' })
  form.appendChild(wEmail)

  // Téléphone avec pays intégré
  let selectedCountry = COUNTRIES.find((c) => c.code === 'BJ') // par défaut Bénin
  const { wrapper: wPhone, phoneInput: iPhone, countrySelect: countrySelectEl, getCountry } = _createPhoneInput(palette, (country) => {
    selectedCountry = country
    loadOperators(country)
  })
  form.appendChild(wPhone)

  body.appendChild(form)

  // Section opérateurs
  const opSection = document.createElement('div')
  opSection.style.cssText = 'margin-top:16px'
  const opLabel = document.createElement('p')
  opLabel.style.cssText = 'font-size:10px;font-weight:600;color:' + palette.textSecondary + ';text-transform:uppercase;letter-spacing:1px;margin:0 0 8px'
  opLabel.textContent = 'Moyen de paiement'
  opSection.appendChild(opLabel)

  const opGrid = document.createElement('div')
  opGrid.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:4px'

  const opHint = document.createElement('p')
  opHint.style.cssText = 'font-size:12px;color:' + palette.textMuted + ';margin:4px 0'
  opHint.textContent = 'Chargement...'
  opGrid.appendChild(opHint)
  opSection.appendChild(opGrid)
  body.appendChild(opSection)

  // Divider
  const div = document.createElement('div')
  div.style.cssText = 'height:0.5px;background:' + palette.border + ';margin:16px 0'
  body.appendChild(div)

  // CTA
  const cta = document.createElement('button')
  cta.type = 'submit'
  cta.disabled = true
  cta.textContent = '💳 Payer maintenant'
  cta.style.cssText = _ctaStyle(palette, true)
  body.appendChild(cta)

  body.appendChild(_buildFooter(palette))
  modal.appendChild(body)

  // ── État opérateur sélectionné ──────────────────────────────────
  let selectedOperator = null

  function selectOperator(op, btn) {
    selectedOperator = op
    ctx.selectedOperator = op
    ctx.selectedCountry = getCountry()
    opGrid.querySelectorAll('button').forEach((b) => { if (b._setSelected) b._setSelected(false) })
    if (btn._setSelected) btn._setSelected(true)
    updateCta()
  }

  function updateCta() {
    const valid = iPrenom.value.trim() && iNom.value.trim() && iEmail.value.trim() && iPhone.value.trim() && !!selectedOperator
    cta.disabled = !valid
    cta.style.opacity = valid ? '1' : '0.35'
    cta.style.cursor = valid ? 'pointer' : 'not-allowed'
    if (valid) cta.textContent = _buildCtaLabel(ctx, tickets)
  }

  ;[iPrenom, iNom, iEmail, iPhone].forEach((inp) => inp.addEventListener('input', updateCta))

  // ── Chargement des opérateurs ──────────────────────────────────
  function loadOperators(country) {
    selectedOperator = null
    ctx.selectedOperator = null
    opGrid.innerHTML = ''
    opGrid.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:4px'
    opGrid.appendChild(skeletonOperatorRow(palette))
    opGrid.appendChild(skeletonOperatorRow(palette))
    updateCta()

    if (!isAutoMode) {
      _renderGenericOperators(opGrid, finalConfig.methods ?? ['MTN', 'Moov', 'Wave'], palette, (label) => {
        ctx.selectedOperator = { name: label, code: label.toLowerCase() }
        selectedOperator = ctx.selectedOperator
        updateCta()
      })
      return
    }

    const apiBaseUrl = finalConfig.apiBaseUrl ?? ctx.baseConfig?.apiBaseUrl
    const publicKey = finalConfig.publicKey ?? ctx.baseConfig?.publicKey

    const appendOperatorBtn = (op) => {
      const btn = _operatorBtn(op, palette)
      btn.addEventListener('click', (e) => { e.preventDefault(); selectOperator(op, btn) })
      opGrid.appendChild(btn)
    }

    // Carte bancaire : universelle, indépendante du pays — jamais fournie par l'API
    // pays (réservée au mobile money), toujours ajoutée côté client.
    const appendCardOption = () => appendOperatorBtn({ code: 'card', name: 'Carte bancaire' })

    _fetchJson(`${apiBaseUrl}/developer/public/operators?country=${country.code}`, publicKey)
      .then((operators) => {
        opGrid.innerHTML = ''
        if (Array.isArray(operators)) operators.forEach(appendOperatorBtn)
        appendCardOption()
      })
      .catch(() => {
        opGrid.innerHTML = ''
        appendCardOption()
      })
  }

  // Charger les opérateurs par défaut au montage
  loadOperators(selectedCountry)

  // ── Soumission ────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    clearError()

    const prenom = iPrenom.value.trim()
    const nom = iNom.value.trim()
    const email = iEmail.value.trim()
    const phoneRaw = iPhone.value.trim()
    const phoneDigits = phoneRaw.replace(/\D/g, '')
    const country = getCountry()

    if (!prenom || !nom) { showError('Prénom et nom obligatoires.'); return }
    const emailCheck = validation.validateEmail(email)
    if (!emailCheck.valid) { showError(emailCheck.error); return }
    if (!phoneDigits) { showError('Numéro de téléphone obligatoire.'); return }
    if (!selectedOperator) { showError('Veuillez choisir un moyen de paiement.'); return }

    ctx.onFormSubmit({
      prenom, nom, email,
      telephone: phoneRaw,
      fullPhone: `${country.dial}${phoneDigits}`,
      countryCode: country.code,
      countryName: country.name,
      dialCode: country.dial,
    })
  })

  cta.addEventListener('click', (e) => {
    if (!cta.disabled) form.requestSubmit()
  })
}

// ── Helpers DOM ───────────────────────────────────────────────────

function _buildHeader(ctx, palette, event, tickets) {
  const wrap = document.createElement('div')

  // Back button — "Annuler" en mode générique, "← Retour" en mode event
  const hasEvent = !!ctx._event?.title
  const back = document.createElement('button')
  back.type = 'button'
  back.textContent = hasEvent ? '← Retour' : 'Annuler'
  back.style.cssText = 'border:none;background:transparent;padding:0;cursor:pointer;font-size:13px;color:' + palette.textSecondary + ';margin-bottom:14px;display:inline-flex;align-items:center;gap:4px'
  back.addEventListener('click', () => ctx.onBack())
  wrap.appendChild(back)

  // Event title compact
  if (event.title) {
    const titleEl = document.createElement('h2')
    titleEl.style.cssText = 'font-size:19px;font-weight:800;color:' + palette.textPrimary + ';margin:0 0 6px;letter-spacing:-0.3px;line-height:1.2'
    titleEl.textContent = event.title
    wrap.appendChild(titleEl)
  }

  // Résumé billets sélectionnés
  const available = ctx._availableTickets ?? []
  const selected = ctx.selectedQuantities ?? {}
  const selectedItems = available.filter((t) => (selected[t.id] ?? 0) > 0)

  if (selectedItems.length > 0) {
    const summary = document.createElement('div')
    summary.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;margin-bottom:0'
    selectedItems.forEach((t) => {
      const qty = selected[t.id]
      const chip = document.createElement('span')
      chip.style.cssText = 'font-size:12px;background:' + palette.surface + ';border:0.5px solid ' + palette.border + ';border-radius:100px;padding:3px 10px;color:' + palette.textSecondary
      chip.textContent = `${qty}× ${_formatTicketType(t.ticketType)}`
      summary.appendChild(chip)
    })

    const total = _computeTotal(selected, available)
    const totalChip = document.createElement('span')
    totalChip.style.cssText = 'font-size:12px;background:rgba(255,77,0,0.15);border-radius:100px;padding:3px 10px;color:#FF4D00;font-weight:700'
    totalChip.textContent = total === 0 ? 'Gratuit' : total.toLocaleString('fr-FR') + ' XOF'
    summary.appendChild(totalChip)
    wrap.appendChild(summary)
  }

  return wrap
}

function _createInput(palette, label, opts = {}) {
  const wrapper = document.createElement('div')
  const lbl = document.createElement('label')
  lbl.style.cssText = 'display:block;font-size:12px;color:' + palette.textSecondary + ';margin-bottom:5px;font-weight:500'
  lbl.textContent = label

  const input = document.createElement('input')
  input.type = opts.type ?? 'text'
  if (opts.placeholder) input.placeholder = opts.placeholder
  if (opts.autocomplete) input.autocomplete = opts.autocomplete
  input.style.cssText = [
    'width:100%;box-sizing:border-box;padding:11px 13px',
    'border-radius:10px;border:1px solid ' + palette.inputBorder,
    'background:' + palette.inputBg + ';color:' + palette.inputText,
    'font-size:14px;outline:none;transition:border-color 0.15s',
  ].join(';')
  input.addEventListener('focus', () => { input.style.borderColor = palette.inputBorderFocus })
  input.addEventListener('blur', () => { input.style.borderColor = palette.inputBorder })

  wrapper.appendChild(lbl)
  wrapper.appendChild(input)
  return { wrapper, input }
}

function _createPhoneInput(palette, onCountryChange) {
  const wrapper = document.createElement('div')

  const lbl = document.createElement('label')
  lbl.style.cssText = 'display:block;font-size:12px;color:' + palette.textSecondary + ';margin-bottom:5px;font-weight:500'
  lbl.textContent = 'Téléphone'
  wrapper.appendChild(lbl)

  const row = document.createElement('div')
  row.style.cssText = [
    'display:flex;border-radius:10px;border:1px solid ' + palette.inputBorder,
    'background:' + palette.inputBg + ';overflow:hidden',
    'transition:border-color 0.15s',
  ].join(';')

  // Sélecteur pays (flag + dial)
  const countrySelect = document.createElement('select')
  countrySelect.style.cssText = [
    'border:none;outline:none;background:transparent;color:' + palette.inputText,
    'font-size:13px;padding:0 8px;cursor:pointer;flex-shrink:0;max-width:105px',
  ].join(';')
  COUNTRIES.forEach((c) => {
    const opt = document.createElement('option')
    opt.value = c.code
    opt.textContent = `${c.flag} ${c.dial}`
    opt.selected = c.code === 'BJ'
    countrySelect.appendChild(opt)
  })

  // Séparateur vertical
  const sep = document.createElement('div')
  sep.style.cssText = 'width:1px;background:' + palette.border + ';flex-shrink:0;margin:8px 0'

  // Champ numéro
  const phoneInput = document.createElement('input')
  phoneInput.type = 'tel'
  phoneInput.placeholder = 'Numéro de téléphone'
  phoneInput.autocomplete = 'tel'
  phoneInput.style.cssText = [
    'flex:1;border:none;outline:none;background:transparent;color:' + palette.inputText,
    'font-size:14px;padding:11px 13px',
  ].join(';')

  row.appendChild(countrySelect)
  row.appendChild(sep)
  row.appendChild(phoneInput)
  wrapper.appendChild(row)

  row.addEventListener('focusin', () => { row.style.borderColor = palette.inputBorderFocus })
  row.addEventListener('focusout', () => { row.style.borderColor = palette.inputBorder })

  let currentCountry = COUNTRIES.find((c) => c.code === 'BJ')

  countrySelect.addEventListener('change', () => {
    currentCountry = COUNTRIES.find((c) => c.code === countrySelect.value) ?? COUNTRIES[0]
    onCountryChange(currentCountry)
  })

  const getCountry = () => currentCountry

  return { wrapper, phoneInput, countrySelect, getCountry }
}

function _operatorBtn(op, palette) {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.style.cssText = [
    'width:100%;display:flex;align-items:center;gap:12px',
    'background:' + palette.surface,
    'border:1.5px solid ' + palette.border,
    'border-radius:12px;padding:11px 14px',
    'cursor:pointer;transition:border-color 0.15s,background 0.15s;text-align:left',
  ].join(';')

  // Icône (logo ou initiales colorées)
  const iconWrap = document.createElement('div')
  iconWrap.style.cssText = 'width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;background:rgba(255,255,255,0.1)'

  if (op.logo) {
    const img = document.createElement('img')
    img.src = op.logo
    img.alt = op.name
    img.style.cssText = 'width:100%;height:100%;object-fit:contain'
    img.onerror = () => { img.style.display = 'none'; iconWrap.textContent = op.name.slice(0, 1).toUpperCase() }
    iconWrap.appendChild(img)
  } else {
    iconWrap.textContent = op.name.slice(0, 1).toUpperCase()
    iconWrap.style.color = '#fff'
    iconWrap.style.fontSize = '14px'
    iconWrap.style.fontWeight = '700'
  }
  btn.appendChild(iconWrap)

  // Texte central
  const textWrap = document.createElement('div')
  textWrap.style.flex = '1'
  const nameEl = document.createElement('div')
  nameEl.textContent = op.name
  nameEl.style.cssText = 'font-size:13px;font-weight:600;color:' + palette.textPrimary
  textWrap.appendChild(nameEl)
  if (op.description || op.sub) {
    const subEl = document.createElement('div')
    subEl.textContent = op.description ?? op.sub
    subEl.style.cssText = 'font-size:11px;color:' + palette.textSecondary + ';margin-top:1px'
    textWrap.appendChild(subEl)
  }
  btn.appendChild(textWrap)

  // Radio indicator (droite)
  const radio = document.createElement('div')
  radio.style.cssText = 'width:17px;height:17px;border-radius:50%;border:1.5px solid ' + palette.border + ';flex-shrink:0;display:flex;align-items:center;justify-content:center'
  btn.appendChild(radio)

  btn._setSelected = (selected) => {
    btn.style.borderColor = selected ? palette.selectedBorder : palette.border
    btn.style.background = selected ? palette.selectedBg : palette.surface
    radio.style.borderColor = selected ? palette.selectedBorder : palette.border
    radio.innerHTML = selected
      ? '<div style="width:9px;height:9px;border-radius:50%;background:' + palette.primaryButtonBg + '"></div>'
      : ''
  }
  btn._setSelected(false)

  return btn
}

function _renderGenericOperators(container, methods, palette, onSelect) {
  container.innerHTML = ''
  methods.forEach((label) => {
    const btn = _operatorBtn({ name: label }, palette)
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      container.querySelectorAll('button').forEach((b) => { if (b._setSelected) b._setSelected(false) })
      if (btn._setSelected) btn._setSelected(true)
      onSelect(label)
    })
    container.appendChild(btn)
  })
}

function _buildCtaLabel(ctx, tickets) {
  const total = _computeTotal(ctx.selectedQuantities ?? {}, tickets)
  const op = ctx.selectedOperator?.name ?? ''
  if (total === 0) return `🎫 Confirmer`
  return `💳 Payer ${total.toLocaleString('fr-FR')} XOF via ${op}`
}

async function _fetchJson(url, publicKey) {
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${publicKey}` } })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.message ?? `HTTP ${resp.status}`)
  return json.data ?? json
}
