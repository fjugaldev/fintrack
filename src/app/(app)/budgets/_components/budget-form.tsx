'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { CurrencyInput } from '@/components/ui/currency-input'
import { getCategoryIcon } from '@/lib/category-icons'
import type { Category } from '@/lib/db/schema'

export type BudgetFormValues = {
  categoryId?: string
  limitAmount: string
  period: 'monthly' | 'yearly'
}

interface BudgetFormProps {
  categories: Category[]
  currency: string
  defaultValues?: Partial<BudgetFormValues>
  isLoading?: boolean
  onSubmit: (data: BudgetFormValues) => Promise<void>
  submitLabel?: string
}

export function BudgetForm({
  categories,
  currency,
  defaultValues,
  isLoading = false,
  onSubmit,
  submitLabel = 'Guardar',
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? 'global')
  const [limitAmount, setLimitAmount] = useState(defaultValues?.limitAmount ?? '0')
  const [period, setPeriod] = useState<'monthly' | 'yearly'>(defaultValues?.period ?? 'monthly')

  const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.isSystem)

  const selectedCategory = expenseCategories.find((c) => c.id === categoryId)
  const selectedLabel = categoryId === 'global'
    ? 'Global (todos los gastos)'
    : selectedCategory
      ? selectedCategory.name
      : 'Seleccionar categoría'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!limitAmount || parseFloat(limitAmount) <= 0) return
    await onSubmit({
      categoryId: categoryId === 'global' ? undefined : categoryId,
      limitAmount,
      period,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Período */}
        <Field>
          <FieldLabel>Período</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={2}
            className="w-full grid grid-cols-2"
            value={[period]}
            onValueChange={(values) => {
              const next = values.find((v) => v !== period) as 'monthly' | 'yearly' | undefined
              if (next) setPeriod(next)
            }}
          >
            <ToggleGroupItem value="monthly" className="cursor-pointer">Mensual</ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="cursor-pointer">Anual</ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {/* Categoría */}
        <Field>
          <FieldLabel htmlFor="budget-category">Categoría</FieldLabel>
          <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
            <SelectTrigger id="budget-category">
              <SelectValue>
                {categoryId === 'global' ? (
                  'Global (todos los gastos)'
                ) : selectedCategory ? (
                  <span className="flex items-center gap-2">
                    {(() => {
                      const Icon = getCategoryIcon(selectedCategory.icon)
                      return Icon
                        ? <Icon className="h-4 w-4" style={{ color: selectedCategory.color ?? undefined }} />
                        : <span>{selectedCategory.icon}</span>
                    })()}
                    {selectedCategory.name}
                  </span>
                ) : selectedLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categoría</SelectLabel>
                <SelectItem value="global">Global (todos los gastos)</SelectItem>
                {expenseCategories.map((c) => {
                  const Icon = getCategoryIcon(c.icon)
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        {Icon
                          ? <Icon className="h-4 w-4" style={{ color: c.color ?? undefined }} />
                          : c.icon ? <span>{c.icon}</span> : null}
                        {c.name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Monto límite */}
        <Field>
          <FieldLabel htmlFor="budget-amount">Límite {period === 'monthly' ? 'mensual' : 'anual'}</FieldLabel>
          <CurrencyInput
            id="budget-amount"
            value={limitAmount}
            onChange={setLimitAmount}
            currency={currency}
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !limitAmount || parseFloat(limitAmount) <= 0}
        >
          {isLoading ? 'Guardando...' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
