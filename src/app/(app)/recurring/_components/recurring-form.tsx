'use client'

import { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
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
import { DatePicker } from '@/components/ui/date-picker'
import type { FinancialAccount, Category } from '@/lib/db/schema'
import type { RecurringFormData } from '@/lib/db/actions/recurring.actions'

export type RecurringType = 'income' | 'expense'

const FREQUENCIES = [
  { value: 'daily',   label: 'Diario' },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly',  label: 'Anual' },
] as const

interface RecurringFormProps {
  accounts: FinancialAccount[]
  categories: Category[]
  defaultValues?: Partial<RecurringFormData>
  isLoading?: boolean
  onSubmit: (data: RecurringFormData) => Promise<void>
  submitLabel?: string
}

export function RecurringForm({
  accounts,
  categories,
  defaultValues,
  isLoading = false,
  onSubmit,
  submitLabel = 'Guardar',
}: RecurringFormProps) {
  const [type, setType] = useState<RecurringType>((defaultValues?.type as RecurringType) ?? 'expense')
  const [amount, setAmount] = useState(defaultValues?.amount ?? '')
  const [accountId, setAccountId] = useState(defaultValues?.accountId ?? accounts[0]?.id ?? '')
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [frequency, setFrequency] = useState<RecurringFormData['frequency']>(defaultValues?.frequency ?? 'monthly')
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(
    defaultValues?.nextDueDate
      ? new Date(defaultValues.nextDueDate + 'T12:00:00')
      : new Date(),
  )

  // Category list filtered by type, hierarchical order
  const parents = categories.filter((c) => !c.parentId && c.type === type)
  const childrenByParent = categories.reduce<Record<string, typeof categories>>((acc, c) => {
    if (!c.parentId || c.type !== type) return acc
    if (!acc[c.parentId]) acc[c.parentId] = []
    acc[c.parentId].push(c)
    return acc
  }, {})
  const orderedCategories: Array<{ id: string; icon: string | null; name: string; isChild: boolean; color: string | null }> = []
  for (const parent of parents) {
    orderedCategories.push({ id: parent.id, icon: parent.icon, name: parent.name, isChild: false, color: parent.color })
    for (const child of (childrenByParent[parent.id] ?? [])) {
      orderedCategories.push({ id: child.id, icon: child.icon, name: child.name, isChild: true, color: child.color })
    }
  }
  const filteredCategories = categories.filter((c) => c.type === type)
  const dateISO = nextDueDate ? nextDueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !accountId || !nextDueDate) return
    await onSubmit({
      accountId,
      categoryId: categoryId || null,
      amount,
      type,
      description: description || null,
      frequency,
      nextDueDate: dateISO,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Tipo */}
        <Field>
          <FieldLabel>Tipo</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={2}
            className="w-full grid grid-cols-2"
            value={[type]}
            onValueChange={(values) => {
              const next = values.find((v) => v !== type) as RecurringType | undefined
              if (next) { setType(next); setCategoryId('') }
            }}
          >
            <ToggleGroupItem value="expense" className="flex-col gap-1.5 h-auto py-2.5 cursor-pointer">
              <TrendingDown data-icon className="size-6 text-red-500" />
              <span className="text-xs">Gasto</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="income" className="flex-col gap-1.5 h-auto py-2.5 cursor-pointer">
              <TrendingUp data-icon className="size-6 text-green-500" />
              <span className="text-xs">Ingreso</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {/* Monto */}
        <Field>
          <FieldLabel htmlFor="rec-amount">Monto</FieldLabel>
          <Input
            id="rec-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>

        {/* Frecuencia */}
        <Field>
          <FieldLabel htmlFor="rec-frequency">Frecuencia</FieldLabel>
          <Select value={frequency} onValueChange={(v) => v && setFrequency(v as RecurringFormData['frequency'])}>
            <SelectTrigger id="rec-frequency">
              <SelectValue>
                {FREQUENCIES.find((f) => f.value === frequency)?.label ?? frequency}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Frecuencia</SelectLabel>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Próxima fecha */}
        <Field>
          <FieldLabel>Próxima fecha</FieldLabel>
          <DatePicker value={nextDueDate} onChange={setNextDueDate} />
        </Field>

        {/* Cuenta */}
        <Field>
          <FieldLabel htmlFor="rec-account">Cuenta</FieldLabel>
          <Select value={accountId} onValueChange={(v) => v && setAccountId(v)}>
            <SelectTrigger id="rec-account">
              <SelectValue>
                {accounts.find((a) => a.id === accountId)?.name ?? 'Selecciona una cuenta'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cuenta</SelectLabel>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Categoría */}
        <Field>
          <FieldLabel htmlFor="rec-category">Categoría</FieldLabel>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
            <SelectTrigger id="rec-category">
              <SelectValue>
                {(() => {
                  const selected = filteredCategories.find((c) => c.id === categoryId)
                  if (!selected) return 'Sin categoría'
                  const SelIcon = getCategoryIcon(selected.icon)
                  return (
                    <span className="flex items-center gap-2">
                      {SelIcon
                        ? <SelIcon className="h-4 w-4" style={{ color: selected.color ?? undefined }} />
                        : selected.icon
                          ? <span className="text-sm">{selected.icon}</span>
                          : null}
                      {selected.name}
                    </span>
                  )
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categoría</SelectLabel>
                {orderedCategories.map((c) => {
                  const CatIcon = getCategoryIcon(c.icon)
                  return (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className={c.isChild ? 'pl-6 text-muted-foreground' : 'font-medium'}
                    >
                      <span className="flex items-center gap-2">
                        {CatIcon
                          ? <CatIcon className="h-4 w-4" style={{ color: c.color ?? undefined }} />
                          : c.icon
                            ? <span className="text-sm">{c.icon}</span>
                            : null}
                        {c.name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Descripción */}
        <Field>
          <FieldLabel htmlFor="rec-desc">Descripción</FieldLabel>
          <Input
            id="rec-desc"
            placeholder="Ej: Netflix, Renta, Sueldo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !amount || !accountId || !nextDueDate}
        >
          {isLoading ? 'Guardando...' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
