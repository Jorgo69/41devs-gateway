import * as ui from '../components/Helpers.js'

/**
 * Affiche l'étape 1 : sélection du moyen de paiement.
 *
 * Mode AUTO (ctx.isAutoMode = true) :
 *   - Récupère les pays depuis GET {apiBaseUrl}/developer/public/countries
 *   - Récupère les opérateurs depuis GET {apiBaseUrl}/developer/public/operators?country=XX
 *   - Affiche les opérateurs avec leur logo
 *
 * Mode GÉNÉRIQUE (ctx.isAutoMode = false) :
 *   - Affiche la liste statique finalConfig.methods (ou défauts)
 *
 * @param {Object} ctx - Contexte partagé (modal, finalConfig, baseConfig, palette, onCancel, onMethodSelect, isAutoMode)
 */
export function renderStep1(ctx) {
  const { modal, finalConfig, palette, onCancel } = ctx

  modal.innerHTML = ''
  ui.addCloseX(modal, palette, onCancel)
  ui.addLogoRow(modal, {
    logoUrl: finalConfig.logoUrl ?? ctx.baseConfig?.logoUrl,
    merchantLogoUrl: finalConfig.merchantLogoUrl ?? ctx.baseConfig?.merchantLogoUrl,
    useDefault41DevLogo: finalConfig.useDefault41DevLogo ?? ctx.baseConfig?.useDefault41DevLogo ?? true,
  }, palette)

  if (ctx.isAutoMode) {
    renderAutoMode(ctx)
  } else {
    renderGenericMode(ctx)
  }
}

// ── Mode AUTO : fetch pays → opérateurs dynamiques ─────────────

/**
 * Rend le step1 en mode AUTO.
 * Charge les pays depuis l'API, puis les opérateurs au choix du pays.
 * @param {Object} ctx
 */
function renderAutoMode(ctx) {
  const { modal, finalConfig, palette, onCancel } = ctx

  const title = buildTitle(finalConfig, palette)
  const amountLine = buildAmountLine(finalConfig, palette)
  const methodsTitle = buildMethodsTitle(palette)

  const loadingMsg = document.createElement('p')
  loadingMsg.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';text-align:center;margin:24px 0'
  loadingMsg.textContent = 'Chargement des moyens de paiement...'

  modal.appendChild(title)
  modal.appendChild(amountLine)
  modal.appendChild(methodsTitle)
  modal.appendChild(loadingMsg)
  addCancelFooter(modal, palette, onCancel)
  ui.addSignature(modal, palette)

  const apiBaseUrl = finalConfig.apiBaseUrl ?? ctx.baseConfig?.apiBaseUrl
  const publicKey = finalConfig.publicKey ?? ctx.baseConfig?.publicKey

  fetchJson(`${apiBaseUrl}/developer/public/countries`, publicKey)
    .then((countries) => {
      if (!Array.isArray(countries) || countries.length === 0) {
        loadingMsg.textContent = 'Aucun pays disponible pour le paiement.'
        return
      }
      modal.removeChild(loadingMsg)
      renderCountryOperatorUI(ctx, countries, apiBaseUrl, publicKey)
    })
    .catch((err) => {
      loadingMsg.style.color = '#f97373'
      loadingMsg.textContent = 'Erreur : ' + (err.message ?? 'Impossible de charger les moyens de paiement.')
    })
}

/**
 * Rend le sélecteur de pays + zone opérateurs dynamique.
 * Flux correct : l'utilisateur choisit son pays EN PREMIER,
 * puis les opérateurs sont chargés depuis l'API pour ce pays.
 * @param {Object} ctx
 * @param {Array} countries - Pays retournés par l'API
 * @param {string} apiBaseUrl
 * @param {string} publicKey
 */
