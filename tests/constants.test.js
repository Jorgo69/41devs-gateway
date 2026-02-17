import { describe, it, expect } from 'vitest'
import {
  PAYMENT_CANCELLED_CODE,
  DEFAULT_41DEV_LOGO_SVG,
  MOBILE_MONEY_METHODS,
  isMobileMoney,
  DEFAULT_COUNTRIES,
  DEFAULT_PALETTE_DARK,
  DEFAULT_PALETTE_LIGHT,
} from '../src/constants/index.js'

describe('constants', () => {
  it('PAYMENT_CANCELLED_CODE is "CANCELLED"', () => {
    expect(PAYMENT_CANCELLED_CODE).toBe('CANCELLED')
  })

  it('DEFAULT_41DEV_LOGO_SVG contains svg', () => {
    expect(DEFAULT_41DEV_LOGO_SVG).toContain('<svg')
    expect(DEFAULT_41DEV_LOGO_SVG).toContain('currentColor')
  })

  it('MOBILE_MONEY_METHODS contains MTN, Moov, Celtis', () => {
    expect(MOBILE_MONEY_METHODS).toEqual(['MTN', 'Moov', 'Celtis'])
  })

  it('isMobileMoney returns true for MTN, Moov, Celtis', () => {
    expect(isMobileMoney('MTN')).toBe(true)
    expect(isMobileMoney('Moov')).toBe(true)
    expect(isMobileMoney('Celtis')).toBe(true)
  })

  it('isMobileMoney returns false for Carte bancaire and others', () => {
    expect(isMobileMoney('Carte bancaire')).toBe(false)
    expect(isMobileMoney('')).toBe(false)
  })

  it('DEFAULT_COUNTRIES has 4 countries with required fields', () => {
    expect(DEFAULT_COUNTRIES).toHaveLength(4)
    const codes = DEFAULT_COUNTRIES.map((c) => c.code)
    expect(codes).toContain('BJ')
    expect(codes).toContain('CI')
    expect(codes).toContain('TG')
    expect(codes).toContain('SN')
    DEFAULT_COUNTRIES.forEach((c) => {
      expect(c).toHaveProperty('code')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('dial')
      expect(c).toHaveProperty('minPhoneLength')
      expect(c).toHaveProperty('maxPhoneLength')
    })
  })

  it('DEFAULT_PALETTE_DARK and DEFAULT_PALETTE_LIGHT have expected keys', () => {
    const keys = ['modalBg', 'textPrimary', 'primaryButtonBg', 'inputBorder']
    keys.forEach((k) => {
      expect(DEFAULT_PALETTE_DARK).toHaveProperty(k)
      expect(DEFAULT_PALETTE_LIGHT).toHaveProperty(k)
    })
  })
})
