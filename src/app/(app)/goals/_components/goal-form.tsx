'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { getCategoryIcon } from '@/lib/category-icons'
import type { FinancialAccount, Category } from '@/lib/db/schema'

export type GoalFormValues = {
  name: string
  targetAmount: string
  currentAmount: string
  targetDate?: string
  accountId?: string
  categoryId?: string
}

interface GoalFormProps {
  accounts: FinancialAccount[]
  incomeCategories: Pick<Category, 'id' | 'name' | 'icon' | 'color'>[]
  currency: string
  defaultValues?: Partial<GoalFormValues>
  isLoading?: boolean
  onSubmit: (data: GoalFormValues) => Promise<void>
  submitLabel?: string
}

export function GoalForm({
  accounts,
  incomeCategories,
  currency,
  defaultValues,
  isLoading = false,
  onSubmit,
  submitLabel = 'Guardar',
}: GoalFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(defaultValues?.targetAmount ?? '0')
  const [currentAmount, setCurrentAmount] = useState(defaultValues?.currentAmount ?? '0')
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    defaultValues?.targetDate ? new Date(defaultValues.targetDate + 'T12:00:00') : undefined,
  )
  const [accountId, setAccountId] = useState(defaultValues?.accountId ?? 'none')
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? 'none')

  const isAccountLinked = accountId !== 'none'
  const selectedAccount = accounts.find((a) => a.id === accountId)
  const accountCurrency = selectedAccount?.currency ?? currency

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) return
    await onSubmit({
      name: name.trim(),
      targetAmount,
      currentAmount: isAccountLinked ? '0' : currentAmount,
      targetDate: targetDate ? targetDate.toISOString().split('T')[0] : undefined,
      accountId: accountId === 'none' ? undefined : accountId,
      categoryId: categoryId === 'none' ? undefined : categoryId,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Nombre */}
        <Field>
          <FieldLabel htmlFor="goal-name">Nombre de la meta</FieldLabel>
          <Input
            id="goal-name"
            placeholder="Ej: Fondo de emergencia, Vacaciones..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        {/* Cuenta asociada */}
        <Field>
          <FieldLabel htmlFor="goal-account">Cuenta asociada (opcional)</FieldLabel>
          <Select
            value={accountId}
            onValueChange={(v) => {
              if (v) {
                setAccountId(v)
                if (v === 'none') setCategoryId('none')
              }
            }}
          >
            <SelectTrigger id="goal-account">
              <SelectValue>
                {accountId === 'none'
                  ? 'Sin cuenta específica'
                  : selectedAccount?.name ?? 'Seleccionar cuenta'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cuenta</SelectLabel>
                <SelectItem value="none">Sin cuenta específica</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            {isAccountLinked
              ? 'El progreso se calculará automáticamente desde los ingresos de esta cuenta.'
              : 'Asocia una cuenta para seguimiento automático, o deja en blanco para registro manual.'}
          </FieldDescription>
        </Field>

        {/* Filtrar por categoría de ingreso — solo visible cuando hay cuenta */}
        {isAccountLinked && incomeCategories.length > 0 && (
          <Field>
            <FieldLabel htmlFor="goal-category">Filtrar por categoría (opcional)</FieldLabel>
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger id="goal-category">
                <SelectValue>
                  {categoryId === 'none'
                    ? 'Todos los ingresos'
                    : incomeCategories.find((c) => c.id === categoryId)?.name ?? 'Seleccionar'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categoría de ingreso</SelectLabel>
                  <SelectItem value="none">Todos los ingresos</SelectItem>
                  {incomeCategories.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon)
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="h-3.5 w-3.5" style={{ color: cat.color ?? undefined }} />}
                          {cat.name}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              Solo cuenta los ingresos de esta categoría hacia la meta.
            </FieldDescription>
          </Field>
        )}

        {/* Monto objetivo */}
        <Field>
          <FieldLabel htmlFor="goal-target">Monto objetivo</FieldLabel>
          <CurrencyInput
            id="goal-target"
            value={targetAmount}
            onChange={setTargetAmount}
            currency={accountCurrency}
          />
        </Field>

        {/* Monto actual — oculto cuando hay cuenta (se calcula automáticamente) */}
        {!isAccountLinked && (
          <Field>
            <FieldLabel htmlFor="goal-current">Monto ahorrado actualmente</FieldLabel>
            <CurrencyInput
              id="goal-current"
              value={currentAmount}
              onChange={setCurrentAmount}
              currency={accountCurrency}
            />
          </Field>
        )}

        {/* Fecha límite */}
        <Field>
          <FieldLabel>Fecha límite (opcional)</FieldLabel>
          <DatePicker
            value={targetDate}
            onChange={setTargetDate}
            placeholder="Sin fecha límite"
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
        >
          {isLoading ? 'Guardando...' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