function renderCountryOperatorUI(ctx, countries, apiBaseUrl, publicKey) {
  const { modal, palette, onCancel } = ctx

  // ── Sélecteur de pays ─────────────────────────────────────────
  const countryWrapper = document.createElement('div')
  countryWrapper.style.marginBottom = '12px'

  const countryLabel = document.createElement('label')
  countryLabel.textContent = 'Votre pays'
  countryLabel.style.cssText = 'display:block;font-size:13px;color:' + palette.textSecondary + ';margin-bottom:4px'

  const countrySelect = document.createElement('select')
  countrySelect.style.cssText = 'width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ' + palette.inputBorder + ';background:' + palette.inputBg + ';color:' + palette.inputText + ';font-size:14px'

  // Option placeholder — aucun opérateur affiché tant que non sélectionné
  const placeholder = document.createElement('option')
  placeholder.value = ''
  placeholder.textContent = '— Choisissez votre pays —'
  placeholder.disabled = true
  placeholder.selected = true
  countrySelect.appendChild(placeholder)

  countries.forEach((c) => {
    const opt = document.createElement('option')
    opt.value = c.code
    opt.textContent = `${c.flag ? c.flag + ' ' : ''}${c.name} (+${c.prefix})`
    countrySelect.appendChild(opt)
  })
  countryWrapper.appendChild(countryLabel)
  countryWrapper.appendChild(countrySelect)
  modal.appendChild(countryWrapper)

  // ── Zone opérateurs (vide jusqu'à sélection du pays) ─────────
  const operatorsZone = document.createElement('div')
  operatorsZone.style.marginBottom = '16px'

  // Message d'invite affiché avant toute sélection
  const hint = document.createElement('p')
  hint.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';text-align:center;margin:12px 0'
  hint.textContent = 'Sélectionnez votre pays pour voir les moyens de paiement disponibles.'
  operatorsZone.appendChild(hint)

  modal.appendChild(operatorsZone)
  addCancelFooter(modal, palette, onCancel)
  ui.addSignature(modal, palette)

  // ── Chargement des opérateurs AU CHOIX du pays ───────────────
  countrySelect.addEventListener('change', () => {
    const selected = countries.find((c) => c.code === countrySelect.value)
    if (!selected) return
    loadOperatorsForCountry(ctx, operatorsZone, selected, apiBaseUrl, publicKey)
  })
}

/**
 * Charge et affiche les opérateurs pour un pays donné.
 * @param {Object} ctx
 * @param {HTMLElement} zone - Conteneur des boutons opérateurs
 * @param {Object} country - Pays sélectionné { code, name, prefix, flag }
 * @param {string} apiBaseUrl
 * @param {string} publicKey
 */
function loadOperatorsForCountry(ctx, zone, country, apiBaseUrl, publicKey) {
  const { palette } = ctx

  zone.innerHTML = ''
  const loading = document.createElement('p')
  loading.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';text-align:center;margin:8px 0'
  loading.textContent = 'Chargement...'
  zone.appendChild(loading)

  fetchJson(`${apiBaseUrl}/developer/public/operators?country=${country.code}`, publicKey)
    .then((operators) => {
      zone.innerHTML = ''
      if (!Array.isArray(operators) || operators.length === 0) {
        const empty = document.createElement('p')
        empty.style.cssText = 'font-size:13px;color:' + palette.textSecondary + ';text-align:center;margin:8px 0'
        empty.textContent = 'Aucun opérateur disponible pour ce pays.'
        zone.appendChild(empty)
        return
      }

      const grid = document.createElement('div')
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px'

      operators.forEach((op) => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.style.cssText = [
          'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px',
          'padding:12px 8px;border-radius:10px',
          'border:1px solid ' + palette.border,
          'background:' + palette.buttonBg,
          'cursor:pointer;font-size:12px;color:' + palette.buttonText,
          'transition:background 0.15s',
        ].join(';')

        btn.addEventListener('mouseenter', () => { btn.style.background = palette.buttonBgHover })
        btn.addEventListener('mouseleave', () => { btn.style.background = palette.buttonBg })

        if (op.logo) {
          const img = document.createElement('img')
          img.src = op.logo
          img.alt = op.name
          img.style.cssText = 'width:32px;height:32px;object-fit:contain'
          img.onerror = () => { img.style.display = 'none' }
          btn.appendChild(img)
        }

        const label = document.createElement('span')
        label.textContent = op.name
        label.style.textAlign = 'center'
        btn.appendChild(label)

        btn.addEventListener('click', () => {
          // Normalise le pays pour la validation téléphone dans step2
          ctx.selectedCountry = {
            code: country.code,
            name: country.name,
            flag: country.flag ?? '',
            dial: `+${country.prefix}`,
            minPhoneLength: 6,
            maxPhoneLength: 12,
          }
          ctx.selectedOperator = op
          ctx.onMethodSelect(op.name, op)
        })

        grid.appendChild(btn)
      })

      zone.appendChild(grid)
    })
    .catch((err) => {
      zone.innerHTML = ''
      const errMsg = document.createElement('p')
      errMsg.style.cssText = 'font-size:13px;color:#f97373;text-align:center;margin:8px 0'
      errMsg.textContent = 'Erreur : ' + (err.message ?? 'Impossible de charger les opérateurs.')
      zone.appendChild(errMsg)
    })
}

