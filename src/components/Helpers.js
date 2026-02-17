import { DEFAULT_41DEV_LOGO_SVG } from '../constants/index.js'

/**
 * @param {HTMLElement} container
 * @param {Object} palette
 * @param {() => void} onClose
 */
export function addCloseX(container, palette, onClose) {
  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Fermer')
  closeBtn.textContent = '×'
  closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;width:32px;height:32px;padding:0;border:none;border-radius:8px;background:transparent;color:' + palette.textSecondary + ';font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center'
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = palette.buttonBg
    closeBtn.style.color = palette.textPrimary
  })
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'transparent'
    closeBtn.style.color = palette.textSecondary
  })
  closeBtn.addEventListener('click', () => onClose())
  container.appendChild(closeBtn)
}

/**
 * @param {HTMLElement} container
 * @param {Object} palette
 */
export function addSignature(container, palette) {
  const sig = document.createElement('p')
  sig.textContent = 'Propulsé par 41 Devs'
  sig.style.marginTop = '10px'
  sig.style.marginBottom = '0'
  sig.style.fontSize = '11px'
  sig.style.textAlign = 'center'
  sig.style.color = palette.textMuted
  container.appendChild(sig)
}

/**
 * @param {HTMLElement} container
 * @param {Object} config - { logoUrl?, merchantLogoUrl?, useDefault41DevLogo? }
 * @param {Object} palette
 */
export function addLogoRow(container, config, palette) {
  const { logoUrl, merchantLogoUrl, useDefault41DevLogo = true } = config
  const hasLeft = logoUrl || (!merchantLogoUrl && useDefault41DevLogo)
  const hasRight = !!merchantLogoUrl
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
    wrap.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;color:' + (palette.primaryButtonBg || palette.textPrimary) + ';max-height:32px;max-width:32px'
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

/**
 * @param {Object} palette
 * @param {string} labelText
 * @param {{ type?: string, placeholder?: string, autocomplete?: string }} options
 * @returns {{ wrapper: HTMLElement, input: HTMLInputElement }}
 */
export function createInput(palette, labelText, options = {}) {
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
  input.style.cssText = 'width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ' + palette.inputBorder + ';background:' + palette.inputBg + ';color:' + palette.inputText + ';font-size:14px'
  if (options.autocomplete) input.autocomplete = options.autocomplete
  wrapper.appendChild(label)
  wrapper.appendChild(input)
  return { wrapper, input }
}

/**
 * @param {Object} palette
 * @param {Array<{ code: string, name: string, flag: string, dial: string }>} countries
 * @returns {{ wrapper: HTMLElement, select: HTMLSelectElement, getSelectedCountry: () => Object }}
 */
export function createCountrySelect(palette, countries) {
  const wrapper = document.createElement('div')
  wrapper.style.marginBottom = '14px'
  const label = document.createElement('label')
  label.textContent = 'Pays'
  label.style.display = 'block'
  label.style.fontSize = '13px'
  label.style.color = palette.textSecondary
  label.style.marginBottom = '4px'
  const select = document.createElement('select')
  select.style.cssText = 'width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid ' + palette.inputBorder + ';background:' + palette.inputBg + ';color:' + palette.inputText + ';font-size:14px'
  countries.forEach((c) => {
    const opt = document.createElement('option')
    opt.value = c.code
    opt.textContent = `${c.flag} ${c.name} (${c.dial})`
    select.appendChild(opt)
  })
  const getSelectedCountry = () => countries.find((c) => c.code === select.value) ?? countries[0]
  wrapper.appendChild(label)
  wrapper.appendChild(select)
  return { wrapper, select, getSelectedCountry }
}
