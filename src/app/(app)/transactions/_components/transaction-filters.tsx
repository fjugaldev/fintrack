'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { FinancialAccount, Category } from '@/lib/db/schema'

interface TransactionFiltersProps {
  accounts: FinancialAccount[]
  categories: Category[]
  currentFilters: {
    dateFrom?: string
    dateTo?: string
    type?: string
    accountId?: string
  }
}

const TYPE_LABELS: Record<string, string> = {
  all: 'Todos',
  expense: 'Gastos',
  income: 'Ingresos',
  transfer: 'Transferencias',
}

export function TransactionFilters({ accounts, currentFilters }: TransactionFiltersProps) {
  const router = useRouter()

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams({
      ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
      ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
      ...(currentFilters.type && { type: currentFilters.type }),
      ...(currentFilters.accountId && { accountId: currentFilters.accountId }),
      [key]: value,
      page: '1',
    })
    if (!value || value === 'all') params.delete(key)
    router.push('/transactions?' + params.toString())
  }

  function handleClear() {
    router.push('/transactions')
  }

  const hasFilters = !!(currentFilters.type || currentFilters.accountId)
  const selectedAccount = accounts.find((a) => a.id === currentFilters.accountId)

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <Field className="w-auto">
        <FieldLabel className="text-xs">Desde</FieldLabel>
        <Input
          type="date"
          className="h-8 text-sm w-36"
          value={currentFilters.dateFrom ?? ''}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
        />
      </Field>

      <Field className="w-auto">
        <FieldLabel className="text-xs">Hasta</FieldLabel>
        <Input
          type="date"
          className="h-8 text-sm w-36"
          value={currentFilters.dateTo ?? ''}
          onChange={(e) => handleChange('dateTo', e.target.value)}
        />
      </Field>

      <Field className="w-auto">
        <FieldLabel className="text-xs">Tipo</FieldLabel>
        <Select
          value={currentFilters.type ?? 'all'}
          onValueChange={(v) => handleChange('type', v ?? '')}
        >
          <SelectTrigger className="h-8 text-sm w-36">
            <SelectValue>
              {TYPE_LABELS[currentFilters.type ?? 'all'] ?? 'Todos'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tipo</SelectLabel>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="transfer">Transferencias</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field className="w-auto">
        <FieldLabel className="text-xs">Cuenta</FieldLabel>
        <Select
          value={currentFilters.accountId ?? 'all'}
          onValueChange={(v) => handleChange('accountId', v ?? '')}
        >
          <SelectTrigger className="h-8 text-sm w-40">
            <SelectValue>
              {selectedAccount?.name ?? 'Todas'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Cuenta</SelectLabel>
              <SelectItem value="all">Todas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8" onClick={handleClear}>
          Limpiar
        </Button>
      )}
    </div>
  )
}
