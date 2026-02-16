/**
 * Logo 41dev par défaut (icône carrée, currentColor pour s'adapter au thème).
 * Utilisé quand logoUrl n'est pas fourni.
 */
const DEFAULT_41DEV_LOGO_SVG =
  '<svg width="406" height="406" viewBox="0 0 406 406" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M135.102 235.245V0H0V405.207H202.604V235.245H135.102Z" fill="currentColor"/><path d="M270.105 170.243V405.207H405.207V7.34329e-05H202.604V170.243H270.105Z" fill="currentColor"/></svg>'

/**
 * Initialise TA gateway avec une configuration globale.
 *
 * ⚠️ Objectif : un SDK 100% maison, inspiré de Kkiapay,
 * mais qui ne dépend d'aucun provider externe.
 *
 * Clés (minimum 2) :
 *   - publicKey : clé publique, utilisée côté front (affichage / identification).
 *   - secretKey : clé secrète, UNIQUEMENT côté backend ; ne doit jamais être
 *     exposée dans le front ni passée à createGateway ou openPayment.
 *
 * Exemple côté front :
 *   const gateway = createGateway({ publicKey: 'pk_xxx', environment: 'sandbox' })
 *   // amount + currency doivent venir du backend (session de paiement), pas du front
 *   gateway.openPayment({ amount: 1000, currency: 'XOF', customerName: 'Alice' })
 */
