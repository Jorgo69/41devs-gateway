import { describe, it, expect } from 'vitest'
import { createGateway } from '../index.js'

describe('createGateway', () => {
  it('returns an object with openPayment function', () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    expect(gateway).toHaveProperty('openPayment')
    expect(typeof gateway.openPayment).toBe('function')
  })

  it('openPayment opens the overlay (returns nothing)', () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    const result = gateway.openPayment({ amount: 1000, currency: 'XOF' })
    expect(result).toBeUndefined()
    expect(document.getElementById('fdg-overlay')).toBeTruthy()
  })
})

describe('openPayment (fermeture)', () => {
  it('clicking Annuler closes the overlay', () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    gateway.openPayment({ amount: 1000, currency: 'XOF' })
    const overlay = document.getElementById('fdg-overlay')
    expect(overlay).toBeTruthy()
    const cancelBtn = [...overlay.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Annuler'
    )
    expect(cancelBtn).toBeTruthy()
    cancelBtn.click()
    expect(document.getElementById('fdg-overlay')).toBeNull()
  })

  it('clicking X (Fermer) closes the overlay', () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    gateway.openPayment({ amount: 1000, currency: 'XOF' })
    const overlay = document.getElementById('fdg-overlay')
    expect(overlay).toBeTruthy()
    const closeBtn = overlay.querySelector('button[aria-label="Fermer"]')
    expect(closeBtn).toBeTruthy()
    closeBtn.click()
    expect(document.getElementById('fdg-overlay')).toBeNull()
  })
})
