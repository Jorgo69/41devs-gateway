import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhoneForCountry,
  validateCardNumber,
  validateExpiry,
  validateCvv,
} from '../src/validation/index.js'

describe('validation', () => {
  describe('validateEmail', () => {
    it('returns invalid for empty or blank', () => {
      expect(validateEmail('').valid).toBe(false)
      expect(validateEmail('   ').valid).toBe(false)
      expect(validateEmail().valid).toBe(false)
    })
    it('returns invalid for bad format', () => {
      expect(validateEmail('a').valid).toBe(false)
      expect(validateEmail('a@').valid).toBe(false)
      expect(validateEmail('a@b').valid).toBe(false)
    })
    it('returns valid for correct email', () => {
      expect(validateEmail('a@b.co').valid).toBe(true)
      expect(validateEmail('user@example.com').valid).toBe(true)
    })
  })

  describe('validatePhoneForCountry', () => {
    it('returns invalid when no country', () => {
      expect(validatePhoneForCountry(null, '12345678').valid).toBe(false)
    })
    it('returns invalid when length out of range', () => {
      const country = { name: 'Test', minPhoneLength: 8, maxPhoneLength: 10 }
      expect(validatePhoneForCountry(country, '123').valid).toBe(false)
      expect(validatePhoneForCountry(country, '12345678901').valid).toBe(false)
    })
    it('returns valid when length in range', () => {
      const country = { name: 'Test', minPhoneLength: 8, maxPhoneLength: 10 }
      expect(validatePhoneForCountry(country, '12345678').valid).toBe(true)
      expect(validatePhoneForCountry(country, '1234567890').valid).toBe(true)
    })
  })

  describe('validateCardNumber', () => {
    it('returns invalid for empty or wrong length', () => {
      expect(validateCardNumber('').valid).toBe(false)
      expect(validateCardNumber('123').valid).toBe(false)
      expect(validateCardNumber('12345678901234567890').valid).toBe(false)
    })
    it('returns valid for 12-19 digits', () => {
      expect(validateCardNumber('123456789012').valid).toBe(true)
      expect(validateCardNumber('1234567890123456').valid).toBe(true)
    })
  })

  describe('validateExpiry', () => {
    it('returns invalid for wrong format', () => {
      expect(validateExpiry('').valid).toBe(false)
      expect(validateExpiry('12/2025').valid).toBe(false)
      expect(validateExpiry('1/25').valid).toBe(false)
    })
    it('returns invalid for invalid month', () => {
      expect(validateExpiry('00/25').valid).toBe(false)
      expect(validateExpiry('13/25').valid).toBe(false)
    })
    it('returns valid for MM/AA', () => {
      expect(validateExpiry('01/25').valid).toBe(true)
      expect(validateExpiry('12/30').valid).toBe(true)
    })
  })

  describe('validateCvv', () => {
    it('returns invalid for empty or wrong length', () => {
      expect(validateCvv('').valid).toBe(false)
      expect(validateCvv('12').valid).toBe(false)
      expect(validateCvv('12345').valid).toBe(false)
    })
    it('returns valid for 3 or 4 digits', () => {
      expect(validateCvv('123').valid).toBe(true)
      expect(validateCvv('1234').valid).toBe(true)
    })
  })
})
