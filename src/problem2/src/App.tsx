import { useEffect, useMemo, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { CurrencyInput } from './components/CurrencyInput'
import { TokenSelectModal } from './components/TokenSelectModal'
import { ArrowUpDownIcon, SpinnerIcon } from './components/Icons'
import type { PriceRow, Token } from './types'
import {
  MOCK_BALANCE,
  PRICES_URL,
  computeReceiveAmount,
  formatAmount,
  formatRateLabel,
  isPositiveAmount,
  isValidAmountInput,
  processTokenData,
} from './utils/tokens'

const SWAP_DELAY_MS = 1800

type ActiveModal = 'from' | 'to' | null

function noop() {}

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwapping, setIsSwapping] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadTokens() {
      try {
        const response = await fetch(PRICES_URL)
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
        const data: PriceRow[] = await response.json()
        if (cancelled) return

        const processed = processTokenData(data)
        setTokens(processed)
        setFromToken(processed.find((token) => token.currency === 'ETH') ?? processed[0] ?? null)
        setToToken(processed.find((token) => token.currency === 'USDC') ?? processed[1] ?? null)
      } catch {
        if (!cancelled) setFetchError('Could not load token prices. Please refresh to try again.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadTokens()
    return () => {
      cancelled = true
    }
  }, [])

  // Derived values only — no syncing useEffect for toAmount/error, so amount
  // edits recompute instantly and never race against a fetch-driven error.
  const toAmount = useMemo(
    () => computeReceiveAmount(fromAmount, fromToken, toToken),
    [fromAmount, fromToken, toToken],
  )
  const rateLabel = useMemo(() => formatRateLabel(fromToken, toToken), [fromToken, toToken])

  const parsedAmount = parseFloat(fromAmount)
  const isInsufficientBalance = parsedAmount > MOCK_BALANCE
  const error =
    fetchError ??
    (isInsufficientBalance && fromToken ? `Insufficient ${fromToken.currency} balance` : null)

  const canSubmit =
    !isSwapping && !!fromToken && !!toToken && parsedAmount > 0 && isPositiveAmount(toAmount) && !error

  function handleAmountChange(value: string) {
    if (isValidAmountInput(value)) setFromAmount(value)
  }

  function handleMaxClick() {
    setFromAmount(formatAmount(MOCK_BALANCE))
  }

  function closeModal() {
    setActiveModal(null)
    setSearchTerm('')
  }

  function handleSelectToken(token: Token) {
    if (activeModal === 'from') {
      if (toToken?.currency === token.currency) setToToken(fromToken)
      setFromToken(token)
    } else if (activeModal === 'to') {
      if (fromToken?.currency === token.currency) setFromToken(toToken)
      setToToken(token)
    }
    closeModal()
  }

  function handleFlip() {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount ? formatAmount(parseFloat(toAmount)) : '')
  }

  function handleConfirm() {
    if (!canSubmit || !fromToken || !toToken) return

    const swappedFromAmount = fromAmount
    const swappedToAmount = toAmount
    const swappedFromSymbol = fromToken.currency
    const swappedToSymbol = toToken.currency

    setIsSwapping(true)
    setTimeout(() => {
      setIsSwapping(false)
      setFromAmount('')
      toast.success(
        `Swapped ${swappedFromAmount} ${swappedFromSymbol} for ${formatAmount(
          parseFloat(swappedToAmount),
        )} ${swappedToSymbol}`,
      )
    }, SWAP_DELAY_MS)
  }

  if (isLoading) {
    return (
      <div className="ledger-backdrop flex min-h-screen flex-col items-center justify-center gap-4 font-sans text-ledger-text">
        <SpinnerIcon className="size-8 animate-spin text-ledger-mint" />
        <p className="text-sm text-ledger-muted">Loading live token prices…</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="ledger-backdrop flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center font-sans text-ledger-text">
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="text-sm text-ledger-muted">{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="ledger-backdrop flex min-h-screen items-center justify-center px-4 py-10 font-sans text-ledger-text">
      <div className="ledger-card-enter w-full max-w-[480px] rounded-2xl border border-ledger-border bg-ledger-panel/80 p-6 shadow-2xl backdrop-blur">
        <h1 className="mb-6 font-mono text-xl font-semibold text-ledger-text">Swap</h1>

        <div className="flex flex-col gap-2">
          <CurrencyInput
            amount={fromAmount}
            balance={MOCK_BALANCE}
            disabled={isSwapping}
            label="You pay"
            onAmountChange={handleAmountChange}
            onMaxClick={handleMaxClick}
            onSelectTokenClick={() => setActiveModal('from')}
            selectedToken={fromToken}
          />

          <div className="flex justify-center">
            <button
              aria-label="Flip tokens"
              className="-my-5 z-10 flex size-9 items-center justify-center rounded-full border border-ledger-border bg-ledger-panel text-ledger-mint transition-transform hover:border-ledger-mint active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSwapping || !fromToken || !toToken}
              onClick={handleFlip}
              type="button"
            >
              <ArrowUpDownIcon className="size-4" />
            </button>
          </div>

          <CurrencyInput
            amount={toAmount}
            disabled={isSwapping}
            emphasizeAmount
            label="You receive"
            onAmountChange={noop}
            onSelectTokenClick={() => setActiveModal('to')}
            readOnly
            selectedToken={toToken}
          />
        </div>

        <div className="mt-3 min-h-5 font-mono text-sm">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : rateLabel ? (
            <p className="text-ledger-mint">{rateLabel}</p>
          ) : null}
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ledger-mint py-3 font-semibold text-ledger-bg-deep transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canSubmit}
          onClick={handleConfirm}
          type="button"
        >
          {isSwapping ? (
            <>
              <SpinnerIcon className="size-5 animate-spin" />
              Swapping…
            </>
          ) : (
            'Confirm swap'
          )}
        </button>
      </div>

      <TokenSelectModal
        isOpen={activeModal !== null}
        onClose={closeModal}
        onSelectToken={handleSelectToken}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tokens={tokens}
      />

      <Toaster position="top-center" theme="dark" />
    </div>
  )
}
