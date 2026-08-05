import { describe, expect, it } from 'vitest'
import {
  computeReceiveAmount,
  formatAmount,
  formatRateLabel,
  isPositiveAmount,
  isValidAmountInput,
  processTokenData,
  tokenIconUrl,
} from './tokens'

describe('tokenIconUrl', () => {
  it('builds Switcheo raw SVG URL', () => {
    expect(tokenIconUrl('ETH')).toBe(
      'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg',
    )
  })
})

describe('processTokenData', () => {
  it('omits tokens without price and dedupes by currency keeping last', () => {
    const result = processTokenData([
      { currency: 'ETH', price: 1 },
      { currency: 'NOPE', price: 0 },
      { currency: 'ETH', price: 2 },
      { currency: 'USDC', price: 1 },
    ])
    expect(result.map((t) => t.currency)).toEqual(['ETH', 'USDC'])
    expect(result[0].price).toBe(2)
    expect(result[0].icon).toContain('/ETH.svg')
  })
})

describe('isValidAmountInput', () => {
  it('allows empty and decimal strings', () => {
    expect(isValidAmountInput('')).toBe(true)
    expect(isValidAmountInput('12.5')).toBe(true)
    expect(isValidAmountInput('.5')).toBe(true)
  })
  it('rejects scientific notation and signs', () => {
    expect(isValidAmountInput('1e2')).toBe(false)
    expect(isValidAmountInput('-1')).toBe(false)
    expect(isValidAmountInput('+1')).toBe(false)
  })
})

describe('isPositiveAmount', () => {
  it('accepts positive finite amounts', () => {
    expect(isPositiveAmount('0.000001')).toBe(true)
    expect(isPositiveAmount('1')).toBe(true)
  })
  it('rejects zero, empty, and non-numeric values', () => {
    expect(isPositiveAmount('0.000000')).toBe(false)
    expect(isPositiveAmount('0')).toBe(false)
    expect(isPositiveAmount('')).toBe(false)
    expect(isPositiveAmount('abc')).toBe(false)
  })
})

describe('computeReceiveAmount', () => {
  const eth = { currency: 'ETH', price: 2000, icon: '' }
  const usdc = { currency: 'USDC', price: 1, icon: '' }
  it('returns empty for invalid inputs', () => {
    expect(computeReceiveAmount('', eth, usdc)).toBe('')
    expect(computeReceiveAmount('0', eth, usdc)).toBe('')
  })
  it('converts using price ratio to 6 decimals', () => {
    expect(computeReceiveAmount('1.5', eth, usdc)).toBe('3000.000000')
  })
  it('can produce zeroed 6-decimal receive for tiny ratios', () => {
    const swth = { currency: 'SWTH', price: 0.004, icon: '' }
    const wbtc = { currency: 'WBTC', price: 26000, icon: '' }
    expect(computeReceiveAmount('1', swth, wbtc)).toBe('0.000000')
  })
})

describe('formatRateLabel', () => {
  it('formats 1 FROM = rate TO', () => {
    const eth = { currency: 'ETH', price: 2000, icon: '' }
    const usdc = { currency: 'USDC', price: 1, icon: '' }
    expect(formatRateLabel(eth, usdc)).toBe('1 ETH = 2000.0000 USDC')
  })
})

describe('formatAmount', () => {
  it('trims trailing zeros for Max fill', () => {
    expect(formatAmount(3491.78)).toBe('3491.78')
    expect(formatAmount(10)).toBe('10')
  })
})
