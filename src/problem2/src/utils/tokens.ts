import type { PriceRow, Token } from '../types'

export const MOCK_BALANCE = 3491.78
export const PRICES_URL = 'https://interview.switcheo.com/prices.json'
export const ICON_FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="16" fill="#1e3c43"/><text x="16" y="20" text-anchor="middle" fill="#8aa4ab" font-size="14" font-family="sans-serif">?</text></svg>`,
  )

export function tokenIconUrl(currency: string): string {
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`
}

export function processTokenData(data: PriceRow[]): Token[] {
  const map = new Map<string, Token>()
  for (const item of data) {
    if (!item.price) continue
    map.set(item.currency, {
      currency: item.currency,
      price: item.price,
      icon: tokenIconUrl(item.currency),
    })
  }
  return Array.from(map.values())
}

export function isValidAmountInput(value: string): boolean {
  return value === '' || /^\d*\.?\d*$/.test(value)
}

export function isPositiveAmount(value: string): boolean {
  const n = parseFloat(value)
  return Number.isFinite(n) && n > 0
}

export function formatAmount(n: number, maxDecimals = 6): string {
  if (!Number.isFinite(n)) return ''
  const s = n.toFixed(maxDecimals)
  return s.replace(/\.?0+$/, '')
}

export function computeReceiveAmount(
  fromAmount: string,
  from: Token | null,
  to: Token | null,
): string {
  const n = parseFloat(fromAmount)
  if (!(n > 0) || !from?.price || !to?.price) return ''
  return (n * (from.price / to.price)).toFixed(6)
}

export function formatRateLabel(from: Token | null, to: Token | null): string | null {
  if (!from?.price || !to?.price) return null
  const rate = from.price / to.price
  return `1 ${from.currency} = ${rate.toFixed(4)} ${to.currency}`
}
