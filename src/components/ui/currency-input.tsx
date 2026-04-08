'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value?: string
  onChange?: (value: string) => void
  currency?: string
  className?: string
  id?: string
  disabled?: boolean
}

function getCurrencySymbol(currency: string): string {
  try {
    return (
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
      })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? currency
    )
  } catch {
    return currency
  }
}

function parseCents(val: string): number {
  const n = parseFloat(val || '0')
  return isNaN(n) ? 0 : Math.round(Math.abs(n) * 100)
}

export function CurrencyInput({
  value = '0',
  onChange,
  currency = 'USD',
  className,
  id,
  disabled,
}: CurrencyInputProps) {
  const [cents, setCents] = useState(() => parseCents(value))

  useEffect(() => {
    setCents(parseCents(value))
  }, [value])

  const display = (cents / 100).toFixed(2)
  const symbol = getCurrencySymbol(currency)
  const symbolWidth = symbol.length === 1 ? 'pl-7' : symbol.length === 2 ? 'pl-9' : 'pl-11'

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      const newCents = Math.min(cents * 10 + Number(e.key), 999999999)
      setCents(newCents)
      onChange?.((newCents / 100).toFixed(2))
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      const newCents = Math.floor(cents / 10)
      setCents(newCents)
      onChange?.((newCents / 100).toFixed(2))
    }
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <span
        className="pointer-events-none absolute left-3 z-10 select-none text-sm text-muted-foreground"
        aria-hidden
      >
        {symbol}
      </span>
      <input
        id={id}
        type="text"
        inputMode="none"
        readOnly
        value={display}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background py-2 pr-3 text-sm tabular-nums shadow-xs',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-default select-none',
          symbolWidth,
        )}
      />
    </div>
  )
}
