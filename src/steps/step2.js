import { isMobileMoney } from '../constants/index.js'
import * as ui from '../components/Helpers.js'
import * as validation from '../validation/index.js'

/**
 * Affiche l'étape 2 : formulaire du moyen choisi (Mobile Money ou Carte).
 * @param {Object} ctx - Contexte partagé
 * @param {string} methodLabel - MTN, Moov, Celtis ou Carte bancaire
 */
export function renderStep2(ctx, methodLabel) {
  const { modal, finalConfig, palette, countries, onFormSubmit, onCancel, onBack } = ctx
  modal.innerHTML = ''

  ui.addCloseX(modal, palette, onCancel)
  ui.addLogoRow(modal, {
    logoUrl: finalConfig.logoUrl ?? ctx.baseConfig?.logoUrl,
    merchantLogoUrl: finalConfig.merchantLogoUrl ?? ctx.baseConfig?.merchantLogoUrl,
    useDefault41DevLogo: finalConfig.useDefault41DevLogo ?? ctx.baseConfig?.useDefault41DevLogo ?? true,
  }, palette)

  const backBtn = document.createElement('button')
  backBtn.type = 'button'
  backBtn.textContent = '← Retour'
  backBtn.style.cssText = 'margin-bottom:16px;padding:6px 0;border:none;background:transparent;cursor:pointer;font-size:13px;color:' + palette.textSecondary
  backBtn.addEventListener('click', () => onBack())
  modal.appendChild(backBtn)

  const title = document.createElement('h2')
  title.textContent = methodLabel
  title.style.margin = '0 0 4px'
  const subtitle = document.createElement('p')
  subtitle.style.margin = '0 0 16px'
  subtitle.style.fontSize = '14px'
  subtitle.style.color = palette.textSecondary
  subtitle.textContent = `Montant : ${finalConfig.amount ?? '—'} ${finalConfig.currency ?? 'XOF'}`
  modal.appendChild(title)
  modal.appendChild(subtitle)

  const form = document.createElement('form')
  form.style.marginBottom = '20px'

  const errorBox = document.createElement('p')
  errorBox.style.cssText = 'margin:0 0 12px;font-size:12px;color:#f97373;display:none'
  form.appendChild(errorBox)

  const showError = (message) => {
    errorBox.textContent = message
    errorBox.style.display = 'block'
  }

  // En mode AUTO, l'opérateur est une carte si son code vaut 'card', sinon Mobile Money.
  // En mode GÉNÉRIQUE, on utilise la liste statique MOBILE_MONEY_METHODS.
  const isMM = ctx.selectedOperator
    ? ctx.selectedOperator.code !== 'card'
    : isMobileMoney(methodLabel)

  if (isMM) {
    // En mode AUTO, le pays est déjà sélectionné dans step1 (ctx.selectedCountry).
    const prefilledCountry = ctx.selectedCountry ?? null
    const displayedCountries = prefilledCountry ? [prefilledCountry] : (countries ?? [])
    const { wrapper: countryWrapper, getSelectedCountry } = prefilledCountry
      ? buildPrefilledCountry(palette, prefilledCountry)
      : ui.createCountrySelect(palette, displayedCountries)
    const { wrapper: w1, input: i1 } = ui.createInput(palette, 'Prénom', { placeholder: 'Ex. Jean' })
    const { wrapper: w2, input: i2 } = ui.createInput(palette, 'Nom', { placeholder: 'Ex. Dupont' })
    const { wrapper: w3, input: i3 } = ui.createInput(palette, 'Email', { placeholder: 'exemple@email.com', type: 'email', autocomplete: 'email' })
    const { wrapper: w4, input: i4 } = ui.createInput(palette, 'Numéro de téléphone', { placeholder: 'Ex. 07 12 34 56 78', type: 'tel', autocomplete: 'tel' })
    form.appendChild(countryWrapper)
    form.appendChild(w1)
    form.appendChild(w2)
    form.appendChild(w3)
    form.appendChild(w4)

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      errorBox.style.display = 'none'
      const country = getSelectedCountry()
      const prenom = i1.value.trim()
      const nom = i2.value.trim()
      const email = i3.value.trim()
      const phoneRaw = i4.value.trim()
      const phoneDigits = phoneRaw.replace(/\D/g, '')

      if (!prenom || !nom) {
        showError('Tous les champs sont obligatoires.')
        return
      }
      const emailCheck = validation.validateEmail(email)
      if (!emailCheck.valid) {
        showError(emailCheck.error)
        return
      }
      const phoneCheck = validation.validatePhoneForCountry(country, phoneDigits)
      if (!phoneCheck.valid) {
        showError(phoneCheck.error)
        return
      }

      const result = {
        success: true,
        method: methodLabel,
        amount: finalConfig.amount,
        currency: finalConfig.currency,
        paymentReference: finalConfig.paymentReference,
        countryCode: country.code,
        countryName: country.name,
        dialCode: country.dial,
        fullPhone: `${country.dial}${phoneDigits}`,
        prenom,
        nom,
        email,
        telephone: phoneRaw,
      }
      onFormSubmit(result)
    })
  } else {
    const { wrapper: w0, input: i0 } = ui.createInput(palette, 'Email', { placeholder: 'exemple@email.com', type: 'email', autocomplete: 'email' })
    const { wrapper: w1, input: i1 } = ui.createInput(palette, 'Numéro de carte', { placeholder: '1234 5678 9012 3456', type: 'text' })
    const { wrapper: w2, input: i2 } = ui.createInput(palette, "Date d'expiration", { placeholder: 'MM/AA', type: 'text' })
    const { wrapper: w3, input: i3 } = ui.createInput(palette, 'CVV', { placeholder: '123', type: 'text' })
    form.appendChild(w0)
    form.appendChild(w1)
    form.appendChild(w2)
    form.appendChild(w3)

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      errorBox.style.display = 'none'
      const email = i0.value.trim()
      const cardNumberRaw = i1.value.replace(/\s+/g, '')
      const expiryRaw = i2.value.trim()
      const cvvRaw = i3.value.trim()

      const emailCheck = validation.validateEmail(email)
      if (!emailCheck.valid) {
        showError(emailCheck.error)
        return
      }
      const cardCheck = validation.validateCardNumber(cardNumberRaw)
      if (!cardCheck.valid) {
        showError(cardCheck.error)
        return
      }
      const expiryCheck = validation.validateExpiry(expiryRaw)
      if (!expiryCheck.valid) {
        showError(expiryCheck.error)
        return
      }
      const cvvCheck = validation.validateCvv(cvvRaw)
      if (!cvvCheck.valid) {
        showError(cvvCheck.error)
        return
      }

      const result = {
        success: true,
        method: methodLabel,
        amount: finalConfig.amount,
        currency: finalConfig.currency,
        paymentReference: finalConfig.paymentReference,
        email,
      }
      onFormSubmit(result)
    })
  }

  modal.appendChild(form)
  form.id = 'fdg-payment-form'

  const footer = document.createElement('div')
  footer.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:8px'
  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.textContent = 'Annuler'
  cancelBtn.style.cssText = 'padding:8px 14px;border-radius:999px;border:1px solid ' + palette.cancelBorder + ';background:' + palette.cancelBg + ';cursor:pointer;font-size:13px;color:' + palette.cancelText
  cancelBtn.addEventListener('click', () => onCancel())
  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.textContent = 'Confirmer le paiement'
  submitBtn.setAttribute('form', form.id)
  submitBtn.style.cssText = 'padding:10px 16px;border-radius:999px;border:none;background:' + palette.primaryButtonBg + ';color:' + palette.primaryButtonText + ';cursor:pointer;font-size:13px;font-weight:600'
  submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    form.requestSubmit()
  })
  footer.appendChild(cancelBtn)
  footer.appendChild(submitBtn)
  modal.appendChild(footer)
  ui.addSignature(modal, palette)
}

/**
 * Crée un champ pays pré-rempli (en lecture seule) quand le pays a déjà été sélectionné en step1.
 * Retourne la même interface que ui.createCountrySelect pour une utilisation transparente.
 * @param {Object} palette
 * @param {{ code, name, flag, dial }} country - Pays sélectionné
 * @returns {{ wrapper: HTMLElement, getSelectedCountry: () => Object }}
 */
function buildPrefilledCountry(palette, country) {
  const wrapper = document.createElement('div')
  wrapper.style.marginBottom = '14px'
  const label = document.createElement('label')
  label.textContent = 'Pays'
  label.style.cssText = 'display:block;font-size:13px;color:' + palette.textSecondary + ';margin-bottom:4px'
  const display = document.createElement('div')
  display.style.cssText = 'padding:10px 12px;border-radius:8px;border:1px solid ' + palette.inputBorder + ';background:' + palette.inputBg + ';color:' + palette.inputText + ';font-size:14px'
  display.textContent = `${country.flag ? country.flag + ' ' : ''}${country.name} (${country.dial})`
  wrapper.appendChild(label)
  wrapper.appendChild(display)
  return { wrapper, getSelectedCountry: () => country }
}
