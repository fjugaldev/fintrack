'use client'

import { useState } from 'react'
import { TrendingDown, TrendingUp, ArrowLeftRight } from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
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

export type TransactionType = 'income' | 'expense' | 'transfer'

export type TransactionFormValues = {
  accountId: string
  toAccountId?: string
  categoryId?: string
  amount: string
  toAmount?: string
  exchangeRate?: string
  type: TransactionType
  description?: string
  notes?: string
  date: string
  merchant?: string
}

interface TransactionFormProps {
  accounts: FinancialAccount[]
  categories: Category[]
  defaultValues?: Partial<TransactionFormValues>
  isLoading?: boolean
  onSubmit: (data: TransactionFormValues) => Promise<void>
  submitLabel?: string
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function TransactionForm({
  accounts,
  categories,
  defaultValues,
  isLoading = false,
  onSubmit,
  submitLabel = 'Guardar',
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultValues?.type ?? 'expense')
  const [amount, setAmount] = useState(defaultValues?.amount ?? '')
  const [toAmount, setToAmount] = useState(defaultValues?.toAmount ?? '')
  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.date ? new Date(defaultValues.date + 'T12:00:00') : new Date(),
  )
  const [accountId, setAccountId] = useState(defaultValues?.accountId ?? accounts[0]?.id ?? '')
  const [toAccountId, setToAccountId] = useState(defaultValues?.toAccountId ?? '')
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [merchant, setMerchant] = useState(defaultValues?.merchant ?? '')

  const isTransfer = type === 'transfer'
  const txnType = isTransfer ? 'expense' : type

  // Construir lista jerárquica: padre → sus hijos, para el selector
  const parents = categories.filter((c) => !c.parentId && c.type === txnType)
  const childrenByParent = categories.reduce<Record<string, typeof categories>>((acc, c) => {
    if (!c.parentId || c.type !== txnType) return acc
    if (!acc[c.parentId]) acc[c.parentId] = []
    acc[c.parentId].push(c)
    return acc
  }, {})
  // Lista ordenada: padre primero, luego sus hijos
  const orderedCategories: Array<{ id: string; icon: string | null; name: string; isChild: boolean; color: string | null }> = []
  for (const parent of parents) {
    orderedCategories.push({ id: parent.id, icon: parent.icon, name: parent.name, isChild: false, color: parent.color })
    for (const child of (childrenByParent[parent.id] ?? [])) {
      orderedCategories.push({ id: child.id, icon: child.icon, name: child.name, isChild: true, color: child.color })
    }
  }
  const filteredCategories = categories.filter((c) => c.type === txnType)
  const destinationAccounts = accounts.filter((a) => a.id !== accountId)
  const dateISO = date ? date.toISOString().split('T')[0] : todayISO()

  const originAccount = accounts.find((a) => a.id === accountId)
  const destAccount = accounts.find((a) => a.id === toAccountId)
  const isCrossCurrency = isTransfer && !!destAccount && originAccount?.currency !== destAccount?.currency

  function calcExchangeRate(): string | undefined {
    if (!isCrossCurrency || !amount || !toAmount) return undefined
    const rate = parseFloat(toAmount) / parseFloat(amount)
    return isNaN(rate) || !isFinite(rate) ? undefined : rate.toFixed(8)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !accountId || !date) return
    if (isTransfer && !toAccountId) return
    if (isCrossCurrency && !toAmount) return
    await onSubmit({
      type,
      amount,
      date: dateISO,
      accountId,
      toAccountId: isTransfer ? toAccountId : undefined,
      toAmount: isCrossCurrency ? toAmount : undefined,
      exchangeRate: calcExchangeRate(),
      categoryId: (!isTransfer && categoryId) ? categoryId : undefined,
      description: description || undefined,
      merchant: (!isTransfer && merchant) ? merchant : undefined,
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
            className="w-full grid grid-cols-3"
            value={[type]}
            onValueChange={(values) => {
              const next = values.find((v) => v !== type) as TransactionType | undefined
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
            <ToggleGroupItem value="transfer" className="flex-col gap-1.5 h-auto py-2.5 cursor-pointer">
              <ArrowLeftRight data-icon className="size-6 text-blue-500" />
              <span className="text-xs">Transferencia</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {/* Monto */}
        <Field>
          <FieldLabel htmlFor="txn-amount">Monto</FieldLabel>
          <Input
            id="txn-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>

        {/* Fecha */}
        <Field>
          <FieldLabel>Fecha</FieldLabel>
          <DatePicker value={date} onChange={setDate} />
        </Field>

        {/* Cuenta origen */}
        <Field>
          <FieldLabel htmlFor="txn-account">{isTransfer ? 'Cuenta origen' : 'Cuenta'}</FieldLabel>
          <Select value={accountId} onValueChange={(v) => v && setAccountId(v)}>
            <SelectTrigger id="txn-account">
              <SelectValue>
                {accounts.find((a) => a.id === accountId)?.name ?? 'Selecciona una cuenta'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{isTransfer ? 'Cuenta origen' : 'Cuenta'}</SelectLabel>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Cuenta destino (solo transferencia) */}
        {isTransfer && (
          <Field>
            <FieldLabel htmlFor="txn-to-account">Cuenta destino</FieldLabel>
            <Select value={toAccountId} onValueChange={(v) => v && setToAccountId(v)}>
              <SelectTrigger id="txn-to-account">
                <SelectValue>
                  {destinationAccounts.find((a) => a.id === toAccountId)?.name ?? 'Selecciona cuenta destino'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cuenta destino</SelectLabel>
                  {destinationAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        {/* Monto destino (solo transferencia cross-currency) */}
        {isCrossCurrency && (
          <Field>
            <FieldLabel htmlFor="txn-to-amount">
              Monto en {destAccount?.currency ?? ''}
            </FieldLabel>
            <CurrencyInput
              id="txn-to-amount"
              value={toAmount}
              onChange={setToAmount}
              currency={destAccount?.currency ?? 'USD'}
            />
          </Field>
        )}

        {/* Categoría (no aplica en transferencia) */}
        {!isTransfer && (
          <Field>
            <FieldLabel htmlFor="txn-category">Categoría</FieldLabel>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
              <SelectTrigger id="txn-category">
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
        )}

        {/* Descripción */}
        <Field>
          <FieldLabel htmlFor="txn-desc">Descripción</FieldLabel>
          <Input
            id="txn-desc"
            placeholder={isTransfer ? 'Ej: Traspaso a ahorros' : 'Ej: Compra en supermercado'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        {/* Comercio (solo ingreso/gasto) */}
        {!isTransfer && (
          <Field>
            <FieldLabel htmlFor="txn-merchant">Comercio (opcional)</FieldLabel>
            <Input
              id="txn-merchant"
              placeholder="Ej: Walmart, Amazon"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </Field>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !amount || !accountId || !date || (isTransfer && !toAccountId) || (isCrossCurrency && !toAmount)}
        >
          {isLoading ? 'Guardando...' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