// ── Mode GÉNÉRIQUE : liste statique ──────────────────────────────

/**
 * Rend le step1 en mode GÉNÉRIQUE avec la liste de méthodes statique.
 * @param {Object} ctx
 */
function renderGenericMode(ctx) {
  const { modal, finalConfig, palette, onCancel } = ctx

  const title = buildTitle(finalConfig, palette)
  const amountLine = buildAmountLine(finalConfig, palette)
  const methodsTitle = buildMethodsTitle(palette)

  const methodsWrapper = document.createElement('div')
  methodsWrapper.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px'

  const methods = finalConfig.methods ?? ['MTN', 'Moov', 'Wave', 'Carte bancaire']
  methods.forEach((label) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = label
    btn.style.cssText = 'padding:10px 12px;border-radius:999px;border:1px solid ' + palette.border + ';background:' + palette.buttonBg + ';cursor:pointer;font-size:13px;color:' + palette.buttonText
    btn.addEventListener('mouseenter', () => { btn.style.background = palette.buttonBgHover })
    btn.addEventListener('mouseleave', () => { btn.style.background = palette.buttonBg })
    btn.addEventListener('click', () => {
      ctx.selectedOperator = null
      ctx.selectedCountry = null
      ctx.onMethodSelect(label, null)
    })
    methodsWrapper.appendChild(btn)
  })

  modal.appendChild(title)
  modal.appendChild(amountLine)
  modal.appendChild(methodsTitle)
  modal.appendChild(methodsWrapper)
  addCancelFooter(modal, palette, onCancel)
  ui.addSignature(modal, palette)
}

// ── Helpers DOM partagés ──────────────────────────────────────────

function buildTitle(finalConfig, palette) {
  const title = document.createElement('h2')
  title.style.margin = '0 0 8px'
  title.textContent = finalConfig.customerName
    ? `${finalConfig.customerName}, veuillez choisir un moyen de paiement.`
    : 'Veuillez choisir un moyen de paiement.'
  return title
}

function buildAmountLine(finalConfig, palette) {
  const amountLine = document.createElement('p')
  amountLine.style.cssText = 'margin:0 0 16px;font-weight:600;color:' + palette.amountText
  amountLine.textContent = finalConfig.amount != null
    ? `Montant : ${finalConfig.amount} ${finalConfig.currency ?? ''}`
    : ''
  return amountLine
}

function buildMethodsTitle(palette) {
  const el = document.createElement('p')
  el.style.cssText = 'margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;color:' + palette.methodsTitle
  el.textContent = 'Moyen de paiement'
  return el
}

function addCancelFooter(modal, palette, onCancel) {
  const footer = document.createElement('div')
  footer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:8px'
  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.textContent = 'Annuler'
  cancelBtn.style.cssText = 'padding:8px 14px;border-radius:999px;border:1px solid ' + palette.cancelBorder + ';background:' + palette.cancelBg + ';cursor:pointer;font-size:13px;color:' + palette.cancelText
  cancelBtn.addEventListener('click', () => onCancel())
  footer.appendChild(cancelBtn)
  modal.appendChild(footer)
}

// ── Utilitaire fetch avec Bearer token ──────────────────────────

/**
 * Fetch JSON avec header Authorization: Bearer {publicKey}.
 * Unwrap la réponse VEEP { statusCode, data } si présente.
 * @param {string} url
 * @param {string} publicKey
 * @returns {Promise<any>} Données de la réponse
 */
async function fetchJson(url, publicKey) {
  const headers = { Authorization: `Bearer ${publicKey}` }
  const resp = await fetch(url, { headers })
  const json = await resp.json()
  if (!resp.ok) {
    throw new Error(json.message ?? json.data?.message ?? `HTTP ${resp.status}`)
  }
  return json.data ?? json
}
