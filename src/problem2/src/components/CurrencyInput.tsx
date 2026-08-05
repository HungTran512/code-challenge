import type { ChangeEvent } from 'react'
import type { Token } from '../types'
import { ICON_FALLBACK } from '../utils/tokens'
import { ChevronDownIcon } from './Icons'

type CurrencyInputProps = {
  label: string
  amount: string
  onAmountChange: (amount: string) => void
  selectedToken: Token | null
  onSelectTokenClick: () => void
  balance?: number
  onMaxClick?: () => void
  disabled?: boolean
  readOnly?: boolean
  emphasizeAmount?: boolean
}

export function CurrencyInput({
  label,
  amount,
  onAmountChange,
  selectedToken,
  onSelectTokenClick,
  balance,
  onMaxClick,
  disabled = false,
  readOnly = false,
  emphasizeAmount = false,
}: CurrencyInputProps) {
  const showBalance = balance != null && balance > 0

  function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
    onAmountChange(event.target.value)
  }

  return (
    <section className="rounded-xl border border-ledger-border bg-ledger-panel-2 p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-ledger-muted">
        <label htmlFor={`${label}-amount`}>{label}</label>
        {showBalance && (
          <div className="flex items-center gap-2">
            <span className="font-mono">Balance: {balance}</span>
            <button
              className="font-medium text-ledger-mint transition-colors hover:text-ledger-text disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || !onMaxClick}
              onClick={onMaxClick}
              type="button"
            >
              Max
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          className={`min-w-0 flex-1 bg-transparent font-mono text-3xl outline-none placeholder:text-ledger-muted disabled:cursor-not-allowed disabled:opacity-50 ${
            emphasizeAmount ? 'text-ledger-mint' : 'text-ledger-text'
          }`}
          disabled={disabled}
          id={`${label}-amount`}
          inputMode="decimal"
          onChange={handleAmountChange}
          placeholder="0.0"
          readOnly={readOnly}
          type="text"
          value={amount}
        />
        <button
          aria-label={selectedToken ? `Select ${selectedToken.currency}` : 'Select a token'}
          className="flex shrink-0 items-center gap-2 rounded-full border border-ledger-border bg-ledger-panel px-3 py-2 font-medium text-ledger-text transition-colors hover:border-ledger-mint disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={onSelectTokenClick}
          type="button"
        >
          {selectedToken ? (
            <>
              <img
                alt=""
                className="size-5 rounded-full"
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = ICON_FALLBACK
                }}
                src={selectedToken.icon}
              />
              <span>{selectedToken.currency}</span>
            </>
          ) : (
            <span>Select token</span>
          )}
          <ChevronDownIcon className="size-4 text-ledger-muted" />
        </button>
      </div>
    </section>
  )
}
