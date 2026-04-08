'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from '@/lib/account-types'
import { CurrencyInput } from '@/components/ui/currency-input'
import { createFinancialAccount } from '@/lib/db/actions/accounts.actions'
import { seedDefaultCategories } from '@/lib/db/actions/categories.actions'
import { completeOnboarding } from '@/lib/db/actions/profile.actions'
import type { NewFinancialAccount } from '@/lib/db/schema'

interface StepFirstAccountProps {
  currency: string
  onComplete: () => void
}

export function StepFirstAccount({ currency, onComplete }: StepFirstAccountProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<NewFinancialAccount['type']>('checking')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    try {
      await createFinancialAccount({ name: name.trim(), type, color, balance, currency })
      await seedDefaultCategories()
      await completeOnboarding()
      onComplete()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Tu primera cuenta</h2>
          <p className="text-sm text-muted-foreground">
            Añade la cuenta principal desde donde manejas tu dinero.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="accountName">Nombre de la cuenta</FieldLabel>
            <Input
              id="accountName"
              placeholder="Ej: Cuenta principal, Billetera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>

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

          <Field>
            <FieldLabel>Color</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-8 rounded-full border-2 transition-transform cursor-pointer ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="balance">Saldo inicial</FieldLabel>
            <CurrencyInput
              id="balance"
              value={balance}
              onChange={setBalance}
              currency={currency}
            />
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
          {isLoading ? 'Creando cuenta...' : 'Completar configuración'}
        </Button>
      </div>
    </form>
  )
}