export function createGateway(globalConfig = {}) {
  const baseConfig = {
    environment: 'sandbox',
    ...globalConfig,
  }

  /**
   * Crée (si besoin) ou récupère le conteneur d'overlay plein écran.
   */
  function getOrCreateOverlay() {
    let overlay = document.getElementById('fdg-overlay')
    if (overlay) return overlay

    overlay = document.createElement('div')
    overlay.id = 'fdg-overlay'
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
  function closeOverlay() {
    const overlay = document.getElementById('fdg-overlay')
    if (overlay) {
      overlay.remove()
    }
  }

  /**
   * Ouvre la « fenêtre de paiement » maison.
   * Ici on gère nous-mêmes l'UI du popup (HTML + CSS + JS).
   *
   * Sécurité : amount et currency ne doivent jamais être définis librement par le front.
   * Ils doivent venir du backend (création de session de paiement) pour éviter toute
   * manipulation (ex. front envoie 1000 USD alors que le back attend 1000 XOF).
   * Idéalement le back crée la session, renvoie amount + currency + référence,
   * et le front ne fait qu'afficher ces valeurs et envoyer la référence au back.
   */
  function openPayment(options) {
    const finalConfig = {
      ...baseConfig,
      ...options,
    }

    // Gestion du thème : 'light' | 'dark' | 'auto' (par défaut : auto via prefers-color-scheme)
    const requestedTheme = finalConfig.theme || baseConfig.theme || 'auto'
    const effectiveTheme =
      requestedTheme === 'auto'
        ? (window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light')
        : requestedTheme

    const customColors = finalConfig.colors ?? {}
    const defaultPaletteDark = {
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
    const defaultPaletteLight = {
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
    const basePalette = effectiveTheme === 'dark' ? defaultPaletteDark : defaultPaletteLight
    const customPrimary = effectiveTheme === 'dark' ? customColors.dark?.primary : customColors.light?.primary
    const palette = {
      ...basePalette,
      ...(customPrimary && {
        primaryButtonBg: customPrimary,
        primaryButtonText: '#ffffff',
      }),
    }

    const defaultCountries = [
      { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dial: '+229', minPhoneLength: 10, maxPhoneLength: 10 },
      { code: 'CI', name: 'Côte d’Ivoire', flag: '🇨🇮', dial: '+225', minPhoneLength: 8, maxPhoneLength: 8 },
      { code: 'TG', name: 'Togo', flag: '🇹🇬', dial: '+228', minPhoneLength: 8, maxPhoneLength: 8 },
      { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dial: '+221', minPhoneLength: 9, maxPhoneLength: 9 },
    ]
    const countries = finalConfig.countries ?? defaultCountries

    const overlay = getOrCreateOverlay()
    overlay.style.background = palette.overlayBg
    overlay.innerHTML = ''

    const modal = document.createElement('div')
    modal.style.position = 'relative'
    modal.style.background = palette.modalBg
    modal.style.color = palette.textPrimary
    modal.style.borderRadius = '12px'
    modal.style.padding = '24px'
    modal.style.width = '360px'
    modal.style.maxWidth = '90%'
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)'
    modal.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    overlay.appendChild(modal)

    function addCloseX(container) {
      const closeBtn = document.createElement('button')
      closeBtn.type = 'button'
      closeBtn.setAttribute('aria-label', 'Fermer')
      closeBtn.textContent = '×'
      closeBtn.style.position = 'absolute'
      closeBtn.style.top = '12px'
      closeBtn.style.right = '12px'
      closeBtn.style.width = '32px'
      closeBtn.style.height = '32px'
      closeBtn.style.padding = '0'
      closeBtn.style.border = 'none'
      closeBtn.style.borderRadius = '8px'
      closeBtn.style.background = 'transparent'
      closeBtn.style.color = palette.textSecondary
      closeBtn.style.fontSize = '24px'
      closeBtn.style.lineHeight = '1'
      closeBtn.style.cursor = 'pointer'
      closeBtn.style.display = 'flex'
      closeBtn.style.alignItems = 'center'
      closeBtn.style.justifyContent = 'center'
      closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = palette.buttonBg; closeBtn.style.color = palette.textPrimary })
      closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'transparent'; closeBtn.style.color = palette.textSecondary })
      closeBtn.addEventListener('click', () => { console.log('[41devs-gateway] Paiement annulé (X)', finalConfig); closeOverlay() })
      container.appendChild(closeBtn)
    }

    function addSignature(container) {
      const sig = document.createElement('p')
      sig.textContent = 'Propulsé par 41 Devs'
      sig.style.marginTop = '10px'
      sig.style.marginBottom = '0'
      sig.style.fontSize = '11px'
      sig.style.textAlign = 'center'
      sig.style.color = palette.textMuted
      container.appendChild(sig)
    }
    function addLogoRow(container) {
      const logoUrl = finalConfig.logoUrl ?? baseConfig.logoUrl
      const merchantLogoUrl = finalConfig.merchantLogoUrl ?? baseConfig.merchantLogoUrl
      const useDefault41DevLogo = finalConfig.useDefault41DevLogo ?? baseConfig.useDefault41DevLogo ?? true

      const hasLeft = logoUrl || (!merchantLogoUrl && useDefault41DevLogo)
      const hasRight = merchantLogoUrl
      if (!hasLeft && !hasRight) return

      const row = document.createElement('div')
      row.style.display = 'flex'
      row.style.alignItems = 'center'
      row.style.justifyContent = hasLeft && hasRight ? 'space-between' : 'center'
      row.style.marginBottom = '16px'
      row.style.paddingRight = '36px'
      row.style.minHeight = '36px'

      const addImg = (src) => {
        const img = document.createElement('img')
        img.src = src
        img.alt = ''
        img.style.maxHeight = '32px'
        img.style.maxWidth = '120px'
        img.style.objectFit = 'contain'
        return img
      }

      const addDefault41DevLogo = () => {
        const wrap = document.createElement('div')
        wrap.style.display = 'inline-flex'
        wrap.style.alignItems = 'center'
        wrap.style.justifyContent = 'center'
        wrap.style.color = palette.primaryButtonBg || palette.textPrimary
        wrap.style.maxHeight = '32px'
        wrap.style.maxWidth = '32px'
        wrap.innerHTML = DEFAULT_41DEV_LOGO_SVG
        const svg = wrap.querySelector('svg')
        if (svg) {
          svg.style.width = '100%'
          svg.style.height = '100%'
          svg.style.objectFit = 'contain'
        }
        return wrap
      }

      if (logoUrl && merchantLogoUrl) {
        const left = document.createElement('div')
        left.appendChild(addImg(logoUrl))
        const right = document.createElement('div')
        right.appendChild(addImg(merchantLogoUrl))
        row.appendChild(left)
        row.appendChild(right)
      } else if (logoUrl) {
        row.appendChild(addImg(logoUrl))
      } else if (merchantLogoUrl) {
        row.appendChild(addImg(merchantLogoUrl))
      } else {
        row.appendChild(addDefault41DevLogo())
      }
      container.appendChild(row)
    }

    const isMobileMoney = (method) =>
      ['MTN', 'Moov', 'Celtis'].includes(method)

    function createInput(labelText, options = {}) {
      const wrapper = document.createElement('div')
      wrapper.style.marginBottom = '14px'
      const label = document.createElement('label')
      label.textContent = labelText
      label.style.display = 'block'
      label.style.fontSize = '13px'
      label.style.color = palette.textSecondary
      label.style.marginBottom = '4px'
      const input = document.createElement('input')
      input.type = options.type ?? 'text'
      input.placeholder = options.placeholder ?? ''
      input.style.width = '100%'
      input.style.boxSizing = 'border-box'
      input.style.padding = '10px 12px'
      input.style.borderRadius = '8px'
      input.style.border = `1px solid ${palette.inputBorder}`
      input.style.background = palette.inputBg
      input.style.color = palette.inputText
      input.style.fontSize = '14px'
      if (options.autocomplete) input.autocomplete = options.autocomplete
      wrapper.appendChild(label)
      wrapper.appendChild(input)
      return { wrapper, input }
    }

    function createCountrySelect() {
      const wrapper = document.createElement('div')
      wrapper.style.marginBottom = '14px'

      const label = document.createElement('label')
      label.textContent = 'Pays'
      label.style.display = 'block'
      label.style.fontSize = '13px'
      label.style.color = palette.textSecondary
      label.style.marginBottom = '4px'

      const select = document.createElement('select')
      select.style.width = '100%'
      select.style.boxSizing = 'border-box'
      select.style.padding = '10px 12px'
      select.style.borderRadius = '8px'
      select.style.border = `1px solid ${palette.inputBorder}`
      select.style.background = palette.inputBg
      select.style.color = palette.inputText
      select.style.fontSize = '14px'

      countries.forEach((c) => {
        const opt = document.createElement('option')
        opt.value = c.code
        opt.textContent = `${c.flag} ${c.name} (${c.dial})`
        select.appendChild(opt)
      })

      const getSelectedCountry = () =>
        countries.find((c) => c.code === select.value) ?? countries[0]

      wrapper.appendChild(label)
      wrapper.appendChild(select)

      return { wrapper, select, getSelectedCountry }
    }

    function renderStep1() {
      modal.innerHTML = ''
      addCloseX(modal)
      addLogoRow(modal)
      const title = document.createElement('h2')
      title.textContent = 'Paiement 41devs-gateway'
      title.style.margin = '0 0 8px'

      const subtitle = document.createElement('p')
      subtitle.style.margin = '0 0 16px'
      subtitle.style.fontSize = '14px'
      subtitle.style.color = palette.textSecondary
      subtitle.textContent = finalConfig.customerName
        ? `${finalConfig.customerName}, veuillez choisir un moyen de paiement.`
        : 'Veuillez choisir un moyen de paiement.'

      const amountLine = document.createElement('p')
      amountLine.style.margin = '0 0 16px'
      amountLine.style.fontWeight = '600'
      amountLine.style.color = palette.amountText
      amountLine.textContent = `Montant : ${finalConfig.amount ?? '—'} ${finalConfig.currency ?? ''}`

      const methodsTitle = document.createElement('p')
      methodsTitle.style.margin = '0 0 8px'
      methodsTitle.style.fontSize = '13px'
      methodsTitle.style.textTransform = 'uppercase'
      methodsTitle.style.letterSpacing = '0.06em'
      methodsTitle.style.color = palette.methodsTitle
      methodsTitle.textContent = 'Moyen de paiement'

      const methodsWrapper = document.createElement('div')
      methodsWrapper.style.display = 'grid'
      methodsWrapper.style.gridTemplateColumns = '1fr 1fr'
      methodsWrapper.style.gap = '8px'
      methodsWrapper.style.marginBottom = '16px'

      const methods = finalConfig.methods ?? ['MTN', 'Moov', 'Celtis', 'Carte bancaire']

      methods.forEach((label) => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.textContent = label
        btn.style.padding = '10px 12px'
        btn.style.borderRadius = '999px'
        btn.style.border = `1px solid ${palette.border}`
        btn.style.background = palette.buttonBg
        btn.style.cursor = 'pointer'
        btn.style.fontSize = '13px'
        btn.style.color = palette.buttonText
        btn.addEventListener('mouseenter', () => { btn.style.background = palette.buttonBgHover })
        btn.addEventListener('mouseleave', () => { btn.style.background = palette.buttonBg })
        btn.addEventListener('click', () => renderStep2(label))
        methodsWrapper.appendChild(btn)
      })

      const footer = document.createElement('div')
      footer.style.display = 'flex'
      footer.style.justifyContent = 'flex-end'
      footer.style.gap = '8px'
      const cancelBtn = document.createElement('button')
      cancelBtn.type = 'button'
      cancelBtn.textContent = 'Annuler'
      cancelBtn.style.padding = '8px 14px'
      cancelBtn.style.borderRadius = '999px'
      cancelBtn.style.border = `1px solid ${palette.cancelBorder}`
      cancelBtn.style.background = palette.cancelBg
      cancelBtn.style.cursor = 'pointer'
      cancelBtn.style.fontSize = '13px'
      cancelBtn.style.color = palette.cancelText
      cancelBtn.addEventListener('click', () => { console.log('[41devs-gateway] Paiement annulé', finalConfig); closeOverlay() })
      footer.appendChild(cancelBtn)

      modal.appendChild(title)
      modal.appendChild(subtitle)
      modal.appendChild(amountLine)
      modal.appendChild(methodsTitle)
      modal.appendChild(methodsWrapper)
      modal.appendChild(footer)
      addSignature(modal)
    }

    function renderStep2(methodLabel) {
      modal.innerHTML = ''
      addCloseX(modal)
      addLogoRow(modal)
      const backBtn = document.createElement('button')
      backBtn.type = 'button'
      backBtn.textContent = '← Retour'
      backBtn.style.marginBottom = '16px'
      backBtn.style.padding = '6px 0'
      backBtn.style.border = 'none'
      backBtn.style.background = 'transparent'
      backBtn.style.cursor = 'pointer'
      backBtn.style.fontSize = '13px'
      backBtn.style.color = palette.textSecondary
      backBtn.addEventListener('click', renderStep1)
      modal.appendChild(backBtn)

      const title = document.createElement('h2')
      title.textContent = methodLabel
      title.style.margin = '0 0 4px'
      const subtitle = document.createElement('p')
      subtitle.style.margin = '0 0 16px'
      subtitle.style.fontSize = '14px'
      subtitle.style.color = palette.textSecondary
      subtitle.textContent = `Montant : ${finalConfig.amount ?? '—'} ${finalConfig.currency ?? ''}`
      modal.appendChild(title)
      modal.appendChild(subtitle)

      const form = document.createElement('form')
      form.style.marginBottom = '20px'

      const errorBox = document.createElement('p')
      errorBox.style.margin = '0 0 12px'
      errorBox.style.fontSize = '12px'
      errorBox.style.color = '#f97373'
      errorBox.style.display = 'none'
      form.appendChild(errorBox)

      const showError = (message) => {
        errorBox.textContent = message
        errorBox.style.display = 'block'
      }

      if (isMobileMoney(methodLabel)) {
        const { wrapper: countryWrapper, getSelectedCountry } = createCountrySelect()
        const { wrapper: w1, input: i1 } = createInput('Prénom', { placeholder: 'Ex. Jean' })
        const { wrapper: w2, input: i2 } = createInput('Nom', { placeholder: 'Ex. Dupont' })
        const { wrapper: w3, input: i3 } = createInput('Email', { placeholder: 'exemple@email.com', type: 'email', autocomplete: 'email' })
        const { wrapper: w4, input: i4 } = createInput('Numéro de téléphone', { placeholder: 'Ex. 07 12 34 56 78', type: 'tel', autocomplete: 'tel' })

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

          if (!country) {
            showError('Veuillez choisir un pays.')
            return
          }

          if (!prenom || !nom || !email || !phoneRaw) {
            showError('Tous les champs sont obligatoires.')
            return
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            showError('Veuillez entrer une adresse email valide.')
            return
          }

          const minLen = country.minPhoneLength ?? 8
          const maxLen = country.maxPhoneLength ?? 15
          if (phoneDigits.length < minLen || phoneDigits.length > maxLen) {
            showError(`Le numéro de téléphone pour ${country.name} doit contenir entre ${minLen} et ${maxLen} chiffres.`)
            return
          }

          const data = {
            method: methodLabel,
            countryCode: country.code,
            countryName: country.name,
            dialCode: country.dial,
            fullPhone: `${country.dial}${phoneDigits}`,
            prenom,
            nom,
            email,
            telephone: phoneRaw,
            ...finalConfig,
          }
          console.log('[41devs-gateway] Paiement simulé (mobile)', data)
          alert(`Paiement simulé via ${methodLabel}\n\nPays: ${country.name}\nPrénom: ${prenom}\nNom: ${nom}\nEmail: ${email}\nTél: ${phoneRaw}`)
          closeOverlay()
        })
      } else {
        const { wrapper: w0, input: i0 } = createInput('Email', { placeholder: 'exemple@email.com', type: 'email', autocomplete: 'email' })
        const { wrapper: w1, input: i1 } = createInput('Numéro de carte', { placeholder: '1234 5678 9012 3456', type: 'text' })
        const { wrapper: w2, input: i2 } = createInput('Date d\'expiration', { placeholder: 'MM/AA', type: 'text' })
        const { wrapper: w3, input: i3 } = createInput('CVV', { placeholder: '123', type: 'text' })
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

          if (!email || !cardNumberRaw || !expiryRaw || !cvvRaw) {
            showError('Tous les champs sont obligatoires.')
            return
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            showError('Veuillez entrer une adresse email valide.')
            return
          }

          if (!/^\d{12,19}$/.test(cardNumberRaw)) {
            showError('Le numéro de carte est invalide.')
            return
          }

          const expiryMatch = expiryRaw.match(/^(\d{2})\/(\d{2})$/)
          if (!expiryMatch) {
            showError('La date d\'expiration doit être au format MM/AA.')
            return
          }
          const month = Number(expiryMatch[1])
          if (month < 1 || month > 12) {
            showError('Le mois d\'expiration est invalide.')
            return
          }

          if (!/^\d{3,4}$/.test(cvvRaw)) {
            showError('Le CVV est invalide.')
            return
          }

          const data = {
            method: methodLabel,
            email,
            numeroCarte: cardNumberRaw,
            expiration: expiryRaw,
            cvv: cvvRaw,
            ...finalConfig,
          }
          console.log('[41devs-gateway] Paiement simulé (carte)', data)
          alert(`Paiement simulé par carte\n\nMontant: ${finalConfig.amount ?? '—'} ${finalConfig.currency ?? ''}\nFacture envoyée à: ${email}`)
          closeOverlay()
        })
      }

      modal.appendChild(form)

      form.id = 'fdg-payment-form'
      const footer = document.createElement('div')
      footer.style.display = 'flex'
      footer.style.justifyContent = 'flex-end'
      footer.style.gap = '8px'
      footer.style.marginTop = '8px'
      const cancelBtn = document.createElement('button')
      cancelBtn.type = 'button'
      cancelBtn.textContent = 'Annuler'
      cancelBtn.style.padding = '8px 14px'
      cancelBtn.style.borderRadius = '999px'
      cancelBtn.style.border = `1px solid ${palette.cancelBorder}`
      cancelBtn.style.background = palette.cancelBg
      cancelBtn.style.cursor = 'pointer'
      cancelBtn.style.fontSize = '13px'
      cancelBtn.style.color = palette.cancelText
      cancelBtn.addEventListener('click', () => { closeOverlay() })
      const submitBtn = document.createElement('button')
      submitBtn.type = 'submit'
      submitBtn.textContent = 'Confirmer le paiement'
      submitBtn.setAttribute('form', form.id)
      submitBtn.style.padding = '10px 16px'
      submitBtn.style.borderRadius = '999px'
      submitBtn.style.border = 'none'
      submitBtn.style.background = palette.primaryButtonBg
      submitBtn.style.color = palette.primaryButtonText
      submitBtn.style.cursor = 'pointer'
      submitBtn.style.fontSize = '13px'
      submitBtn.style.fontWeight = '600'
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault()
        form.requestSubmit()
      })
      footer.appendChild(cancelBtn)
      footer.appendChild(submitBtn)
      modal.appendChild(footer)
      addSignature(modal)
    }

    renderStep1()
  }

  return {
    openPayment,
  }
}

/** Alias pour éviter les conflits avec d'autres SDK ou le code du dev. */
export { createGateway as create41DevsGateway }