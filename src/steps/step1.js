import * as ui from '../components/Helpers.js'

/**
 * Affiche l'étape 1 : choix du moyen de paiement.
 * @param {Object} ctx - Contexte partagé (modal, finalConfig, palette, countries, callbacks, etc.)
 */
export function renderStep1(ctx) {
  const { modal, finalConfig, palette, countries, onCancel, onMethodSelect } = ctx
  modal.innerHTML = ''

  ui.addCloseX(modal, palette, onCancel)
  ui.addLogoRow(modal, {
    logoUrl: finalConfig.logoUrl ?? ctx.baseConfig?.logoUrl,
    merchantLogoUrl: finalConfig.merchantLogoUrl ?? ctx.baseConfig?.merchantLogoUrl,
    useDefault41DevLogo: finalConfig.useDefault41DevLogo ?? ctx.baseConfig?.useDefault41DevLogo ?? true,
  }, palette)

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
    btn.style.cssText = 'padding:10px 12px;border-radius:999px;border:1px solid ' + palette.border + ';background:' + palette.buttonBg + ';cursor:pointer;font-size:13px;color:' + palette.buttonText
    btn.addEventListener('mouseenter', () => { btn.style.background = palette.buttonBgHover })
    btn.addEventListener('mouseleave', () => { btn.style.background = palette.buttonBg })
    btn.addEventListener('click', () => onMethodSelect(label))
    methodsWrapper.appendChild(btn)
  })

  const footer = document.createElement('div')
  footer.style.display = 'flex'
  footer.style.justifyContent = 'flex-end'
  footer.style.gap = '8px'
  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.textContent = 'Annuler'
  cancelBtn.style.cssText = 'padding:8px 14px;border-radius:999px;border:1px solid ' + palette.cancelBorder + ';background:' + palette.cancelBg + ';cursor:pointer;font-size:13px;color:' + palette.cancelText
  cancelBtn.addEventListener('click', () => onCancel())
  footer.appendChild(cancelBtn)

  modal.appendChild(title)
  modal.appendChild(subtitle)
  modal.appendChild(amountLine)
  modal.appendChild(methodsTitle)
  modal.appendChild(methodsWrapper)
  modal.appendChild(footer)
  ui.addSignature(modal, palette)
}
