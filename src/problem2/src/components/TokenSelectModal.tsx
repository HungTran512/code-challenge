import { useEffect, useMemo, useRef } from 'react'
import type { Token } from '../types'
import { ICON_FALLBACK } from '../utils/tokens'
import { CloseIcon, SearchIcon } from './Icons'

type TokenSelectModalProps = {
  isOpen: boolean
  onClose: () => void
  tokens: Token[]
  onSelectToken: (token: Token) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
}

export function TokenSelectModal({
  isOpen,
  onClose,
  tokens,
  onSelectToken,
  searchTerm,
  setSearchTerm,
}: TokenSelectModalProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredTokens = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return tokens.filter((token) => token.currency.toLowerCase().includes(normalizedSearch))
  }, [searchTerm, tokens])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    searchInputRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ledger-bg-deep/80 p-4"
      onClick={onClose}
      role="dialog"
    >
      <section className="flex max-h-[520px] w-full max-w-md flex-col overflow-hidden rounded-xl border border-ledger-border bg-ledger-panel shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-ledger-border px-5 py-4">
          <h2 className="text-lg font-semibold text-ledger-text">Select a token</h2>
          <button aria-label="Close token selection" className="rounded p-1 text-ledger-muted transition-colors hover:bg-ledger-panel-2 hover:text-ledger-text" onClick={onClose} type="button">
            <CloseIcon className="size-5" />
          </button>
        </header>

        <div className="border-b border-ledger-border p-4">
          <label className="flex items-center gap-2 rounded-lg border border-ledger-border bg-ledger-panel-2 px-3 py-2 text-ledger-muted focus-within:border-ledger-mint" htmlFor="token-search">
            <SearchIcon className="size-5 shrink-0" />
            <input
              className="w-full bg-transparent text-ledger-text outline-none placeholder:text-ledger-muted"
              id="token-search"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search tokens"
              ref={searchInputRef}
              type="search"
              value={searchTerm}
            />
          </label>
        </div>

        <div className="overflow-y-auto p-2">
          {filteredTokens.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ledger-muted">No tokens found.</p>
          ) : (
            filteredTokens.map((token) => (
              <button
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-ledger-panel-2"
                key={token.currency}
                onClick={() => onSelectToken(token)}
                type="button"
              >
                <img
                  alt=""
                  className="size-9 rounded-full"
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = ICON_FALLBACK
                  }}
                  src={token.icon}
                />
                <span className="flex-1 font-medium text-ledger-text">{token.currency}</span>
                <span className="font-mono text-sm text-ledger-muted">${token.price.toFixed(4)}</span>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
