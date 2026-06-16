import { describe, it, expect } from 'vitest'
import { createGateway, PAYMENT_CANCELLED_CODE } from '../index.js'

describe('createGateway', () => {
  it('returns an object with openPayment function', () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    expect(gateway).toHaveProperty('openPayment')
    expect(typeof gateway.openPayment).toBe('function')
  })

  it('openPayment returns a thenable (Promise)', () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    const result = gateway.openPayment({ amount: 1000 })
    expect(result).toBeDefined()
    expect(typeof result.then).toBe('function')
    expect(typeof result.catch).toBe('function')
  })
})

describe('openPayment (annulation)', () => {
  it('rejects with PAYMENT_CANCELLED_CODE when user clicks Annuler', async () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    const promise = gateway.openPayment({ amount: 1000 })

    const overlay = document.getElementById('fdg-overlay')
    expect(overlay).toBeTruthy()
    // En mode générique (sans eventId), le back button affiche "Annuler"
    const cancelBtn = [...overlay.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Annuler'
    )
    expect(cancelBtn).toBeTruthy()
    cancelBtn.click()

    await expect(promise).rejects.toMatchObject({
      code: PAYMENT_CANCELLED_CODE,
      message: expect.any(String),
    })
  })

  it('rejects with PAYMENT_CANCELLED_CODE when user clicks close (X)', async () => {
    const gateway = createGateway({ publicKey: 'pk_test' })
    const promise = gateway.openPayment({ amount: 1000 })

    const overlay = document.getElementById('fdg-overlay')
    expect(overlay).toBeTruthy()
    // En mode générique (sans eventId), un close X persistent est ajouté sur le modal
    const closeBtn = overlay.querySelector('button[aria-label="Fermer"]')
    expect(closeBtn).toBeTruthy()
    closeBtn.click()

    await expect(promise).rejects.toMatchObject({
      code: PAYMENT_CANCELLED_CODE,
    })
  })
})
