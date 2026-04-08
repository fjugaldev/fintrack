'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from '@/lib/account-types'
import { CURRENCIES } from '@/lib/currencies'
import { CurrencyInput } from '@/components/ui/currency-input'
import type { NewFinancialAccount } from '@/lib/db/schema'

export type AccountFormValues = {
  name: string
  type: NewFinancialAccount['type']
  color: string
  balance?: string
  currency: string
  exchangeRateToBase?: string
}

interface AccountFormProps {
  defaultValues?: Partial<AccountFormValues>
  defaultCurrency?: string
  showBalance?: boolean
  isLoading?: boolean
  onSubmit: (data: AccountFormValues) => Promise<void>
  submitLabel?: string
}

export function AccountForm({
  defaultValues,
  defaultCurrency = 'USD',
  showBalance = false,
  isLoading = false,
  onSubmit,
  submitLabel = 'Guardar',
}: AccountFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [type, setType] = useState<NewFinancialAccount['type']>(defaultValues?.type ?? 'checking')
  const [color, setColor] = useState(defaultValues?.color ?? ACCOUNT_COLORS[0])
  const [currency, setCurrency] = useState(defaultValues?.currency ?? defaultCurrency)
  const [balance, setBalance] = useState(defaultValues?.balance ?? '0')
  const [exchangeRateToBase, setExchangeRateToBase] = useState(defaultValues?.exchangeRateToBase ?? '')

  const isForeignCurrency = currency !== defaultCurrency

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit({
      name: name.trim(),
      type,
      color,
      balance,
      currency,
      exchangeRateToBase: isForeignCurrency ? exchangeRateToBase : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Nombre */}
        <Field>
          <FieldLabel htmlFor="acc-name">Nombre de la cuenta</FieldLabel>
          <Input
            id="acc-name"
            placeholder="Ej: Cuenta principal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        {/* Tipo */}
        <Field>
          <FieldLabel>Tipo de cuenta</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={2}
            className="w-full grid grid-cols-3"
            value={[type]}
            onValueChange={(values) => {
              const next = values.find((v) => v !== type) as NewFinancialAccount['type'] | undefined
              if (next) setType(next)
            }}
          >
            {ACCOUNT_TYPES.map((t) => (
              <ToggleGroupItem
                key={t.value}
                value={t.value}
                className="flex-col gap-1 h-auto py-2.5 cursor-pointer"
              >
                <t.icon className="size-6" />
                <span className="text-xs font-medium">{t.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        {/* Color */}
        <Field>
          <FieldLabel>Color</FieldLabel>
          <div className="flex gap-2 flex-wrap">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-7 rounded-full border-2 transition-transform cursor-pointer ${
                  color === c ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>

        {/* Moneda */}
        <Field>
          <FieldLabel htmlFor="acc-currency">Moneda</FieldLabel>
          <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
            <SelectTrigger id="acc-currency">
              <SelectValue>
                {CURRENCIES.find((c) => c.code === currency)?.label ?? currency}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Moneda</SelectLabel>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Tasa de cambio (solo si la moneda difiere de la base) */}
        {isForeignCurrency && (
          <Field>
            <FieldLabel htmlFor="acc-exchange-rate">
              Tasa de cambio (1 {currency} = X {defaultCurrency})
            </FieldLabel>
            <Input
              id="acc-exchange-rate"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="Ej: 0.9100"
              value={exchangeRateToBase}
              onChange={(e) => setExchangeRateToBase(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ¿Cuántos {defaultCurrency} equivale 1 {currency}? Puedes actualizarla cuando cambie.
            </p>
          </Field>
        )}

        {/* Saldo inicial */}
        {showBalance && (
          <Field>
            <FieldLabel htmlFor="acc-balance">Saldo inicial</FieldLabel>
            <CurrencyInput
              id="acc-balance"
              value={balance}
              onChange={setBalance}
              currency={currency}
            />
          </Field>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
          {isLoading ? 'Guardando...' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
